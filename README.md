# TilepMoney

**Codeless Stablecoin Orchestration Builder for B2B Payments Infrastructure**

> Integrating stablecoin is hard, we made it easier using drag and drop

A visual drag-and-drop builder that allows businesses to design stablecoin movement workflows on Mantle testnet using dummy tokens and dummy third-party providers. TilepMoney enables enterprises to create, test, and automate transparent token routing without writing code.

## 🎯 Features

### Core Capabilities

- **Visual Workflow Builder** - Drag-and-drop interface for creating stablecoin payment workflows
- **9 Node Types** - Deposit, Mint, Swap, Bridge, Redeem, Transfer, Vault, Wait, and Partition nodes
- **AI-Powered Generation** - Generate workflows from natural language prompts
- **Real-Time Execution** - Execute workflows on Mantle testnet with live transaction monitoring
- **Workflow Templates** - Pre-built templates for common B2B scenarios
- **Auto-Save** - Automatic workflow saving with visual feedback
- **Execution Monitoring** - Real-time status updates, transaction logs, and progress tracking
- **Provider Agnostic** - Choose between multiple dummy providers for mint, swap, and bridge operations

### Node Types

**Input Nodes:**
- **Deposit** - Simulate fiat funding (IDR/USD) from corporate clients

**Processing Nodes:**
- **Mint** - Convert fiat to stablecoin via dummy issuer
- **Swap** - Exchange tokens via dummy DEX aggregator
- **Bridge** - Transfer tokens to Mantle testnet

**Output Nodes:**
- **Redeem** - Convert stablecoin back to fiat
- **Transfer** - Send stablecoins to any wallet
- **Vault** - Deposit into yield-generating vault with stop conditions

**Utility Nodes:**
- **Wait** - Delay execution for specified time periods
- **Partition** - Split amounts into multiple branches with percentage allocation

## 🚀 Getting Started

### Prerequisites

- Node.js 20 LTS or higher
- pnpm (recommended) or npm/yarn
- MongoDB Atlas account (or local MongoDB instance)
- Wallet (MetaMask or compatible) for Mantle testnet

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tilepmoney
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   MONGODB_URI=your_mongodb_connection_string
   
   # Authentication (Privy)
   NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
   PRIVY_APP_SECRET=your_privy_app_secret
   
   # OpenAI (for AI workflow generation - optional)
   OPENAI_API_KEY=your_openai_api_key
   
   # Blockchain RPC
   MANTLE_RPC_URL=your_mantle_rpc_url
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm format` - Format code with Biome
- `pnpm check` - Run Biome linter and formatter
- `pnpm lefthook:install` - Install git hooks

## 🏗️ Project Structure

```
tilepmoney/
├── src/
│   ├── app/
│   │   ├── api/              # Next.js API routes
│   │   │   ├── ai/           # AI workflow generation
│   │   │   ├── blockchain/   # Blockchain operations (mint, swap, bridge, etc.)
│   │   │   └── workflows/    # Workflow CRUD operations
│   │   ├── components/       # React components
│   │   │   ├── landing/      # Landing page components
│   │   │   ├── ui/           # shadcn/ui components
│   │   │   └── workflow/    # Workflow-specific components
│   │   ├── data/
│   │   │   └── nodes/        # Node type definitions
│   │   ├── features/         # Feature modules
│   │   │   ├── diagram/      # ReactFlow diagram logic
│   │   │   ├── json-form/    # Form generation and validation
│   │   │   ├── dashboard/    # Dashboard components
│   │   │   └── execution/    # Execution monitoring
│   │   ├── models/          # MongoDB models (User, Workflow, Execution, Transaction)
│   │   ├── store/           # Zustand state management
│   │   └── utils/           # Utility functions
│   └── types/               # TypeScript type definitions
├── docs/                    # Documentation
├── public/                  # Static assets
└── dummy-data/              # Sample workflow data
```

### Key Directories

- **`data/nodes`** - Includes definitions of the nodes used by the application and passed to the palette
- **`features`** - Most of Workflow Builder's core functionalities
- **`features/diagram`** - Logic responsible for displaying the diagram using ReactFlow
- **`features/json-form`** - Code responsible for rendering and validating items in the properties sidebars
- **`features/plugins-core`** - Logic implementing the functionality of optional plugins
- **`plugins`** - Optional features that can be removed without breaking the project
- **`store`** - Directory defining the main Zustand store of the workflow builder app

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript (strict mode)
- **Styling:** TailwindCSS + shadcn/ui components
- **Flow Builder:** React Flow (@xyflow/react)
- **State Management:** Zustand
- **Forms:** JSONForms + custom validation
- **Animation:** Framer Motion
- **Web3:**
  - Privy (authentication)
  - Wagmi (Ethereum interactions)
  - Viem (Ethereum library)

### Backend
- **Runtime:** Node.js 20 LTS
- **Framework:** Next.js 15 (API Routes + Server Actions)
- **Database:** MongoDB Atlas with Mongoose ODM
- **Authentication:** Privy (wallet-based auth)

### Blockchain
- **Network:** Mantle Testnet
- **Smart Contracts:** Solidity 0.8.20+
- **RPC Provider:** Mantle public RPC

### Development Tools
- **Package Manager:** pnpm
- **Linting & Formatting:** Biome
- **Pre-commit Hooks:** Lefthook
- **Type Checking:** TypeScript

## 📚 Documentation

- [AI Workflow Setup](./docs/ai-workflow-setup.md) - Guide for AI-powered workflow generation
- [AI Agent Summary](./docs/ai-agent-summary.md) - Overview of AI agent architecture
- [NLP Agent Architecture](./docs/nlp-agent-architecture.md) - Natural language processing details
- [MCP Alternative](./docs/mcp-alternative.md) - Model Context Protocol alternative approach
- [Product Requirements Document](./prd.md) - Complete PRD with detailed specifications
- [Project Info](./project_info.md) - Project overview and problem statement

## 🎨 Usage

### Creating a Workflow

1. **Start from Dashboard** - Click "Create New Workflow" or select a template
2. **Add Nodes** - Drag nodes from the left palette onto the canvas
3. **Connect Nodes** - Click and drag from output ports to input ports
4. **Configure Nodes** - Click a node to open the configuration drawer on the right
5. **Save** - Workflows auto-save, but you can manually save using Ctrl+S
6. **Execute** - Click "Run Full Flow" to execute the workflow on Mantle testnet

### Using AI Generation

1. Click the "Generate with AI" button on the dashboard
2. Enter a natural language description of your workflow
3. Review and customize the generated workflow
4. Save and execute

### Example Workflow

**Simple Treasury Allocation:**
```
Deposit (IDR) → Mint (IDRX) → Swap (USDT) → Bridge (mUSDT) → Partition (50/30/20)
  ├─ 50% → Transfer to wallet
  ├─ 30% → Redeem to fiat
  └─ 20% → Vault (stop at 120 mUSDT)
```

## 🔒 Security

- All API keys and secrets stored in environment variables
- Database credentials never exposed to client
- Server-side validation for all inputs
- Wallet-based authentication via Privy
- HTTPS for all API communications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript strict mode
- Use Biome for formatting and linting
- Write descriptive commit messages
- Add tests for new features
- Update documentation as needed

## 📝 License

MIT

## 🙏 Acknowledgments
l
TilepMoney combines ideas from:
- xWeave (real-time cross-border routing)
- Studio.Factor (visual node-based automation)
- n8n (codeless workflow builder)

Applied to a **stablecoin-focused B2B orchestration system**.

---

Built for the **Mantle Network Hackathon** 🚀
