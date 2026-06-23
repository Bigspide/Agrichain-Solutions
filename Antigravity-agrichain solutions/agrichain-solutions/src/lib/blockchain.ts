import { prisma } from "@/lib/db";

/**
 * Retrieves the latest blockchain anchor for a given product/trace record.
 * Used in the marketplace to show the "Verified on Blockchain" status.
 */
export async function getBlockchainAnchor(traceCode: string | null) {
  if (!traceCode) return null;

  try {
    // Find the product by traceCode first to get the traceRecordId
    const product = await prisma.product.findUnique({
      where: { traceCode },
    });

    if (!product) return null;

    // We assume the trace record is linked to the product via the traceCode
    // Looking for the most recent anchor associated with this trace code
    const anchor = await prisma.blockchainAnchor.findFirst({
      where: {
        // In our schema, BlockchainAnchor is linked to TraceRecord. 
        // We need to find the TraceRecord that matches this traceCode.
        traceRecord: {
          traceCode: traceCode,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return anchor;
  } catch (error) {
    console.error(`[BlockchainLib] Error fetching anchor for traceCode ${traceCode}:`, error);
    return null;
  }
}
