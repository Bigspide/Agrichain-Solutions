"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { canManageResource } from "@/lib/security/rbac";

const productSchema = z.object({
  name: z.string().min(2).max(160),
  description: z.string().min(10).max(2000),
  category: z.string().min(2).max(80),
  price: z.coerce.number().positive(),
  unit: z.string().min(1).max(30),
  quantity: z.coerce.number().nonnegative(),
  minOrder: z.coerce.number().positive().default(1),
  images: z.array(z.string()).default([]),
  origin: z.string().min(2).max(180),
  certifications: z.array(z.string().max(80)).default([]),
  isOrganic: z.boolean().default(false),
  farmId: z.string().uuid().optional(),
  traceCode: z.string().max(80).optional(),
});

export async function createProductAction(input: unknown) {
  const user = await requireUser();
  if (!["producer", "cooperative", "admin"].includes(user.role)) return { ok: false, error: "FORBIDDEN" };

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "INVALID_INPUT", details: parsed.error.flatten() };

  if (parsed.data.farmId) {
    const farm = await prisma.farm.findUnique({ where: { id: parsed.data.farmId }, select: { ownerId: true } });
    if (!farm || !canManageResource(user.role, farm.ownerId, user.id)) return { ok: false, error: "FORBIDDEN" };
  }

  const product = await prisma.product.create({
    data: { ...parsed.data, sellerId: user.id, currency: "XOF", status: "available" },
  });
  await prisma.auditLog.create({ data: { actorId: user.id, action: "product.create", entity: "Product", entityId: product.id } });
  revalidatePath("/dashboard/marketplace");
  return { ok: true, productId: product.id };
}

export async function updateProductAction(productId: string, input: unknown) {
  const user = await requireUser();
  const product = await prisma.product.findUnique({ where: { id: productId }, select: { sellerId: true } });
  if (!product || !canManageResource(user.role, product.sellerId, user.id)) return { ok: false, error: "FORBIDDEN" };

  const parsed = productSchema.partial().safeParse(input);
  if (!parsed.success) return { ok: false, error: "INVALID_INPUT", details: parsed.error.flatten() };

  await prisma.product.update({ where: { id: productId }, data: parsed.data });
  await prisma.auditLog.create({ data: { actorId: user.id, action: "product.update", entity: "Product", entityId: productId } });
  revalidatePath("/dashboard/marketplace");
  return { ok: true };
}

export async function deleteProductAction(productId: string) {
  const user = await requireUser();
  const product = await prisma.product.findUnique({ where: { id: productId }, select: { sellerId: true } });
  if (!product || !canManageResource(user.role, product.sellerId, user.id)) return { ok: false, error: "FORBIDDEN" };

  await prisma.product.update({ where: { id: productId }, data: { status: "sold_out" } });
  await prisma.auditLog.create({ data: { actorId: user.id, action: "product.archive", entity: "Product", entityId: productId } });
  revalidatePath("/dashboard/marketplace");
  return { ok: true };
}
