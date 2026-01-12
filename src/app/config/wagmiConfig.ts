// Import createConfig from @privy-io/wagmi, NOT from wagmi
// This enables automatic sync between Privy auth and Wagmi connector
import { createConfig } from "@privy-io/wagmi";
import { http } from "wagmi";
import { baseSepoliaTestnet, mantleSepoliaTestnet } from "./chains";

export const wagmiConfig = createConfig({
  chains: [mantleSepoliaTestnet, baseSepoliaTestnet],
  // No connectors needed - Privy handles this automatically
  transports: {
    [mantleSepoliaTestnet.id]: http(),
    [baseSepoliaTestnet.id]: http(),
  },
});
