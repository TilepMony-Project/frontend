# TilepMoney

**Codeless Stablecoin Orchestration Builder for B2B Payments Infrastructure**

> integrating stablecoin is hard, we made it easier using drag and drop
> 

A visual drag-and-drop builder that allows businesses to design stablecoin movement workflows on Mantle testnet using dummy tokens and dummy third-party providers.

This project combines ideas from:

- xWeave (real-time cross-border routing)
- Studio.Factor (visual node-based automation)
- n8n (codeless workflow builder)

and applies them to a **stablecoin-focused B2B orchestration system**.

---

## 1. Problem Statement

Today’s businesses that want to process payments or build crypto-native financial products face several challenges:

- Stablecoin payment flows (mint → swap → bridge) must be hard-coded into backends.
- Businesses cannot visualize or audit how money moves through each provider.
- Enterprises need modularity to select preferred issuers, swap providers, and bridges.
- Cross-chain workflows are difficult to configure, test, or simulate safely.
- Existing visual builders (e.g., Studio.Factor) are not tailored for **stablecoin payment automation for businesses**.

TilepMoney targets this gap by providing a **B2B orchestration studio** for stablecoin flows, reducing integration time and increasing transparency.

---

## 2. Project Summary

TilepMoney enables a business to visually design and configure:

Deposit → Mint → Swap → Bridge → Output (Redeem / Vault / Transfer)

Everything is:

- Codeless
- Modular
- Provider-agnostic
- Fully testnet (safe for experimentation)
- Designed for integration into enterprise backend pipelines

Each step is a modular node that can be arranged visually.
Every node is fully configurable via a right-side drawer or panel.

The system is B2B-oriented, allowing multiple corporate organizations to design, test, and automate their payment and treasury routes.

---

## 3. Designed Flow

### Step 1 — Fiat Input (Deposit)

Simulates a business receiving fiat funding (IDR) from a corporate client or internal treasury operation.

Node: Deposit Node

**Input:** None

**Output:** IDR (or chosen fiat unit stored in DB)

**Drawer Fields:**

- List of dummy payment gateway dropdown

### Step 2 — Mint to Stablecoin (e.g. IDR → IDRX)

The business selects which issuer to use.

This reflects a typical B2B decision where a company chooses between multiple liquidity providers.

Node: **Mint Node**

**Input:** IDR

**Output:** IDRX

**Drawer Fields:**

- Amount to mint
- Dummy stablecoin issuer (DummyIssuerA/B/C)
- Wallet receiving the minted token

### Step 3 — Swap (e.g. IDRX → USDT)

Simulates the business’s routing engine choosing an aggregator for optimal price execution.

Node: **Swap Node**

**Input:** IDRX

**Output:** USDT

**Drawer Fields:**

- Amount
- Swap provider (DummyDEXA/DEXB/DEXC)
- Slippage tolerance
- Preferred route (optional)

### Step 4 — Bridge to Mantle (e.g. USDT → mUSDT)

Ensures activity on Mantle and mirrors real-world B2B cross-chain settlement flows.

Node: **Bridge Node**

**Input:** USDT

**Output:** mUSDT

**Drawer Fields:**

- Amount
- Bridge provider (DummyLayerZero / DummyOrbiter / DummyHyperlane)
- Destination chain
- Receiver wallet address

### Step 5 — Output Options

Businesses can allocate funds into multiple output channels:

### a. Redeem Node (e.g. mUSDT → USD)

Simulates converting mUSDT back to fiat (IDR or USD) stored in DB.

**Input:** mUSDT

**Output:** Fiat in database

**Drawer Fields:**

- Currency type (IDR / USD simulation)
- Amount
- Recipient wallet addres (default current user’s wallet)

---

### b. Transfer Node

Simulates sending mUSDT to a business wallet.

**Input:** mUSDT

**Output:** None (on-chain transfer simulation)

**Drawer Fields:**

- Recipient wallet address (default current user’s wallet)
- Amount
- Network (Mantle testnet)
- Max slippage

---

### c. Vault Node

Simulates depositing into a dummy auto-yield vault.

**Input:** mUSDT

**Output:** Vault shares

**Drawer Fields:**

- Amount
- Yield model (simulated)
- Vault stop condition:
    - Stop when vault reaches a target amount (e.g., 120 mUSDT)
    - Stop after a time period
    - Stop when APR drops below threshold
- Optional: Auto-withdraw destination (Redeem or Transfer)

---

## 4. Utility Node

### a. Wait Node

Delays workflow execution for a specified period.

**Input:** Any token

**Output:** Same token

**Drawer Fields:**

- Delay duration (seconds / minutes / hours / days)

Used for:

- Scheduled settlements
- Time-based vault strategies
- Rate-limited treasury operations

Connectable anywhere in the flow.

---

### b. Partition Node

Splits the incoming amount into multiple branches.

**Input:** Single token input

**Output:** Multiple token outputs

**Drawer Fields:**

- Partition percentages per output (e.g., 50%, 30%, 20%)
- Validation ensures total = 100%

Used for:

- Treasury allocation
- Multiple output options
- Multi-step simulations

---

## 5. Node List

| Node Type | Description |
| --- | --- |
| **Deposit** | Bring IDR/fiat into the system |
| **Mint** | Convert fiat → stablecoin |
| **Swap** | Exchange one token to another |
| **Bridge** | Move assets across blockchains |
| **Redeem** | Convert stablecoin → fiat |
| **Transfer** | Send stablecoins to any wallet |
| **Vault** | Earn yield; stop when target reached |
| **Wait** | Delay execution (time-based) |
| **Partition** | Split amount into multiple branches |

---

## 6. Why This Project Fits Mantle Hackathon

1. Directly drives stablecoin activity into Mantle’s ecosystem.
2. Provides **developer and business tooling**, which is highly valuable.
3. Offers visual orchestration, a rare capability in stablecoin payment automation.
4. Testnet-based approach is safe for enterprise experimentation.
5. Clear pathway to real-world commercial use cases:
    - Corporate payments
    - Treasury automation
    - Merchant settlements
    - Aggregated crypto on/off-ramping
    - Enterprise cross-chain liquidity management

---

## 7. Technical Architecture

### Frontend

- React / Next.js
- React Flow for node-based drag-and-drop interface
- Node configuration panels
- Real-time execution logs

### Backend

- Node.js / Python
- Dummy provider logic for mint, swap, bridge
- Service for executing end-to-end flows
- API access for B2B clients
- Authentication layer (API keys for businesses)

### On-Chain (Mantle Testnet)

- DummyStablecoinIssuer.sol
- DummyAggregator.sol
- DummyBridge.sol
- Vault.sol
- Tokens: IDRX, USDT, mUSDT

### Database

- Postgres / Supabase
- Corporate fiat ledger
- Workflow definitions
- Execution logs
- Business-specific API keys

---

## 8. Example B2B Workflow

Corporate treasury wants to move 1,000,000 IDR into multiple destinations:

Flow:

1. Deposit Node (IDR 1,000,000)
2. Mint Node (Issuer A → IDRX)
3. Swap Node (IDRX → USDT via DummyDEXA)
4. Bridge Node (USDT → mUSDT via DummyLayerZero)
5. Partition Node (50/30/20)
    - Branch 1 (50%): Transfer Node → Corporate wallet
    - Branch 2 (30%): Redeem Node → Corporate fiat account
    - Branch 3 (20%): Wait Node (7 days) → Vault Node (stop when 120 mUSDT)

---

## 9. Benefits for B2B Users

1. Codeless visual orchestration of stablecoin flows.
2. Complete routing transparency for audits and compliance.
3. Provider-agnostic choice for issuers, DEX aggregators, and bridges.
4. Enterprise-friendly with API entrypoints and workflow storage.
5. Clear roadmap for integration with real financial providers.
6. Easy for businesses to test their routing logic on testnet before deploying real money flows.

---
