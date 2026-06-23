import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { rateLimit, requestIp } from "@/lib/security/rate-limit";

const registerSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(180),
  phone: z.string().min(6).max(40).optional().or(z.literal("")),
  password: z.string().min(8).max(160),
  confirmPassword: z.string().min(8).max(160),
  role: z.enum(["producer", "cooperative", "logistics", "industry", "consumer", "investor"]),
  location: z.string().max(160).optional().or(z.literal("")),
});

export async function POST(request: Request) {
  const ip = requestIp(request.headers);
  const limit = rateLimit(`register:${ip}`, 5, 10 * 60_000);
  if (!limit.ok) {
    return NextResponse.json({ error: "Trop de tentatives. Réessayez plus tard." }, { status: 429 });
  }

  const parsed = registerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Données d'inscription invalides." }, { status: 400 });
  }
  if (parsed.data.password !== parsed.data.confirmPassword) {
    return NextResponse.json({ error: "Les mots de passe ne correspondent pas." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    return NextResponse.json({ error: "Un compte existe déjà avec cette adresse." }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      email,
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      location: parsed.data.location || null,
      role: parsed.data.role,
      passwordHash: hashPassword(parsed.data.password),
      language: "fr",
      country: "CI",
    },
    select: { id: true, email: true, name: true, role: true },
  });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "auth.register",
      entity: "User",
      entityId: user.id,
      metadata: { email: user.email, role: user.role },
      ip,
      userAgent: request.headers.get("user-agent") || undefined,
    },
  });

  return NextResponse.json({ user }, { status: 201 });
}
