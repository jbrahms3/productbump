import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fillOpenSlots } from "@/lib/queue";

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base;
  let i = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${base}-${i++}`;
  }
  return slug;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, tagline, description, websiteUrl, logoUrl, makerName, makerEmail, category } = body;

    if (!name || !tagline || !description || !websiteUrl || !makerName || !makerEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const slug = await uniqueSlug(slugify(name));

    const product = await prisma.product.create({
      data: {
        name,
        tagline,
        description,
        websiteUrl,
        logoUrl: logoUrl || null,
        makerName,
        makerEmail,
        category: category || "Other",
        slug,
        featured: false, // joins the queue; fillOpenSlots promotes it if a homepage slot is open
      },
    });

    // Submission order is the queue order — fill any open homepage slot immediately
    await fillOpenSlots();

    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  const products = await prisma.product.findMany({
    where: { featured: true, bumped: false },
    orderBy: [{ revenueAmount: "desc" }, { featuredAt: "desc" }],
    take: 20,
  });
  return NextResponse.json(products);
}
