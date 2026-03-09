# VeloMind

Verifiable AI inference layer on Base. Run models, generate cryptographic proofs, anchor results on-chain.

VeloMind bridges the gap between off-chain AI computation and on-chain verifiability. Every inference request is hashed, executed, and registered as an immutable proof on the Base L2 — enabling trustless auditability for AI-powered applications.

---

## Architecture

```
                                 +------------------+
                                 |   Base L2 Chain   |
                                 |  (EVM / 8453)     |
                                 +--------+---------+
                                          |
                          +---------------+---------------+
                          |                               |
                 +--------v---------+           +---------v--------+
                 |  PaymentGateway  |           |  ProofRegistry   |
                 |  0xbFE0...3F7C   |           |  0xF5e0...F11F   |
                 +------------------+           +------------------+
                          |                               ^
                          |  payForInference()            |  submitProof()
                          |                               |
              +-----------v-------------------------------+-----------+
              |                    VeloMind API                       |
              |              Express / Prisma / TypeScript            |
              +---+-------------------------------------------+------+
                  |                                           |
        +---------v----------+                   +------------v-----------+
        |   Inference Engine  |                   |   Proof Generator      |
        |   OpenAI / Anthropic|                   |   SHA-256 + Keccak256 |
        +--------------------+                   +------------------------+
                  |
        +---------v----------+
        |   React Frontend    |
        |   Wagmi / Viem      |
        +--------------------+
```

## Contracts

Deployed and verified on Base Mainnet.

| Contract | Address | Purpose |
|---|---|---|
| PaymentGateway | [`0xbFE0F6CeBEB3B5D5156c4206e4013688Ce673F7C`](https://basescan.org/address/0xbFE0F6CeBEB3B5D5156c4206e4013688Ce673F7C#code) | Handles inference fee collection with per-job payment tracking |
| ProofRegistry | [`0xF5e0e64af3B1066F8c651Ad0f6eA09904f7EF11F`](https://basescan.org/address/0xF5e0e64af3B1066F8c651Ad0f6eA09904f7EF11F#code) | Stores and indexes inference proofs by job ID and user address |

### PaymentGateway

Accepts ETH payments tied to a `bytes32` job identifier. Enforces a minimum inference fee and emits `PaymentReceived` events for off-chain indexing.

```solidity
function payForInference(bytes32 jobId) external payable
```

### ProofRegistry

Immutable proof store. Each proof contains the job ID, user address, input/output hashes, model identifier, and block timestamp. Supports lookups by job ID and enumeration by user address.

```solidity
function submitProof(bytes32 jobId, bytes32 inputHash, bytes32 outputHash, string calldata model) external
function getProof(bytes32 jobId) external view returns (Proof memory)
function getProofsByUser(address user) external view returns (bytes32[] memory)
```

## Tech Stack

### Smart Contracts
- **Solidity 0.8.24** — Minimal, gas-optimized contracts with no external dependencies
- **Hardhat** — Compilation, testing, deployment, and BaseScan verification
- **TypeChain** — Auto-generated TypeScript bindings for type-safe contract interaction
- **Base L2** — Low-cost EVM execution with Ethereum L1 security

### Backend
- **Express 5** — HTTP API layer with structured route handlers
- **Prisma ORM** — Type-safe database access with PostgreSQL
- **OpenAI SDK** — GPT model inference integration
- **Anthropic SDK** — Claude model inference integration
- **ethers.js 6** — On-chain proof submission and transaction management
- **TypeScript** — Strict mode, full type coverage

### Frontend
- **React 18** — Component architecture with hooks
- **Vite** — Sub-second HMR, optimized production builds
- **Wagmi 2 / Viem 2** — Wallet connection, contract reads/writes, transaction lifecycle
- **TailwindCSS** — Utility-first styling
- **Radix UI** — Accessible, unstyled component primitives
- **TanStack Query** — Server state management with caching and background refetching
- **Framer Motion** — Layout animations and page transitions
- **Recharts** — Data visualization for inference analytics

### Infrastructure
- **Railway** — Backend hosting with managed PostgreSQL
- **Vercel** — Frontend edge deployment with automatic previews
- **BaseScan** — Contract source verification

## How It Works

1. **User connects wallet** via injected provider (MetaMask, Rabby, etc.)
2. **Submits inference request** — prompt is encrypted client-side before transmission
3. **Payment** — `PaymentGateway.payForInference()` locks the fee on-chain
4. **Execution** — Backend routes the request to the selected model (GPT-4, Claude)
5. **Proof generation** — Input and output are hashed (SHA-256), then combined into a Keccak256 digest
6. **On-chain anchoring** — `ProofRegistry.submitProof()` writes the proof immutably
7. **Verification** — Anyone can call `getProof(jobId)` to verify the inference record

## API

```
POST /api/inference       — Submit encrypted inference request
GET  /api/jobs/:address   — List jobs by wallet address
GET  /api/proofs/:jobId   — Retrieve proof for a specific job
POST /api/proofs/confirm  — Confirm on-chain proof submission
GET  /api/stats/:address  — Aggregated stats for a wallet
GET  /api/health          — Service health check
```

## Development

```bash
# Install dependencies
cd contracts && npm install
cd ../backend && npm install
cd ../frontend && npm install

# Start local Hardhat node
cd contracts && npx hardhat node

# Deploy contracts locally
npx hardhat run scripts/deploy.ts --network localhost

# Run backend
cd backend && npm run dev

# Run frontend
cd frontend && npm run dev
```

## License

MIT
