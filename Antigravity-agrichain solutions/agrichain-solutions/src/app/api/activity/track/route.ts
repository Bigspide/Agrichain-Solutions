import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, action, entity, entityId, duration, userAgent, ip } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { error: "UserId and action are required" },
        { status: 400 }
      );
    }

    // Create activity record
    await prisma.userActivity.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        duration,
        ip: ip || req.ip,
        userAgent: userAgent || req.headers.get("user-agent"),
      },
    });

    // Update User aggregate metrics
    if (duration) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          totalTimeSpent: {
            increment: duration,
          },
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Activity tracking error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
