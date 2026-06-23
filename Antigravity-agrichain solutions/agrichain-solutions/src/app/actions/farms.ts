"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { canManageResource } from "@/lib/security/rbac";

const farmSchema = z.object({
  name: z.string().min(2).max(160),
  region: z.string().max(120).optional(),
  country: z.string().min(2).max(80).default("CI"),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
});

const fieldSchema = z.object({
  farmId: z.string().uuid(),
  name: z.string().min(2).max(160),
  areaHa: z.coerce.number().positive().optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
});

const cropSchema = z.object({
  fieldId: z.string().uuid(),
  name: z.string().min(2).max(120),
  variety: z.string().max(120).optional(),
  plantedAt: z.coerce.date().optional(),
  harvestedAt: z.coerce.date().optional(),
});

export async function createFarmAction(input: unknown) {
  const user = await requireUser();
  if (!["producer", "cooperative", "admin"].includes(user.role)) return { ok: false, error: "FORBIDDEN" };

  const parsed = farmSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "INVALID_INPUT", details: parsed.error.flatten() };

  const farm = await prisma.farm.create({ data: { ...parsed.data, ownerId: user.id } });
  await prisma.auditLog.create({ data: { actorId: user.id, action: "farm.create", entity: "Farm", entityId: farm.id } });
  revalidatePath("/dashboard");
  return { ok: true, farmId: farm.id };
}

export async function updateFarmAction(farmId: string, input: unknown) {
  const user = await requireUser();
  const farm = await prisma.farm.findUnique({ where: { id: farmId }, select: { ownerId: true } });
  if (!farm || !canManageResource(user.role, farm.ownerId, user.id)) return { ok: false, error: "FORBIDDEN" };

  const parsed = farmSchema.partial().safeParse(input);
  if (!parsed.success) return { ok: false, error: "INVALID_INPUT", details: parsed.error.flatten() };

  await prisma.farm.update({ where: { id: farmId }, data: parsed.data });
  await prisma.auditLog.create({ data: { actorId: user.id, action: "farm.update", entity: "Farm", entityId: farmId } });
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteFarmAction(farmId: string) {
  const user = await requireUser();
  const farm = await prisma.farm.findUnique({ where: { id: farmId }, select: { ownerId: true } });
  if (!farm || !canManageResource(user.role, farm.ownerId, user.id)) return { ok: false, error: "FORBIDDEN" };

  await prisma.farm.delete({ where: { id: farmId } });
  await prisma.auditLog.create({ data: { actorId: user.id, action: "farm.delete", entity: "Farm", entityId: farmId } });
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function createFieldAction(input: unknown) {
  const user = await requireUser();
  const parsed = fieldSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "INVALID_INPUT", details: parsed.error.flatten() };

  const farm = await prisma.farm.findUnique({ where: { id: parsed.data.farmId }, select: { ownerId: true } });
  if (!farm || !canManageResource(user.role, farm.ownerId, user.id)) return { ok: false, error: "FORBIDDEN" };

  const field = await prisma.field.create({ data: { ...parsed.data, ownerId: user.id } });
  await prisma.auditLog.create({ data: { actorId: user.id, action: "field.create", entity: "Field", entityId: field.id } });
  revalidatePath("/dashboard");
  return { ok: true, fieldId: field.id };
}

export async function upsertCropAction(input: unknown) {
  const user = await requireUser();
  const parsed = cropSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "INVALID_INPUT", details: parsed.error.flatten() };

  const field = await prisma.field.findUnique({ where: { id: parsed.data.fieldId }, include: { farm: { select: { ownerId: true } } } });
  if (!field || !canManageResource(user.role, field.farm.ownerId, user.id)) return { ok: false, error: "FORBIDDEN" };

  const crop = await prisma.crop.upsert({
    where: { fieldId: parsed.data.fieldId },
    update: parsed.data,
    create: parsed.data,
  });
  await prisma.auditLog.create({ data: { actorId: user.id, action: "crop.upsert", entity: "Crop", entityId: crop.id } });
  revalidatePath("/dashboard");
  return { ok: true, cropId: crop.id };
}
