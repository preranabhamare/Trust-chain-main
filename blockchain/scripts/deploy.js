const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("==================================================");
  console.log("Deploying TrustChainAudit Smart Contract (Person 3)...");
  console.log("==================================================");

  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deployer Account: ${deployer.address}`);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`Account Balance:  ${hre.ethers.formatEther(balance)} ETH`);

  // Deploy Contract
  const TrustChainAudit = await hre.ethers.getContractFactory("TrustChainAudit");
  const auditContract = await TrustChainAudit.deploy();
  await auditContract.waitForDeployment();

  const contractAddress = await auditContract.getAddress();
  console.log(`\n>>> TrustChainAudit successfully deployed to: ${contractAddress} <<<`);

  // Get Contract Artifact / ABI
  const artifact = await hre.artifacts.readArtifact("TrustChainAudit");

  const deploymentData = {
    contractAddress: contractAddress,
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    abi: artifact.abi,
  };

  // 1. Save in blockchain folder
  const blockchainOut = path.join(__dirname, "..", "deployedAddress.json");
  fs.writeFileSync(blockchainOut, JSON.stringify(deploymentData, null, 2));
  console.log(`Saved deployment info to: ${blockchainOut}`);

  // 2. Export to frontend for MetaMask integration
  const frontendContractsDir = path.join(__dirname, "..", "..", "frontend", "src", "contracts");
  if (!fs.existsSync(frontendContractsDir)) {
    fs.mkdirSync(frontendContractsDir, { recursive: true });
  }
  const frontendOut = path.join(frontendContractsDir, "TrustChainAudit.json");
  fs.writeFileSync(frontendOut, JSON.stringify(deploymentData, null, 2));
  console.log(`Saved frontend artifact to: ${frontendOut}`);

  // 3. Export to backend for Python connector
  const backendOut = path.join(__dirname, "..", "..", "backend", "contract_info.json");
  fs.writeFileSync(backendOut, JSON.stringify(deploymentData, null, 2));
  console.log(`Saved backend contract info to: ${backendOut}`);

  console.log("\nDeployment completed successfully!");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
