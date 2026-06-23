import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser, requireUser } from "@/lib/auth/session";
import { productDto } from "@/lib/api/serializers";

const productSchema = z.object({
  name: z.string().min(2).max(160),
  description: z.string().min(10).max(2000),
  category: z.string().min(2).max(80),
  price: z.coerce.number().positive(),
  unit: z.string().min(1).max(30),
  quantity: z.coerce.number().nonnegative(),
  minOrder: z.coerce.number().positive().default(1),
  images: z.array(z.string().url()).default([]),
  origin: z.string().min(2).max(180),
  certifications: z.array(z.string().max(80)).default([]),
  isOrganic: z.boolean().default(false),
  traceCode: z.string().max(80).optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const query = searchParams.get("q");
  const products = await prisma.product.findMany({
    where: {
      status: "available",
      ...(category && category !== "all" ? { category } : {}),
      ...(query
        ? {
            OR: [
              { name: { contains: query } },
              { description: { contains: query } },
              { origin: { contains: query } },
            ],
          }
        : {}),
    },
    include: { seller: { select: { name: true } } },
    orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
    take: 80,
  });

  return NextResponse.json({ products: products.map(productDto) });
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (!["producer", "cooperative", "admin"].includes(user.role)) {
    return NextResponse.json({ error: "Role not allowed to create products" }, { status: 403 });
  }

  const parsed = productSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid product payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const product = await prisma.product.create({
    data: {
      ...parsed.data,
      sellerId: user.id,
      currency: "XOF",
      status: "available",
    },
    include: { seller: { select: { name: true } } },
  });

  const currentUser = await getCurrentUser();
  await prisma.auditLog.create({
    data: {
      actorId: currentUser?.id,
      action: "product.create",
      entity: "Product",
      entityId: product.id,
      metadata: { traceCode: product.traceCode },
    },
  });

  return NextResponse.json({ product: productDto(product) }, { status: 201 });
}
