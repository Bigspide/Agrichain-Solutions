import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";

const allowedMime = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxBytes = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const user = await requireUser();
  const formData = await request.formData();
  const file = formData.get("file");
  const productId = formData.get("productId")?.toString();

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }
  if (!allowedMime.has(file.type)) {
    return NextResponse.json({ error: "Unsupported image type" }, { status: 415 });
  }
  if (file.size > maxBytes) {
    return NextResponse.json({ error: "Image exceeds 5MB limit" }, { status: 413 });
  }

  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const filename = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
  await mkdir(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, filename);
  await writeFile(filePath, Buffer.from(await file.arrayBuffer()));

  const url = `/uploads/products/${filename}`;
  const asset = await prisma.mediaAsset.create({
    data: {
      ownerId: user.id,
      productId: productId || null,
      url,
      path: filePath,
      mimeType: file.type,
      sizeBytes: file.size,
      altText: formData.get("altText")?.toString() || "Photo produit AgriChain",
    },
  });

  return NextResponse.json({ asset, url }, { status: 201 });
}

