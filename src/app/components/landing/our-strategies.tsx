'use client';

import React from "react";
import { Button } from "@/components/ui/button";

interface StrategyCardProps {
  icon: string;
  iconAlt: string;
  title: string;
  description: string;
}

const StrategyCard: React.FC<StrategyCardProps> = ({
  icon,
  iconAlt,
  title,
  description,
}) => {
  return (
    <div className="flex flex-col items-start gap-4 p-6 rounded-xl bg-card border hover:border-primary hover:shadow-xl transition-all duration-200 cursor-pointer">
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center min-w-8 min-h-8 p-2 rounded-lg bg-primary/10 flex-shrink-0">
          <img alt={iconAlt} className="w-5 h-5" src={icon} />
        </div>
        <p className="text-lg font-semibold text-left text-foreground">{title}</p>
      </div>
      <p className="text-base text-left text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
};

const StrategyCardBackground: React.FC = () => {
  return (
    <div className="w-full max-w-6xl h-96 relative overflow-hidden rounded-3xl bg-primary/20 border border-border flex items-center justify-center">
      <img
        alt="Card Background 1"
        className="absolute left-0 top-0 w-full h-full object-cover"
        src="/landing/card-background-1.svg"
      />
      <div className="flex items-center gap-3 px-6 py-4 rounded-full bg-card border-4 lg:border-5 border-primary/35 relative z-10 animate-smooth-bounce cursor-pointer hover:bg-accent hover:border-primary/50 hover:shadow-lg transition-all duration-300">
        <img alt="Sparkle" className="w-8 h-8" src="/landing/Sparkle.svg" />
        <div className="flex flex-col items-start">
          <p className="text-xl font-semibold text-foreground">
            AI-Driven Forecasts
          </p>
        </div>
      </div>
    </div>
  );
};

const OurStrategies: React.FC = () => {
  return (
    <div className="flex flex-col items-center gap-16 px-8 lg:px-24 pt-20 lg:pt-32 pb-20 lg:pb-28 bg-background">
      <div className="flex flex-col items-center gap-16">
        <div className="flex flex-col items-center gap-8">

          {/* Text Content */}
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-card border border-border shadow-lg">
              <img alt="Sparkle" className="w-5 h-5" src="/landing/Sparkle.svg" />
              <p className="text-base font-medium text-center text-muted-foreground">
                Our Strategies
              </p>
            </div>
            <div className="flex items-center gap-2 px-4">
              <p className="w-full max-w-2xl text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-foreground leading-tight">
                Streamline Your Treasury Operations
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 lg:px-5">
              <p className="w-full max-w-xl opacity-80 text-sm lg:text-base text-center text-muted-foreground leading-relaxed">
                TilepMoney helps you gain control of your stablecoin operations across teams and workflows.
              </p>
            </div>
          </div>
        </div>

        {/* Strategies */}
        <div className="flex flex-col items-center gap-10 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 w-full">
            <StrategyCard
              description="In the fast-paced world of DeFi, every second counts. TilepMoney processes transactions in real-time, ensuring you're always working with the most up-to-date information. React to changes as they happen and pivot your strategies instantly."
              icon="/landing/instant.svg"
              iconAlt="Instant"
              title="Instant Execution"
            />
            <StrategyCard
              description="TilepMoney seamlessly integrates with your favorite Web3 tools, wallets, and platforms. Experience a unified treasury platform that bridges the gaps in your workflow, ensuring you have a holistic view of your operations."
              icon="/landing/connect.svg"
              iconAlt="Connect"
              title="Connect & Streamline"
            />
            <StrategyCard
              description="Harness the power of visual workflow building with TilepMoney. Design complex treasury operations with drag-and-drop simplicity, anticipate settlement patterns, and stay steps ahead. Make informed decisions backed by real-time data."
              icon="/landing/database.svg"
              iconAlt="Database"
              title="Visual Workflows"
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
