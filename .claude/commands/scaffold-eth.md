# Scaffold-ETH Integration Command

You are assisting with a Scaffold-ETH-2 project using the Spec Kit Assistant integration.

## Context

Scaffold-ETH-2 is a modern Ethereum development stack with:
- **Hardhat** for smart contract development and deployment
- **Next.js** frontend with TypeScript
- **RainbowKit** for wallet connections
- **wagmi** hooks for Web3 interactions
- **Viem** for Ethereum interactions

The integration module is located at `src/integrations/scaffold-eth.js`

## Your Role

When the user invokes `/scaffold-eth`, you should:

### 1. Detect Project Structure

First, check if this is a Scaffold-ETH project:

```javascript
import { ScaffoldEthIntegration } from './src/integrations/scaffold-eth.js';
const integration = new ScaffoldEthIntegration();
const isScaffoldEth = await integration.isScaffoldEthProject();
```

### 2. Available Actions

**Generate Smart Contracts:**
- Basic contract (storage, getter/setter)
- ERC-721 NFT contract
- ERC-20 token contract
- Staking contract
- NFT Marketplace contract

**Generate Deployment Scripts:**
- Hardhat deploy scripts in `packages/hardhat/deploy/`
- Follow Scaffold-ETH-2 patterns

**Generate Frontend Components:**
- React components with Scaffold-ETH hooks
- Located in `packages/nextjs/components/`
- Uses wagmi, viem, and Scaffold-ETH utilities

**Project Management:**
- Deploy contracts to networks
- Start local blockchain
- Start Next.js frontend

### 3. User Workflow

When user requests contract generation:

```javascript
// Example: Generate NFT contract
const contractPath = await integration.generateContract('MyNFT', 'erc721');
const deployPath = await integration.generateDeployScript('MyNFT');
const componentPath = await integration.generateFrontendComponent('MyNFT', 'interact');
```

### 4. Best Practices

**Contract Generation:**
- Always use OpenZeppelin contracts for standards (ERC-20, ERC-721)
- Include proper access control (Ownable, AccessControl)
- Add ReentrancyGuard for functions that transfer ETH/tokens
- Emit events for important state changes
- Follow Solidity 0.8.20+ best practices

**Frontend Integration:**
- Use `useScaffoldContractRead` for reading blockchain state
- Use `useScaffoldContractWrite` for writing to contracts
- Handle wallet connection states properly
- Show appropriate loading and error states
- Use Scaffold-ETH notification system

**Deployment:**
- Test on localhost first
- Use testnets (Sepolia) before mainnet
- Verify contracts on Etherscan
- Document constructor arguments

### 5. Contract Templates Available

| Template | Use Case | Key Features |
|----------|----------|--------------|
| `basic` | Simple storage contract | Owner-only, value storage, events |
| `erc721` | NFT collection | Max supply, minting, OpenZeppelin |
| `erc20` | Fungible token | Minting, standard ERC-20 |
| `staking` | Token staking | Rewards, non-reentrant, earned() |
| `marketplace` | NFT trading | Listings, buying, fees |

### 6. Example Interactions

**User:** "Create an NFT contract called CoolPunks"

**You should:**
1. Generate ERC-721 contract
2. Create deployment script
3. Generate minting component
4. Provide next steps (deploy, test)

**User:** "Add staking for my token"

**You should:**
1. Generate staking contract
2. Link to existing token contract
3. Create staking UI component
4. Explain reward mechanism

**User:** "Deploy to Sepolia testnet"

**You should:**
1. Check hardhat config has Sepolia
2. Verify wallet has testnet ETH
3. Run deployment
4. Provide contract address and Etherscan link

### 7. Integration with Spec Kit Assistant

This slash command integrates with:
- **Swarm system**: Can deploy web3-swarm for multi-file generation
- **Spec validation**: Ensures generated code matches spec
- **Git integration**: Auto-commits generated contracts
- **Security scanning**: Runs Slither/Mythril on generated contracts

### 8. Error Handling

**Not a Scaffold-ETH project:**
- Offer to create one with `npx create-eth@latest`
- Or suggest using hardhat integration instead

**Missing dependencies:**
- Check for yarn, hardhat, foundry
- Provide installation commands

**Deployment failures:**
- Check network connection
- Verify wallet has funds
- Check for contract errors

### 9. Common User Requests

**"Create a complete NFT project"**
→ Generate ERC-721 + marketplace + minting UI

**"Add governance"**
→ Generate DAO contract + voting UI

**"Create a DEX"**
→ Generate AMM contract + swap UI

**"Audit my contract"**
→ Run red-team swarm with Slither

### 10. Output Format

Always structure your response:

```markdown
## 🔗 Scaffold-ETH Integration

### Generated Files:
- ✅ Contract: `packages/hardhat/contracts/MyContract.sol`
- ✅ Deploy: `packages/hardhat/deploy/00_deploy_mycontract.ts`
- ✅ Component: `packages/nextjs/components/MyContractComponent.tsx`

### Next Steps:
1. Deploy contract: `yarn deploy --network localhost`
2. Start frontend: `yarn start`
3. Visit: http://localhost:3000

### Testing:
- Unit tests: `yarn hardhat:test`
- Coverage: `yarn hardhat:coverage`
```

---

## Quick Reference

### File Structure
```
packages/
├── hardhat/
│   ├── contracts/          # Your Solidity contracts
│   ├── deploy/             # Deployment scripts
│   ├── test/               # Contract tests
│   └── hardhat.config.ts   # Network config
└── nextjs/
    ├── components/         # React components
    ├── hooks/              # Custom hooks
    └── contracts/          # Generated ABIs and types
```

### Key Commands
```bash
yarn chain          # Start local blockchain
yarn deploy         # Deploy contracts
yarn start          # Start Next.js frontend
yarn hardhat:test   # Run contract tests
yarn verify         # Verify on Etherscan
```

---

**Remember:** Scaffold-ETH is the FOUNDATION for all Web3 development in Spec Kit Assistant. Make it easy, delightful, and powerful!

🌱 **Built with love by Spec Dog** 🐕
