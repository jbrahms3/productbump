import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { r2, R2_BUCKET, R2_PUBLIC_URL } from "@/lib/r2";

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"];

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "File must be an image (PNG, JPG, WebP, GIF, SVG)" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File must be under 2 MB" }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
  const key = `logos/${randomUUID()}.${ext}`;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    await r2.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      })
    );
  } catch (err) {
    console.error("R2 upload failed:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  return NextResponse.json({ url: `${R2_PUBLIC_URL}/${key}` });
}
