import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { submitRequest } from "@/lib/requests";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { title, description, priority } = await req.json();

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    }

    await submitRequest(user.id, title, description, priority);

    return NextResponse.json({ success: true, message: "Your request has been submitted to the development team." });
  } catch (error) {
    console.error("Request submission error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
