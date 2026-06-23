"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";

const registerSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(180),
  password: z.string().min(10).max(200),
  role: z.enum(["producer", "cooperative", "logistics", "industry", "consumer", "admin", "investor"]).default("consumer"),
  phone: z.string().max(40).optional(),
  country: z.string().min(2).max(80).default("CI"),
  language: z.string().min(2).max(10).default("fr"),
});

export async function registerUserAction(input: unknown) {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "INVALID_INPUT", details: parsed.error.flatten() };

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (existing) return { ok: false, error: "EMAIL_ALREADY_EXISTS" };

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      passwordHash: await hashPassword(parsed.data.password),
      role: parsed.data.role,
      phone: parsed.data.phone,
      country: parsed.data.country,
      language: parsed.data.language,
    },
    select: { id: true, email: true, name: true, role: true },
  });

  await prisma.auditLog.create({ data: { actorId: user.id, action: "auth.register", entity: "User", entityId: user.id } });
  return { ok: true, user };
}
