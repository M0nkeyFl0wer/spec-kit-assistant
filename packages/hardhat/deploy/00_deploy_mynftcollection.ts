import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployMyNFTCollection: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("MyNFTCollection", {
    from: deployer,
    args: [], // Add constructor arguments here
    log: true,
    autoMine: true,
  });

  // Get the deployed contract
  const mynftcollection = await hre.ethers.getContract("MyNFTCollection", deployer);
  console.log("MyNFTCollection deployed to:", await mynftcollection.getAddress());
};

export default deployMyNFTCollection;

deployMyNFTCollection.tags = ["MyNFTCollection"];
