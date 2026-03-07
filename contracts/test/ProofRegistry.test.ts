import { expect } from "chai";
import { ethers } from "hardhat";

describe("ProofRegistry", () => {
  let registry: any;
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
