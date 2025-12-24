"use client";

import type React from "react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useFadeInOnScroll } from "@/hooks/use-scroll-animations";
import { useTheme } from "@/hooks/use-theme";

const Footer: React.FC = () => {
  const { theme } = useTheme();

  const containerRef = useFadeInOnScroll({
    delay: 0,
    y: 20,
    duration: 0.8,
    ease: "power2.out",
  });

  return (
    <div className="relative mt-20">
      {/* Top Gradient Border */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div
        ref={containerRef as React.RefObject<HTMLDivElement>}
        className="px-6 md:px-12 lg:px-24 pt-16 pb-12"
      >
        <div className="flex flex-col md:flex-row justify-between gap-12 lg:gap-24">
          {/* Left Side: Branding & Identity */}
          <div className="flex flex-col gap-8 md:max-w-md">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {theme === "dark" ? (
                  <img
                    alt="TilepMoney"
                    className="h-12 w-auto"
                    src="/tilepmoney_white_text.png"
                  />
                ) : (
                  <img
                    alt="TilepMoney"
                    className="h-12 w-auto"
                    src="/tilepmoney_dark_text.png"
                  />
                )}
                <span className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-mono text-primary uppercase tracking-wider">
                  Beta
                </span>
              </div>
              <p className="opacity-80 text-sm lg:text-base text-muted-foreground leading-relaxed max-w-md">
                Visual workflow builder for stablecoin orchestration.
              </p>
            </div>
            <div className="pt-4 md:pt-8 text-sm text-muted-foreground">
              © 2025 TilepMoney. All rights reserved.
            </div>
          </div>

          {/* Right Side: Navigation & Status */}
          <div className="flex flex-col gap-10 mt-8 md:items-end">
            {/* Social CTA */}
            <Link
              href="https://x.com/TilepMoney"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center gap-3 px-5 py-3 rounded-xl bg-foreground/5 hover:bg-foreground/10 transition-all duration-300 md:ml-auto overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent translate-x-[-100%] group-hover:animate-shimmer" />
              <div className="flex items-center justify-center w-8 h-8 rounded-lg">
                <img
                  alt="X (Twitter)"
                  className="w-8 h-8 object-contain"
                  src="/logos/x_logo.jpg"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
                  Join the conversation
                </span>
                <span className="text-sm font-bold text-foreground">
                  See what's cooking
                </span>
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="flex flex-wrap gap-x-8 gap-y-4 md:justify-end">
              <Link
                href="#"
                className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="https://tilepmoney.gitbook.io/tilepmoney-docs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors"
              >
                Docs
              </Link>
              <Link
                href="mailto:tilepmoney@gmail.com"
                className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors"
              >
                Support
              </Link>
              <Link
                href="/dashboard"
                className="group flex items-center gap-1 text-sm font-medium text-foreground/70 hover:text-primary transition-colors"
              >
                Launch App
                <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-300" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
