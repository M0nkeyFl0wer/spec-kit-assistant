# Data Model: Web3 Context Templates

**Feature**: 789-web3-context-templates
**Date**: 2025-09-29

## Overview

This document defines the data structures for Web3 domain detection, persona banks, template catalogs, and safety guidance profiles.

---

## 1. Web3DomainContext

**Purpose**: Captures detected Web3 domain information from user input

**Fields**:
```javascript
{
  detected: boolean,              // Was Web3 domain detected? (FR-001)
  keywords: string[],             // Matched keywords (blockchain, dApp, NFT, etc.)
  dappType: DAppType | null,      // Detected dApp category (FR-003)
  complexityLevel: ComplexityLevel, // User experience assessment
  privacyRequirements: PrivacyLevel, // Inferred privacy needs
  timestamp: Date,                // Detection timestamp
  confidence: number              // Detection confidence (0-1)
}
```

**Enums**:
```javascript
enum DAppType {
  DEX = 'dex',
  NFT_MARKETPLACE = 'nft-marketplace',
  DAO = 'dao',
  TOKEN = 'token',
  LENDING = 'lending',
  STAKING = 'staking',
  UNKNOWN = 'unknown'
}

enum ComplexityLevel {
  BEGINNER = 'beginner',      // First dApp
  INTERMEDIATE = 'intermediate', // Some experience
  ADVANCED = 'advanced'        // Production system
}

enum PrivacyLevel {
  PUBLIC = 'public',           // No special privacy needs
  PSEUDONYMOUS = 'pseudonymous', // Basic privacy (MEV protection)
  PRIVATE = 'private'          // Strong privacy (ZK, stealth addresses)
}
```

**Validation Rules**:
- `detected` true only if 2+ keywords matched (reduce false positives)
- `confidence` >= 0.7 to activate Web3 personas
- `dappType` must be recognized or UNKNOWN
- `complexityLevel` inferred from user language patterns

**State Transitions**:
```
NULL → DETECTED (keywords matched)
DETECTED → CONFIRMED (user confirms dApp type)
CONFIRMED → PERSONA_ACTIVATED (personas loaded)
```

**Source**: FR-001, FR-002 (domain detection)

---

## 2. Web3PersonaContext

**Purpose**: Extends Feature 788's PersonaContext with Web3-specific insights

**Fields**:
```javascript
{
  personaId: string,             // e.g., 'smart-contract-security'
  questionBank: Question[],      // Persona-specific questions
  contextExtracted: ContextInsight[], // Insights gathered
  priority: number,              // 1-10, higher = more critical
  applicability: number,         // 0-1, relevance to current dApp type
  activationRules: ActivationRule[], // When to activate this persona
}
```

**Nested Types**:
```javascript
type Question = {
  id: string,
  text: string,
  category: string,              // security, privacy, performance, etc.
  followUps: string[],           // Follow-up question IDs if needed
  toolRecommendations: string[], // Relevant tools for this question
}

type ContextInsight = {
  question: string,
  answer: string,
  category: string,
  toolsRecommended: ToolRecommendation[],
  risks: string[],               // Identified risks
  mitigations: string[],         // Suggested mitigations
}

type ActivationRule = {
  condition: string,             // e.g., 'dappType === DEX'
  threshold: number,             // Confidence threshold
}
```

**Validation Rules**:
- `priority` 1-10, security/wallet personas get 9-10
- `applicability` recalculated per dApp type
- Question bank minimum 5 questions per persona
- Tool recommendations must exist in tool catalog

**Relationships**:
- One `Web3DomainContext` triggers multiple `Web3PersonaContext` instances
- Personas activated based on `dappType` and `privacyRequirements`

**Source**: FR-004 (security persona), FR-005 (DeFi), FR-006 (gas), FR-007 (wallet)

---

## 3. ScaffoldTemplate

**Purpose**: Represents a Scaffold-ETH boilerplate template

**Fields**:
```javascript
{
  id: string,                    // e.g., 'dex-uniswap-v2'
  name: string,                  // 'DEX (Uniswap V2 Fork)'
  dappType: DAppType,            // Associated dApp type
  description: string,           // What this template provides
  structure: ProjectStructure,   // File/folder structure
  contracts: ContractTemplate[], // Smart contract files
  frontend: FrontendTemplate,    // Next.js frontend files
  tests: TestTemplate[],         // Test files
  dependencies: Dependency[],    // NPM packages, Foundry libs
  estimatedComplexity: ComplexityLevel, // Target user level
}
```

**Nested Types**:
```javascript
type ProjectStructure = {
  packageManager: 'npm' | 'yarn' | 'pnpm',
  contracts: 'hardhat' | 'foundry',
  frontend: 'nextjs' | 'react',
  folders: string[],             // Directory paths to create
}

type ContractTemplate = {
  filename: string,              // e.g., 'DEX.sol'
  content: string,               // Contract code
  openZeppelinImports: string[], // e.g., ['Ownable', 'ReentrancyGuard']
  securityPatterns: string[],    // Applied patterns
}

type FrontendTemplate = {
  components: ComponentFile[],
  hooks: HookFile[],
  pages: PageFile[],
  walletIntegration: 'rainbowkit' | 'walletconnect',
}

type TestTemplate = {
  filename: string,
  type: 'contract' | 'integration' | 'unit',
  content: string,
}

type Dependency = {
  name: string,
  version: string,
  purpose: string,               // Why this dependency
}
```

**Validation Rules**:
- Each template must have 1+ contract
- Frontend must include wallet connection
- Minimum 3 tests per template (contract, integration, unit)
- All OpenZeppelin imports must be valid
- Security patterns must be from approved list

**Relationships**:
- `DAppType` → 1+ `ScaffoldTemplate` (e.g., DEX has Uniswap V2 and Sushiswap variants)
- `ScaffoldTemplate` → multiple `ContractPattern` (security, upgrades)

**Source**: FR-008 (project structure), FR-009 (template contracts), FR-010 (frontend)

---

## 4. PrivacyToolCatalog

**Purpose**: Comprehensive catalog of privacy and security tools

**Fields**:
```javascript
{
  category: ToolCategory,
  tools: PrivacyTool[],
}
```

**Enums**:
```javascript
enum ToolCategory {
  PRIVACY_L2 = 'privacy-l2',
  ZK_FRAMEWORKS = 'zk-frameworks',
  TRANSACTION_PRIVACY = 'transaction-privacy',
  WALLET_SECURITY = 'wallet-security',
  SMART_CONTRACT_SECURITY = 'smart-contract-security',
}
```

**Nested Types**:
```javascript
type PrivacyTool = {
  id: string,                    // e.g., 'flashbots-protect'
  name: string,                  // 'Flashbots Protect'
  category: ToolCategory,
  description: string,           // What it does
  useCase: string,               // When to use it
  difficultyLevel: ComplexityLevel, // Target user
  cost: CostLevel,               // Free, Low, Medium, High
  adoptionRate: number,          // 0-1, e.g., 0.8 for Flashbots
  documentation: string,         // URL or local path
  integration: IntegrationGuide, // How to integrate
  alternatives: string[],        // Alternative tool IDs
  warnings: string[],            // Known issues (legal, technical)
  stats: ToolStats,              // Usage stats, incident data
}

enum CostLevel {
  FREE = 'free',
  LOW = 'low',                   // Gas-only
  MEDIUM = 'medium',             // Gas + protocol fees
  HIGH = 'high',                 // Development overhead
}

type IntegrationGuide = {
  steps: string[],
  codeExample: string,
  dependencies: string[],
  estimatedTime: string,         // e.g., '15 minutes'
}

type ToolStats = {
  adoptionRate: number,          // e.g., 0.8 for Flashbots
  incidentsPrevented: number,    // Known prevented attacks
  incidentsReported: number,     // Known failures/exploits
  lastUpdated: Date,
}
```

**Validation Rules**:
- Tool IDs must be unique across catalog
- Documentation URLs must be accessible or marked offline
- Alternatives must reference valid tool IDs
- Warnings mandatory for tools with legal/technical risks
- Stats updated monthly (automated or manual)

**Relationships**:
- `PrivacyTool` referenced by `Web3PersonaContext.contextExtracted`
- `PrivacyTool` referenced by `SafetyGuidanceProfile.recommendedTools`

**Source**: FR-012 (wallet security), FR-014 (privacy patterns), FR-019 (guidance)

---

## 5. SafetyGuidanceProfile

**Purpose**: User profile for personalized safety recommendations

**Fields**:
```javascript
{
  userId: string | null,         // Optional user ID
  riskTolerance: RiskTolerance,
  privacyPreference: PrivacyLevel,
  experienceLevel: ComplexityLevel,
  concerns: string[],            // User-stated concerns
  recommendedTools: ToolRecommendation[],
  educationalContent: EducationalItem[],
  consentGiven: ConsentRecord[], // Tracking informed consent
}
```

**Enums**:
```javascript
enum RiskTolerance {
  CONSERVATIVE = 'conservative', // Maximum security, convenience secondary
  BALANCED = 'balanced',         // Balance security and usability
  AGGRESSIVE = 'aggressive',     // Prioritize speed/features over security
}
```

**Nested Types**:
```javascript
type ToolRecommendation = {
  toolId: string,
  reason: string,                // Why recommended
  priority: 'critical' | 'recommended' | 'optional',
  actionRequired: string,        // What user should do
  estimatedImpact: string,       // Expected outcome
}

type EducationalItem = {
  topic: string,                 // e.g., 'wallet-drainers'
  content: string,               // Explanation
  severity: 'high' | 'medium' | 'low', // Risk severity
  stats: string,                 // e.g., '$494M stolen in 2024'
  presented: boolean,            // Has user seen this?
  understood: boolean | null,    // Did user acknowledge understanding?
}

type ConsentRecord = {
  topic: string,                 // e.g., 'declining-privacy-tools'
  decision: 'accept' | 'decline',
  reasoning: string,             // Why user chose this
  timestamp: Date,
  acknowledged: boolean,         // User confirmed understanding risks
}
```

**Validation Rules**:
- Cannot recommend `ADVANCED` tools to `BEGINNER` user without warning
- `priority: 'critical'` tools (e.g., Revoke.cash) always included
- Educational content must be presented before consent
- Consent records immutable after creation (audit trail)

**State Transitions**:
```
UNKNOWN → ASSESSING (asking questions)
ASSESSING → PROFILED (profile created)
PROFILED → RECOMMENDING (tools recommended)
RECOMMENDING → CONSENTED (user accepts/declines)
```

**Relationships**:
- `SafetyGuidanceProfile` references `PrivacyToolCatalog` for recommendations
- One profile per user session
- Profile persists across context elicitation conversation

**Source**: FR-019 (safety guidance), FR-020 (warnings), FR-021 (consent)

---

## 6. ContractSecurityPattern

**Purpose**: Reusable smart contract security patterns

**Fields**:
```javascript
{
  id: string,                    // e.g., 'reentrancy-guard'
  name: string,                  // 'Reentrancy Protection'
  category: SecurityCategory,
  owaspRank: number | null,      // 1-10 if OWASP vulnerability
  description: string,           // What it protects against
  implementation: Implementation[],
  testCases: TestCase[],
  references: string[],          // OpenZeppelin docs, audits
}
```

**Enums**:
```javascript
enum SecurityCategory {
  ACCESS_CONTROL = 'access-control',
  REENTRANCY = 'reentrancy',
  ARITHMETIC = 'arithmetic',
  FRONTRUNNING = 'frontrunning',
  ORACLE = 'oracle',
  UPGRADE = 'upgrade',
  EMERGENCY = 'emergency',
}
```

**Nested Types**:
```javascript
type Implementation = {
  language: 'solidity' | 'vyper',
  version: string,               // e.g., '0.8.0+'
  code: string,                  // Example implementation
  openZeppelinContract: string | null, // e.g., 'ReentrancyGuard'
  gasOverhead: number,           // Estimated gas cost
}

type TestCase = {
  scenario: string,              // What is being tested
  code: string,                  // Test implementation
  expectedOutcome: string,       // What should happen
}
```

**Validation Rules**:
- OWASP rank 1-10 must match official OWASP list
- Implementation must include OpenZeppelin reference if available
- Minimum 2 test cases per pattern (success and failure scenarios)
- Gas overhead estimated from benchmarks (NFR-005)

**Relationships**:
- `ContractSecurityPattern` referenced by `ScaffoldTemplate.contracts`
- `ContractSecurityPattern` recommended by `Web3PersonaContext` (security persona)

**Source**: FR-011 (vulnerabilities), FR-013 (OpenZeppelin), FR-015 (hardening)

---

## 7. GasOptimizationProfile

**Purpose**: Gas optimization recommendations based on usage patterns

**Fields**:
```javascript
{
  dappType: DAppType,
  frequencyPatterns: FrequencyPattern[],
  storageLayout: StorageRecommendation[],
  batchOpportunities: BatchOperation[],
  layer2Consideration: L2Recommendation | null,
  estimatedSavings: GasSavings,
}
```

**Nested Types**:
```javascript
type FrequencyPattern = {
  operation: string,             // e.g., 'token-swap'
  frequency: 'high' | 'medium' | 'low',
  currentGasCost: number,        // Estimated gas
  optimizationPotential: number, // 0-1, how much can be saved
}

type StorageRecommendation = {
  variable: string,
  currentType: string,           // e.g., 'uint256'
  recommendedType: string,       // e.g., 'uint128'
  savings: number,               // Gas saved per operation
  tradeoff: string,              // What you give up
}

type BatchOperation = {
  operations: string[],          // Which operations can be batched
  potential: number,             // 0-1, how much batching possible
  implementation: string,        // How to implement
}

type L2Recommendation = {
  recommended: boolean,
  layers: string[],              // e.g., ['Arbitrum', 'Optimism']
  costReduction: number,         // Percentage reduction
  tradeoffs: string[],           // What changes
}

type GasSavings = {
  perTransaction: number,        // Estimated gas saved
  monthly: number,               // Savings for typical volume
  annualized: number,            // Yearly savings
}
```

**Validation Rules**:
- Gas costs based on real benchmarks (NFR-005)
- L2 recommendation only if `frequencyPattern` indicates high usage
- Savings estimates conservative (80% of theoretical maximum)

**Relationships**:
- `GasOptimizationProfile` generated by Gas Optimization persona
- One profile per dApp type

**Source**: FR-006 (gas optimization persona)

---

## 8. SocraticRefinementExtension

**Purpose**: Web3-specific ambiguity resolution patterns for Feature 788

**Fields**:
```javascript
{
  ambiguousTerm: string,         // e.g., 'secure'
  expansionPrompt: string,       // Socratic question
  toolSuggestions: string[],     // Tool IDs from catalog
  examples: RefinementExample[],
}
```

**Nested Types**:
```javascript
type RefinementExample = {
  userInput: string,
  clarification: string,
  recommendedApproach: string,
}
```

**Examples** (FR-018):
- "secure" → "ReentrancyGuard + AccessControl + limited approvals + Tenderly simulation + Revoke.cash monitoring?"
- "safe wallet integration" → "Revoke.cash audits, Tenderly simulation, hardware wallet for high-value, MetaMask security practices?"
- "private" → "Circom/Noir ZK proofs, Flashbots Protect RPC, ERC-5564 stealth addresses, or Aztec/Railgun L2?"
- "protected from MEV" → "Flashbots Protect (80% adoption), BuilderNet TEE, or commit-reveal?"
- "privacy-preserving" → "zkBob for simple transfers, Railgun for DeFi, Aztec for contracts, or Flashbots for tx privacy?"

**Validation Rules**:
- Tool suggestions must exist in `PrivacyToolCatalog`
- Expansion prompt must be a question (ends with '?')
- Minimum 2 examples per ambiguous term

**Relationships**:
- Used by Feature 788's `SocraticRefiner`
- Loaded when `Web3DomainContext.detected === true`

**Source**: FR-018 (Socratic refinement)

---

## Entity Relationship Diagram

```
Web3DomainContext (1) ──→ (N) Web3PersonaContext
                           │
                           ├──→ (N) Question
                           └──→ (N) ContextInsight ──→ (N) ToolRecommendation

Web3DomainContext (1) ──→ (1) ScaffoldTemplate
                           │
                           ├──→ (N) ContractTemplate ──→ (N) ContractSecurityPattern
                           ├──→ (1) FrontendTemplate
                           └──→ (N) TestTemplate

PrivacyToolCatalog (1) ──→ (N) PrivacyTool

SafetyGuidanceProfile (1) ──→ (N) ToolRecommendation ──→ (1) PrivacyTool
                           │
                           ├──→ (N) EducationalItem
                           └──→ (N) ConsentRecord

Web3PersonaContext (1) ──→ (1) GasOptimizationProfile (if Gas Optimization persona)

SocraticRefinementExtension (N) ──→ (N) PrivacyTool (via tool suggestions)
```

---

## Data Persistence

**Storage Strategy**:
- **Templates & Catalogs**: JSON files bundled in repository (`src/templates/web3/`)
- **Session Context**: In-memory during elicitation, serialized to `specs/[feature]/context.json` after completion
- **User Profiles**: Optional persistence to local config file `~/.speckit/profiles.json`

**No External Database**: All data local, offline-capable (NFR-004)

---

## Validation Summary

**Pre-conditions**:
- Feature 788 provides `PersonaRotator`, `ContextState`, `SocraticRefiner` interfaces
- All JSON schemas validated on load
- Tool catalog updated monthly (automated script)

**Post-conditions**:
- All domain contexts serializable to JSON
- Privacy tool recommendations traceable to catalog entries
- Consent records immutable audit trail

---

**Status**: Data Model Complete ✅

**Next Step**: Generate API contracts from this data model