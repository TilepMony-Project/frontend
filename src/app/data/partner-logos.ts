import type { FC, SVGProps } from "react";
// Import individual icons from @web3icons/react v4
// Tokens
import TokenUSDT from "@web3icons/react/icons/tokens/TokenUSDT";
import TokenUSDC from "@web3icons/react/icons/tokens/TokenUSDC";
import TokenDAI from "@web3icons/react/icons/tokens/TokenDAI";
import TokenUNI from "@web3icons/react/icons/tokens/TokenUNI";
import Token1INCH from "@web3icons/react/icons/tokens/Token1INCH";
// Networks
import NetworkMantle from "@web3icons/react/icons/networks/NetworkMantle";
import NetworkEthereum from "@web3icons/react/icons/networks/NetworkEthereum";
import NetworkArbitrumOne from "@web3icons/react/icons/networks/NetworkArbitrumOne";
import NetworkOptimism from "@web3icons/react/icons/networks/NetworkOptimism";
import NetworkBase from "@web3icons/react/icons/networks/NetworkBase";

export interface PartnerLogo {
  name: string;
  Icon: FC<SVGProps<SVGSVGElement>>;
  category: "stablecoin" | "blockchain" | "defi";
}

export const partnerLogos: PartnerLogo[] = [
  {
    name: "USDT",
    Icon: TokenUSDT,
    category: "stablecoin",
  },
  {
    name: "USDC",
    Icon: TokenUSDC,
    category: "stablecoin",
  },
  {
    name: "DAI",
    Icon: TokenDAI,
    category: "stablecoin",
  },
  {
    name: "Mantle",
    Icon: NetworkMantle,
    category: "blockchain",
  },
  {
    name: "Ethereum",
    Icon: NetworkEthereum,
    category: "blockchain",
  },
  {
    name: "Uniswap",
    Icon: TokenUNI,
    category: "defi",
  },
  {
    name: "Arbitrum",
    Icon: NetworkArbitrumOne,
    category: "blockchain",
  },
  {
    name: "Optimism",
    Icon: NetworkOptimism,
    category: "blockchain",
  },
  {
    name: "Base",
    Icon: NetworkBase,
    category: "blockchain",
  },
  {
    name: "1inch",
    Icon: Token1INCH,
    category: "defi",
  },
];

// Split logos into two rows for the scrolling animation
export const firstRowLogos = partnerLogos.slice(0, 5);
export const secondRowLogos = partnerLogos.slice(5, 10);
