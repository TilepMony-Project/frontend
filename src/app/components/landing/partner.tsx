"use client";

import type React from "react";
import { firstRowLogos, secondRowLogos } from "@/data/partner-logos";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useFadeInOnScroll } from "@/hooks/use-scroll-animations";

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
            className={`w-10 h-10 transition-all duration-300 drop-shadow-sm ${
              ["FRAX", "Mantle", "WBTC"].includes(name)
                ? "brightness-0 dark:brightness-0 dark:invert opacity-90 group-hover:opacity-100"
                : "opacity-90 group-hover:opacity-100"
            }`}
            aria-label={name}
          />
        </div>
      </div>
    </div>
  );
};

const Partner: React.FC = () => {
  const { ready, authenticated, login } = usePrivy();
  const router = useRouter();

  // Cinematic animation refs with enhanced effects
  const badgeRef = useFadeInOnScroll({ 
    delay: 0, 
    y: 20, 
    scale: 0.95,
    duration: 1.0,
    ease: "power3.out"
  });
  const headlineRef = useFadeInOnScroll({ 
    delay: 0.1, 
    y: 30, 
    scale: 0.95,
    blur: 4,
    duration: 1.2,
    ease: "power3.out"
  });
  const descriptionRef = useFadeInOnScroll({ 
    delay: 0.2, 
    y: 20, 
    scale: 0.98,
    duration: 1.1,
    ease: "power3.out"
  });
  const buttonRef = useFadeInOnScroll({ 
    delay: 0.3, 
    y: 20, 
    scale: 0.95,
    duration: 1.0,
    ease: "power3.out"
  });

  const handleBrowseIntegrations = () => {
    if (!ready) return;

    if (authenticated) {
      // Navigate to dashboard/workspace if logged in
      router.push("/dashboard");
    } else {
      // Show connect wallet dialog if not logged in
      login();
    }
  };

  return (
    <div
      id="integrations"
      className="flex flex-col items-center gap-8 px-8 lg:px-24 pt-16 pb-16"
    >
      {/* Header Section */}
      <div className="flex flex-col items-center gap-6">
        <div
          ref={badgeRef as React.RefObject<HTMLDivElement>}
          className="group flex items-center gap-2 px-3 py-2 rounded-2xl border-[1px] bg-card shadow-lg hover:shadow-xl border-primary/40 dark:border-white/40 hover:border-primary dark:hover:border-primary/40 transition-all duration-300 hover:bg-gradient-to-r hover:from-card hover:to-primary/5 hover:cursor-default"
        >
          <img
            alt="Sparkle"
            className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300"
            src="/landing/Sparkle.svg"
          />
          <p className="text-base font-medium text-center text-muted-foreground group-hover:text-primary transition-colors duration-300">
            Integrations
          </p>
        </div>
      </div>
      <div className="text-center space-y-3">
        <h2
          ref={headlineRef as React.RefObject<HTMLHeadingElement>}
          className="max-w-lg mx-auto text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight flex flex-col items-center gap-2"
        >
          <span className="text-gray-900 dark:text-gray-100">
            Seamlessly connect
          </span>
          <span className="flex flex-wrap justify-center gap-x-1.5">
            <span className="text-gray-900 dark:text-gray-100">with</span>
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              over 26+ integrations
            </span>
          </span>
        </h2>
        <p
          ref={descriptionRef as React.RefObject<HTMLParagraphElement>}
          className="text-gray-600 dark:text-gray-400 text-sm lg:text-base max-w-lg mx-auto"
        >
          Build powerful stablecoin workflows with support for major DeFi
          protocols and blockchain networks
        </p>
      </div>

      {/* Logo Carousel */}
      <div className="flex flex-col items-center gap-5 w-full">
        <div className="flex flex-col items-center py-2 gap-3 w-full">
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

      {/* Browse All Integrations Button */}
      <div ref={buttonRef as React.RefObject<HTMLDivElement>} className="mt-2">
        <button
          type="button"
          onClick={handleBrowseIntegrations}
          disabled={!ready}
          className="group relative px-6 py-3 bg-gradient-to-r from-primary to-primary/80 text-white rounded-full font-semibold text-sm shadow-lg hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
        >
          <span>Browse all integrations</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
        </button>
      </div>
    </div>
  );
};

export default Partner;
