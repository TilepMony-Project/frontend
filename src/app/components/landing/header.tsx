"use client";

import type React from "react";
import { ChevronDown, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconSwitch } from "@/components/ui/icon-switch";
import { useTheme } from "@/hooks/use-theme";
import { usePrivy, useWallets } from "@privy-io/react-auth";

const Header: React.FC = () => {
  const { ready, authenticated, login, logout, user } = usePrivy();
  const { wallets } = useWallets();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const isConnected = ready && authenticated;
  const primaryWalletAddress = wallets[0]?.address ?? user?.wallet?.address;
  const linkedAccounts =
    (user as { linkedAccounts?: Array<{ type?: string; walletClientType?: string; address?: string }> })?.linkedAccounts ??
    [];
  const originalWallet =
    linkedAccounts.find((account) => account?.type === "wallet" && account.walletClientType !== "privy")?.address || null;
  const loginIdentifier = originalWallet || user?.email?.address || primaryWalletAddress;

  const formatIdentifier = (identifier?: string | null) => {
    if (!identifier) {
      return "Connected";
    }
    if (identifier.includes("@")) {
      return identifier;
    }
    return `${identifier.slice(0, 6)}...${identifier.slice(-4)}`;
  };

  const connectButtonLabel = !ready
    ? "Loading..."
    : isConnected
      ? formatIdentifier(loginIdentifier)
      : "Login / Connect";

  const handleAuthClick = () => {
    if (!ready) {
      return;
    }
    if (isConnected) {
      logout();
      return;
    }
    login();
  };

  return (
    <div className="flex flex-col bg-background border-b border-border">
      {/* Main navigation */}
      <div className="flex flex-col lg:flex-row justify-between items-center px-8 lg:px-24 py-4 lg:py-5 gap-4">
        <div className="flex items-center gap-4 lg:gap-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1">
            <img
              alt="TilepMoney Logo"
              className="w-20 h-6 sm:w-24 sm:h-8"
              src="/landing/logo.svg"
            />
            <img alt="Sparkle" className="w-4 h-4 sm:w-5 sm:h-5" src="/landing/Sparkle.svg" />
          </Link>

          {/* Navigation menu */}
          <div className="hidden md:flex items-center gap-4 lg:gap-8">
            <div className="flex items-center gap-1 cursor-pointer text-muted-foreground hover:text-primary transition-colors duration-300 min-h-12 px-2">
              <p className="text-sm lg:text-base font-medium">Features</p>
              <ChevronDown className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1 cursor-pointer text-muted-foreground hover:text-primary transition-colors duration-300 min-h-12 px-2">
              <p className="text-sm lg:text-base font-medium">Case Studies</p>
              <ChevronDown className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1 cursor-pointer text-muted-foreground hover:text-primary transition-colors duration-300 min-h-12 px-2">
              <p className="text-sm lg:text-base font-medium">Pricing</p>
            </div>
            <div className="flex items-center gap-1 cursor-pointer text-muted-foreground hover:text-primary transition-colors duration-300 min-h-12 px-2">
              <p className="text-sm lg:text-base font-medium">Applications</p>
            </div>
          </div>
        </div>

        {/* Connect Wallet Button and Theme Toggle */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-center lg:justify-end">
          <button
            type="button"
            onClick={handleAuthClick}
            disabled={!ready}
            className="h-10 px-6 py-2 rounded-md bg-white dark:bg-[#1b1b1d] border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-900 dark:text-gray-50 hover:bg-gray-50 dark:hover:bg-[#242427] transition-all duration-200 hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {connectButtonLabel}
          </button>
          {isConnected && (
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="h-10 px-6 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all duration-200 hover:shadow-md active:scale-95 flex items-center gap-2"
            >
              <span>Dashboard</span>
              <ChevronDown className="w-4 h-4 -rotate-90" />
            </button>
          )}
          <IconSwitch
            checked={theme === "dark"}
            onChange={toggleTheme}
            icon={<Sun size={18} />}
            IconChecked={<Moon size={18} />}
            variant="secondary"
            className="h-10 w-10 bg-white dark:bg-[#27282b] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-[#323336] shadow-sm p-0 flex items-center justify-center rounded-md"
          />
        </div>
      </div>
    </div>
  );
};

export default Header;
