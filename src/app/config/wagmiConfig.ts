import { http, createConfig } from "wagmi";
import { mantleSepoliaTestnet } from "./chains";
import { injected } from "wagmi/connectors";

export const wagmiConfig = createConfig({
  chains: [mantleSepoliaTestnet],
  connectors: [injected()],
  transports: {
    [mantleSepoliaTestnet.id]: http(),
  },
});
