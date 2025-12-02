import { Icon } from "@/components/icons";
import {
  SelectWrapper as Select,
  type SelectOption,
  type SelectProps,
} from "@/components/ui/select-wrapper";
import type { ItemOption, PrimitiveFieldSchema } from "@/types/node-schema";
import type { SelectControlProps } from "../../types/controls";
import { createControlRenderer } from "../../utils/rendering";
import { ControlWrapper } from "../control-wrapper";
import type { FC, SVGProps } from "react";

// Import web3icons that might be used
import TokenUSDT from "@web3icons/react/icons/tokens/TokenUSDT";
import TokenUSDC from "@web3icons/react/icons/tokens/TokenUSDC";
import TokenDAI from "@web3icons/react/icons/tokens/TokenDAI";
import TokenUNI from "@web3icons/react/icons/tokens/TokenUNI";
import Token1INCH from "@web3icons/react/icons/tokens/Token1INCH";
import TokenAAVE from "@web3icons/react/icons/tokens/TokenAAVE";
import TokenLINK from "@web3icons/react/icons/tokens/TokenLINK";
import TokenCRV from "@web3icons/react/icons/tokens/TokenCRV";
import TokenCOMP from "@web3icons/react/icons/tokens/TokenCOMP";
import TokenLDO from "@web3icons/react/icons/tokens/TokenLDO";
import TokenMKR from "@web3icons/react/icons/tokens/TokenMKR";
import TokenSNX from "@web3icons/react/icons/tokens/TokenSNX";
import TokenYFI from "@web3icons/react/icons/tokens/TokenYFI";
import TokenWBTC from "@web3icons/react/icons/tokens/TokenWBTC";
import TokenFRAX from "@web3icons/react/icons/tokens/TokenFRAX";
import NetworkMantle from "@web3icons/react/icons/networks/NetworkMantle";
import NetworkEthereum from "@web3icons/react/icons/networks/NetworkEthereum";
import NetworkArbitrumOne from "@web3icons/react/icons/networks/NetworkArbitrumOne";
import NetworkOptimism from "@web3icons/react/icons/networks/NetworkOptimism";
import NetworkBase from "@web3icons/react/icons/networks/NetworkBase";
import NetworkPolygon from "@web3icons/react/icons/networks/NetworkPolygon";
import NetworkAvalanche from "@web3icons/react/icons/networks/NetworkAvalanche";
import NetworkSolana from "@web3icons/react/icons/networks/NetworkSolana";
import NetworkZksync from "@web3icons/react/icons/networks/NetworkZksync";
import NetworkBlast from "@web3icons/react/icons/networks/NetworkBlast";
import NetworkScroll from "@web3icons/react/icons/networks/NetworkScroll";
import NetworkLinea from "@web3icons/react/icons/networks/NetworkLinea";
import NetworkStarknet from "@web3icons/react/icons/networks/NetworkStarknet";
import TokenIDRX from "@/components/icons/TokenIDRX";

// Web3icon mapping
const web3IconMap: Record<string, FC<SVGProps<SVGSVGElement>>> = {
  TokenUSDT,
  TokenUSDC,
  TokenDAI,
  TokenIDRX,
  TokenUNI,
  Token1INCH,
  TokenAAVE,
  TokenLINK,
  TokenCRV,
  TokenCOMP,
  TokenLDO,
  TokenMKR,
  TokenSNX,
  TokenYFI,
  TokenWBTC,
  TokenFRAX,
  NetworkMantle,
  NetworkEthereum,
  NetworkArbitrumOne,
  NetworkOptimism,
  NetworkBase,
  NetworkPolygon,
  NetworkAvalanche,
  NetworkSolana,
  NetworkZksync,
  NetworkBlast,
  NetworkScroll,
  NetworkLinea,
  NetworkStarknet,
};

// Helper to render icon (web3icon or lucide icon)
function renderIcon(iconName: string | undefined): React.ReactNode {
  if (!iconName) return null;

  // Check if it's a web3icon
  const Web3IconComponent = web3IconMap[iconName];
  if (Web3IconComponent) {
    return <Web3IconComponent className="w-4 h-4" />;
  }

  // Use Lucide icon as fallback
  return <Icon name={iconName} size="small" />;
}

function SelectControl(props: SelectControlProps) {
  const { data, handleChange, path, enabled, schema } = props;

  const items = ((schema as PrimitiveFieldSchema).options as ItemOption[] | undefined)?.map(
    (option) =>
      option.type === "separator" || !option.icon
        ? option
        : {
            ...option,
            icon: renderIcon(option.icon as string),
          }
  );

  const onChange: SelectProps["onChange"] = (_event, value) => {
    handleChange(path, value);
  };

  // Get schema-level icon if available
  const schemaIcon = (schema as PrimitiveFieldSchema).icon
    ? renderIcon((schema as PrimitiveFieldSchema).icon as string)
    : null;

  return (
    <ControlWrapper {...props}>
      <Select
        value={data ?? null}
        items={(items as SelectOption[]) ?? []}
        disabled={!enabled}
        onChange={onChange}
        placeholder={schema.placeholder as string}
        className="h-10 rounded-xl border border-gray-200/80 bg-white px-4 text-sm text-gray-900 shadow-sm transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/40 dark:border-gray-700 dark:bg-[#1c1c20] dark:text-gray-100"
        icon={schemaIcon}
      />
    </ControlWrapper>
  );
}

export const selectControlRenderer = createControlRenderer("Select", SelectControl);
