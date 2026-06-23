"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";

const traceEventSchema = z.object({
  traceRecordId: z.string().uuid(),
  type: z.string().min(2).max(80),
  title: z.string().min(2).max(160),
  description: z.string().min(2).max(1000),
  location: z.string().min(2).max(180),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  data: z.record(z.string(), z.unknown()).optional(),
});

export async function createTraceEventAction(input: unknown) {
  const user = await requireUser();
  const parsed = traceEventSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "INVALID_INPUT", details: parsed.error.flatten() };
  const { data, ...traceData } = parsed.data;

  const event = await prisma.traceEvent.create({
    data: {
      ...traceData,
      data: data ? (data as Prisma.InputJsonValue) : undefined,
      actor: user.name,
      actorRole: user.role,
      verified: user.role === "admin" || user.role === "cooperative",
    },
  });

  const payloadHash = `0x${crypto.createHash("sha256").update(JSON.stringify({ eventId: event.id, traceRecordId: event.traceRecordId })).digest("hex")}`;
  await prisma.blockchainAnchor.create({
    data: {
      traceRecordId: event.traceRecordId,
      chainId: Number(process.env.EVM_CHAIN_ID || 11155111),
      payloadHash,
      status: "pending",
    },
  });
  await prisma.auditLog.create({ data: { actorId: user.id, action: "trace.event.create", entity: "TraceEvent", entityId: event.id, metadata: { payloadHash } } });
  revalidatePath("/dashboard/traceability");
  return { ok: true, eventId: event.id, payloadHash };
}

export async function generateQrTagAction(traceRecordId: string) {
  const user = await requireUser();
  const trace = await prisma.traceRecord.findUnique({ where: { id: traceRecordId }, select: { id: true, traceCode: true } });
  if (!trace) return { ok: false, error: "TRACE_NOT_FOUND" };

  const tag = `AGR-${trace.traceCode}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
  const qr = await prisma.qRTag.create({ data: { traceRecordId: trace.id, tag } });
  await prisma.auditLog.create({ data: { actorId: user.id, action: "qr.generate", entity: "QRTag", entityId: qr.id } });
  revalidatePath("/dashboard/traceability");
  return { ok: true, tag };
}
