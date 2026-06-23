import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { walletDto } from "@/lib/api/serializers";

export async function GET() {
  const user = await requireUser();
  const entries = await prisma.walletTransaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ wallet: walletDto(entries) });
}

