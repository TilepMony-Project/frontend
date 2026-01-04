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
    MainController: "0x3DF27Fb51Ef8bCC7AbD0D67d4531E6eD6d990b9f" as const,
    SwapAggregator: "0xed47849Eb9548F164234287964356eF9A6f73075" as const,
    YieldRouter: "0xfd5d839ef67bb50a3395f2974419274b47d7cb90" as const,
  },
  SWAP_ADAPTERS: {
    FusionXAdapter: "0x864d3a6F4804ABd32D7b42414E33Ed1CAeC5F505" as const,
    MerchantMoeAdapter: "0xA80e0Cc68389D3e98Fd41887e70580d5D260f022" as const,
    VertexAdapter: "0x20e7f518Bf77cde999Dba30758F7C562Db0b5A9C" as const,
  },
  YIELD: {
    ROUTER: "0xfd5d839ef67bb50a3395f2974419274b47d7cb90" as const,
    METHLAB: {
      ADAPTER: "0x183c5d648a3b36144ac7697aabc3ce27e1086e36" as const,
      VAULTS: {
        IDRX: "0xbe97818d0b6577410b7282f9306ea9ed8967d56a" as const,
        USDC: "0xde28623e3a209062479c4cd3240ed14819309d66" as const,
        USDT: "0x30f42e2f1931324abc0ee9975ff63c552ab50ab7" as const,
      },
    },
    INIT_CAPITAL: {
      ADAPTER: "0x9738885a3946456f471c17f43dd421ebe7ceb0ef" as const,
      POOLS: {
        IDRX: "0x6adaa6312b785fcbf4904ba505ecff4f3fe2b4e2" as const,
        USDC: "0x2e01d3672be5978a0cceada25097325f255f76e8" as const,
        USDT: "0x99a13d0d22025ebee7958be133022aa17e63a821" as const,
      },
    },
    COMPOUND: {
      ADAPTERS: {
        IDRX: "0xf040bb54c3b3a842543f2586f83ffe0bb0b3c0ad" as const,
        USDC: "0xceb77041351731c0613dce7f67e0c4086e283d5d" as const,
        USDT: "0x18706225374771d0d6286ed17b79a74445dedca5" as const,
      },
      COMETS: {
        IDRX: "0xadc863d35179fb78d05cd7bc270117d47cb7c366" as const,
        USDC: "0x36ecf1a5e8fb62ab7289b8eaeb1083f1211679fd" as const,
        USDT: "0xb01a0dbb3334da1087f87e70fb5149da1093e6a2" as const,
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
      decimals: 6,
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
    "0xbe97818d0b6577410b7282f9306ea9ed8967d56a": {
      decimals: 6,
      symbol: "mIDRX_METH",
      name: "MethLab IDRX Vault",
    },
    "0xde28623e3a209062479c4cd3240ed14819309d66": {
      decimals: 6,
      symbol: "mUSDC_METH",
      name: "MethLab USDC Vault",
    },
    "0x30f42e2f1931324abc0ee9975ff63c552ab50ab7": {
      decimals: 6,
      symbol: "mUSDT_METH",
      name: "MethLab USDT Vault",
    },
    // Init Capital Pool Tokens
    "0x6adaa6312b785fcbf4904ba505ecff4f3fe2b4e2": {
      decimals: 14,
      symbol: "inIDRX",
      name: "InitCapital IDRX",
    },
    "0x2e01d3672be5978a0cceada25097325f255f76e8": {
      decimals: 14,
      symbol: "inUSDC",
      name: "InitCapital USDC",
    },
    "0x99a13d0d22025ebee7958be133022aa17e63a821": {
      decimals: 14,
      symbol: "inUSDT",
      name: "InitCapital USDT",
    },
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
