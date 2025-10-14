import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployStakingPool: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("StakingPool", {
    from: deployer,
    args: [], // Add constructor arguments here
    log: true,
    autoMine: true,
  });

  // Get the deployed contract
  const stakingpool = await hre.ethers.getContract("StakingPool", deployer);
  console.log("StakingPool deployed to:", await stakingpool.getAddress());
};

export default deployStakingPool;

deployStakingPool.tags = ["StakingPool"];
