import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying to BSC with:", deployer.address);
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
