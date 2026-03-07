# VeloMind Backend Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a functional backend with real AI inference, 2 smart contracts on Base, PostgreSQL history, and connect the existing React frontend to everything.

**Architecture:** Express TS backend on Railway calls OpenAI/Anthropic APIs behind a privacy layer (AES-256-GCM client encryption, keccak256 hashes on-chain). Two Solidity contracts (PaymentGateway + ProofRegistry) deployed via Hardhat. Frontend on Vercel wired to real APIs + wagmi contract calls.

**Tech Stack:** Express, TypeScript, Prisma, PostgreSQL, Hardhat, Solidity, wagmi/viem, OpenAI SDK, Anthropic SDK, AES-256-GCM (Web Crypto API)

---

### Task 1: Scaffold Hardhat project + contracts

**Files:**
- Create: `contracts/hardhat.config.ts`
- Create: `contracts/package.json`
- Create: `contracts/tsconfig.json`
- Create: `contracts/contracts/PaymentGateway.sol`
- Create: `contracts/contracts/ProofRegistry.sol`

**Step 1: Init Hardhat project**

```bash
cd C:/Users/victo/PROJETS/VELOMIND
mkdir contracts && cd contracts
npm init -y
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox typescript ts-node @types/node
npx hardhat init  # choose TypeScript project
```

**Step 2: Write PaymentGateway.sol**

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract PaymentGateway {
    address public owner;
    uint256 public constant INFERENCE_FEE = 0.00001 ether;

    event PaymentReceived(bytes32 indexed jobId, address indexed user, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function payForInference(bytes32 jobId) external payable {
        require(msg.value >= INFERENCE_FEE, "Insufficient fee");
        emit PaymentReceived(jobId, msg.sender, msg.value);
    }

    function withdraw() external onlyOwner {
        (bool ok, ) = owner.call{value: address(this).balance}("");
        require(ok, "Withdraw failed");
    }
}
```

**Step 3: Write ProofRegistry.sol**

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ProofRegistry {
    struct Proof {
        bytes32 jobId;
        address user;
        bytes32 inputHash;
        bytes32 outputHash;
        string model;
        uint256 timestamp;
    }

    mapping(bytes32 => Proof) public proofs;
    mapping(address => bytes32[]) public userProofs;

    event ProofSubmitted(
        bytes32 indexed jobId,
        address indexed user,
        bytes32 inputHash,
        bytes32 outputHash,
        string model,
        uint256 timestamp
    );

    function submitProof(
        bytes32 jobId,
        bytes32 inputHash,
        bytes32 outputHash,
        string calldata model
    ) external {
        require(proofs[jobId].timestamp == 0, "Proof already exists");

        proofs[jobId] = Proof({
            jobId: jobId,
            user: msg.sender,
            inputHash: inputHash,
            outputHash: outputHash,
            model: model,
            timestamp: block.timestamp
        });

        userProofs[msg.sender].push(jobId);

        emit ProofSubmitted(jobId, msg.sender, inputHash, outputHash, model, block.timestamp);
    }

    function getProof(bytes32 jobId) external view returns (Proof memory) {
        return proofs[jobId];
    }

    function getProofsByUser(address user) external view returns (bytes32[] memory) {
        return userProofs[user];
    }

    function getProofCount(address user) external view returns (uint256) {
        return userProofs[user].length;
    }
}
```

**Step 4: Compile contracts**

```bash
npx hardhat compile
```

Expected: Compilation successful, artifacts generated.

**Step 5: Commit**

```bash
git add contracts/
git commit -m "feat: scaffold hardhat project with PaymentGateway and ProofRegistry contracts"
```

---

### Task 2: Write contract tests + Hardhat deploy script

**Files:**
- Create: `contracts/test/PaymentGateway.test.ts`
- Create: `contracts/test/ProofRegistry.test.ts`
- Create: `contracts/scripts/deploy.ts`
- Create: `contracts/scripts/deploy-base.ts`

**Step 1: Write PaymentGateway tests**

```typescript
import { expect } from "chai";
import { ethers } from "hardhat";
import { PaymentGateway } from "../typechain-types";

describe("PaymentGateway", () => {
  let gateway: PaymentGateway;
  let owner: any, user: any;

  beforeEach(async () => {
    [owner, user] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("PaymentGateway");
    gateway = await Factory.deploy();
  });

  it("accepts payment for inference", async () => {
    const jobId = ethers.keccak256(ethers.toUtf8Bytes("job-1"));
    const fee = ethers.parseEther("0.00001");
    await expect(gateway.connect(user).payForInference(jobId, { value: fee }))
      .to.emit(gateway, "PaymentReceived")
      .withArgs(jobId, user.address, fee);
  });

  it("rejects insufficient fee", async () => {
    const jobId = ethers.keccak256(ethers.toUtf8Bytes("job-2"));
    await expect(
      gateway.connect(user).payForInference(jobId, { value: 0 })
    ).to.be.revertedWith("Insufficient fee");
  });

  it("allows owner to withdraw", async () => {
    const jobId = ethers.keccak256(ethers.toUtf8Bytes("job-3"));
    const fee = ethers.parseEther("0.00001");
    await gateway.connect(user).payForInference(jobId, { value: fee });
    await expect(gateway.connect(owner).withdraw()).to.changeEtherBalance(owner, fee);
  });

  it("blocks non-owner withdraw", async () => {
    await expect(gateway.connect(user).withdraw()).to.be.revertedWith("Not owner");
  });
});
```

**Step 2: Write ProofRegistry tests**

```typescript
import { expect } from "chai";
import { ethers } from "hardhat";
import { ProofRegistry } from "../typechain-types";

describe("ProofRegistry", () => {
  let registry: ProofRegistry;
  let user: any;

  beforeEach(async () => {
    [, user] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("ProofRegistry");
    registry = await Factory.deploy();
  });

  it("submits and retrieves a proof", async () => {
    const jobId = ethers.keccak256(ethers.toUtf8Bytes("job-1"));
    const inputHash = ethers.keccak256(ethers.toUtf8Bytes("input"));
    const outputHash = ethers.keccak256(ethers.toUtf8Bytes("output"));

    await expect(
      registry.connect(user).submitProof(jobId, inputHash, outputHash, "GPT-4 Private")
    ).to.emit(registry, "ProofSubmitted");

    const proof = await registry.getProof(jobId);
    expect(proof.user).to.equal(user.address);
    expect(proof.inputHash).to.equal(inputHash);
    expect(proof.model).to.equal("GPT-4 Private");
  });

  it("rejects duplicate proof", async () => {
    const jobId = ethers.keccak256(ethers.toUtf8Bytes("job-dup"));
    const h = ethers.keccak256(ethers.toUtf8Bytes("data"));
    await registry.connect(user).submitProof(jobId, h, h, "model");
    await expect(
      registry.connect(user).submitProof(jobId, h, h, "model")
    ).to.be.revertedWith("Proof already exists");
  });

  it("tracks proofs by user", async () => {
    const jobId = ethers.keccak256(ethers.toUtf8Bytes("job-user"));
    const h = ethers.keccak256(ethers.toUtf8Bytes("data"));
    await registry.connect(user).submitProof(jobId, h, h, "model");

    const ids = await registry.getProofsByUser(user.address);
    expect(ids.length).to.equal(1);
    expect(ids[0]).to.equal(jobId);
  });
});
```

**Step 3: Run tests**

```bash
cd C:/Users/victo/PROJETS/VELOMIND/contracts
npx hardhat test
```

Expected: All tests pass.

**Step 4: Write local deploy script**

```typescript
// scripts/deploy.ts
import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const Gateway = await ethers.getContractFactory("PaymentGateway");
  const gateway = await Gateway.deploy();
  await gateway.waitForDeployment();
  console.log("PaymentGateway:", await gateway.getAddress());

  const Registry = await ethers.getContractFactory("ProofRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();
  console.log("ProofRegistry:", await registry.getAddress());
}

main().catch(console.error);
```

**Step 5: Write Base deploy script**

```typescript
// scripts/deploy-base.ts
import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying to Base with:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

  const Gateway = await ethers.getContractFactory("PaymentGateway");
  const gateway = await Gateway.deploy();
  await gateway.waitForDeployment();
  const gatewayAddr = await gateway.getAddress();
  console.log("PaymentGateway:", gatewayAddr);

  const Registry = await ethers.getContractFactory("ProofRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();
  const registryAddr = await registry.getAddress();
  console.log("ProofRegistry:", registryAddr);

  console.log("\nUpdate frontend/src/config/contracts.ts with:");
  console.log(`PAYMENT_GATEWAY: "${gatewayAddr}"`);
  console.log(`PROOF_REGISTRY: "${registryAddr}"`);
}

main().catch(console.error);
```

**Step 6: Update hardhat.config.ts for Base network**

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    base: {
      url: "https://mainnet.base.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    hardhat: {},
  },
};

export default config;
```

**Step 7: Commit**

```bash
git add contracts/
git commit -m "feat: add contract tests and deploy scripts for local + Base"
```

---

### Task 3: Scaffold backend (Express + Prisma + PostgreSQL)

**Files:**
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `backend/prisma/schema.prisma`
- Create: `backend/src/index.ts`
- Create: `backend/src/config.ts`
- Create: `backend/.env.example`

**Step 1: Init backend project**

```bash
cd C:/Users/victo/PROJETS/VELOMIND
mkdir -p backend/src && cd backend
npm init -y
npm install express cors dotenv openai @anthropic-ai/sdk ethers
npm install --save-dev typescript ts-node @types/express @types/cors @types/node nodemon prisma
npx tsc --init
```

**Step 2: Write tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Step 3: Write Prisma schema**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Job {
  id            String   @id @default(uuid())
  walletAddress String
  model         String
  inputHash     String
  outputHash    String
  response      String?  // encrypted response stored temporarily
  txHash        String?
  proofTxHash   String?
  status        String   @default("pending") // pending, processing, verified, failed
  cost          String   @default("0.00001")
  createdAt     DateTime @default(now())

  proof Proof?
}

model Proof {
  id           String   @id @default(uuid())
  jobId        String   @unique
  inputHash    String
  outputHash   String
  onChainTxHash String?
  verified     Boolean  @default(false)
  createdAt    DateTime @default(now())

  job Job @relation(fields: [jobId], references: [id])
}
```

**Step 4: Write config.ts**

```typescript
import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "3001"),
  openaiKey: process.env.OPENAI_API_KEY || "",
  anthropicKey: process.env.ANTHROPIC_API_KEY || "",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
};
```

**Step 5: Write minimal index.ts**

```typescript
import express from "express";
import cors from "cors";
import { config } from "./config";

const app = express();
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

app.listen(config.port, () => {
  console.log(`VeloMind API running on port ${config.port}`);
});
```

**Step 6: Write .env.example**

```
DATABASE_URL=postgresql://user:password@localhost:5432/velomind
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

**Step 7: Add scripts to package.json**

Add to `scripts`:
```json
{
  "dev": "nodemon --exec ts-node src/index.ts",
  "build": "tsc",
  "start": "node dist/index.js",
  "db:push": "prisma db push",
  "db:generate": "prisma generate"
}
```

**Step 8: Init Prisma + generate client**

```bash
npx prisma generate
```

**Step 9: Commit**

```bash
git add backend/
git commit -m "feat: scaffold Express backend with Prisma schema"
```

---

### Task 4: Backend inference routes + AI integration

**Files:**
- Create: `backend/src/services/inference.ts`
- Create: `backend/src/services/crypto.ts`
- Create: `backend/src/routes/inference.ts`
- Modify: `backend/src/index.ts`

**Step 1: Write crypto service (hashing)**

```typescript
// src/services/crypto.ts
import { ethers } from "ethers";
import crypto from "crypto";

export function generateJobId(): string {
  return ethers.keccak256(ethers.toUtf8Bytes(`vm-${Date.now()}-${crypto.randomBytes(8).toString("hex")}`));
}

export function hashInput(input: string): string {
  return ethers.keccak256(ethers.toUtf8Bytes(input));
}

export function hashOutput(output: string): string {
  return ethers.keccak256(ethers.toUtf8Bytes(output));
}

// Server-side decryption of client-encrypted prompt
export function decryptPrompt(encryptedData: string, key: string): string {
  const data = JSON.parse(Buffer.from(encryptedData, "base64").toString());
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    Buffer.from(key, "hex"),
    Buffer.from(data.iv, "hex")
  );
  decipher.setAuthTag(Buffer.from(data.tag, "hex"));
  let decrypted = decipher.update(data.encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export function encryptResponse(text: string, key: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(
    "aes-256-gcm",
    Buffer.from(key, "hex"),
    iv
  );
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag();
  return Buffer.from(JSON.stringify({
    encrypted,
    iv: iv.toString("hex"),
    tag: tag.toString("hex"),
  })).toString("base64");
}
```

**Step 2: Write inference service**

```typescript
// src/services/inference.ts
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { config } from "../config";

const openai = new OpenAI({ apiKey: config.openaiKey });
const anthropic = new Anthropic({ apiKey: config.anthropicKey });

const MODEL_MAP: Record<string, { provider: "openai" | "anthropic"; model: string }> = {
  "GPT-4 Private": { provider: "openai", model: "gpt-4o-mini" },
  "LLaMA-70B Encrypted": { provider: "openai", model: "gpt-3.5-turbo" },
  "Mistral-7B Secure": { provider: "openai", model: "gpt-3.5-turbo" },
  "Claude-3 Private": { provider: "anthropic", model: "claude-haiku-4-5-20251001" },
};

export async function runInference(prompt: string, modelName: string): Promise<string> {
  const mapping = MODEL_MAP[modelName];
  if (!mapping) throw new Error(`Unknown model: ${modelName}`);

  if (mapping.provider === "openai") {
    const response = await openai.chat.completions.create({
      model: mapping.model,
      messages: [
        { role: "system", content: "You are a private AI assistant running on VeloMind's decentralized compute network. Provide helpful, concise responses." },
        { role: "user", content: prompt },
      ],
      max_tokens: 1024,
    });
    return response.choices[0]?.message?.content || "No response generated.";
  }

  // Anthropic
  const response = await anthropic.messages.create({
    model: mapping.model,
    max_tokens: 1024,
    system: "You are a private AI assistant running on VeloMind's decentralized compute network. Provide helpful, concise responses.",
    messages: [{ role: "user", content: prompt }],
  });
  const block = response.content[0];
  return block.type === "text" ? block.text : "No response generated.";
}
```

**Step 3: Write inference route**

```typescript
// src/routes/inference.ts
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { runInference } from "../services/inference";
import { generateJobId, hashInput, hashOutput, decryptPrompt, encryptResponse } from "../services/crypto";

const router = Router();
const prisma = new PrismaClient();

router.post("/", async (req, res) => {
  try {
    const { encryptedPrompt, model, walletAddress, encryptionKey } = req.body;

    if (!encryptedPrompt || !model || !walletAddress || !encryptionKey) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Decrypt prompt in memory
    const prompt = decryptPrompt(encryptedPrompt, encryptionKey);

    // Generate hashes
    const jobId = generateJobId();
    const inputHash = hashInput(prompt);

    // Create job record
    const job = await prisma.job.create({
      data: {
        id: jobId.slice(2), // remove 0x prefix for uuid compat
        walletAddress,
        model,
        inputHash,
        outputHash: "",
        status: "processing",
      },
    });

    // Run AI inference
    const output = await runInference(prompt, model);
    const outputHash = hashOutput(output);

    // Encrypt response for client
    const encryptedResponse = encryptResponse(output, encryptionKey);

    // Update job
    await prisma.job.update({
      where: { id: job.id },
      data: { outputHash, status: "pending", response: encryptedResponse },
    });

    res.json({
      jobId,
      encryptedResponse,
      inputHash,
      outputHash,
      model,
    });
  } catch (error: any) {
    console.error("Inference error:", error);
    res.status(500).json({ error: "Inference failed", message: error.message });
  }
});

export default router;
```

**Step 4: Write jobs/proofs/stats routes**

Create `backend/src/routes/jobs.ts`:

```typescript
import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.get("/:address", async (req, res) => {
  const jobs = await prisma.job.findMany({
    where: { walletAddress: req.params.address.toLowerCase() },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { proof: true },
  });
  res.json(jobs);
});

export default router;
```

Create `backend/src/routes/proofs.ts`:

```typescript
import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.get("/:jobId", async (req, res) => {
  const proof = await prisma.proof.findUnique({
    where: { jobId: req.params.jobId },
    include: { job: true },
  });
  if (!proof) return res.status(404).json({ error: "Proof not found" });
  res.json(proof);
});

// Confirm proof was submitted on-chain
router.post("/confirm", async (req, res) => {
  const { jobId, onChainTxHash } = req.body;
  const proof = await prisma.proof.upsert({
    where: { jobId },
    create: {
      jobId,
      inputHash: req.body.inputHash,
      outputHash: req.body.outputHash,
      onChainTxHash,
      verified: true,
    },
    update: { onChainTxHash, verified: true },
  });
  await prisma.job.update({
    where: { id: jobId },
    data: { proofTxHash: onChainTxHash, status: "verified" },
  });
  res.json(proof);
});

export default router;
```

Create `backend/src/routes/stats.ts`:

```typescript
import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.get("/:address", async (req, res) => {
  const address = req.params.address.toLowerCase();
  const [total, verified] = await Promise.all([
    prisma.job.count({ where: { walletAddress: address } }),
    prisma.job.count({ where: { walletAddress: address, status: "verified" } }),
  ]);
  res.json({
    totalInferences: total,
    verifiedProofs: verified,
    verificationRate: total > 0 ? ((verified / total) * 100).toFixed(1) : "0",
  });
});

export default router;
```

**Step 5: Wire routes into index.ts**

```typescript
import express from "express";
import cors from "cors";
import { config } from "./config";
import inferenceRouter from "./routes/inference";
import jobsRouter from "./routes/jobs";
import proofsRouter from "./routes/proofs";
import statsRouter from "./routes/stats";

const app = express();
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

app.use("/api/inference", inferenceRouter);
app.use("/api/jobs", jobsRouter);
app.use("/api/proofs", proofsRouter);
app.use("/api/stats", statsRouter);

app.listen(config.port, () => {
  console.log(`VeloMind API running on port ${config.port}`);
});
```

**Step 6: Commit**

```bash
git add backend/
git commit -m "feat: add inference, jobs, proofs, stats API routes with AI integration"
```

---

### Task 5: Frontend crypto utilities + API client

**Files:**
- Create: `frontend/src/lib/crypto.ts`
- Create: `frontend/src/lib/api.ts`
- Create: `frontend/src/config/contracts.ts`

**Step 1: Write client-side crypto (Web Crypto API)**

```typescript
// src/lib/crypto.ts
export async function generateEncryptionKey(): Promise<{ key: CryptoKey; keyHex: string }> {
  const key = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
  const raw = await crypto.subtle.exportKey("raw", key);
  const keyHex = Array.from(new Uint8Array(raw))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return { key, keyHex };
}

export async function encryptPrompt(text: string, key: CryptoKey): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(text);
  const cipherBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded
  );
  const cipher = new Uint8Array(cipherBuffer);
  // GCM appends 16-byte auth tag
  const encrypted = cipher.slice(0, cipher.length - 16);
  const tag = cipher.slice(cipher.length - 16);

  const payload = JSON.stringify({
    encrypted: Array.from(encrypted).map((b) => b.toString(16).padStart(2, "0")).join(""),
    iv: Array.from(iv).map((b) => b.toString(16).padStart(2, "0")).join(""),
    tag: Array.from(tag).map((b) => b.toString(16).padStart(2, "0")).join(""),
  });
  return btoa(payload);
}

export async function decryptResponse(encryptedBase64: string, key: CryptoKey): Promise<string> {
  const data = JSON.parse(atob(encryptedBase64));
  const iv = new Uint8Array(data.iv.match(/.{2}/g).map((h: string) => parseInt(h, 16)));
  const encrypted = new Uint8Array(data.encrypted.match(/.{2}/g).map((h: string) => parseInt(h, 16)));
  const tag = new Uint8Array(data.tag.match(/.{2}/g).map((h: string) => parseInt(h, 16)));

  // Combine encrypted + tag for GCM
  const combined = new Uint8Array(encrypted.length + tag.length);
  combined.set(encrypted);
  combined.set(tag, encrypted.length);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    combined
  );
  return new TextDecoder().decode(decrypted);
}
```

**Step 2: Write API client**

```typescript
// src/lib/api.ts
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export async function runInferenceAPI(params: {
  encryptedPrompt: string;
  model: string;
  walletAddress: string;
  encryptionKey: string;
}) {
  const res = await fetch(`${API_URL}/api/inference`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getJobs(address: string) {
  const res = await fetch(`${API_URL}/api/jobs/${address}`);
  return res.json();
}

export async function getProof(jobId: string) {
  const res = await fetch(`${API_URL}/api/proofs/${jobId}`);
  return res.json();
}

export async function confirmProof(params: {
  jobId: string;
  inputHash: string;
  outputHash: string;
  onChainTxHash: string;
}) {
  const res = await fetch(`${API_URL}/api/proofs/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return res.json();
}

export async function getStats(address: string) {
  const res = await fetch(`${API_URL}/api/stats/${address}`);
  return res.json();
}
```

**Step 3: Write contract config with ABIs**

```typescript
// src/config/contracts.ts
export const CONTRACTS = {
  paymentGateway: {
    address: import.meta.env.VITE_PAYMENT_GATEWAY || "0x..." as `0x${string}`,
    abi: [
      {
        name: "payForInference",
        type: "function",
        stateMutability: "payable",
        inputs: [{ name: "jobId", type: "bytes32" }],
        outputs: [],
      },
      {
        name: "INFERENCE_FEE",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [{ name: "", type: "uint256" }],
      },
    ] as const,
  },
  proofRegistry: {
    address: import.meta.env.VITE_PROOF_REGISTRY || "0x..." as `0x${string}`,
    abi: [
      {
        name: "submitProof",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
          { name: "jobId", type: "bytes32" },
          { name: "inputHash", type: "bytes32" },
          { name: "outputHash", type: "bytes32" },
          { name: "model", type: "string" },
        ],
        outputs: [],
      },
      {
        name: "getProof",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "jobId", type: "bytes32" }],
        outputs: [
          {
            name: "",
            type: "tuple",
            components: [
              { name: "jobId", type: "bytes32" },
              { name: "user", type: "address" },
              { name: "inputHash", type: "bytes32" },
              { name: "outputHash", type: "bytes32" },
              { name: "model", type: "string" },
              { name: "timestamp", type: "uint256" },
            ],
          },
        ],
      },
      {
        name: "getProofsByUser",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "user", type: "address" }],
        outputs: [{ name: "", type: "bytes32[]" }],
      },
      {
        name: "getProofCount",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "user", type: "address" }],
        outputs: [{ name: "", type: "uint256" }],
      },
    ] as const,
  },
};
```

**Step 4: Commit**

```bash
git add frontend/src/lib/ frontend/src/config/contracts.ts
git commit -m "feat: add client-side crypto, API client, and contract config"
```

---

### Task 6: Wire frontend pages to real backend + contracts

**Files:**
- Modify: `frontend/src/pages/RunInference.tsx`
- Modify: `frontend/src/pages/DashboardHome.tsx`
- Modify: `frontend/src/pages/HistoryPage.tsx`
- Modify: `frontend/src/pages/ProofExplorer.tsx`

**Step 1: Rewrite RunInference.tsx**

Replace the `setTimeout` mock with:
1. Generate AES key
2. Encrypt prompt client-side
3. Call backend API
4. Call `PaymentGateway.payForInference()` via wagmi
5. Call `ProofRegistry.submitProof()` via wagmi
6. Call `confirmProof()` API
7. Decrypt response and display

Use `useWriteContract` from wagmi for contract calls.
Use the crypto utilities from `src/lib/crypto.ts`.
Use the API client from `src/lib/api.ts`.
Keep the same UI structure and styling, just replace the mock logic.

**Step 2: Rewrite DashboardHome.tsx**

Replace mock stats with `useQuery` fetching from `/api/stats/:address`.
Replace mock jobs with `useQuery` fetching from `/api/jobs/:address`.
Use `useAccount` from wagmi to get the connected address.
Show "Connect wallet to view stats" if not connected.

**Step 3: Rewrite HistoryPage.tsx**

Replace mock data with `useQuery` fetching from `/api/jobs/:address`.
Add real status colors based on job.status from DB.
Link "View" arrow to BaseScan tx if proofTxHash exists.

**Step 4: Rewrite ProofExplorer.tsx**

Replace mock proofs with on-chain data via `useReadContract` reading `getProofsByUser`.
For each proof ID, fetch proof details via `getProof` contract call.
Add BaseScan links for txHash.
Keep search filter working on the fetched data.

**Step 5: Commit**

```bash
git add frontend/src/pages/
git commit -m "feat: wire all frontend pages to real backend API and contracts"
```

---

### Task 7: Refresh frontend UX (landing + dashboard)

**Files:**
- Modify: `frontend/src/pages/Landing.tsx`
- Modify: `frontend/src/components/DashboardLayout.tsx`
- Modify: `frontend/src/pages/DashboardHome.tsx`
- Modify: `frontend/src/index.css`

**Step 1: Use frontend-design skill**

Invoke `frontend-design` skill to refresh:
- Landing page: better hero layout, smoother animations, improved spacing
- Dashboard sidebar: add wallet info panel at bottom, add network status indicator
- Dashboard home: add a simple activity chart (recharts already installed), better card layout
- Keep the same color palette (neon green primary, dark blue background, glass morphism)
- Keep Space Grotesk headings + Inter body text

**Step 2: Commit**

```bash
git add frontend/
git commit -m "feat: refresh landing and dashboard UX"
```

---

### Task 8: Local integration test (Hardhat node)

**Step 1: Start local Hardhat node**

```bash
cd C:/Users/victo/PROJETS/VELOMIND/contracts
npx hardhat node
```

**Step 2: Deploy contracts locally**

```bash
npx hardhat run scripts/deploy.ts --network localhost
```

Copy addresses to `frontend/.env.local`:
```
VITE_PAYMENT_GATEWAY=0x...
VITE_PROOF_REGISTRY=0x...
VITE_API_URL=http://localhost:3001
```

**Step 3: Start backend**

```bash
cd C:/Users/victo/PROJETS/VELOMIND/backend
cp .env.example .env  # fill in API keys + local DB URL
npm run db:push
npm run dev
```

**Step 4: Start frontend**

```bash
cd C:/Users/victo/PROJETS/VELOMIND/frontend
npm run dev
```

**Step 5: Test full flow**

1. Connect MetaMask to localhost:8545
2. Import a Hardhat test account
3. Run an inference
4. Verify payment + proof submission
5. Check history and proof explorer

**Step 6: Commit**

```bash
git commit -m "chore: integration test verified on local Hardhat node"
```

---

### Task 9: Deploy to Base Mainnet + Railway + Vercel

**Step 1: Deploy contracts to Base**

```bash
cd C:/Users/victo/PROJETS/VELOMIND/contracts
# Set PRIVATE_KEY in .env (funded Base wallet)
npx hardhat run scripts/deploy-base.ts --network base
```

**Step 2: Deploy backend to Railway**

- Push backend/ to Railway
- Set env vars: DATABASE_URL (Railway Postgres), OPENAI_API_KEY, ANTHROPIC_API_KEY, CORS_ORIGIN
- Run `npx prisma db push` in Railway

**Step 3: Deploy frontend to Vercel**

- Set env vars: VITE_API_URL, VITE_PAYMENT_GATEWAY, VITE_PROOF_REGISTRY
- Deploy

**Step 4: Verify end-to-end on mainnet**

**Step 5: Final commit**

```bash
git commit -m "chore: deploy to Base mainnet, Railway, and Vercel"
```
