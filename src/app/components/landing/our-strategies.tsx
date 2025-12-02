"use client";

import type React from "react";
import { Button } from "@/components/ui/button";

interface StrategyCardProps {
  icon: string;
  iconAlt: string;
  title: string;
  description: string;
}

const StrategyCard: React.FC<StrategyCardProps> = ({ icon, iconAlt, title, description }) => {
  return (
    <div className="flex flex-col items-start gap-4 p-6 rounded-xl bg-card border-[1px] border-primary/20 dark:border-white/40 hover:border-primary border[1px] dark:hover:border-[1.5px] dark:hover:border-primary  transition-all duration-200 cursor-pointer">
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center min-w-8 min-h-8 p-2 rounded-lg bg-primary/10 flex-shrink-0">
          <img alt={iconAlt} className="w-5 h-5 dark:brightness-0 dark:invert" src={icon} />
        </div>
        <p className="text-lg font-semibold text-left text-foreground">{title}</p>
      </div>
      <p className="text-base text-left text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
};

import WorkflowPreview from "./workflow-preview/workflow-preview";
import { useFadeInOnScroll, useStaggerFade } from "@/hooks/use-scroll-animations";

const StrategyCardBackground: React.FC = () => {
  const workflowRef = useFadeInOnScroll({
    delay: 0.4,
    y: 40,
    scale: 0.95,
    blur: 8,
    duration: 1.4,
    ease: "power3.out",
  });

  return (
    <div
      ref={workflowRef as React.RefObject<HTMLDivElement>}
      className="w-full max-w-7xl h-96 relative overflow-hidden rounded-3xl bg-primary/20 border-[1px] border-primary/40 dark:border-white/40 flex items-center justify-center"
    >
      <WorkflowPreview />
    </div>
  );
};

const OurStrategies: React.FC = () => {
  // Cinematic animation refs with enhanced effects
  const badgeRef = useFadeInOnScroll({
    delay: 0,
    y: 20,
    scale: 0.95,
    duration: 1.0,
    ease: "power3.out",
  });
  const headlineRef = useFadeInOnScroll({
    delay: 0.1,
    y: 30,
    scale: 0.95,
    blur: 4,
    duration: 1.2,
    ease: "power3.out",
  });
  const descriptionRef = useFadeInOnScroll({
    delay: 0.2,
    y: 20,
    scale: 0.98,
    duration: 1.1,
    ease: "power3.out",
  });
  const cardsRef = useStaggerFade({
    stagger: 0.1,
    y: 30,
    scale: 0.92,
    blur: 4,
    duration: 1.0,
    ease: "power3.out",
  });

  return (
    <div
      id="features"
      className="flex flex-col items-center gap-16 px-8 lg:px-24 pt-20 lg:pt-32 pb-20 lg:pb-28"
    >
      <div className="flex flex-col items-center gap-16">
        <div className="flex flex-col items-center gap-8">
          {/* Text Content */}
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
                Our Strategies
              </p>
            </div>
            <div className="flex items-center gap-2 px-4">
              <h2
                ref={headlineRef as React.RefObject<HTMLHeadingElement>}
                className="w-full max-w-2xl mx-auto text-2xl sm:text-3xl lg:text-4xl font-bold text-center leading-tight"
              >
                <span className="text-gray-900 dark:text-gray-100">
                  B2B Orchestration Studio for{" "}
                </span>
                <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Stablecoin Flows
                </span>
              </h2>
            </div>
            <div
              ref={descriptionRef as React.RefObject<HTMLDivElement>}
              className="flex items-center gap-2 px-4 lg:px-5"
            >
              <p className="w-full max-w-xl opacity-80 text-sm lg:text-base text-center text-muted-foreground leading-relaxed">
                Design, test, and automate your payment and treasury routes with complete routing
                transparency and provider-agnostic flexibility.
              </p>
            </div>
          </div>
        </div>

        {/* Strategies */}
        <div className="flex flex-col items-center gap-10 w-full">
          <div
            ref={cardsRef as React.RefObject<HTMLDivElement>}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 w-full"
          >
            <StrategyCard
              description="Design complex stablecoin flows with drag-and-drop simplicity. No coding required—just drag, drop, and configure each node to build your complete payment workflow from deposit to output."
              icon="/landing/database.svg"
              iconAlt="Database"
              title="Codeless Visual Orchestration"
            />
            <StrategyCard
              description="Complete routing transparency for audits and compliance. Visualize and audit how money moves through each provider, ensuring full visibility into every step of your stablecoin operations."
              icon="/landing/connect.svg"
              iconAlt="Connect"
              title="Routing Transparency"
            />
            <StrategyCard
              description="Choose your preferred issuers, swap providers, and bridges. Provider-agnostic design gives you the flexibility to select the best services for your business needs without vendor lock-in."
              icon="/landing/instant.svg"
              iconAlt="Instant"
              title="Provider-Agnostic"
            />
          </div>

          {/* Strategy Card Background */}
          <StrategyCardBackground />
        </div>
      </div>
    </div>
  );
};

export default OurStrategies;
