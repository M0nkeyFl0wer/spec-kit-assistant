# Research: Web3 Context Templates

**Feature**: 789-web3-context-templates
**Date**: 2025-09-29
**Status**: Complete

## Research Overview

This document consolidates research findings for Web3 privacy tools, security patterns, and best practices to inform the implementation of Web3-specific context templates.

---

## 1. Privacy Layer 2 Solutions

### Decision: Support Aztec, Railgun, zkBob, Secret Network

**Rationale**:
- **Diverse use cases**: Each serves different privacy needs (Aztec for contracts, Railgun for DeFi, zkBob for simple transfers)
- **Production-ready**: All are deployed and battle-tested in 2025
- **User experience range**: zkBob (beginner-friendly) to Aztec (advanced developers)
- **Legal clarity**: Post-Tornado Cash sanction lift, these alternatives provide compliant privacy

**Research Findings**:
- **Aztec Network**: L2 privacy solution using ZK-SNARKs, sunset zk.money but network still active
- **Railgun**: Privacy protocol for DeFi, works as layer-1 solution with shielded pools
- **zkBob**: Designed for everyday users with simple, intuitive interface
- **Secret Network**: L1 blockchain with private smart contracts (cross-chain consideration)

**Alternatives Considered**:
- **Tornado Cash**: Legal uncertainty despite sanction lift (March 2025), enforcement risk remains
- **Privacy Pools**: Theoretical alternative still in development phase

**Implementation Impact**:
- Catalog in `src/templates/web3/privacy-tools/privacy-layers.json`
- Guidance system recommends based on complexity (FR-019)

---

## 2. Zero-Knowledge Proof Frameworks

### Decision: Prioritize Circom (beginner) and Noir (performance)

**Rationale**:
- **Circom + SnarkJS**: Most accessible, well-documented API, supports Groth16/PLONK/FFLONK
- **Noir + Barretenberg**: 30x faster proving for SHA-256, production-ready, Aztec Network's choice
- **Complementary**: Circom for learning/prototyping, Noir for production performance

**Research Findings**:
- **Circom**: JavaScript/WASM based, libsnark C++ library widely used, extensive documentation
- **Noir**: Reduces constraint counts, leverages UltraPlonk for speed, gaining rapid adoption
- **2025 Trends**: AI-powered toolchains accelerating ZK proof generation
- **Benchmarks**: Noir consistently faster and requires fewer constraints than Circom

**Alternatives Considered**:
- **Cairo**: StarkNet-specific, not general-purpose for Ethereum
- **o1js**: Mina Protocol, different ecosystem
- **Leo**: Aleo-specific, not Ethereum-focused

**Implementation Impact**:
- Catalog in `src/templates/web3/privacy-tools/zk-frameworks.json`
- Recommend Circom for beginners, Noir for advanced (FR-019)
- Note AI-powered tools in educational context (FR-020)

---

## 3. Transaction Privacy & MEV Protection

### Decision: Flashbots Protect as primary, with stealth addresses and TEE options

**Rationale**:
- **80% adoption**: Flashbots Protect used by 80% of Ethereum transactions in 2025
- **Free & effective**: No cost, prevents MEV/frontrunning, gas refunds available
- **Production-ready TEE**: BuilderNet using Trusted Execution Environments for end-to-end privacy
- **Ecosystem support**: Well-integrated with wallets and dApps

**Research Findings**:
- **Flashbots Protect**: Private mempool, no IP tracking, only successful tx pay gas
- **Private RPCs**: 80% of Ethereum usage, direct-to-builder submission
- **BuilderNet**: Migrated all builders in Dec 2024, TDX support in Feb 2025
- **TEE Infrastructure**: Flashbots running majority of MEV infra in TEEs in 2025
- **Gas Refunds**: New 2025 feature for Protect users

**Stealth Address Standards**:
- **ERC-5564**: Ethereum standard for stealth addresses
- **Fluidkey & Umbra**: Break recipient identity link
- **PlasmaFold**: PSE privacy-preserving L2
- **Challenge**: Not yet mainstream wallet support

**Account Abstraction Privacy (EIP-4337 & EIP-7702)**:
- **Gasless transactions**: Protocol-sponsored gas for privacy
- **ERC-20 gas payments**: Obscure ETH holdings
- **Pectra upgrade**: May 7, 2025 launch with EIP-7702

**Alternatives Considered**:
- **Commit-reveal schemes**: Traditional approach, higher gas costs
- **Private mempools (non-Flashbots)**: Less adoption, fragmented

**Implementation Impact**:
- Catalog in `src/templates/web3/privacy-tools/transaction-privacy.json`
- Default recommendation: Flashbots Protect (easiest, 80% adoption)
- Advanced options: ERC-5564 stealth addresses, EIP-4337/7702
- Note TEE developments for cutting-edge users

---

## 4. Wallet Security & Drainer Protection

### Decision: Revoke.cash + Transaction Simulation as core recommendations

**Rationale**:
- **$494M stolen in 2024**: Wallet drainers are existential threat to Web3 users
- **Free tools available**: Revoke.cash and Etherscan approval checker cost nothing
- **Proactive protection**: Simulation prevents attacks before they happen
- **Educational value**: Users learn about approval risks

**Research Findings - Wallet Drainers**:
- **$494M stolen in 2024** via drainer-as-a-service attacks
- **Persistence**: Approvals remain active even after disconnecting wallet
- **Malware**: SparkKitty uses OCR to scan images for seed phrases
- **Attack vector**: Malicious contracts trick users into granting unlimited approvals

**Research Findings - Revoke.cash**:
- **100+ networks supported**: Ethereum, BNB, Polygon, etc.
- **Browser extension**: Warns before signing harmful transactions
- **Free tool**: Preventative wallet hygiene practice
- **Effectiveness**: Regular audits significantly reduce exploit risk

**Research Findings - Transaction Simulation**:
- **Tenderly**: Web3 Gateway with dry-run capability, prevents gas waste
- **Blocknative**: Transaction Preview shows net-balance changes pre-signing
- **Web3 Onboard**: Integration for dApp developers
- **2025 Threat**: "Transaction simulation spoofing" attacks (143.45 ETH/$460k stolen)

**MetaMask Security Best Practices**:
- **Never share SRP**: Even with MetaMask team
- **Secure storage**: Hardware wallets or encrypted password managers
- **Limited approvals**: Adjust approval amounts, never unlimited
- **Verify URLs**: Check for phishing copycat sites
- **Separate wallets**: Different wallets for airdrops vs. holdings

**WalletConnect Security**:
- **MetaMask integration**: Safe mobile wallet interaction
- **Connection auditing**: Review connected sites regularly
- **Domain verification**: Ensure legitimate platforms

**Alternatives Considered**:
- **Manual approval tracking**: Error-prone, doesn't scale
- **Wallet-specific tools**: Fragmented, not universal

**Implementation Impact**:
- Catalog in `src/templates/web3/privacy-tools/wallet-security.json`
- Integrate into Smart Contract Security persona (FR-004, FR-012)
- Add to safety guidance "first steps" (FR-019)
- Educational warnings about $494M stolen, simulation spoofing (FR-020)

---

## 5. Smart Contract Security Patterns

### Decision: OpenZeppelin contracts as foundation, with 2025 best practices

**Rationale**:
- **Industry standard**: OpenZeppelin is the gold standard for secure contracts
- **Battle-tested**: Years of audits and production use
- **Comprehensive**: Covers all common patterns (access control, reentrancy, pausable, upgrades)
- **Maintained**: Regular updates for new threats

**Research Findings**:
- **Reentrancy protection**: Check-Effects-Interactions (CEI) pattern + ReentrancyGuard
- **Access control**: Ownable, AccessControl, role-based permissions
- **Integer overflow**: Solidity 0.8+ built-in, SafeMath for older versions
- **Upgradeability**: Transparent, UUPS, Beacon proxy patterns
- **Emergency pause**: Circuit breakers for critical functions
- **MEV protection**: Front-running mitigation via commit-reveal or Flashbots

**OWASP Top 10 Smart Contract Vulnerabilities**:
1. Reentrancy
2. Integer overflow/underflow
3. Access control issues
4. Front-running
5. Oracle manipulation
6. Logic errors
7. Denial of service
8. External call failures
9. Timestamp dependence
10. Gas limit issues

**Implementation Impact**:
- Catalog in `src/templates/web3/contract-patterns/security-patterns.json`
- Reference in Smart Contract Security persona (FR-004)
- Validate against OWASP top 10 (NFR-003)

---

## 6. Scaffold-ETH Template Patterns

### Decision: Support 6 core dApp types with Scaffold-ETH structure

**Rationale**:
- **Scaffold-ETH standard**: Industry-standard for Ethereum dApp development
- **Production-ready**: Not tutorial code, mainnet-ready patterns
- **Comprehensive coverage**: Covers 80%+ of common dApp use cases
- **Modern stack**: Hardhat/Foundry, Next.js, wagmi, RainbowKit

**Template Types**:
1. **DEX (Decentralized Exchange)**: Uniswap V2 fork patterns
2. **NFT Marketplace**: OpenSea-style with listings, offers, royalties
3. **DAO**: Governor Bravo with proposals, voting, timelock
4. **Token**: ERC-20/721/1155 with extensions (permit, snapshot, votes)
5. **Lending Protocol**: Compound/Aave patterns
6. **Staking Platform**: Time-locked rewards, slashing

**Scaffold-ETH Structure**:
```
scaffold-eth-app/
├── packages/
│   ├── hardhat/          # Smart contracts
│   │   ├── contracts/
│   │   ├── deploy/
│   │   └── test/
│   ├── nextjs/           # Frontend
│   │   ├── components/
│   │   ├── pages/
│   │   └── hooks/
│   └── foundry/          # Optional alternative to Hardhat
```

**Frontend Integration Patterns** (FR-010):
- **wagmi hooks**: useContractRead, useContractWrite, useBalance
- **RainbowKit**: Wallet connection UI
- **ethers.js/viem**: Low-level contract interaction
- **Transaction state**: Pending, success, error handling
- **Network switching**: Multi-chain support

**Implementation Impact**:
- Templates in `src/templates/web3/scaffold-eth-templates/`
- Generator triggered by domain detection (FR-003)
- Each template includes contracts + frontend + tests

---

## 7. Safety-First Guidance System

### Decision: Implement tiered recommendation system based on user needs

**Rationale**:
- **Non-pushy**: Respects user autonomy (FR-021)
- **Educational**: Users understand "why" not just "what"
- **Context-aware**: Matches recommendations to experience level and needs
- **Protective**: Like a dog guiding owner to safety without forcing

**Guidance Tiers**:

**Beginner (First dApp)**:
- Scaffold-ETH templates
- OpenZeppelin contracts
- Flashbots Protect RPC
- Revoke.cash for testing
- MetaMask security basics

**Intermediate (Some Experience)**:
- Custom contracts with OpenZeppelin
- Circom for basic ZK
- ERC-5564 stealth addresses
- Transaction simulation integration

**Advanced (Production System)**:
- Noir for performance ZK
- Aztec L2 integration
- TEE infrastructure
- EIP-4337/7702 account abstraction

**Privacy Need Assessment** (FR-019):
- "Basic privacy" → Flashbots Protect (easiest)
- "Simple private transfers" → zkBob, ERC-5564
- "DeFi with privacy" → Railgun
- "Fully private contracts" → Aztec + Noir
- "Front-running protection" → Flashbots, commit-reveal
- "Maximum privacy" → Combination approach

**Security Need Assessment** (FR-019):
- "Protect against drainers" → Revoke.cash + limited approvals + simulation
- "Audit wallet security" → Revoke.cash checker + Etherscan
- "Protect dApp users" → Integrate Tenderly/Blocknative + enforce limited approvals
- "First steps" → Revoke.cash extension + audit approvals + hardware wallet

**Cost vs. Privacy Tradeoffs**:
- **Free/Low-Cost**: Flashbots Protect, Revoke.cash, stealth addresses (gas only)
- **Moderate**: Railgun, zkBob (gas + protocol fees)
- **High**: Aztec L2 development, custom Circom/Noir circuits

**Educational Warnings** (FR-020):
- $494M stolen via wallet drainers in 2024
- Disconnecting wallet doesn't revoke approvals
- Transaction simulation spoofing is 2025 threat
- Tornado Cash legal uncertainty despite sanction lift
- Aztec's zk.money sunset (guide to alternatives)

**Implementation Impact**:
- Implement in `src/guidance/safety-guide.js`
- Integrate with Feature 788's Socratic refinement (FR-018)
- Never mandate, always educate (FR-021)

---

## 8. Integration with Feature 788

### Decision: Extend, don't replace, Feature 788 architecture

**Rationale**:
- **Modular**: Web3 personas plug into existing PersonaRotator
- **Consistent**: Uses ContextState for Web3-specific data
- **Leverage existing**: Socratic refinement already handles ambiguity resolution
- **Clean separation**: Web3 domain knowledge separate from core engine

**Integration Points**:

**PersonaRotator** (FR-016):
```javascript
import { PersonaRotator } from '../context/persona-rotator.js';
import { Web3SecurityPersona } from './personas/web3/smart-contract-security.js';

PersonaRotator.registerDomainPersonas('web3', [
  Web3SecurityPersona,
  DeFiPatternsPersona,
  GasOptimizationPersona,
  WalletIntegrationPersona
]);
```

**ContextState** (FR-017):
- Store Web3DomainContext (keywords, dApp type, complexity)
- Store PrivacyProfile (privacy level, ZK requirements, MEV protection)
- Store SafetyGuidanceProfile (risk tolerance, experience level)

**Socratic Refinement** (FR-018):
- Extend with Web3-specific ambiguity patterns
- "secure" → detailed security checklist with tools
- "private" → privacy options with tradeoffs
- "safe wallet integration" → comprehensive safety stack

**Implementation Impact**:
- Mock Feature 788 integration points during parallel development
- Rebase and integrate after Feature 788 merges
- Keep Web3 modules independent for testing

---

## 9. Performance & Constraints

### Decision: Offline-first with aggressive caching

**Rationale**:
- **Reliability**: Works without internet or API dependencies
- **Speed**: Local file access faster than network calls
- **Privacy**: No external tracking or data leakage
- **Cost**: No API rate limits or usage fees

**Performance Targets** (NFR-001, NFR-002):
- Domain detection: <100ms (keyword regex matching)
- Template generation: <5s (file copy + template substitution)
- Persona activation: <200ms (load from memory/disk)

**Implementation Strategy**:
- Bundle all templates as JSON/YAML in repository
- Pre-compile persona question banks
- Cache domain detection results per session
- Lazy-load privacy tool catalogs (only when needed)

**Constraints**:
- **Offline-capable**: All functionality works without network (NFR-004)
- **No external APIs**: Templates bundled, no GitHub/NPM fetches during runtime
- **Gas benchmarks**: Reference actual gas costs for optimization suggestions (NFR-005)

---

## 10. Success Metrics & Validation

### Decisions: User education and safety as primary metrics

**Rationale**:
- **User outcomes matter**: Speed is less important than safety
- **Education prevents attacks**: Understanding "why" reduces future risk
- **Informed consent**: Users should understand tradeoffs

**Key Metrics**:
- **Privacy Tool Guidance**: 85%+ users understand which tool fits needs
- **Safety-First Adoption**: 90%+ integrate Revoke.cash monitoring + simulation
- **Informed Consent**: 95%+ understand tradeoffs before choosing privacy level
- **User Protection**: Zero wallet drainer incidents in dApps built with tool
- **Educational Impact**: Users explain "why" behind choices, not just "what"

**Validation Approach**:
- User interviews: "Which privacy tool would you use and why?"
- Code review: Check for Revoke.cash links and simulation integration
- Security audit: Verify limited approvals, no unlimited patterns
- Incident tracking: Monitor for wallet drainer attacks

---

## Research Completion Checklist

- [x] Privacy Layer 2 solutions researched (Aztec, Railgun, zkBob, Secret)
- [x] ZK frameworks compared (Circom vs. Noir benchmarks)
- [x] Transaction privacy tools identified (Flashbots, stealth addresses, TEE)
- [x] Wallet security threats cataloged ($494M drainers, simulation spoofing)
- [x] Protection tools evaluated (Revoke.cash, Tenderly, Blocknative)
- [x] Smart contract security patterns documented (OpenZeppelin, OWASP top 10)
- [x] Scaffold-ETH template structure analyzed
- [x] Safety-first guidance system designed (tiered recommendations)
- [x] Feature 788 integration points identified
- [x] Performance constraints validated (offline-first, <100ms domain detection)
- [x] Success metrics defined (user education focus)

**Status**: Phase 0 Research COMPLETE ✅

---

**Next Step**: Proceed to Phase 1 (Design & Contracts)