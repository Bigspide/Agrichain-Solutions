import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { traceDto } from "@/lib/api/serializers";

export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const trace = await prisma.traceRecord.findUnique({
    where: { traceCode: decodeURIComponent(code) },
    include: { events: { orderBy: { timestamp: "asc" } }, certificates: true },
  });

  if (!trace) {
    return NextResponse.json({ error: "Trace not found" }, { status: 404 });
  }

  return NextResponse.json({ trace: traceDto(trace) });
}

