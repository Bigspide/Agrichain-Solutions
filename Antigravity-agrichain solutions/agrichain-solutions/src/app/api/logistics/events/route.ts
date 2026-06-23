import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";

const eventSchema = z.object({
  tripId: z.string().uuid(),
  latitude: z.number(),
  longitude: z.number(),
  speedKph: z.number().optional(),
  heading: z.number().optional(),
});

export async function GET(request: Request) {
  await requireUser();
  const orderId = new URL(request.url).searchParams.get("orderId");
  const trip = await prisma.logisticsTrip.findFirst({
    where: orderId ? { orderId } : {},
    include: { gpsEvents: { orderBy: { recordedAt: "asc" } }, order: { include: { items: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ trip });
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (!["logistics", "admin"].includes(user.role)) {
    return NextResponse.json({ error: "Only logistics operators can publish GPS events" }, { status: 403 });
  }

  const parsed = eventSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid GPS event" }, { status: 400 });
  }

  const event = await prisma.gpsEvent.create({ data: parsed.data });
  await prisma.logisticsTrip.update({
    where: { id: parsed.data.tripId },
    data: { currentLat: parsed.data.latitude, currentLng: parsed.data.longitude, status: "in_transit" },
  });

  return NextResponse.json({ event }, { status: 201 });
}

