import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployMyToken: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("MyToken", {
    from: deployer,
    args: [], // Add constructor arguments here
    log: true,
    autoMine: true,
  });

  // Get the deployed contract
  const mytoken = await hre.ethers.getContract("MyToken", deployer);
  console.log("MyToken deployed to:", await mytoken.getAddress());
};

export default deployMyToken;

deployMyToken.tags = ["MyToken"];
