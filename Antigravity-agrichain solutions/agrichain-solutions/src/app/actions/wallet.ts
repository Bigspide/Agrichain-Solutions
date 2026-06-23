"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";

const transferSchema = z.object({
  recipientUserId: z.string().uuid(),
  amount: z.coerce.number().positive(),
  description: z.string().min(3).max(240),
  category: z.string().min(2).max(80).default("transfer"),
});

export async function walletTransferAction(input: unknown) {
  const user = await requireUser();
  const parsed = transferSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "INVALID_INPUT", details: parsed.error.flatten() };
  if (parsed.data.recipientUserId === user.id) return { ok: false, error: "SELF_TRANSFER" };

  const recipient = await prisma.user.findUnique({ where: { id: parsed.data.recipientUserId }, select: { id: true } });
  if (!recipient) return { ok: false, error: "RECIPIENT_NOT_FOUND" };

  const reference = `TRF-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  await prisma.$transaction([
    prisma.walletTransaction.create({
      data: {
        userId: user.id,
        type: "debit",
        amount: parsed.data.amount,
        description: parsed.data.description,
        category: parsed.data.category,
        reference: `${reference}-D`,
      },
    }),
    prisma.walletTransaction.create({
      data: {
        userId: recipient.id,
        type: "credit",
        amount: parsed.data.amount,
        description: parsed.data.description,
        category: parsed.data.category,
        reference: `${reference}-C`,
      },
    }),
    prisma.auditLog.create({ data: { actorId: user.id, action: "wallet.transfer", entity: "WalletTransaction", metadata: { reference, amount: parsed.data.amount } } }),
  ]);

  revalidatePath("/dashboard/wallet");
  return { ok: true, reference };
}
