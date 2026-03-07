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
