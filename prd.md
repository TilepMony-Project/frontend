# Product Requirements Document: TilepMoney

## Document Information

**Project Name:** TilepMoney  
**Tagline:** Codeless Stablecoin Orchestration Builder for B2B Payments Infrastructure  
**Version:** 2.0  
**Date:** November 2025  
**Target Hackathon:** Mantle Network Hackathon  
**Document Owner:** Product Team  

---

## 1. Executive Summary

### 1.1 Product Vision
TilepMoney is a visual, codeless stablecoin orchestration builder that enables businesses to design and automate stablecoin payment workflows on Mantle testnet. By combining workflow automation with Web3 infrastructure, TilepMoney reduces the time and complexity required for enterprises to integrate stablecoin payments into their operations.

**Core Value:** "Integrating stablecoin is hard, we made it easier using drag and drop"

### 1.2 Product Goals
- Enable businesses to design stablecoin flows through visual drag-and-drop interface without coding
- Provide transparent, auditable payment orchestration across mint, swap, and bridge operations
- Reduce enterprise stablecoin integration time from weeks to hours
- Demonstrate practical B2B developer tooling on Mantle testnet
- Create extensible framework for real-world corporate payment automation

### 1.3 Target Market
**Primary:** B2B SaaS companies, fintech platforms, and enterprises building crypto-native payment infrastructure  
**Secondary:** Corporate treasury departments, merchant payment processors, cross-border payment providers  
**Future:** White-label solution for banks and financial institutions

### 1.4 Success Metrics
- Successful execution of 5+ workflow templates during demo
- Complete transaction path from deposit to multiple outputs (wallet/redeem/vault)
- Average workflow creation time under 5 minutes
- Workflow execution with real Mantle testnet transactions
- Zero critical bugs during judge evaluation

---

## 2. Problem Definition

### 2.1 Current Pain Points

**For Businesses:**
1. **Hard-coded Payment Flows:** Stablecoin payment logic (mint → swap → bridge) must be manually coded into backends, requiring engineering resources for every change
2. **Limited Visibility:** Companies cannot visualize or audit how money moves through provider chains
3. **Provider Lock-in:** Systems force businesses into specific issuers, swap providers, and bridges without flexibility
4. **Complex Cross-chain Logic:** Multi-chain workflows are difficult to configure, test, and simulate safely
5. **Slow Integration:** Integrating stablecoin rails takes weeks of development time
6. **No Testing Environment:** Businesses lack safe sandbox environments to experiment with payment routing

### 2.2 Why Existing Solutions Fall Short
- **Studio.Factor:** Not tailored for stablecoin payment automation
- **Traditional payment processors:** Lack crypto-native features and cross-chain capabilities
- **Hard-coded solutions:** Inflexible, expensive to maintain, and opaque
- **Generic smart contract builders:** Too technical, not business-focused

### 2.3 Target Users

**Primary Personas:**

**1. Fintech Payment Engineer**
- Needs to integrate stablecoin payments into existing platform
- Wants to test different routing strategies before production
- Requires API access for backend integration

**2. Corporate Treasury Manager**
- Manages company funds across multiple chains
- Needs automated allocation strategies (wallet/redemption/yield)
- Requires audit trails and execution logs

**3. Merchant Payment Processor**
- Processes customer payments in stablecoins
- Needs flexible routing based on customer preferences
- Requires settlement automation

---

## 3. Product Overview

### 3.1 Core Value Proposition
"The first B2B orchestration studio for stablecoin payment workflows—enabling businesses to design, test, and automate transparent token routing without writing code."

### 3.2 Key Differentiators
1. **B2B-first design** with multi-tenant architecture and API keys
2. **Stablecoin-specific focus** (vs. generic workflow automation)
3. **Provider-agnostic** architecture for maximum flexibility
4. **Mantle testnet integration** with real transaction execution
5. **Workflow templates** for common enterprise use cases
6. **Enterprise features:** scheduled execution, conditional stops, percentage-based allocation

### 3.3 Product Scope

#### In Scope (MVP)
- Visual workflow builder with 9 node types
- Dummy token operations on Mantle testnet
- **Full-stack Next.js application** with integrated backend
- **MongoDB database operations** handled via Next.js API Routes and Server Actions
- **External API integration** (blockchain RPC, payment gateways) via server-side API Routes
- Template library for common B2B scenarios
- Execution engine with node-by-node or full-flow execution
- Workflow status tracking (running/stopped/finished)
- Simple landing page and dashboard
- Wallet connection via RainbowKit
- Animation system for node execution states

#### Out of Scope (Post-MVP)
- Real fiat integration with payment processors
- Production mainnet deployment
- Advanced multi-user collaboration features
- Detailed analytics dashboard with charts
- Compliance/KYC integration
- Mobile application
- Webhook notifications for workflow events

---

## 4. Functional Requirements

### 4.1 Node System

TilepMoney provides 9 node types divided into three categories:

**Input Nodes:** Deposit  
**Processing Nodes:** Mint, Swap, Bridge  
**Output Nodes:** Redeem, Transfer, Vault  
**Utility Nodes:** Wait, Partition

---

#### 4.1.1 Deposit Node
**Category:** Input  
**Purpose:** Simulates business receiving fiat funding from corporate client or treasury

**Inputs:** None (entry point)  
**Outputs:** IDR or USD (stored in database)

**Configuration Drawer Fields:**
- Amount (numeric, 100 - 100,000,000)
- Currency (IDR / USD)
- Payment gateway selection (dropdown: DummyGatewayA, DummyGatewayB, DummyGatewayC)

**Behavior:**
- Creates fiat balance entry in database
- No actual payment processing
- Validates amount within range
- Can be starting point for multiple workflows

**Validation Rules:**
- Must be first node or have no incoming connections
- Amount must be positive number
- Currency must be selected

---

#### 4.1.2 Mint Node
**Category:** Processing  
**Purpose:** Convert fiat to stablecoin via dummy issuer

**Inputs:** IDR or USD  
**Outputs:** IDRX, USDX (depending on input currency)

**Configuration Drawer Fields:**
- Amount to mint
- Stablecoin issuer (dropdown: DummyIssuerA, DummyIssuerB, DummyIssuerC)
- Receiving wallet address (pre-filled with connected wallet)
- Exchange rate display (calculated, read-only)

**Behavior:**
- Calls `DummyStablecoinIssuer.sol` on Mantle testnet
- Mints equivalent stablecoin amount
- Records transaction hash in workflow execution log
- Updates user's on-chain balance

**Smart Contract:** `DummyStablecoinIssuer.sol`

**Validation Rules:**
- Must have incoming fiat connection
- Wallet address must be valid Ethereum address
- Amount cannot exceed available input balance

---

#### 4.1.3 Swap Node
**Category:** Processing  
**Purpose:** Exchange one token for another via dummy DEX

**Inputs:** Any stablecoin (IDRX, USDT, USDX)  
**Outputs:** Different stablecoin token

**Configuration Drawer Fields:**
- Input token (auto-filled from connection)
- Output token (dropdown: USDT, USDX, IDRX)
- Amount to swap
- Swap provider (dropdown: DummyDEXA, DummyDEXB, DummyDEXC)
- Slippage tolerance (0.1% - 5%, slider)
- Preferred route (optional, dropdown: Direct / Multi-hop)

**Behavior:**
- Calls `DummyAggregator.sol`
- Simulates DEX routing logic
- Displays estimated output and price impact
- Executes swap transaction
- Records transaction hash

**Smart Contract:** `DummyAggregator.sol`

**Validation Rules:**
- Input and output tokens must be different
- Amount must be within available balance
- Slippage must be between 0.1% and 5%

---

#### 4.1.4 Bridge Node
**Category:** Processing  
**Purpose:** Transfer tokens to Mantle testnet from simulated source chain

**Inputs:** USDT, USDX, or other supported token  
**Outputs:** mUSDT (Mantle testnet version)

**Configuration Drawer Fields:**
- Amount to bridge
- Bridge provider (dropdown: DummyLayerZero, DummyOrbiter, DummyHyperlane)
- Source chain (display only: Ethereum Testnet)
- Destination chain (fixed: Mantle Testnet)
- Receiver wallet address (pre-filled)
- Estimated bridge time (display only: ~30 seconds)

**Behavior:**
- Calls `DummyBridge.sol`
- Simulates cross-chain messaging
- Burns token on source (simulated)
- Mints equivalent on Mantle testnet
- Records bridge transaction ID

**Smart Contract:** `DummyBridge.sol`

**Validation Rules:**
- Must receive supported token type
- Destination must be Mantle testnet
- Receiver address must be valid

---

#### 4.1.5 Redeem Node
**Category:** Output  
**Purpose:** Convert stablecoin back to fiat (database simulation)

**Inputs:** mUSDT or other Mantle stablecoin  
**Outputs:** Fiat balance (database entry)

**Configuration Drawer Fields:**
- Amount to redeem
- Currency type (dropdown: IDR / USD)
- Recipient wallet address (default: current user, optional override)
- Conversion rate (display only, calculated)

**Behavior:**
- Burns tokens on Mantle testnet (calls contract)
- Credits equivalent fiat to user's database balance
- No actual bank integration
- Creates redemption transaction record

**Validation Rules:**
- Must have incoming mUSDT connection
- Amount cannot exceed available balance
- Terminal node (no outgoing connections allowed)

---

#### 4.1.6 Transfer Node
**Category:** Output  
**Purpose:** Send stablecoins to business wallet or external address

**Inputs:** mUSDT or other Mantle token  
**Outputs:** None (terminal node)

**Configuration Drawer Fields:**
- Amount to transfer
- Recipient wallet address (default: current user)
- Network (display only: Mantle Testnet)
- Max slippage (0.1% - 2%, for gas estimation)
- Add memo/note (optional, stored in DB only)

**Behavior:**
- Executes standard ERC20 transfer on Mantle
- Records transaction hash
- Shows confirmation in execution log
- Updates recipient balance

**Validation Rules:**
- Recipient address must be valid
- Amount must be positive and within balance
- Terminal node (no outgoing connections)

---

#### 4.1.7 Vault Node
**Category:** Output  
**Purpose:** Deposit into yield-generating vault with automated stop conditions

**Inputs:** mUSDT  
**Outputs:** Vault share tokens

**Configuration Drawer Fields:**
- Amount to deposit
- Yield model (dropdown: Conservative 3% APR, Moderate 5% APR, Aggressive 8% APR)
- **Vault Stop Condition (required, radio buttons):**
  - Target amount reached (e.g., stop when vault reaches 120 mUSDT)
  - Time period elapsed (e.g., stop after 30 days)
  - APR drops below threshold (e.g., stop if APR < 2%)
- **Auto-withdraw Destination (optional, if stop condition met):**
  - Redeem to fiat
  - Transfer to wallet
  - Do nothing (manual withdrawal required)

**Behavior:**
- Deposits tokens into `Vault.sol` smart contract
- Mints vault share tokens
- Simulates yield accrual over time
- Monitors stop condition in background
- Automatically executes withdrawal action when condition met
- Updates workflow status to "finished" when vault completes

**Smart Contract:** `Vault.sol`

**Validation Rules:**
- Must select at least one stop condition
- If target amount selected, must be greater than initial deposit
- If time period selected, must be between 1 hour and 365 days
- Auto-withdraw destination required if stop condition is active

---

#### 4.1.8 Wait Node
**Category:** Utility  
**Purpose:** Delay workflow execution for specified time period

**Inputs:** Any token  
**Outputs:** Same token (pass-through)

**Configuration Drawer Fields:**
- Delay duration (numeric input)
- Time unit (dropdown: Seconds / Minutes / Hours / Days)
- Description/reason (optional text field)

**Behavior:**
- Pauses workflow execution for specified duration
- Token balance remains unchanged
- During wait period, workflow status shows "running (waiting)"
- Resumes automatically after duration elapses
- Can be inserted anywhere in flow

**Use Cases:**
- Scheduled settlements (wait 24 hours before transfer)
- Rate-limited operations
- Time-based treasury strategies
- Cooling-off periods for compliance

**Validation Rules:**
- Duration must be positive number
- Maximum wait time: 365 days
- Cannot be terminal node (must have outgoing connection)

---

#### 4.1.9 Partition Node
**Category:** Utility  
**Purpose:** Split incoming amount into multiple branches with percentage allocation

**Inputs:** Single token input  
**Outputs:** Multiple token outputs (2-5 branches)

**Configuration Drawer Fields:**
- Number of output branches (dropdown: 2, 3, 4, 5)
- Percentage allocation per branch (e.g., 50%, 30%, 20%)
- Branch labels (optional, for clarity)
- Auto-balance toggle (automatically adjusts percentages to sum to 100%)

**Behavior:**
- Validates total percentages equal 100%
- Splits token amount across branches
- Each branch can connect to different nodes
- Creates separate execution paths
- All branches execute in parallel

**Use Cases:**
- Treasury allocation (wallet/redemption/vault split)
- Multi-destination payments
- Risk diversification strategies
- Testing multiple routing strategies

**Validation Rules:**
- Total percentages must equal exactly 100%
- Each percentage must be greater than 0%
- Must have at least 2 output connections
- Maximum 5 output branches

---

### 4.2 Workflow Builder Interface

#### 4.2.1 Canvas
- **Infinite scroll workspace** with pan and zoom
- **Zoom controls:** 25% to 400% with preset buttons (50%, 100%, 200%)
- **Grid background** with snapping (toggle on/off)
- **Mini-map** in bottom-left corner for navigation
- **Auto-layout button** to organize nodes cleanly
- **Fit to view button** to center all nodes
- **Auto-save:** Automatically saves workflow changes when user modifies the flow (nodes, connections, configurations)
  - **Implementation:** Uses Next.js Server Action `saveWorkflow()` called via debounced function
  - **Save triggers:** Node addition/deletion, connection changes, node configuration updates, node position changes
  - **Debounce delay:** 500ms to prevent excessive API calls
  - **Save indicator:** Visual feedback showing "Saving..." / "Saved" status in header
  - **Error handling:** Retry logic for failed saves, offline queue for network failures

#### 4.2.2 Node Palette (Left Sidebar)
**Organized by categories:**

**Input Nodes**
- Deposit (💰 icon)

**Processing Nodes**
- Mint (🪙 icon)
- Swap (🔄 icon)
- Bridge (🌉 icon)

**Output Nodes**
- Redeem (💵 icon)
- Transfer (📤 icon)
- Vault (🏦 icon)

**Utility Nodes**
- Wait (⏳ icon)
- Partition (🔀 icon)

**Interaction:**
- **List of draggable nodes** displayed in left panel
- Drag node from palette to canvas
- Hover shows node description tooltip
- Click to add at center of viewport

#### 4.2.3 Node Management
- **Add node:** Drag from palette or click to add
- **Select node:** Click to select, show configuration drawer
- **Multi-select:** Shift+click or drag selection box
- **Delete:** Select + Delete key or trash icon
- **Duplicate:** Ctrl+D or duplicate button
- **Copy/Paste:** Standard shortcuts (Ctrl+C, Ctrl+V)
- **Undo/Redo:** Ctrl+Z / Ctrl+Shift+Z (up to 20 steps)

#### 4.2.4 Connection System
- **Create connection:** Click output port → drag → drop on input port
- **Connection validation:** 
  - Green line = valid connection
  - Red line = invalid (incompatible types)
  - Animated flow = active execution
- **Delete connection:** Click connection line → press Delete or click X
- **Connection styles:**
  - Solid line = default flow
  - Dashed line = conditional flow (from Partition node)
  - Animated dots = currently executing

**Connection Rules:**
- Input types must match output types (token compatibility)
- No circular dependencies allowed
- Partition node must have multiple outputs
- Output nodes (Redeem/Transfer) cannot have outputs
- Deposit node cannot have inputs

#### 4.2.5 Configuration Drawer (Right Side)
**Opens when node is clicked and active**

**Structure:**
- **Header:** Node type icon + name
- **Body:** Configuration form with fields (details field input)
- **Footer:** Save/Cancel buttons

**Features:**
- **Right panel appears automatically** when a node is clicked and becomes active
- Real-time validation with inline error messages
- Help tooltips (?) next to complex fields
- Smart defaults pre-filled
- "Duplicate node" button in header
- "Delete node" button in header
- Collapsible sections for advanced options

**Validation Display:**
- Red border on invalid fields
- Error message below field
- Node icon shows red badge if configuration incomplete
- "Save" button disabled until valid

---

### 4.3 Workflow Execution System

#### 4.3.1 Execution Modes

**Mode 1: Full Flow Execution**
- Executes all nodes from start to finish
- Follows connection graph sequentially
- Button: "Run Full Flow" (primary button, top-right)

**Mode 2: Single Node Execution**
- Right-click node → "Run This Node Only"
- Executes only selected node with mock inputs
- Useful for testing individual steps
- Shows preview of expected outputs

**Mode 3: Partial Flow Execution**
- Select multiple nodes → "Run Selected Nodes"
- Executes subgraph if properly connected
- Validates that selection has valid start/end points

#### 4.3.2 Pre-Execution Validation
**System checks before allowing execution:**

✅ **Graph Structure:**
- At least one entry node (Deposit)
- All nodes properly connected
- No disconnected nodes
- No circular dependencies

✅ **Node Configuration:**
- All required fields filled
- All validations passing
- Percentage allocations sum to 100% (Partition nodes)

✅ **Wallet & Balance:**
- Wallet connected
- Sufficient balance for gas fees
- Valid receiving addresses

**Validation Error Display:**
- Modal overlay with checklist
- Red X for failed checks
- Green checkmark for passed checks
- "Fix Issues" button links to problematic nodes
- Cannot proceed until all checks pass

#### 4.3.3 Execution Process

**Step 1: Pre-Execution Preview**
- Modal shows execution plan
- Lists all nodes in execution order
- Displays estimated gas costs
- Shows expected token flows between nodes
- "Confirm & Execute" or "Cancel" buttons
- **Server-side validation** via `/api/workflows/[id]/validate` endpoint

**Step 2: Execution Initiation**
- Client calls `POST /api/workflows/[id]/execute` with workflow configuration
- Server validates workflow structure and node configurations
- Server creates execution record in MongoDB
- Server returns execution ID and initial status
- Client establishes WebSocket connection or polling for real-time updates

**Step 3: Execution Monitoring**
- **Progress bar** at top showing overall completion %
- **Node status indicators:**
  - ⏳ Pending (gray)
  - ⚡ Processing (blue, animated pulse)
  - ✅ Complete (green, checkmark)
  - ❌ Failed (red, error icon)
  - ⏸️ Waiting (yellow, for Wait nodes)
- **Real-time status updates** via polling `GET /api/workflows/[id]/status` or WebSocket
- **Server-side execution:**
  - Each node execution calls appropriate API endpoint (e.g., `/api/blockchain/mint`)
  - Server handles blockchain interactions and external API calls
  - Server updates execution state in database
  - Server logs all transactions and operations
  
**Step 4: Live Updates**
- **Transaction log panel** (bottom drawer)
  - Timestamp for each operation
  - Transaction hash (click to view on Mantle block explorer)
  - Gas used
  - Status message
  - Data fetched from `/api/transactions` endpoint
- **Token balance updates** in real-time via `/api/blockchain/balance`
- **Node animation effects:**
  - Glow effect on active node
  - Particle effects on connections during token flow
  - Success confetti animation on completion

**Step 5: Error Handling**
- **If node fails:**
  - Server-side error handling in API routes
  - Execution pauses immediately on server
  - Error details returned to client via API response
  - Error modal appears with details
  - Options: "Retry Node" (calls `/api/workflows/[id]/retry-node`) / "Skip & Continue" / "Stop Execution" (calls `/api/workflows/[id]/stop`)
  - Failed node highlighted in red with error icon
- **Retry logic (Server-Side):**
  - Automatic retry for network errors (max 3 attempts)
  - Exponential backoff: 5s, 15s, 30s
  - Retry logic implemented in API route handlers
- **Rollback capability:**
  - Option to "Revert All Changes" if critical failure
  - Server-side rollback via `/api/workflows/[id]/rollback` endpoint
  - Returns tokens to pre-execution state (if supported by contracts)

**Step 6: Completion Summary**
- **Success modal** with celebration animation
- **Summary cards** (data from `/api/workflows/[id]/execution-summary`):
  - Total execution time
  - Number of transactions
  - Total gas used
  - Final token balances by destination
  - Vault deposits (if applicable)
- **Action buttons:**
  - "View Full Log" (fetches from `/api/transactions?workflowId=[id]`)
  - "View on Block Explorer" (opens Mantle explorer with transaction hash)
  - "Create New Workflow"
  - "Run Again" (triggers new execution via API)

#### 4.3.4 Workflow Status States

| Status | Description | Triggers |
|--------|-------------|----------|
| **Draft** | Workflow created but not executed | Initial creation |
| **Running** | Actively executing nodes | User clicks "Run Full Flow" |
| **Running (Waiting)** | Paused at Wait node | Wait node is executing |
| **Stopped** | Manually stopped by user | User clicks "Stop Execution" |
| **Finished** | All nodes completed successfully | Last node completes OR vault stop condition met |
| **Failed** | Execution failed with error | Critical node error without retry |

---

### 4.4 Workflow Management

#### 4.4.1 Workflow Dashboard
**Layout:** Grid or list view toggle

**Data Loading:**
- Workflows fetched from `GET /api/workflows` endpoint
- Real-time updates via polling or WebSocket connection
- Server-side filtering and sorting for performance

**Each workflow card displays:**
- Workflow name (editable inline - saves via `PUT /api/workflows/[id]`)
- Description (truncated, hover for full)
- Status badge (color-coded by state)
- Last executed timestamp
- Owner/creator name
- Node count
- Quick actions: Run / Edit / Duplicate / Delete

**Filtering & Sorting:**
- Filter by status (All / Draft / Running / Finished) - handled server-side via query params
- Sort by: Name / Last Modified / Last Executed / Status - handled server-side
- Search bar for workflow name - server-side search via MongoDB queries

**Batch Actions:**
- Select multiple workflows
- Bulk delete (with confirmation) - calls `DELETE /api/workflows/batch` endpoint
- Export selected as JSON - generates export via `/api/workflows/export` endpoint

#### 4.4.2 Workflow Templates
**Pre-built templates for common B2B scenarios:**

**Template 1: Simple Treasury Allocation**
- Deposit → Mint → Swap → Bridge → Partition (50/30/20)
  - 50% Transfer to wallet
  - 30% Redeem to fiat
  - 20% Vault with 30-day stop

**Template 2: Cross-Border Payment Settlement**
- Deposit (IDR) → Mint (IDRX) → Swap (IDRX→USDT) → Bridge → Transfer

**Template 3: Automated Yield Strategy**
- Deposit → Mint → Bridge → Vault (stop at 120 mUSDT target) → Redeem

**Template 4: Scheduled Corporate Payout**
- Deposit → Mint → Bridge → Wait (7 days) → Partition
  - 70% Transfer to employees
  - 30% Vault

**Template 5: Risk-Diversified Treasury**
- Deposit → Mint → Bridge → Partition (4-way split)
  - 40% Vault A
  - 30% Vault B
  - 20% Transfer
  - 10% Redeem

**Template Actions:**
- "Use Template" button creates copy in user's workspace
- User can customize all node configurations
- Templates locked (cannot edit original)
- Templates categorized: Treasury / Payments / Yield / Multi-chain

#### 4.4.3 Workflow History
**For each workflow, track (stored in MongoDB):**
- All execution attempts
- Timestamp, duration, status
- Input amounts and output distributions
- Transaction hashes for each node
- Error logs (if failed)
- Gas costs per execution

**History View:**
- Data fetched from `GET /api/workflows/[id]/history` endpoint
- Timeline visualization
- Click execution to see detailed report (from `/api/executions/[id]`)
- Filter by date range (server-side filtering)
- Export history as CSV (generated via `/api/workflows/[id]/history/export`)

---

### 4.5 Simulation & Preview System

#### 4.5.1 Simulation Mode
**Purpose:** Preview workflow behavior without executing real transactions

**Activation:**
- "Run Simulation" button (secondary button next to "Run Full Flow")
- No wallet signature required
- No gas costs

**Simulation Behavior:**
- Validates entire flow
- Calculates estimated outputs for each node
- Shows mock transaction hashes
- Displays predicted final balances
- Estimates gas costs
- Highlights potential issues (e.g., insufficient balance, high slippage)

**Simulation Results Screen:**
- Visual flow diagram with predicted values on each connection
- **Balance Simulator Panel:**
  - Starting balance
  - Balance after each node
  - Final balances by destination
  - Percentage breakdowns
- **Risk Indicators:**
  - Slippage warnings
  - Bridge time estimates
  - Gas cost alerts (if unusually high)

**Use Cases:**
- Test new workflow before committing funds
- Compare different routing strategies
- Validate logic before client demonstration
- Training and onboarding

---

## 5. User Interface Design

### 5.1 Landing Page

**Structure:**

**Hero Section:**
- Headline: "Integrating stablecoin is hard, we made it easier using drag and drop"
- Subheadline: "Visual orchestration builder for B2B stablecoin payment workflows"
- Primary CTA: "Start Building Workflows"
- Secondary CTA: "Watch Demo Video"
- Hero graphic: Animated workflow diagram showing nodes connecting

**Feature Highlights (3 columns):**
1. **Codeless Orchestration**
   - Icon: Drag-and-drop cursor
   - Description: "Build complex payment flows visually without writing code"
   
2. **Provider Agnostic**
   - Icon: Network nodes
   - Description: "Choose your preferred mint, swap, and bridge providers"
   
3. **Enterprise Ready**
   - Icon: Building/vault
   - Description: "Built for B2B with templates, automation, and API access"

**How It Works (4 steps):**
1. Design your flow → Visual canvas illustration
2. Configure nodes → Configuration panel illustration
3. Execute on Mantle → Blockchain transaction illustration
4. Monitor results → Dashboard illustration

**Use Case Section:**
- "Trusted by forward-thinking businesses"
- 3-4 use case cards:
  - Corporate Treasury Management
  - Cross-Border Payments
  - Merchant Settlement
  - Automated Yield Strategies

**CTA Section:**
- "Ready to streamline your stablecoin operations?"
- "Start Building" button
- "Book Demo" button (for sales)

**Footer:**
- Links: About, Docs, Templates, Contact
- Social links
- Mantle hackathon badge

---

### 5.2 Dashboard / Workspace

**Layout:**

**Top Navigation Bar:**
- Logo (left)
- Workspace selector (if multi-workspace in future)
- Search workflows (center)
- Notifications icon
- Wallet connection status
- User menu (right): Profile, Settings, Logout

**Left Sidebar (collapsed/expanded):**
- **My Workflows** (list view)
  - Search/filter bar
  - Create New button
  - Workflow list with status indicators
- **Templates** (expandable)
  - Template categories
  - Click to preview/use
- **Execution History**
  - Recent executions
  - Filter by status

**Main Content Area:**
- Empty state (if no workflow selected):
  - "Create your first workflow" prompt
  - Quick-start templates
  - Getting started guide link
  
- Workflow builder (if workflow selected):
  - Canvas (center)
  - Node palette (left) - list of draggable nodes
  - Configuration drawer (right, collapsible) - shows when node is clicked and active
  - Control panel (top): Save (auto-saves on flow changes), Run Full Flow, Simulate, Share, Delete
  - Minimap (bottom-left)

**Bottom Panel (collapsible):**
- Execution logs
- Transaction history
- Validation errors
- Console output

---

### 5.3 Workflow Builder Screen

**Anatomy:**

**Header Bar:**
- Back to dashboard arrow
- Workflow name (editable inline)
- Status badge
- Action buttons:
  - Save (auto-saves when user changes the flow)
  - Run Simulation
  - **Run Full Flow** (primary action to execute workflow)
  - Share workflow
  - Settings

**Canvas Controls (floating toolbar):**
- Zoom in/out buttons
- Fit to screen
- Auto-layout
- Minimap toggle (positioned bottom-left)
- Grid snap toggle
- Undo/redo

**Node Palette (Left Sidebar, 280px width):**
- **List of nodes** organized by category that can be dragged to workspace
- Search nodes
- Categorized accordion:
  - Input (1 node type)
  - Processing (3 node types)
  - Output (3 node types)
  - Utility (2 node types)
- Each node shows icon + name
- Drag onto canvas

**Configuration Drawer (Right Sidebar, 360px width):**
- **Shows when node is clicked and active** (right panel for details field input)
- Only visible when node selected
- Sticky header with node type
- Scrollable form fields
- Action buttons at bottom

**Canvas (Main Area):**
- Infinite workspace with grid
- Nodes connected by lines
- Zoom: 25% to 400%
- Click to select, drag to move
- Right-click for context menu

---

### 5.4 Execution Monitor Screen

**During execution, interface transforms:**

**Full-Screen Execution View:**
- Semi-transparent overlay on canvas
- Workflow diagram in center showing node states
- Progress bar at top (0-100%)
- Node-by-node status updates

**Execution Dashboard Panel (Bottom Drawer, expanded):**
- **Live Log Tab:**
  - Scrolling log of operations
  - Timestamps, transaction hashes, status
  
- **Token Flow Tab:**
  - Sankey diagram showing token movement
  - Real-time balance updates
  
- **Transactions Tab:**
  - Table of all transactions
  - Columns: Node, TX Hash, Status, Gas, Timestamp
  - Click hash to open block explorer

**Status Banner (Top):**
- Current node executing
- Estimated time remaining
- "Stop Execution" emergency button

---

### 5.5 Workflow List / Dashboard View

**View Modes:**
- **Grid View:** Cards with preview thumbnails
- **List View:** Table with sortable columns

**Grid View Cards:**
- Thumbnail of workflow diagram
- Name and description
- Status badge
- Last executed timestamp
- Quick actions: Run / Edit / Duplicate / Delete

**List View Columns:**
- Checkbox (for batch operations)
- Name
- Status
- Last Executed
- Owner
- Node Count
- Actions dropdown

**Filters Panel (Left Sidebar):**
- Status checkboxes
- Date range picker
- Owner filter (if team feature)
- Node type filter

---

### 5.6 Animation System

**Purpose:** Provide visual feedback during node execution

**Animation Types:**

**1. Node State Animations:**
- **Pending:** Subtle gray pulse
- **Processing:** Blue glow with rotating ring
- **Complete:** Green checkmark fade-in + subtle bounce
- **Failed:** Red shake animation + error icon
- **Waiting:** Yellow hourglass with rotating animation

**2. Connection Flow Animations:**
- **Idle:** Static line
- **Active:** Animated dots flowing along connection
- **Complete:** Green pulse wave traveling along line
- **Failed:** Red flash

**3. Token Transfer Visualization:**
- Particle effects moving from source to destination
- Speed increases based on transaction value
- Color matches token type (e.g., green for USDT)

**4. Execution Completion:**
- Confetti animation from center
- Success modal fade-in
- Smooth transition to dashboard

**5. Loading States:**
- Skeleton screens for loading content
- Shimmer effect on loading cards
- Progress spinner with brand colors

**Animation Library:** Framer Motion

---

## 6. Technical Architecture

### 6.1 Architecture Overview

TilepMoney is built as a **full-stack Next.js application** that handles both frontend presentation and backend business logic within a single codebase. All database operations, external API calls, and server-side processing are handled through Next.js API Routes and Server Actions, eliminating the need for a separate backend service.

**Key Architectural Decisions:**
- **Unified Codebase:** Frontend and backend logic coexist in the same Next.js project
- **Server-Side Processing:** Database operations and external API calls are handled server-side for security and performance
- **API Routes:** RESTful endpoints for workflow CRUD operations, execution, and data management
- **Server Actions:** Form submissions and mutations use Next.js Server Actions for type-safe server operations
- **Client Components:** Interactive UI components marked with 'use client' directive
- **Server Components:** Default rendering on server for better performance and SEO

### 6.2 Technology Stack

#### Frontend (Client Components)
- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript (strict mode)
- **Styling:** TailwindCSS 3.x + shadcn/ui components
- **Animation:** Framer Motion
- **Flow Builder:** React Flow 11.x
- **State Management:** Zustand (for workflow state)
- **Forms:** React Hook Form + Zod validation
- **Icons:** web3icons
- **Notifications:** Sonner (toast notifications)
- **Web3:**
  - RainbowKit (wallet connection)
  - Wagmi (Ethereum interactions)
  - Viem (Ethereum library)

#### Backend (Server-Side)
- **Runtime:** Node.js 20 LTS
- **Framework:** Next.js 15 App Router (API Routes + Server Actions)
- **Database:** MongoDB Atlas
- **ODM:** Mongoose
- **Authentication:** NextAuth.js (with wallet-based auth)
- **API Architecture:**
  - **API Routes:** `/app/api/*` for RESTful endpoints
  - **Server Actions:** Server-side functions for mutations
  - **External API Integration:** All external API calls (blockchain RPC, payment gateways, etc.) handled server-side
- **API Documentation:** OpenAPI/Swagger (future)

#### Blockchain
- **Network:** Mantle Testnet
- **Smart Contract Language:** Solidity 0.8.20+
- **Development Framework:** Foundry (Forge, Cast, Anvil)
- **Testing:** Foundry tests + Hardhat for integration
- **RPC Provider:** Mantle public RPC + Infura backup

#### Development Tools
- **Package Manager:** pnpm
- **Linting & Formatting:** Biome (linter and formatter)
- **Pre-commit Hooks:** Lefthook
- **Git:** Version control

### 6.3 API Architecture

#### 6.3.1 API Routes Structure
All backend operations are handled through Next.js API Routes located in `/app/api/`:

**Workflow Management:**
- `GET /api/workflows` - List all workflows for authenticated user
- `GET /api/workflows/[id]` - Get specific workflow details
- `POST /api/workflows` - Create new workflow
- `PUT /api/workflows/[id]` - Update existing workflow
- `DELETE /api/workflows/[id]` - Delete workflow

**Workflow Execution:**
- `POST /api/workflows/[id]/execute` - Execute workflow flow
- `POST /api/workflows/[id]/simulate` - Simulate workflow without execution
- `GET /api/workflows/[id]/status` - Get execution status
- `POST /api/workflows/[id]/stop` - Stop running workflow

**Transaction Management:**
- `GET /api/transactions` - List transaction history
- `GET /api/transactions/[hash]` - Get transaction details by hash
- `POST /api/transactions/verify` - Verify transaction on blockchain

**User & Authentication:**
- `GET /api/user` - Get current user profile
- `POST /api/user/preferences` - Update user preferences
- `POST /api/auth/wallet` - Authenticate with wallet signature

**External API Integration:**
- `POST /api/blockchain/mint` - Mint tokens via dummy issuer contract
- `POST /api/blockchain/swap` - Execute swap via dummy aggregator
- `POST /api/blockchain/bridge` - Bridge tokens via dummy bridge contract
- `POST /api/blockchain/transfer` - Transfer tokens
- `POST /api/blockchain/vault` - Deposit to vault contract
- `GET /api/blockchain/balance` - Get token balances

#### 6.3.2 Server Actions
Next.js Server Actions are used for form submissions and mutations:

**Workflow Operations:**
- `saveWorkflow()` - Save workflow changes (auto-save functionality)
- `createWorkflow()` - Create new workflow from template
- `duplicateWorkflow()` - Duplicate existing workflow
- `deleteWorkflow()` - Delete workflow

**Node Configuration:**
- `updateNodeConfig()` - Update node configuration
- `validateNodeConfig()` - Validate node configuration before save

**Execution:**
- `executeWorkflow()` - Trigger workflow execution
- `simulateWorkflow()` - Run workflow simulation

#### 6.3.3 Database Operations
All database operations are performed server-side:

**MongoDB Collections:**
- `workflows` - Workflow definitions and configurations
- `users` - User profiles and preferences
- `executions` - Workflow execution history and logs
- `transactions` - Blockchain transaction records
- `templates` - Workflow templates

**Database Access Pattern:**
- All database queries executed in API Routes or Server Actions
- Mongoose ODM for type-safe database operations
- Connection pooling for optimal performance
- Transaction support for atomic operations

#### 6.3.4 External API Integration
External API calls are handled server-side for security:

**Blockchain RPC Calls:**
- Mantle Testnet RPC endpoints
- Contract interaction via Viem
- Transaction signing and broadcasting
- Event listening and monitoring

**Payment Gateway Integration (Future):**
- Payment processor webhooks
- Fiat-to-crypto conversion APIs
- Settlement and reconciliation APIs

**Third-Party Services:**
- All external API calls routed through Next.js API Routes
- API keys and secrets stored in environment variables
- Rate limiting and error handling
- Retry logic with exponential backoff

### 6.4 Security Considerations

**Server-Side Security:**
- API keys and secrets never exposed to client
- Database credentials stored in environment variables
- Input validation using Zod schemas
- SQL injection prevention via Mongoose ODM
- CORS configuration for API routes
- Rate limiting on API endpoints

**Authentication:**
- Wallet-based authentication via NextAuth.js
- Session management server-side
- JWT tokens for API authentication
- Role-based access control (future)

**Data Protection:**
- Sensitive data encrypted at rest (MongoDB)
- HTTPS for all API communications
- Environment variable validation
- Secure cookie handling