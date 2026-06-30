import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const { body } = await req.json();
  const text = typeof body === "string" ? body.trim() : "";
  if (!text) {
    return NextResponse.json({ error: "Comment can't be empty" }, { status: 400 });
  }
  if (text.length > 1000) {
    return NextResponse.json({ error: "Comment must be under 1000 characters" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const user = await currentUser();
  const authorName =
    user?.fullName || user?.username || user?.primaryEmailAddress?.emailAddress || "Anonymous";

  const comment = await prisma.comment.create({
    data: {
      body: text,
      authorUserId: userId,
      authorName,
      productId: id,
    },
  });

  return NextResponse.json(comment, { status: 201 });
}
