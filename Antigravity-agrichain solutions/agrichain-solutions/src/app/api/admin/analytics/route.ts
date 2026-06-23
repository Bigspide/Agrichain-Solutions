import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

async function isAdmin(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return false;
  }
  return true;
}

export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Forbidden: Admin access only" }, { status: 403 });
  }

  try {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // 1. Active Users (DAU, WAU, MAU, YAU)
    const dau = await prisma.userActivity.count({
      where: { timestamp: { gte: startOfDay } },
    });
    const wau = await prisma.userActivity.count({
      where: { timestamp: { gte: startOfWeek } },
    });
    const mau = await prisma.userActivity.count({
      where: { timestamp: { gte: startOfMonth } },
    });
    const yau = await prisma.userActivity.count({
      where: { timestamp: { gte: startOfYear } },
    });

    // 2. Global Engagement
    const engagement = await prisma.user.aggregate({
      _avg: { totalTimeSpent: true },
      _sum: { totalTimeSpent: true },
      _count: { id: true },
    });

    // 3. Growth Metrics
    const growth = await prisma.user.count({
      where: { createdAt: { gte: startOfMonth } },
    });

    return NextResponse.json({
      metrics: {
        activeUsers: { dau, wau, mau, yau },
        engagement: {
          avgTimeSpent: engagement._avg.totalTimeSpent || 0,
          totalTimeSpent: engagement._sum.totalTimeSpent || 0,
          totalUsers: engagement._count.id,
        },
        growth: {
          newUsersThisMonth: growth,
        },
      },
    });
  } catch (error) {
    console.error("Admin analytics error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
