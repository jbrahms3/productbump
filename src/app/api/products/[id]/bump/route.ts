import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { replaceBumpedProduct } from "@/lib/queue";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  if (product.makerUserId !== userId) {
    return NextResponse.json({ error: "Only the maker can bump this product" }, { status: 403 });
  }
  if (product.bumped) {
    return NextResponse.json({ error: "Already bumped" }, { status: 400 });
  }

  await prisma.product.update({
    where: { id },
    data: {
      revenueAmount: product.revenueThreshold,
      bumped: true,
      featured: false,
      bumpedAt: new Date(),
    },
  });
  await replaceBumpedProduct(product.randomSlot);

  return NextResponse.json({ ok: true });
}
