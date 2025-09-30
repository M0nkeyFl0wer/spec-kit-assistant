# Feature Specification: Web3 Context Templates for Ethereum dApp Development

**Feature Branch**: `789-web3-context-templates`
**Created**: 2025-09-29
**Status**: Draft
**Dependencies**: Feature 788 (context engineering infrastructure)

## Core Insight

**Spec Kit is a context engineer** (from Feature 788). This feature extends it with **domain-specific Web3 context templates** - pre-built question banks, persona patterns, and best practices for Ethereum dApp development. Think of it as "hardwiring" Scaffold-ETH patterns and Web3 knowledge into the context elicitation process.

## Executive Summary

Extend the context engineering system (Feature 788) with Web3-specific personas, Scaffold-ETH boilerplate templates, smart contract security patterns, and Ethereum dApp best practices. When users say "build a dApp", the system provides battle-tested context extraction specifically for Web3 development.

---

## The Opportunity

### Current State (After Feature 788)
- ✅ Generic personas: Security, UX, Architecture, QA
- ✅ Generic context elicitation
- ❌ No domain-specific knowledge for Web3

### Enhanced State (Feature 789)
- ✅ **Web3-Specific Personas**: Smart contract security, DeFi patterns, gas optimization, wallet UX
- ✅ **Scaffold-ETH Templates**: Pre-configured project structures for common dApp types
- ✅ **Pattern Library**: AMM, NFT marketplace, DAO, token patterns
- ✅ **Security Context**: Reentrancy, overflow, access control patterns baked in

---

## User Scenarios & Testing

### Primary User Story
As a Web3 developer using Spec Kit Assistant, when I start a new Ethereum dApp specification, the system MUST recognize the Web3 domain and automatically provide Scaffold-ETH patterns, smart contract security context, gas optimization questions, and wallet integration best practices, so that I build secure, efficient dApps without missing critical Web3-specific requirements.

### Acceptance Scenarios

1. **Web3 Domain Detection**
   - **Given** user says "build an NFT marketplace"
   - **When** system begins context elicitation
   - **Then** Web3 domain detected, specialized personas activated

2. **Smart Contract Security Persona**
   - **Given** user describes contract functionality
   - **When** security persona activates
   - **Then** asks about reentrancy, integer overflow, access control, upgrade patterns

3. **Scaffold-ETH Template Selection**
   - **Given** user confirms building DEX
   - **When** system generates project structure
   - **Then** provides Scaffold-ETH DEX template with Uniswap V2 patterns

4. **Gas Optimization Context**
   - **Given** user describes contract operations
   - **When** gas optimization persona activates
   - **Then** suggests storage patterns, batch operations, efficient data structures

5. **Wallet Integration UX**
   - **Given** user describes frontend
   - **When** UX persona activates for Web3
   - **Then** asks about MetaMask, WalletConnect, network switching, transaction feedback

### Edge Cases
- **EC-001**: User says "blockchain" but means non-Ethereum (detect and offer alternatives)
- **EC-002**: User unfamiliar with Web3 (offer educational context, simpler patterns)
- **EC-003**: Advanced user (skip basics, focus on optimization and edge cases)

---

## Requirements

### Functional Requirements: Web3 Domain Detection

**FR-001**: System MUST detect Web3/Ethereum keywords in user vision:
- Keywords: blockchain, dApp, smart contract, NFT, DeFi, token, wallet, Ethereum, Solidity, web3

**FR-002**: System MUST load Web3 persona templates when domain detected

**FR-003**: System MUST offer Scaffold-ETH templates for common dApp types:
- DEX (Decentralized Exchange)
- NFT Marketplace
- DAO (Decentralized Autonomous Organization)
- Token (ERC-20, ERC-721, ERC-1155)
- Lending Protocol
- Staking Platform

### Functional Requirements: Web3-Specific Personas

**FR-004**: System MUST provide **Smart Contract Security & Privacy Persona**:
```yaml
Questions:
  - "What assets does this contract hold?"
  - "Who can call sensitive functions?"
  - "Are there external calls to untrusted contracts?"
  - "How are you preventing reentrancy?"
  - "What happens if ETH/tokens get stuck?"
  - "Do you need upgradeability?"
  - "What transaction data needs to be private?"
  - "Are you protecting against MEV/front-running?"
  - "What user data is exposed on-chain?"
  - "Do you need commit-reveal or zero-knowledge proofs?"

Context Extracted:
  - Asset custody patterns
  - Access control requirements
  - External dependency risks
  - Reentrancy protection needs
  - Recovery mechanisms
  - Upgrade strategy
  - Privacy requirements (ZK, commit-reveal)
  - MEV protection strategies
  - On-chain data minimization
```

**FR-005**: System MUST provide **DeFi Patterns Persona**:
```yaml
Questions:
  - "What's the core financial primitive? (AMM/Lending/Staking)"
  - "What oracle are you using for price feeds?"
  - "How do you handle slippage?"
  - "What's your liquidation strategy?"
  - "How do users provide liquidity?"

Context Extracted:
  - Financial primitive type
  - Oracle integration requirements
  - Slippage tolerance
  - Liquidation mechanisms
  - Liquidity provision model
```

**FR-006**: System MUST provide **Gas Optimization Persona**:
```yaml
Questions:
  - "What operations happen most frequently?"
  - "What data needs to be on-chain vs off-chain?"
  - "Are you batching operations?"
  - "What's your expected transaction volume?"

Context Extracted:
  - Frequency patterns
  - Storage optimization opportunities
  - Batch operation candidates
  - Layer 2 considerations
```

**FR-007**: System MUST provide **Wallet Security & Safety Persona** (KEY PRIORITY):
```yaml
Questions:
  - "What wallets will you support? (MetaMask/WalletConnect/Coinbase)"
  - "How are you preventing wallet drainers and approval exploits?"
  - "Are you validating transaction parameters before signing?"
  - "How do you protect against malicious contract interactions?"
  - "What's your transaction simulation strategy?"
  - "How do you handle unlimited approvals?"
  - "Do you need hardware wallet support?"
  - "How are you protecting private keys in the frontend?"
  - "What's your phishing protection strategy?"
  - "Do you need multi-chain support?"
  - "How do you handle network switching safely?"
  - "What's your transaction feedback UX?"

Context Extracted:
  - Wallet provider requirements
  - Chain support (Ethereum mainnet, L2s, testnets)
  - Approval security (limited approvals, revocation)
  - Transaction simulation (Tenderly, Blocknative)
  - Contract verification before interaction
  - Hardware wallet integration
  - Key management strategy
  - Phishing protection (domain verification, connection warnings)
  - Network switching safety
  - Transaction state management
  - Error handling patterns
```

### Functional Requirements: Scaffold-ETH Templates

**FR-008**: System MUST generate Scaffold-ETH project structure:
```
scaffold-eth-app/
├── packages/
│   ├── hardhat/
│   │   ├── contracts/
│   │   ├── deploy/
│   │   └── test/
│   ├── nextjs/
│   │   ├── components/
│   │   ├── pages/
│   │   └── hooks/
│   └── foundry/ (optional)
```

**FR-009**: System MUST provide template contracts for detected patterns:
- **DEX**: Uniswap V2 fork with swap, liquidity pool
- **NFT Marketplace**: OpenSea-style with listings, offers, royalties
- **DAO**: Governor Bravo pattern with proposals, voting, timelock
- **Token**: ERC-20/721/1155 with extensions (permit, snapshot, votes)

**FR-010**: System MUST include Web3 frontend patterns:
- wagmi hooks for contract interaction
- RainbowKit for wallet connection
- ethers.js/viem utilities
- Transaction state management
- Error handling and user feedback

### Functional Requirements: Security & Privacy Pattern Library (KEY PRIORITY)

**FR-011**: System MUST validate against common smart contract vulnerabilities:
- Reentrancy (CEI pattern enforcement)
- Integer overflow (use SafeMath or Solidity 0.8+)
- Access control (OpenZeppelin AccessControl)
- Front-running mitigation (commit-reveal, private mempools)
- Oracle manipulation
- MEV exploitation vectors
- Privacy leaks (on-chain data exposure)

**FR-012**: System MUST validate against wallet security threats and recommend protection tools:

**Wallet Drainer Protection ($494M stolen in 2024):**
- **Revoke.cash**: Audit and revoke active token approvals across 100+ networks
- **Etherscan Token Approval Checker**: View and revoke permissions per chain
- **Revoke.cash Browser Extension**: Warns before signing potentially harmful transactions
- **Regular Approval Audits**: Practice wallet hygiene by revoking unused approvals

**Transaction Simulation (Pre-Signing Safety):**
- **Tenderly**: Web3 Gateway with transaction simulation, dry-run before execution
- **Blocknative Transaction Preview**: Simulate unsigned transactions, show net-balance changes
- **Web3 Onboard Integration**: Built-in simulation for dApp users
- **IMPORTANT**: Beware of "transaction simulation spoofing" attacks (2025 threat)

**Approval Security Best Practices:**
- **Limited Approvals**: Never grant unlimited token approvals
- **Approval Revocation**: Disconnecting wallet doesn't revoke approvals - must explicitly revoke
- **Active Permission Monitoring**: Check Revoke.cash regularly for active approvals
- **MetaMask Approval Controls**: Adjust approval amounts before signing

**Secret Recovery Phrase (SRP) Protection:**
- **Never Share SRP**: Not even with MetaMask team or support
- **Secure Storage**: Use hardware wallets or encrypted password managers
- **No Photo Gallery**: Malware like SparkKitty uses OCR to scan images for seed phrases
- **Separate Wallets**: Different wallets for airdrops, trading, and long-term storage

**Contract Interaction Safety:**
- **Verify on Etherscan**: Check contract verification before interaction
- **Only Trusted Sites**: Verify URLs, avoid phishing copycat sites
- **Review Before Approve**: Check what dApp is requesting before clicking approve

**WalletConnect Best Practices:**
- **MetaMask Integration**: Safe dApp interaction via mobile wallet
- **Connection Auditing**: Review connected sites regularly
- **Domain Verification**: Ensure legitimate platform before connecting

**Hardware Wallet Integration:**
- **High-Value Operations**: Require hardware wallet for significant transactions
- **Cold Storage**: Majority of funds in cold wallet, minimal in hot wallet
- **Browser Extension Security**: Only install from verified publishers, use allowlist

**FR-013**: System MUST suggest OpenZeppelin contracts:
- Ownable, AccessControl
- ReentrancyGuard
- Pausable
- ERC token implementations
- Proxy patterns (Transparent, UUPS, Beacon)

**FR-014**: System MUST provide privacy enhancement patterns and recommend specific tools:

**Privacy Layer 2 Solutions:**
- **Aztec Network**: L2 privacy solution with ZK-SNARK private smart contracts (note: zk.money sunset)
- **Railgun**: Privacy protocol for DeFi interactions with shielded pool architecture
- **zkBob**: User-friendly privacy transfers with simple interface for non-technical users
- **Secret Network**: L1 blockchain with private smart contracts (cross-chain consideration)

**Transaction Privacy Tools:**
- **Flashbots Protect**: Private mempool RPC preventing MEV/frontrunning (80% Ethereum usage in 2025)
- **BuilderNet with TEE**: Trusted Execution Environments for end-to-end transaction privacy
- **Private RPCs**: Direct-to-builder submission bypassing public mempool
- **Gas Fee Refunds**: Flashbots offering refunds for failed transaction protection

**Zero-Knowledge Proof Frameworks:**
- **Circom + SnarkJS**: Most accessible ZK framework, well-documented API, supports Groth16/PLONK/FFLONK
- **Noir + Barretenberg**: High-performance (30x faster than Circom for SHA-256), centerpiece of Aztec Network
- **AI-Powered ZK Tools**: 2025 AI toolchains for faster proof generation and error reduction

**Stealth Address Standards:**
- **ERC-5564**: Standard for stealth addresses on Ethereum
- **Fluidkey & Umbra**: Break recipient identity link while preserving traceability
- **PlasmaFold**: Privacy-preserving L2 from Ethereum Privacy Stewards (PSE)

**MEV & Front-Running Protection:**
- **Flashbots Protect RPC**: No IP tracking, only successful transactions pay gas
- **Private Order Flow**: 80% of Ethereum transactions use private submission (2025)
- **TEE Infrastructure**: Flashbots running majority of MEV infrastructure in Trusted Execution Environments
- **Commit-Reveal Schemes**: Traditional cryptographic approach for sensitive operations

**Privacy-Preserving Standards:**
- **zkTLS**: Zero-knowledge Transport Layer Security for private data verification
- **ORAM**: Oblivious RAM for hiding access patterns
- **Privacy RPCs**: PSE privacy-preserving RPC infrastructure

**Account Abstraction Privacy (EIP-4337 & EIP-7702):**
- **Gasless Transactions**: Protocol-sponsored gas for privacy (no on-chain payment trace)
- **ERC-20 Gas Payments**: Pay gas in tokens to obscure ETH holdings
- **Delegated Access**: EIP-7702 compatible with ERC-4337 smart accounts

**Data Minimization Strategies:**
- **Off-Chain Data**: Keep sensitive data off-chain, only commit hashes
- **Homomorphic Encryption**: Compute on encrypted state without decryption
- **Threshold Encryption**: Distributed decryption requiring multiple parties

**FR-015**: System MUST enforce system hardening best practices:
- **Input Validation**: All user inputs sanitized and validated
- **Rate Limiting**: Prevent spam and DoS attacks on frontend
- **HTTPS Only**: No mixed content, enforce secure connections
- **Content Security Policy**: Prevent XSS attacks
- **Dependency Auditing**: Regular npm audit, use known-safe versions
- **Emergency Pause**: Circuit breakers for critical contract functions
- **Upgrade Strategy**: Secure upgrade mechanisms with timelock/multisig

### Functional Requirements: Integration with Feature 788

**FR-016**: System MUST use Feature 788's persona rotation system to cycle through Web3 personas

**FR-017**: System MUST store Web3 context in Feature 788's ContextState

**FR-018**: System MUST use Feature 788's Socratic refinement for Web3-specific ambiguities:
- "secure" → "ReentrancyGuard + AccessControl + limited approvals + Tenderly/Blocknative simulation + Revoke.cash monitoring + what else?"
- "safe wallet integration" → "Revoke.cash for approval audits, Tenderly/Blocknative simulation, hardware wallet for high-value, MetaMask security practices, phishing protection?"
- "private" → "Circom/Noir ZK proofs, Flashbots Protect RPC, ERC-5564 stealth addresses, Aztec/Railgun L2, or off-chain computation?"
- "efficient" → "Gas target: < 100k for swaps? Layer 2 consideration? Batch operations?"
- "decentralized" → "On-chain governance or multisig?"
- "protected from MEV" → "Flashbots Protect (80% adoption), BuilderNet TEE, or commit-reveal?"
- "hardened" → "Rate limiting, CSP, emergency pause, audit trail, Revoke.cash monitoring?"
- "privacy-preserving" → "zkBob for simple transfers, Railgun for DeFi, Aztec for contracts, or Flashbots for transaction privacy?"

### Functional Requirements: Safety-First Guidance System

**FR-019**: System MUST act as a protective guide, recommending appropriate tools based on user needs:

**Privacy Need Assessment:**
- **"I want basic transaction privacy"** → Guide to: Flashbots Protect RPC (easiest, 80% adoption)
- **"I need simple private transfers"** → Guide to: zkBob (user-friendly), ERC-5564 stealth addresses
- **"I need DeFi with privacy"** → Guide to: Railgun privacy protocol
- **"I need fully private smart contracts"** → Guide to: Aztec Network L2, Noir framework
- **"I'm worried about front-running"** → Guide to: Flashbots Protect, commit-reveal patterns
- **"I need maximum privacy"** → Guide to: Combination approach (stealth + ZK + private RPC)

**Security Need Assessment:**
- **"How do I protect against wallet drainers?"** → Guide to: Revoke.cash (immediate), limited approvals (always), transaction simulation (before signing)
- **"I want to audit my wallet security"** → Guide to: Revoke.cash approval checker, Etherscan token approvals, MetaMask security review
- **"I'm building a dApp, how do I protect users?"** → Guide to: Integrate Tenderly/Blocknative simulation, enforce limited approvals, add Revoke.cash links to UI
- **"What's the first thing I should do?"** → Guide to: Install Revoke.cash browser extension, audit existing approvals, set up hardware wallet for high-value holdings

**Development Complexity Assessment:**
- **Beginner (first dApp)** → Guide to: Scaffold-ETH templates, OpenZeppelin contracts, Flashbots Protect RPC, Revoke.cash for testing
- **Intermediate (some experience)** → Guide to: Custom contracts with OpenZeppelin, Circom for basic ZK, stealth addresses
- **Advanced (production system)** → Guide to: Noir for performance ZK, Aztec L2 integration, TEE infrastructure, account abstraction (EIP-4337/7702)

**Cost vs Privacy Tradeoff Guidance:**
- **Free/Low-Cost** → Flashbots Protect (free), Revoke.cash (free), stealth addresses (gas only)
- **Moderate** → Railgun (gas + fees), zkBob (gas + protocol fees)
- **Higher Cost/Complexity** → Aztec L2 (development overhead), custom Circom/Noir circuits (development time)

**FR-020**: System MUST provide contextual warnings and education:
- Warn about $494M stolen via wallet drainers in 2024
- Explain that disconnecting wallet doesn't revoke approvals
- Clarify that "transaction simulation spoofing" is a 2025 threat
- Emphasize Tornado Cash legal uncertainty despite sanction lift
- Note that Aztec's zk.money is sunset (guide to alternatives)

**FR-021**: System MUST never be pushy about privacy tools:
- Present options, don't mandate choices
- Respect user's risk tolerance and privacy preferences
- Provide "why" explanations for each recommendation
- Allow users to decline privacy features (with informed consent)
- Frame as "here are your options" not "you must use this"

### Key Entities

- **Web3DomainContext**: Detected Web3 keywords, dApp type, complexity level, privacy requirements
- **ScaffoldTemplate**: Template ID, project structure, boilerplate files
- **SmartContractPattern**: Pattern type (DEX, NFT, DAO), security requirements, privacy requirements, dependencies
- **Web3PersonaContext**: Extends PersonaContext from Feature 788 with Web3-specific insights
- **GasOptimizationProfile**: Frequency patterns, storage layout, batch opportunities
- **WalletIntegrationConfig**: Supported wallets, chains, connection flow
- **PrivacyProfile**: Privacy level (public, pseudonymous, private), ZK requirements, MEV protection needs, on-chain data minimization strategy
- **SafetyGuidanceProfile**: User risk tolerance, privacy preferences, experience level, appropriate tool recommendations

---

## Non-Functional Requirements

**NFR-001**: Web3 domain detection MUST complete within 100ms
**NFR-002**: Scaffold-ETH template generation MUST complete within 5 seconds
**NFR-003**: Security pattern validation MUST check against OWASP top 10 smart contract vulnerabilities
**NFR-004**: System MUST work offline (templates bundled, no external API calls)
**NFR-005**: Gas optimization suggestions MUST reference actual gas benchmarks

---

## Dependencies and Assumptions

### Dependencies
- **Feature 788**: Context engineering infrastructure (persona rotation, context state, Socratic refinement)
- Scaffold-ETH project structure patterns (bundled locally)
- OpenZeppelin contracts reference (bundled or referenced)
- Solidity security patterns (documented locally)

### Assumptions
- Users have basic Web3 familiarity (or system provides educational context)
- Scaffold-ETH remains standard for Ethereum dApp development
- OpenZeppelin contracts remain security best practice
- Users want mainnet-ready patterns (not just tutorial code)

### Success Metrics
- **Domain Detection Accuracy**: 95%+ correct Web3 domain identification
- **Template Relevance**: 80%+ of users select suggested Scaffold-ETH template
- **Security Coverage**: 95%+ of common vulnerabilities surfaced during elicitation (KEY METRIC)
- **Wallet Safety**: 100% of dApps use limited approvals and transaction simulation (KEY METRIC)
- **System Hardening**: 90%+ compliance with OWASP Web3 security checklist (KEY METRIC)
- **Privacy Tool Guidance**: 85%+ of users understand which privacy tool fits their needs (NEW METRIC)
- **Safety-First Adoption**: 90%+ of users integrate Revoke.cash monitoring and transaction simulation (NEW METRIC)
- **Informed Consent**: 95%+ of users understand tradeoffs before choosing privacy level (NEW METRIC)
- **Development Speed**: 50% faster to production-ready dApp vs manual setup
- **Security Incidents**: Measurable reduction in smart contract vulnerabilities and wallet exploits
- **User Protection**: Zero wallet drainer incidents in dApps built with this tool (KEY METRIC)
- **Educational Impact**: Users can explain "why" behind security/privacy choices, not just "what" to use

---

## Implementation Notes

### File Structure
```
src/
├── templates/
│   └── web3/
│       ├── scaffold-eth-templates/
│       ├── contract-patterns/
│       └── frontend-patterns/
├── personas/
│   └── web3/
│       ├── smart-contract-security.js
│       ├── defi-patterns.js
│       ├── gas-optimization.js
│       └── wallet-integration.js
└── context/
    └── web3-domain-detector.js  # Integrates with Feature 788
```

### Integration Points with Feature 788
```javascript
// Feature 788 provides:
import { PersonaRotator } from '../context/persona-rotator.js';
import { ContextState } from '../context/context-state.js';
import { SocraticRefiner } from '../context/socratic-refiner.js';

// Feature 789 extends:
import { Web3SecurityPersona } from './personas/web3/smart-contract-security.js';
import { ScaffoldEthGenerator } from './templates/web3/scaffold-generator.js';

// Register Web3 personas with Feature 788's system
PersonaRotator.registerDomainPersonas('web3', [
  Web3SecurityPersona,
  DeFiPatternsPersona,
  GasOptimizationPersona,
  WalletIntegrationPersona
]);
```

---

## Review & Acceptance Checklist

### Content Quality
- [x] No implementation details (languages, frameworks) in spec - focused on WHAT not HOW
- [x] Focused on user value (faster, safer dApp development)
- [x] Domain-specific without being overly technical
- [x] Clear dependency on Feature 788

### Requirement Completeness
- [x] No [NEEDS CLARIFICATION] markers
- [x] Requirements testable (domain detection, persona activation, template selection)
- [x] Success criteria measurable
- [x] Scope bounded to Web3 domain knowledge
- [x] Dependencies clearly identified (Feature 788)

---

## Implementation Readiness

- [x] Problem clearly defined (lack of Web3-specific context)
- [x] Solution leverages Feature 788 infrastructure
- [x] Integration points with Feature 788 identified
- [x] Success metrics measurable
- [x] Can be built in parallel with Feature 788
- [ ] Requires Feature 788 merge before final integration

**Status**: Ready for `/plan` after Feature 788 infrastructure design is complete

---

**Next Steps for Parallel Development**:
1. Create branch `789-web3-context-templates`
2. Run `/plan` to design Web3 persona banks and templates
3. Mock Feature 788 integration points during development
4. After Feature 788 merges, rebase and integrate
5. Run `/tasks` and implement

**Estimated Effort**: 15-20 tasks (much simpler than 788 since infrastructure exists)