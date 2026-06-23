import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const locale = new URL(request.url).searchParams.get("locale") || "fr";
  const courses = await prisma.course.findMany({
    where: { OR: [{ locale }, { locale: "fr" }] },
    orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
    take: 40,
  });
  return NextResponse.json({ courses });
}

