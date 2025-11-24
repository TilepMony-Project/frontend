import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mantleTestnet } from 'viem/chains';
import { http, createConfig } from 'wagmi';
import { injected, walletConnect } from 'wagmi/connectors';

// RainbowKit config with SSR support
export const rainbowKitConfig = getDefaultConfig({
  appName: 'TilepMoney',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id',
  chains: [mantleTestnet],
  ssr: true,
});

// Wagmi config (for direct use if needed)
export const wagmiConfig = createConfig({
  chains: [mantleTestnet],
  connectors: [
    injected(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id',
    }),
  ],
  transports: {
    [mantleTestnet.id]: http(
      process.env.NEXT_PUBLIC_MANTLE_RPC_URL || 'https://rpc.testnet.mantle.xyz'
    ),
  },
});

export const config = rainbowKitConfig;

// Mantle Testnet configuration
export const mantleConfig = {
  chainId: 5001,
  rpcUrl: process.env.NEXT_PUBLIC_MANTLE_RPC_URL || 'https://rpc.testnet.mantle.xyz',
  blockExplorer: 'https://explorer.testnet.mantle.xyz',
};

// Smart Contract Addresses (to be deployed)
export const contractAddresses = {
  dummyIssuer: process.env.NEXT_PUBLIC_DUMMY_ISSUER_ADDRESS || '',
  dummyAggregator: process.env.NEXT_PUBLIC_DUMMY_AGGREGATOR_ADDRESS || '',
  dummyBridge: process.env.NEXT_PUBLIC_DUMMY_BRIDGE_ADDRESS || '',
  vault: process.env.NEXT_PUBLIC_VAULT_ADDRESS || '',
};
