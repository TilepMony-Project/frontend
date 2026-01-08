import { http, createConfig } from "wagmi";
import { injected } from "wagmi/connectors";
import { mantleSepoliaTestnet, baseSepoliaTestnet } from "./chains";

export const wagmiConfig = createConfig({
  chains: [mantleSepoliaTestnet, baseSepoliaTestnet],
  connectors: [injected()],
  transports: {
    [mantleSepoliaTestnet.id]: http(),
    [baseSepoliaTestnet.id]: http(),
  },
});
