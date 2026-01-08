import { defineChain } from "viem";

export const mantleSepoliaTestnet = defineChain({
  id: 5003,
  name: "Mantle Sepolia Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "MNT",
    symbol: "MNT",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.sepolia.mantle.xyz/"],
    },
  },
  blockExplorers: {
    default: {
      name: "Mantle Sepolia Explorer",
      url: "https://sepolia.mantlescan.xyz",
    },
  },
  testnet: true,
});

export const baseSepoliaTestnet = defineChain({
  id: 84532,
  name: "Base Sepolia",
  nativeCurrency: {
    decimals: 18,
    name: "ETH",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["https://sepolia.base.org"],
    },
  },
  blockExplorers: {
    default: {
      name: "Basescan",
      url: "https://sepolia.basescan.org",
    },
  },
  testnet: true,
});

export const EXPLORER_URL = "https://sepolia.mantlescan.xyz";
export const BASE_EXPLORER_URL = "https://sepolia.basescan.org";

export const getExplorerTxUrl = (txHash: string, chainId?: number) => {
  const baseUrl = chainId === 84532 ? BASE_EXPLORER_URL : EXPLORER_URL;
  return `${baseUrl}/tx/${txHash}`;
};

export const getExplorerAddressUrl = (address: string, chainId?: number) => {
  const baseUrl = chainId === 84532 ? BASE_EXPLORER_URL : EXPLORER_URL;
  return `${baseUrl}/address/${address}`;
};
