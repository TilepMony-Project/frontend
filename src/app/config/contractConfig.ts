/**
 * Smart Contract Configuration for TilepMoney
 * Adapted from integration-test-fe for Mantle Sepolia Testnet
 */

// MainController ABI (subset for executeWorkflow)
export const MAIN_CONTROLLER_ABI = [
  {
    inputs: [
      {
        components: [
          {
            internalType: "enum IMainController.ActionType",
            name: "actionType",
            type: "uint8",
          },
          {
            internalType: "address",
            name: "targetContract",
            type: "address",
          },
          { internalType: "bytes", name: "data", type: "bytes" },
          {
            internalType: "uint256",
            name: "inputAmountPercentage",
            type: "uint256",
          },
        ],
        internalType: "struct IMainController.Action[]",
        name: "actions",
        type: "tuple[]",
      },
      { internalType: "address", name: "initialToken", type: "address" },
      { internalType: "uint256", name: "initialAmount", type: "uint256" },
    ],
    name: "executeWorkflow",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "allowance", type: "uint256" },
      { internalType: "uint256", name: "needed", type: "uint256" },
    ],
    name: "ERC20InsufficientAllowance",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "token", type: "address" }],
    name: "SafeERC20FailedOperation",
    type: "error",
  },
  {
    inputs: [
      { internalType: "address", name: "sender", type: "address" },
      { internalType: "uint256", name: "balance", type: "uint256" },
      { internalType: "uint256", name: "needed", type: "uint256" },
    ],
    name: "ERC20InsufficientBalance",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      {
        indexed: false,
        internalType: "uint256",
        name: "actionCount",
        type: "uint256",
      },
    ],
    name: "WorkflowExecuted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      {
        indexed: false,
        internalType: "enum IMainController.ActionType",
        name: "actionType",
        type: "uint8",
      },
      { indexed: false, internalType: "uint256", name: "index", type: "uint256" },
      { indexed: false, internalType: "address", name: "target", type: "address" },
      { indexed: false, internalType: "bool", name: "success", type: "bool" },
    ],
    name: "ActionExecuted",
    type: "event",
  },
] as const;

export const VAULT_ABI = [
  {
    inputs: [{ internalType: "uint256", name: "newExchangeRate", type: "uint256" }],
    name: "setExchangeRate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export const ERC20_ABI = [
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

// Contract Addresses on Mantle Sepolia
export const ADDRESSES = {
  CORE: {
    MainController: "0xFE16617562Ce4005C42B0CDd70493820Ff0d8494" as const,
    SwapAggregator: "0x2C66416C018Fd9bD505A1FB07672d41271b00A90" as const,
    YieldRouter: "0x0222ac14bae2f6b4229ac6bc25f42c62b203893d" as const,
  },
  SWAP_ADAPTERS: {
    FusionXAdapter: "0x69ef210A4BE2F51558E0C4eE09c8E8a952b08B5a" as const,
    MerchantMoeAdapter: "0x7CCa9e3464AB751b94E59641E24D4e781366FDa9" as const,
    VertexAdapter: "0x16AB225113e6504aA38448C02c4ff3EDFbB6676D" as const,
  },
  YIELD: {
    // Adapters
    MethLabAdapter: "0x3ac50c119c1fec7ce2da88b7661965a4251be9f5" as const,
    InitCapitalAdapter: "0x8c8d17e5772ac3cefd01452952fd37316649853a" as const,
    ROUTER: "0x0222ac14bae2f6b4229ac6bc25f42c62b203893d" as const,
    METHLAB: {
      ADAPTER: "0x3ac50c119c1fec7ce2da88b7661965a4251be9f5" as const,
      VAULTS: {
        IDRX: "0x33b412fc19f18ca897f5046a6c2835cf8967b98c" as const,
        USDC: "0x2d7df3362ad89dc9647f62ef02d5a9b048f60e66" as const,
        USDT: "0xaf3b9f8207c9e86c71b46633c5e670bbf8ccc946" as const,
      },
    },
    INIT_CAPITAL: {
      ADAPTER: "0x8c8d17e5772ac3cefd01452952fd37316649853a" as const,
      POOLS: {
        IDRX: "0xeddcf78479dd5a358d23dd88bc2e17f443c0744b" as const,
        USDC: "0x2379f8671c294bf25a34e0f57aae0445074ae5cc" as const,
        USDT: "0x7ad0e6c5ef91d1fae6ad7cac00cf68f445710523" as const,
      },
    },
    COMPOUND: {
      ADAPTERS: {
        IDRX: "0x47c241c8fc2f799f2c1394073e43c2bb68495258" as const,
        USDC: "0x82b1af1ce5345e0f3b81a766a304954a00820f9e" as const,
        USDT: "0xd93dc201a691c7fbf61273e083bd8a68282b0057" as const,
      },
      COMETS: {
        IDRX: "0x851e69b388d055fc1068c3cd2888e32d2b8c6f5d" as const,
        USDC: "0x3e39df4be60278a77ff3d62004228d299a794d46" as const,
        USDT: "0xe7fdda7fa6b95e93c16229c6123174acf431e0df" as const,
      },
    },
  },
  TOKENS: {
    IDRX: "0x9C314942eAD675f56274da992aCCa6bCaA5d5147" as const,
    USDC: "0xd0f6B4Ed0F01579DaC8870A8EDba81c3ae6e751f" as const,
    USDT: "0x72a9793834a41054216Dfaf8782A38044470f42F" as const,
  },
  TOKENS_METADATA: {
    "0x9C314942eAD675f56274da992aCCa6bCaA5d5147": {
      decimals: 18,
      symbol: "IDRX",
      name: "Mock IDRX",
    },
    "0xd0f6B4Ed0F01579DaC8870A8EDba81c3ae6e751f": {
      decimals: 6,
      symbol: "USDC",
      name: "Mock USDC",
    },
    "0x72a9793834a41054216Dfaf8782A38044470f42F": {
      decimals: 6,
      symbol: "USDT",
      name: "Mock USDT",
    },
    // MethLab Vault Tokens
    "0x33b412fc19f18ca897f5046a6c2835cf8967b98c": {
      decimals: 18, // Updated from 6
      symbol: "mIDRX_METH", // Keep internal name or sync to mlIDRX? Keeping internal names for now but address updated
      name: "MethLab IDRX Vault",
    },
    "0x2d7df3362ad89dc9647f62ef02d5a9b048f60e66": {
      decimals: 6,
      symbol: "mUSDC_METH",
      name: "MethLab USDC Vault",
    },
    "0xaf3b9f8207c9e86c71b46633c5e670bbf8ccc946": {
      decimals: 6,
      symbol: "mUSDT_METH",
      name: "MethLab USDT Vault",
    },
    // Init Capital Pool Tokens
    "0xeddcf78479dd5a358d23dd88bc2e17f443c0744b": {
      decimals: 26,
      symbol: "inIDRX",
      name: "InitCapital IDRX",
    },
    "0x2379f8671c294bf25a34e0f57aae0445074ae5cc": {
      decimals: 14,
      symbol: "inUSDC",
      name: "InitCapital USDC",
    },
    "0x7ad0e6c5ef91d1fae6ad7cac00cf68f445710523": {
      decimals: 14,
      symbol: "inUSDT",
      name: "InitCapital USDT",
    },
    // Compound Comet Tokens (Missing in prev config, adding match)
    "0x851e69b388d055fc1068c3cd2888e32d2b8c6f5d": {
      decimals: 18,
      symbol: "cIDRXv3",
      name: "Compound IDRX",
    },
    "0x3e39df4be60278a77ff3d62004228d299a794d46": {
      decimals: 6,
      symbol: "cUSDCv3",
      name: "Compound USDC",
    },
    "0xe7fdda7fa6b95e93c16229c6123174acf431e0df": {
      decimals: 6,
      symbol: "cUSDTv3",
      name: "Compound USDT",
    },
  },
  BRIDGE: {
    BridgeRouter: "0xBEF02e7378378F4AB4E76F935d432fA27a51A828" as const,
    HypERC20Adapter: "0xDc505033eF57054b6613D75B5d7B806FD72F7BBf" as const,
  },
  DESTINATION_CHAINS: {
    mantleSepolia: { id: 5003, name: "Mantle Sepolia" },
    baseSepolia: { id: 84532, name: "Base Sepolia" },
  },
  IGP: {
    mantleSepolia: "0x6ad4c78ee9612eC9387370a9b9A997676B6C0228" as const,
    baseSepolia: "0x2a1dd0325fCeC114b9C4e62D06e09b8B2eBbC935" as const,
  },
} as const;

// Utility Functions
export const getTokenDecimals = (address: string): number => {
  const normalizedAddress = address.toLowerCase();
  const metadata = Object.entries(ADDRESSES.TOKENS_METADATA).find(
    ([addr]) => addr.toLowerCase() === normalizedAddress
  );
  return metadata ? metadata[1].decimals : 18;
};

export const getTokenSymbol = (address: string): string => {
  const normalizedAddress = address.toLowerCase();
  const metadata = Object.entries(ADDRESSES.TOKENS_METADATA).find(
    ([addr]) => addr.toLowerCase() === normalizedAddress
  );
  return metadata ? metadata[1].symbol : "UNKNOWN";
};

export const getTokenAddress = (symbol: string): string => {
  if (!symbol) return "";
  const tokenKey = symbol.toUpperCase() as keyof typeof ADDRESSES.TOKENS;
  return ADDRESSES.TOKENS[tokenKey] || "";
};

export const getSwapAdapterAddress = (adapterName: string): `0x${string}` | undefined => {
  const adapters: Record<string, `0x${string}`> = {
    FusionXAdapter: ADDRESSES.SWAP_ADAPTERS.FusionXAdapter,
    MerchantMoeAdapter: ADDRESSES.SWAP_ADAPTERS.MerchantMoeAdapter,
    VertexAdapter: ADDRESSES.SWAP_ADAPTERS.VertexAdapter,
  };
  return adapters[adapterName];
};

export const getYieldAdapterAddress = (adapterName: string): `0x${string}` | undefined => {
  const adapters: Record<string, `0x${string}`> = {
    MethLabAdapter: ADDRESSES.YIELD.METHLAB.ADAPTER,
    InitCapitalAdapter: ADDRESSES.YIELD.INIT_CAPITAL.ADAPTER,
    CompoundAdapterIDRX: ADDRESSES.YIELD.COMPOUND.ADAPTERS.IDRX,
    CompoundAdapterUSDC: ADDRESSES.YIELD.COMPOUND.ADAPTERS.USDC,
    CompoundAdapterUSDT: ADDRESSES.YIELD.COMPOUND.ADAPTERS.USDT,
  };
  return adapters[adapterName];
};

/**
 * Get vault share token address from symbol
 * Supports MethLab (ml*) and InitCapital (in*) vault tokens
 */
export const getShareTokenAddress = (symbol: string): string => {
  const shareTokens: Record<string, string> = {
    // MethLab vault tokens
    mlIDRX: ADDRESSES.YIELD.METHLAB.VAULTS.IDRX,
    mlUSDC: ADDRESSES.YIELD.METHLAB.VAULTS.USDC,
    mlUSDT: ADDRESSES.YIELD.METHLAB.VAULTS.USDT,
    // InitCapital pool tokens
    inIDRX: ADDRESSES.YIELD.INIT_CAPITAL.POOLS.IDRX,
    inUSDC: ADDRESSES.YIELD.INIT_CAPITAL.POOLS.USDC,
    inUSDT: ADDRESSES.YIELD.INIT_CAPITAL.POOLS.USDT,
    // Compound comet tokens
    cIDRXv3: ADDRESSES.YIELD.COMPOUND.COMETS.IDRX,
    cUSDCv3: ADDRESSES.YIELD.COMPOUND.COMETS.USDC,
    cUSDTv3: ADDRESSES.YIELD.COMPOUND.COMETS.USDT,
  };
  return shareTokens[symbol] || "";
};

// Main Contract Address Export
export const CONTRACT_ADDRESS = ADDRESSES.CORE.MainController;
export const CONTRACT_ABI = MAIN_CONTROLLER_ABI;

// IGP (Interchain Gas Paymaster) ABI for gas quote
export const IGP_ABI = [
  {
    inputs: [
      { name: "destinationDomain", type: "uint32" },
      { name: "gasAmount", type: "uint256" },
    ],
    name: "quoteGasPayment",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
