"use client";

import type React from "react";
import { firstRowLogos, secondRowLogos } from "@/data/partner-logos";

const LogoBox = ({
  name,
  Icon,
}: {
  name: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
}) => {
  return (
    <div className="group relative flex-shrink-0">
      {/* Background box with subtle styling for both light and dark mode */}
      <div className="relative p-4 rounded-2xl bg-white/80 dark:bg-white/10 backdrop-blur-sm border border-gray-200/50 dark:border-white/20 shadow-sm hover:shadow-md dark:hover:shadow-xl dark:hover:shadow-primary/20 transition-all duration-300 hover:border-primary/50 dark:hover:border-primary/40">
        {/* Glow effect on hover - only in dark mode */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 dark:group-hover:from-primary/10 dark:group-hover:via-primary/5 dark:group-hover:to-transparent transition-all duration-500 opacity-0 dark:opacity-100" />

        {/* Icon - using branded colors, works in both modes */}
        <div className="relative z-10">
          <Icon
            className="w-10 h-10 transition-all duration-300 opacity-90 group-hover:opacity-100 drop-shadow-sm"
            aria-label={name}
          />
        </div>
      </div>
    </div>
  );
};

const Partner: React.FC = () => {
  return (
    <div className="flex flex-col items-center gap-8 px-8 lg:px-24 pt-16 pb-16">
      {/* Header Section */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
          <span className="text-gray-900 dark:text-gray-100">
            Seamlessly connect with{" "}
          </span>
          <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            over 26+ integrations
          </span>
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
          Build powerful stablecoin workflows with support for major DeFi
          protocols and blockchain networks
        </p>
      </div>

      {/* Logo Carousel */}
      <div className="flex flex-col items-center gap-5 w-full">
        <div className="flex flex-col items-center py-5 gap-3 w-full">
          {/* First row - moving to the right */}
          <div className="relative w-full max-w-7xl overflow-hidden">
            <div className="flex animate-scroll-right gap-5 sm:gap-6 lg:gap-8">
              {/* First set of logos */}
              <div className="flex items-center gap-5 sm:gap-6 lg:gap-8">
                {firstRowLogos.map(({ name, Icon }) => (
                  <LogoBox key={name} name={name} Icon={Icon} />
                ))}
              </div>
              {/* Duplicate set for seamless loop */}
              <div className="flex items-center gap-5 sm:gap-6 lg:gap-8">
                {firstRowLogos.map(({ name, Icon }) => (
                  <LogoBox key={`${name}-duplicate`} name={name} Icon={Icon} />
                ))}
              </div>
            </div>
          </div>

          {/* Second row - moving to the left */}
          <div className="relative w-full max-w-7xl overflow-hidden">
            <div className="flex animate-scroll-left gap-5 sm:gap-6 lg:gap-8">
              {/* First set of logos */}
              <div className="flex items-center gap-5 sm:gap-6 lg:gap-8">
                {secondRowLogos.map(({ name, Icon }) => (
                  <LogoBox key={name} name={name} Icon={Icon} />
                ))}
              </div>
              {/* Duplicate set for seamless loop */}
              <div className="flex items-center gap-5 sm:gap-6 lg:gap-8">
                {secondRowLogos.map(({ name, Icon }) => (
                  <LogoBox key={`${name}-duplicate`} name={name} Icon={Icon} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Partner;
