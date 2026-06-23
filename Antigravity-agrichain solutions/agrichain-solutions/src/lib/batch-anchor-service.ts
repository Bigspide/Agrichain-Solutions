import { ethers } from "ethers";
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

/**
 * BATCH-ANCHOR-SERVICE: High-Scale Blockchain Provenance
 * Instead of anchoring every single event (expensive), this service
 * aggregates data into Merkle Trees and anchors only the root.
 */

export class BatchAnchorService {
  private static instance: BatchAnchorService;
  private queue: any[] = [];
  private batchSize = 100;

  private constructor() {}

  public static getInstance(): BatchAnchorService {
    if (!BatchAnchorService.instance) {
      BatchAnchorService.instance = new BatchAnchorService();
    }
    return BatchAnchorService.instance;
  }

  /**
   * Adds a record to the current batch queue.
   */
  async queueForAnchoring(traceId: string, payload: any) {
    this.queue.push({ traceId, payload, timestamp: new Date() });
    logger.debug(`[Batch-Anchor] Record ${traceId} queued. Queue size: ${this.queue.length}`);

    if (this.queue.length >= this.batchSize) {
      await this.processBatch();
    }
  }

  /**
   * Processes the queue: Calculates Merkle Root and anchors to BatchAnchor.sol
   */
  async processBatch() {
    if (this.queue.length === 0) return;

    logger.info(`[Batch-Anchor] Processing batch of ${this.queue.length} records...`);
    const currentBatch = [...this.queue];
    this.queue = [];

    try {
      // 1. Generate Merkle Root (Simplified implementation)
      const leafHashes = currentBatch.map(item => 
        ethers.id(JSON.stringify(item))
      );
      const merkleRoot = this.calculateMerkleRoot(leafHashes);
      
      const batchCode = `BATCH-${Date.now()}`;
      const uri = `https://api.agrichain.solutions/provenance/${batchCode}`;

      // 2. Anchor to Blockchain
      const rpcUrl = process.env.EVM_RPC_URL;
      const privateKey = process.env.EVM_PRIVATE_KEY;
      const contractAddress = process.env.BATCH_ANCHOR_ADDRESS;

      if (!rpcUrl || !privateKey || !contractAddress) {
        throw new Error("BatchAnchor config missing");
      }

      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const wallet = new ethers.Wallet(privateKey, provider);
      const abi = ["function anchorBatch(bytes32 merkleRoot, string batchCode, string uri) public"];
      const contract = new ethers.Contract(contractAddress, abi, wallet);

      const tx = await contract.anchorBatch(merkleRoot, batchCode, uri);
      const receipt = await tx.wait();

      logger.info(`[Batch-Anchor] Batch ${batchCode} anchored! Tx: ${receipt.hash}`);

      // 3. Update DB records with the batch reference
      await prisma.nexusEvolution.updateMany({
        where: { 
          createdAt: { gte: currentBatch[0].timestamp } 
        },
        data: { 
          status: 'anchored_batch',
          blockchainHash: receipt.hash 
        }
      });

    } catch (error: any) {
      logger.error(`[Batch-Anchor] Batch processing failed: ${error.message}`);
      // Re-queue items on failure
      this.queue = [...currentBatch, ...this.queue];
    }
  }

  private calculateMerkleRoot(hashes: string[]): string {
    if (hashes.length === 0) return ethers.ZeroAddress;
    if (hashes.length === 1) return hashes[0];

    const nextLevel: string[] = [];
    for (let i = 0; i < hashes.length; i += 2) {
      const left = hashes[i];
      const right = hashes[i + 1] || hashes[i];
      nextLevel.push(ethers.id(left + right));
    }
    return this.calculateMerkleRoot(nextLevel);
  }
}

export const batchAnchorService = BatchAnchorService.getInstance();
