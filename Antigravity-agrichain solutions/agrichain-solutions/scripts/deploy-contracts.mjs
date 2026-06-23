#!/usr/bin/env node
console.log(`AgriChain contract deployment checklist:

1. Compile contracts/TraceRegistry.sol, contracts/CertificationRegistry.sol, and contracts/BatchAnchor.sol with solc 0.8.24 or a Hardhat/Foundry pipeline.
2. Deploy to the configured EVM testnet.
3. Set TRACE_REGISTRY_ADDRESS, CERTIFICATION_REGISTRY_ADDRESS, and BATCH_ANCHOR_ADDRESS in the environment.
4. Use /api/blockchain/anchor to create auditable payload hashes and persist broadcast state.

This repository intentionally avoids committing private keys or generated artifacts.`);

