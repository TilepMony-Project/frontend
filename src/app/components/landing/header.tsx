"use client";

import { useEffect, useState } from "react";
import type React from "react";
import { ChevronDown, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { IconSwitch } from "@/components/ui/icon-switch";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

const Header: React.FC = () => {
  const { isConnected } = useAccount();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
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
          <ConnectButton />
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
