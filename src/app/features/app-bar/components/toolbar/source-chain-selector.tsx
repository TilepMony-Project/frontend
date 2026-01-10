"use client";

import { Tooltip } from "@/components/ui/tooltip";
import useStore from "@/store/store";
import clsx from "clsx";
import Image from "next/image";
import { useChainId, useSwitchChain, useAccount } from "wagmi";

type ChainOption = {
  id: number;
  label: string;
  logo: string;
};

const chainOptions: ChainOption[] = [
  { id: 5003, label: "Mantle", logo: "/logos/mantle.png" },
  { id: 84532, label: "Base", logo: "/logos/base.png" },
];

export function SourceChainSelector() {
  const sourceChainId = useStore((state) => state.sourceChainId);
  const setSourceChainId = useStore((state) => state.setSourceChainId);

  const { isConnected } = useAccount();
  const walletChainId = useChainId();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();

  const handleChainSelect = (chainId: number) => {
    // Update the UI state
    setSourceChainId(chainId);

    // Switch wallet chain if connected and different from selected
    if (isConnected && walletChainId !== chainId) {
      switchChain({ chainId });
    }
  };

  // Determine if wallet is on a different network than selected
  const isWalletMismatch = isConnected && walletChainId !== sourceChainId;

  return (
    <div className="flex items-center gap-2">
      <div className="flex rounded-full border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-[#1c1c20]">
        {chainOptions.map((chain, index) => (
          <Tooltip
            key={chain.id}
            content={
              isSwitchingChain ? "Switching network..." : `Start from ${chain.label} Sepolia`
            }
          >
            <button
              type="button"
              onClick={() => handleChainSelect(chain.id)}
              disabled={isSwitchingChain}
              aria-pressed={sourceChainId === chain.id}
              aria-label={chain.label}
              className={clsx(
                "flex items-center gap-1.5 px-3 h-8 text-xs font-medium transition-colors",
                index === 0 && "rounded-l-full",
                index === chainOptions.length - 1 && "rounded-r-full",
                isSwitchingChain && "opacity-50 cursor-not-allowed",
                sourceChainId === chain.id
                  ? "bg-[#1296e7] text-white shadow-sm"
                  : "text-gray-600 hover:bg-[#eeeff3] dark:text-gray-300 dark:hover:bg-[#2c2d31]"
              )}
            >
              <Image
                src={chain.logo}
                alt={chain.label}
                width={16}
                height={16}
                className="rounded-full"
              />
              <span className="hidden sm:inline">{chain.label}</span>
            </button>
          </Tooltip>
        ))}
      </div>
      {isWalletMismatch && !isSwitchingChain && (
        <Tooltip
          content={`Click to switch wallet to ${chainOptions.find((c) => c.id === sourceChainId)?.label || "selected network"}`}
        >
          <button
            type="button"
            onClick={() => switchChain({ chainId: sourceChainId })}
            className="flex items-center gap-1 px-2 py-1 text-xs text-orange-600 bg-orange-50 rounded-full hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/30"
          >
            <span className="text-orange-500">⚠️</span>
            <span className="hidden sm:inline">Wrong Network</span>
          </button>
        </Tooltip>
      )}
      {isSwitchingChain && (
        <span className="text-xs text-gray-500 dark:text-gray-400 animate-pulse">Switching...</span>
      )}
    </div>
  );
}
