import { ethers } from "ethers";

export async function anchorToBlockchain(payloadHash: string, traceRecordId: string) {
  const rpcUrl = process.env.EVM_RPC_URL;
  const privateKey = process.env.EVM_PRIVATE_KEY;
  const contractAddress = process.env.TRACE_REGISTRY_ADDRESS;

  if (!rpcUrl || !privateKey || !contractAddress) {
    throw new Error("Blockchain configuration missing (RPC_URL, PRIVATE_KEY, or ADDRESS)");
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  
  // Minimal ABI for the TraceRegistry contract
  const abi = [
    "function recordTrace(string traceId, string payloadHash) public returns (bytes32)",
    "function verifyTrace(string traceId) public view returns (string)"
  ];
  
  const contract = new ethers.Contract(contractAddress, abi, wallet);

  try {
    const tx = await contract.recordTrace(traceRecordId, payloadHash);
    const receipt = await tx.wait();
    return {
      success: true,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
    };
  } catch (error: any) {
    console.error("[BlockchainLib] Broadcast failed:", error);
    throw new Error(`Blockchain broadcast failed: ${error.message}`);
  }
}
