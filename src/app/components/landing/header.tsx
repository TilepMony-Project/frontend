'use client';

import type React from "react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';

const Header: React.FC = () => {
  const { isConnected } = useAccount();
  const router = useRouter();

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
            <img
              alt="Sparkle"
              className="w-4 h-4 sm:w-5 sm:h-5"
              src="/landing/Sparkle.svg"
            />
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

        {/* Connect Wallet Button */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-center lg:justify-end">
          <ConnectButton />
          {isConnected && (
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="h-10 px-6 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all duration-200 hover:shadow-md active:scale-95 flex items-center gap-2"
            >
              <span>Dashboard</span>
              <ChevronDown className="w-4 h-4 -rotate-90" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
