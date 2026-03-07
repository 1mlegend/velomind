# VeloMind Backend Design

## Overview
Functional backend for VeloMind — verifiable & private AI inference on Base.
Real AI inference behind a privacy layer, 2 smart contracts, PostgreSQL history.

## Stack
- Frontend: Vite + React + TS + shadcn + wagmi -> Vercel
- Backend: Express + TypeScript + Prisma + PostgreSQL -> Railway
- Contracts: Hardhat, Solidity -> Base Mainnet (test Hardhat local first)

## User Flow
1. Connect wallet (injected/MetaMask)
2. Write prompt, select model
3. Frontend encrypts prompt (AES-256-GCM, client-derived key)
4. Frontend sends encrypted prompt to backend API
5. Backend decrypts in memory, calls AI API (OpenAI/Anthropic)
6. Backend generates keccak256 hashes of input + output
7. Backend returns: encrypted response + hashes
8. Frontend calls PaymentGateway.pay() -> 0.00001 ETH
9. After payment confirmed, frontend calls ProofRegistry.submitProof()
10. Frontend decrypts and displays response

## Smart Contracts

### PaymentGateway.sol
- `payForInference(bytes32 jobId)` payable, require msg.value >= 0.00001 ETH
- `withdraw()` owner only
- Event `PaymentReceived(jobId, user, amount)`

### ProofRegistry.sol
- `submitProof(bytes32 jobId, bytes32 inputHash, bytes32 outputHash, string model)`
- `getProof(bytes32 jobId)` -> struct
- `getProofsByUser(address)` -> list
- Event `ProofSubmitted(jobId, user, inputHash, outputHash, model, timestamp)`

## Backend API (Express TS)

| Endpoint | Method | Description |
|---|---|---|
| /api/inference | POST | Encrypted prompt + model -> AI response + hashes |
| /api/jobs/:address | GET | Job history for a wallet |
| /api/proofs/:jobId | GET | Proof detail |
| /api/stats/:address | GET | Dashboard stats |

## Privacy Layer
- AES-256-GCM encryption client-side before sending
- Backend decrypts in memory only, never stores raw prompt
- On-chain: only bytes32 hashes (keccak256) — looks legit
- ProofExplorer shows on-chain hashes with BaseScan links

## Model Mapping
| Frontend Label | Real API |
|---|---|
| GPT-4 Private | OpenAI GPT-4o-mini |
| LLaMA-70B Encrypted | OpenAI GPT-3.5-turbo |
| Mistral-7B Secure | OpenAI GPT-3.5-turbo |
| Claude-3 Private | Anthropic Claude Haiku |

## Database (Prisma + PostgreSQL)

### jobs
- id (uuid), walletAddress, model, prompt (never stored), inputHash, outputHash, txHash, proofTxHash, status (pending/processing/verified/failed), cost, createdAt

### proofs
- id (uuid), jobId (FK), inputHash, outputHash, onChainTxHash, verified, createdAt

## Frontend Updates
- Refresh UX on landing/dashboard (same color palette, better layout)
- Connect all pages to real API endpoints
- Integrate wagmi contract calls (payment + proof submission)

## Deployment
- Backend: Railway (Express + PostgreSQL)
- Frontend: Vercel
- Contracts: Hardhat deploy to Base Mainnet
