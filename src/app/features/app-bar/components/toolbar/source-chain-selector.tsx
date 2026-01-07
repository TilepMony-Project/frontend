"use client";

import { Tooltip } from "@/components/ui/tooltip";
import useStore from "@/store/store";
import clsx from "clsx";
import Image from "next/image";

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

  return (
    <div className="flex items-center gap-2">
      <div className="flex rounded-full border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-[#1c1c20]">
        {chainOptions.map((chain, index) => (
          <Tooltip key={chain.id} content={`Start from ${chain.label} Sepolia`}>
            <button
              type="button"
              onClick={() => setSourceChainId(chain.id)}
              aria-pressed={sourceChainId === chain.id}
              aria-label={chain.label}
              className={clsx(
                "flex items-center gap-1.5 px-3 h-8 text-xs font-medium transition-colors",
                index === 0 && "rounded-l-full",
                index === chainOptions.length - 1 && "rounded-r-full",
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
    </div>
  );
}
