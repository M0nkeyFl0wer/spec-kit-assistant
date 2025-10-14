/**
 * Scaffold-ETH Integration Module
 * Detects and integrates with Scaffold-ETH-2 projects
 */

import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';

export class ScaffoldEthIntegration {
  constructor(projectPath = process.cwd()) {
    this.projectPath = projectPath;
    this.packagesPath = path.join(projectPath, 'packages');
    this.hardhatPath = path.join(this.packagesPath, 'hardhat');
    this.nextjsPath = path.join(this.packagesPath, 'nextjs');
  }

  /**
   * Detect if current directory is a Scaffold-ETH-2 project
   */
  async isScaffoldEthProject() {
    try {
      // Check for SE-2 structure: packages/hardhat and packages/nextjs
      const hasHardhat = await fs.pathExists(this.hardhatPath);
      const hasNextjs = await fs.pathExists(this.nextjsPath);

      if (hasHardhat && hasNextjs) {
        console.log(chalk.green('🔗 Scaffold-ETH-2 project detected!'));
        return true;
      }

      // Check for package.json with scaffold-eth dependencies
      const packageJsonPath = path.join(this.projectPath, 'package.json');
      if (await fs.pathExists(packageJsonPath)) {
        const packageJson = await fs.readJson(packageJsonPath);
        const hasScaffoldDeps =
          packageJson.name?.includes('scaffold-eth') ||
          packageJson.dependencies?.['@se-2/common'] ||
          packageJson.workspaces?.includes('packages/*');

        if (hasScaffoldDeps) {
          console.log(chalk.green('🔗 Scaffold-ETH project detected!'));
          return true;
        }
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get project information
   */
  async getProjectInfo() {
    const info = {
      type: 'scaffold-eth-2',
      hasHardhat: await fs.pathExists(this.hardhatPath),
      hasNextjs: await fs.pathExists(this.nextjsPath),
      contracts: [],
      deployedContracts: {},
      networks: []
    };

    // Get contracts
    if (info.hasHardhat) {
      const contractsPath = path.join(this.hardhatPath, 'contracts');
      if (await fs.pathExists(contractsPath)) {
        const files = await fs.readdir(contractsPath);
        info.contracts = files.filter(f => f.endsWith('.sol'));
      }

      // Get networks from hardhat config
      const configPath = path.join(this.hardhatPath, 'hardhat.config.ts');
      if (await fs.pathExists(configPath)) {
        const config = await fs.readFile(configPath, 'utf-8');
        // Parse networks (simplified)
        if (config.includes('localhost')) info.networks.push('localhost');
        if (config.includes('sepolia')) info.networks.push('sepolia');
        if (config.includes('mainnet')) info.networks.push('mainnet');
      }
    }

    // Get deployed contracts
    if (info.hasNextjs) {
      const deployedPath = path.join(this.nextjsPath, 'contracts', 'deployedContracts.ts');
      if (await fs.pathExists(deployedPath)) {
        try {
          const deployed = await fs.readFile(deployedPath, 'utf-8');
          // Parse deployed contracts (simplified)
          info.hasDeployedContracts = deployed.length > 100; // Basic check
        } catch (error) {
          // Ignore parse errors
        }
      }
    }

    return info;
  }

  /**
   * Generate a new Solidity contract
   */
  async generateContract(contractName, contractType = 'basic') {
    const contractPath = path.join(this.hardhatPath, 'contracts', `${contractName}.sol`);

    const templates = {
      basic: this.generateBasicContract(contractName),
      erc721: this.generateERC721Contract(contractName),
      erc20: this.generateERC20Contract(contractName),
      staking: this.generateStakingContract(contractName),
      marketplace: this.generateMarketplaceContract(contractName)
    };

    const contractCode = templates[contractType] || templates.basic;

    await fs.ensureDir(path.dirname(contractPath));
    await fs.writeFile(contractPath, contractCode);

    console.log(chalk.green(`✅ Contract created: ${contractPath}`));
    return contractPath;
  }

  /**
   * Generate deployment script
   */
  async generateDeployScript(contractName) {
    const deployPath = path.join(this.hardhatPath, 'deploy', `00_deploy_${contractName.toLowerCase()}.ts`);

    const deployScript = `import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deploy${contractName}: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("${contractName}", {
    from: deployer,
    args: [], // Add constructor arguments here
    log: true,
    autoMine: true,
  });

  // Get the deployed contract
  const ${contractName.toLowerCase()} = await hre.ethers.getContract("${contractName}", deployer);
  console.log("${contractName} deployed to:", await ${contractName.toLowerCase()}.getAddress());
};

export default deploy${contractName};

deploy${contractName}.tags = ["${contractName}"];
`;

    await fs.ensureDir(path.dirname(deployPath));
    await fs.writeFile(deployPath, deployScript);

    console.log(chalk.green(`✅ Deploy script created: ${deployPath}`));
    return deployPath;
  }

  /**
   * Generate frontend component
   */
  async generateFrontendComponent(contractName, componentType = 'interact') {
    const componentPath = path.join(
      this.nextjsPath,
      'components',
      `${contractName}Component.tsx`
    );

    const component = this.generateReactComponent(contractName, componentType);

    await fs.ensureDir(path.dirname(componentPath));
    await fs.writeFile(componentPath, component);

    console.log(chalk.green(`✅ Component created: ${componentPath}`));
    return componentPath;
  }

  /**
   * Generate React component for contract interaction
   */
  generateReactComponent(contractName, componentType) {
    return `"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

export const ${contractName}Component = () => {
  const { address } = useAccount();

  // Read from contract
  const { data: value } = useScaffoldContractRead({
    contractName: "${contractName}",
    functionName: "getValue", // Change to your read function
  });

  // Write to contract
  const { writeAsync: writeValue } = useScaffoldContractWrite({
    contractName: "${contractName}",
    functionName: "setValue", // Change to your write function
    args: [0n], // Add your arguments
  });

  const handleWrite = async () => {
    try {
      await writeValue();
      notification.success("Transaction successful!");
    } catch (error) {
      notification.error("Transaction failed");
      console.error(error);
    }
  };

  return (
    <div className="card w-96 bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">${contractName}</h2>

        {address ? (
          <>
            <div className="stats shadow">
              <div className="stat">
                <div className="stat-title">Current Value</div>
                <div className="stat-value">{value?.toString() || "0"}</div>
              </div>
            </div>

            <div className="card-actions justify-end">
              <button className="btn btn-primary" onClick={handleWrite}>
                Update Value
              </button>
            </div>
          </>
        ) : (
          <p>Please connect your wallet</p>
        )}
      </div>
    </div>
  );
};
`;
  }

  /**
   * Contract Templates
   */
  generateBasicContract(name) {
    return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ${name}
 * @author Generated by Spec Kit Assistant
 */
contract ${name} {
    address public owner;
    uint256 public value;

    event ValueChanged(uint256 newValue);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function setValue(uint256 _value) external onlyOwner {
        value = _value;
        emit ValueChanged(_value);
    }

    function getValue() external view returns (uint256) {
        return value;
    }
}
`;
  }

  generateERC721Contract(name) {
    return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ${name}
 * @author Generated by Spec Kit Assistant
 */
contract ${name} is ERC721, Ownable {
    uint256 private _nextTokenId;
    uint256 public constant MAX_SUPPLY = 10000;

    constructor() ERC721("${name}", "NFT") Ownable(msg.sender) {}

    function mint(address to) external onlyOwner {
        require(_nextTokenId < MAX_SUPPLY, "Max supply reached");
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
    }

    function totalSupply() external view returns (uint256) {
        return _nextTokenId;
    }
}
`;
  }

  generateERC20Contract(name) {
    return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ${name}
 * @author Generated by Spec Kit Assistant
 */
contract ${name} is ERC20, Ownable {
    constructor() ERC20("${name}", "TKN") Ownable(msg.sender) {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
`;
  }

  generateStakingContract(name) {
    return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title ${name}
 * @author Generated by Spec Kit Assistant
 */
contract ${name} is ReentrancyGuard {
    IERC20 public stakingToken;
    IERC20 public rewardToken;

    uint256 public rewardRate = 100; // Rewards per second

    mapping(address => uint256) public stakedBalance;
    mapping(address => uint256) public lastUpdateTime;
    mapping(address => uint256) public rewards;

    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);

    constructor(address _stakingToken, address _rewardToken) {
        stakingToken = IERC20(_stakingToken);
        rewardToken = IERC20(_rewardToken);
    }

    function stake(uint256 amount) external nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Cannot stake 0");
        stakedBalance[msg.sender] += amount;
        stakingToken.transferFrom(msg.sender, address(this), amount);
        emit Staked(msg.sender, amount);
    }

    function withdraw(uint256 amount) external nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Cannot withdraw 0");
        require(stakedBalance[msg.sender] >= amount, "Insufficient balance");
        stakedBalance[msg.sender] -= amount;
        stakingToken.transfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }

    function claimReward() external nonReentrant updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            rewardToken.transfer(msg.sender, reward);
            emit RewardPaid(msg.sender, reward);
        }
    }

    function earned(address account) public view returns (uint256) {
        return stakedBalance[account] *
            (block.timestamp - lastUpdateTime[account]) *
            rewardRate / 1e18 + rewards[account];
    }

    modifier updateReward(address account) {
        rewards[account] = earned(account);
        lastUpdateTime[account] = block.timestamp;
        _;
    }
}
`;
  }

  generateMarketplaceContract(name) {
    return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title ${name}
 * @author Generated by Spec Kit Assistant
 */
contract ${name} is ReentrancyGuard {
    struct Listing {
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 price;
        bool active;
    }

    mapping(bytes32 => Listing) public listings;
    uint256 public listingFee = 0.025 ether;

    event ItemListed(
        bytes32 indexed listingId,
        address indexed seller,
        address indexed nftContract,
        uint256 tokenId,
        uint256 price
    );

    event ItemSold(
        bytes32 indexed listingId,
        address indexed buyer,
        uint256 price
    );

    function listItem(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) external payable nonReentrant {
        require(price > 0, "Price must be greater than 0");
        require(msg.value >= listingFee, "Insufficient listing fee");

        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "Not owner");
        require(nft.getApproved(tokenId) == address(this) ||
                nft.isApprovedForAll(msg.sender, address(this)),
                "Not approved");

        bytes32 listingId = keccak256(abi.encodePacked(
            nftContract,
            tokenId,
            msg.sender,
            block.timestamp
        ));

        listings[listingId] = Listing({
            seller: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            price: price,
            active: true
        });

        emit ItemListed(listingId, msg.sender, nftContract, tokenId, price);
    }

    function buyItem(bytes32 listingId) external payable nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(msg.value >= listing.price, "Insufficient payment");

        listing.active = false;

        IERC721(listing.nftContract).safeTransferFrom(
            listing.seller,
            msg.sender,
            listing.tokenId
        );

        payable(listing.seller).transfer(listing.price);

        // Refund excess payment
        if (msg.value > listing.price) {
            payable(msg.sender).transfer(msg.value - listing.price);
        }

        emit ItemSold(listingId, msg.sender, listing.price);
    }

    function cancelListing(bytes32 listingId) external {
        Listing storage listing = listings[listingId];
        require(listing.seller == msg.sender, "Not seller");
        require(listing.active, "Listing not active");

        listing.active = false;
    }
}
`;
  }

  /**
   * Run commands in project
   */
  async runCommand(command, description) {
    console.log(chalk.blue(`\n🔧 ${description}...`));
    try {
      const result = execSync(command, {
        cwd: this.projectPath,
        stdio: 'inherit'
      });
      console.log(chalk.green(`✅ ${description} complete`));
      return result;
    } catch (error) {
      console.error(chalk.red(`❌ ${description} failed`));
      throw error;
    }
  }

  /**
   * Deploy contracts
   */
  async deploy(network = 'localhost') {
    if (!await this.isScaffoldEthProject()) {
      throw new Error('Not a Scaffold-ETH project');
    }

    await this.runCommand(
      `cd ${this.hardhatPath} && yarn deploy --network ${network}`,
      `Deploying contracts to ${network}`
    );
  }

  /**
   * Start local chain
   */
  async startChain() {
    if (!await this.isScaffoldEthProject()) {
      throw new Error('Not a Scaffold-ETH project');
    }

    await this.runCommand(
      `cd ${this.hardhatPath} && yarn chain`,
      'Starting local blockchain'
    );
  }

  /**
   * Start frontend
   */
  async startFrontend() {
    if (!await this.isScaffoldEthProject()) {
      throw new Error('Not a Scaffold-ETH project');
    }

    await this.runCommand(
      `cd ${this.nextjsPath} && yarn start`,
      'Starting Next.js frontend'
    );
  }
}

export default ScaffoldEthIntegration;
