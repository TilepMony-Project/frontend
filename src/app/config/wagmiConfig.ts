import { http, createConfig } from "wagmi";
import { injected } from "wagmi/connectors";
import { mantleSepoliaTestnet } from "./chains";

export const wagmiConfig = createConfig({
  chains: [mantleSepoliaTestnet],
  connectors: [injected()],
  transports: {
    [mantleSepoliaTestnet.id]: http(),
  },
});
