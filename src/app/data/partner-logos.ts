import NetworkArbitrumOne from "@web3icons/react/icons/networks/NetworkArbitrumOne";
import NetworkAvalanche from "@web3icons/react/icons/networks/NetworkAvalanche";
import NetworkBase from "@web3icons/react/icons/networks/NetworkBase";
import NetworkBlast from "@web3icons/react/icons/networks/NetworkBlast";
import NetworkEthereum from "@web3icons/react/icons/networks/NetworkEthereum";
import NetworkLinea from "@web3icons/react/icons/networks/NetworkLinea";
// Layer 1 & Layer 2 Networks
import NetworkMantle from "@web3icons/react/icons/networks/NetworkMantle";
import NetworkOptimism from "@web3icons/react/icons/networks/NetworkOptimism";
import NetworkPolygon from "@web3icons/react/icons/networks/NetworkPolygon";
import NetworkScroll from "@web3icons/react/icons/networks/NetworkScroll";
import NetworkSolana from "@web3icons/react/icons/networks/NetworkSolana";
import NetworkStarknet from "@web3icons/react/icons/networks/NetworkStarknet";
import NetworkZksync from "@web3icons/react/icons/networks/NetworkZksync";
import Token1INCH from "@web3icons/react/icons/tokens/Token1INCH";
import TokenAAVE from "@web3icons/react/icons/tokens/TokenAAVE";
import TokenCOMP from "@web3icons/react/icons/tokens/TokenCOMP";
import TokenCRV from "@web3icons/react/icons/tokens/TokenCRV";
import TokenDAI from "@web3icons/react/icons/tokens/TokenDAI";
import TokenFRAX from "@web3icons/react/icons/tokens/TokenFRAX";
import TokenLDO from "@web3icons/react/icons/tokens/TokenLDO";
import TokenLINK from "@web3icons/react/icons/tokens/TokenLINK";
import TokenMKR from "@web3icons/react/icons/tokens/TokenMKR";
import TokenSNX from "@web3icons/react/icons/tokens/TokenSNX";
import TokenUNI from "@web3icons/react/icons/tokens/TokenUNI";
import TokenUSDC from "@web3icons/react/icons/tokens/TokenUSDC";
// Import individual icons from @web3icons/react v4
// Tokens
import TokenUSDT from "@web3icons/react/icons/tokens/TokenUSDT";
import TokenWBTC from "@web3icons/react/icons/tokens/TokenWBTC";
import TokenYFI from "@web3icons/react/icons/tokens/TokenYFI";
import type { FC, SVGProps } from "react";

export interface PartnerLogo {
  name: string;
  Icon: FC<SVGProps<SVGSVGElement>>;
  category: "stablecoin" | "blockchain" | "defi";
}

export const partnerLogos: PartnerLogo[] = [
  // Row 1 - Stablecoins & Major DeFi Protocols
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
    name: "FRAX",
    Icon: TokenFRAX,
    category: "stablecoin",
  },
  {
    name: "Ethereum",
    Icon: NetworkEthereum,
    category: "blockchain",
  },
  {
    name: "Mantle",
    Icon: NetworkMantle,
    category: "blockchain",
  },
  {
    name: "Uniswap",
    Icon: TokenUNI,
    category: "defi",
  },
  {
    name: "AAVE",
    Icon: TokenAAVE,
    category: "defi",
  },
  {
    name: "Chainlink",
    Icon: TokenLINK,
    category: "defi",
  },
  {
    name: "Curve",
    Icon: TokenCRV,
    category: "defi",
  },
  {
    name: "MakerDAO",
    Icon: TokenMKR,
    category: "defi",
  },
  {
    name: "Synthetix",
    Icon: TokenSNX,
    category: "defi",
  },
  {
    name: "Yearn",
    Icon: TokenYFI,
    category: "defi",
  },

  // Row 2 - Layer 2s, Major L1s & Wrapped Assets
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
    name: "Polygon",
    Icon: NetworkPolygon,
    category: "blockchain",
  },
  {
    name: "zkSync",
    Icon: NetworkZksync,
    category: "blockchain",
  },
  {
    name: "Starknet",
    Icon: NetworkStarknet,
    category: "blockchain",
  },
  {
    name: "Scroll",
    Icon: NetworkScroll,
    category: "blockchain",
  },
  {
    name: "Linea",
    Icon: NetworkLinea,
    category: "blockchain",
  },
  {
    name: "WBTC",
    Icon: TokenWBTC,
    category: "defi",
  },
  {
    name: "1inch",
    Icon: Token1INCH,
    category: "defi",
  },
  {
    name: "Compound",
    Icon: TokenCOMP,
    category: "defi",
  },
  {
    name: "Lido",
    Icon: TokenLDO,
    category: "defi",
  },
];

// Split logos into two rows for the scrolling animation
export const firstRowLogos = partnerLogos.slice(0, 13);
export const secondRowLogos = partnerLogos.slice(13, 26);
