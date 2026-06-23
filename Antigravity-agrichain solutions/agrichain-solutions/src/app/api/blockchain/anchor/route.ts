import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { anchorToBlockchain } from "@/lib/blockchain-service";

const anchorSchema = z.object({
  traceRecordId: z.string().uuid().optional(),
  payload: z.unknown(),
});

export async function POST(request: Request) {
  const user = await requireUser();
  if (!["producer", "cooperative", "admin"].includes(user.role)) {
    return NextResponse.json({ error: "Role not allowed to anchor traceability events" }, { status: 403 });
  }

  const parsed = anchorSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid anchor payload" }, { status: 400 });
  }

  const payloadHash = `0x${createHash("sha256").update(JSON.stringify(parsed.data.payload)).digest("hex")}`;
  const chainId = Number(process.env.EVM_CHAIN_ID || 11155111);

  try {
    // Perform actual on-chain broadcast
    const broadcast = await anchorToBlockchain(payloadHash, parsed.data.traceRecordId || "unknown");
    
    const anchor = await prisma.blockchainAnchor.create({
      data: {
        traceRecordId: parsed.data.traceRecordId,
        chainId,
        contractAddress: process.env.TRACE_REGISTRY_ADDRESS,
        payloadHash,
        status: "broadcasted",
        txHash: broadcast.txHash,
        error: null,
      },
    });

    return NextResponse.json({ anchor, payloadHash, broadcastConfigured: true }, { status: 201 });
  } catch (error: any) {
    // Fallback: Create a pending anchor if broadcast fails
    const anchor = await prisma.blockchainAnchor.create({
      data: {
        traceRecordId: parsed.data.traceRecordId,
        chainId,
        contractAddress: process.env.TRACE_REGISTRY_ADDRESS,
        payloadHash,
        status: "failed",
        error: error.message,
      },
    });
    return NextResponse.json({ anchor, payloadHash, broadcastConfigured: false, error: error.message }, { status: 500 });
  }
}

