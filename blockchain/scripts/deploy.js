import hardhat from "hardhat";

async function main() {
  const { ethers } = hardhat;
  
  console.log("Deploying BugBounty contract...");
  const BugBounty = await ethers.getContractFactory("BugBounty");
  const bugBounty = await BugBounty.deploy();

  await bugBounty.waitForDeployment();

  const address = await bugBounty.getAddress();
  console.log(`BugBounty deployed to: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
