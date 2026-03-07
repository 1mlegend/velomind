import { expect } from "chai";
import { ethers } from "hardhat";

describe("PaymentGateway", () => {
  let gateway: any;
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
