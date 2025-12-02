"use client";

import { useEffect, useMemo, useState } from "react";
import type React from "react";
import type { ComponentType, SVGProps } from "react";
import { ChevronDown, Moon, Shield as ShieldIcon, Sun, Wallet as WalletIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconSwitch } from "@/components/ui/icon-switch";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import {
  WalletCoinbase,
  WalletMetamask,
  WalletRainbow,
  WalletRabby,
  WalletWalletConnect,
} from "@web3icons/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Copy, Check } from "lucide-react";
import { toast } from "sonner";

const Header: React.FC = () => {
  const { ready, authenticated, login, logout, user } = usePrivy();
  const { wallets } = useWallets();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  const copyToClipboard = async () => {
    if (loginIdentifier) {
      await navigator.clipboard.writeText(loginIdentifier);
      setHasCopied(true);
      toast.success("Address copied to clipboard");
      setTimeout(() => setHasCopied(false), 2000);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop =
        window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;
      setIsScrolled(scrollTop > 10);
    };

    // Use capture phase to detect scroll events from elements (like body) since scroll doesn't bubble
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, []);

  // Scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const scrollTop =
        window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;
      const offsetPosition = elementPosition + scrollTop - headerOffset;

      // Try scrolling body first as it's the likely container due to global styles
      document.body.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      // Also try window/documentElement as fallback
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      document.documentElement.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const isConnected = ready && authenticated;
  const primaryWalletAddress = wallets[0]?.address ?? user?.wallet?.address;
  const linkedAccounts =
    (
      user as {
        linkedAccounts?: Array<{ type?: string; walletClientType?: string; address?: string }>;
      }
    )?.linkedAccounts ?? [];
  const externalWallet = linkedAccounts.find(
    (account) => account?.type === "wallet" && account.address
  );
  const walletClientType =
    externalWallet?.walletClientType ||
    user?.wallet?.walletClientType ||
    wallets[0]?.walletClientType ||
    "embedded";
  const originalWallet =
    linkedAccounts.find(
      (account) => account?.type === "wallet" && account.walletClientType !== "privy"
    )?.address || null;
  const loginIdentifier = originalWallet || user?.email?.address || primaryWalletAddress;

  type WalletMeta = {
    label: string;
    Icon: ComponentType<SVGProps<SVGSVGElement>>;
  };

  const walletMeta = useMemo<WalletMeta>(() => {
    const type = walletClientType?.toLowerCase() ?? "embedded";
    if (type.includes("metamask")) {
      return { label: "MetaMask", Icon: WalletMetamask };
    }
    if (type.includes("rabby")) {
      return { label: "Rabby Wallet", Icon: WalletRabby };
    }
    if (type.includes("coinbase")) {
      return { label: "Coinbase Wallet", Icon: WalletCoinbase };
    }
    if (type.includes("rainbow")) {
      return { label: "Rainbow", Icon: WalletRainbow };
    }
    if (type.includes("walletconnect")) {
      return { label: "WalletConnect", Icon: WalletWalletConnect };
    }
    if (type.includes("privy") || type.includes("embedded")) {
      return { label: "Privy Wallet", Icon: ShieldIcon };
    }
    return { label: "Wallet", Icon: WalletIcon };
  }, [walletClientType]);

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
      : "Connect Wallet";

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
    <div
      className={cn(
        "sticky z-50 flex flex-col backdrop-blur-lg transition-all duration-300",
        isScrolled
          ? "top-4 mx-4 lg:mx-8 mt-4 border-[1px] rounded-full shadow-lg bg-background/40 border-primary dark:border-white/40"
          : "top-0 border-b border-border/40 bg-background/80 shadow-lg"
      )}
    >
      {/* Main navigation */}
      <div className="flex flex-col lg:flex-row justify-between items-center px-8 lg:px-24 py-4 lg:py-5 gap-4">
        <div className="flex items-center gap-4 lg:gap-10">
          <Link href="/" className="flex items-center gap-1">
            <img
              alt="TilepMoney Logo"
              className="w-10 h-10 sm:w-12 sm:h-12"
              src="/tilepmoney.png"
            />
          </Link>

          {/* Navigation menu */}
          <div className="hidden md:flex items-center gap-4 lg:gap-8">
            <button
              type="button"
              onClick={() => scrollToSection("demo")}
              className="flex items-center gap-1 cursor-pointer text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-105 active:scale-95 min-h-12 px-2 bg-transparent border-none outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md shadow-none hover:!shadow-none"
            >
              <p className="text-sm lg:text-base font-medium">Home</p>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("integrations")}
              className="flex items-center gap-1 cursor-pointer text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-105 active:scale-95 min-h-12 px-2 bg-transparent border-none outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md shadow-none hover:!shadow-none"
            >
              <p className="text-sm lg:text-base font-medium">Integrations</p>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("features")}
              className="flex items-center gap-1 cursor-pointer text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-105 active:scale-95 min-h-12 px-2 bg-transparent border-none outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md shadow-none hover:!shadow-none"
            >
              <p className="text-sm lg:text-base font-medium">Our strategies</p>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("applications")}
              className="flex items-center gap-1 cursor-pointer text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-105 active:scale-95 min-h-12 px-2 bg-transparent border-none outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md shadow-none hover:!shadow-none"
            >
              <p className="text-sm lg:text-base font-medium">Application</p>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("faq")}
              className="flex items-center gap-1 cursor-pointer text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-105 active:scale-95 min-h-12 px-2 bg-transparent border-none outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md shadow-none hover:!shadow-none"
            >
              <p className="text-sm lg:text-base font-medium">FAQ</p>
            </button>
          </div>
        </div>

        {/* Connect Wallet Button and Theme Toggle */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-center lg:justify-end">
          {isConnected ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "h-10 px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:shadow-md flex items-center gap-2 outline-none",
                    "bg-white dark:bg-[#1b1b1d] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-50 hover:bg-gray-50 dark:hover:bg-[#242427]"
                  )}
                >
                  <span className="flex items-center justify-center">
                    <walletMeta.Icon className="h-4 w-4" />
                  </span>
                  {connectButtonLabel}
                  <ChevronDown className="h-4 w-4 text-muted-foreground ml-1" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel>My Wallet</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5 text-sm">
                  <div className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/50">
                    <span className="font-mono text-xs text-muted-foreground truncate">
                      {loginIdentifier}
                    </span>
                    <button
                      type="button"
                      onClick={copyToClipboard}
                      className="p-1 hover:bg-background rounded-md transition-colors"
                    >
                      {hasCopied ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/20 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Disconnect</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              type="button"
              onClick={handleAuthClick}
              disabled={!ready}
              className={cn(
                "h-10 px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2",
                "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              {connectButtonLabel}
            </button>
          )}
          {isConnected && (
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="h-10 px-6 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all duration-200 hover:shadow-md active:scale-95 flex items-center gap-2"
            >
              <span>Launch App</span>
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
