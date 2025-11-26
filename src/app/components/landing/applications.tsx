"use client";

import type React from "react";
import { Button } from "@/components/ui/button";

interface ApplicationCardProps {
  icon: string;
  iconAlt: string;
  title: string;
  description: string;
  categories: string;
  disableHoverShadow?: boolean;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({
  icon,
  iconAlt,
  title,
  description,
  categories,
  disableHoverShadow = false,
}) => {
  return (
    <div
      className={`flex flex-col items-start gap-4 p-6 rounded-xl bg-card border border-border hover:border-primary cursor-pointer transition-all duration-200 min-h-12 ${!disableHoverShadow ? "hover:shadow-xl" : ""}`}
    >
      <div className="flex flex-col items-start gap-2">
        <div className="flex items-center justify-center pt-1 rounded-lg flex-shrink-0">
          <img alt={iconAlt} className="w-8 h-8" src={icon} />
        </div>
        <p className="text-lg font-semibold text-left text-foreground">{title}</p>
      </div>
      <p className="text-base text-left text-muted-foreground leading-relaxed min-h-24">
        {description}
      </p>
      <p className="text-sm text-left text-primary">{categories}</p>
    </div>
  );
};

const Applications: React.FC = () => {
  return (
    <div className="flex flex-col items-center gap-4 px-8 lg:px-24 pt-20 lg:pt-32 pb-20 lg:pb-28 bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="flex flex-col items-center gap-8 mb-8">
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-card border border-border shadow-lg w-fit">
              <img alt="Sparkle" className="w-5 h-5" src="/landing/Sparkle.svg" />
              <p className="text-base font-medium text-center text-muted-foreground">
                Applications
              </p>
            </div>
            <div className="flex items-center gap-2 px-4">
              <p className="w-full max-w-4xl text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-foreground leading-tight">
                Enterprise Use Cases for B2B Payments
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 lg:px-5">
              <p className="w-full max-w-3xl opacity-80 text-sm lg:text-base text-center text-muted-foreground leading-relaxed">
                From corporate payments to treasury automation, TilepMoney provides clear pathways
                to real-world commercial use cases for stablecoin payment infrastructure.
              </p>
            </div>
          </div>
        </div>

        {/* Applications */}
        <div className="flex flex-col items-center gap-10 w-full relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 w-full">
            {/* Corporate Payments */}
            <ApplicationCard
              categories="B2B, Payments, Settlements"
              description="Design and automate corporate payment flows with visual workflows. Configure deposit, mint, swap, bridge, and output nodes to streamline your payment infrastructure."
              icon="/landing/connect.svg"
              iconAlt="Connect"
              title="Corporate Payments"
            />
            {/* Treasury Automation */}
            <ApplicationCard
              categories="Treasury, Automation, Yield"
              description="Automate treasury operations with partition nodes, vault strategies, and wait conditions. Allocate funds across multiple channels with time-based and condition-based triggers."
              icon="/landing/ticket.svg"
              iconAlt="Ticket"
              title="Treasury Automation"
            />
            {/* Merchant Settlements */}
            <ApplicationCard
              categories="Merchants, Settlements, Cross-Chain"
              description="Enable merchant settlements with cross-chain workflows. Bridge assets to Mantle L2 and configure automated settlement routes for your merchant partners."
              icon="/landing/target.svg"
              iconAlt="Target"
              title="Merchant Settlements"
            />
            {/* Crypto On/Off-Ramping */}
            <ApplicationCard
              categories="On-Ramp, Off-Ramp, Aggregation"
              description="Build aggregated crypto on/off-ramping solutions. Connect deposit nodes to mint nodes, swap providers, and bridge services for seamless fiat-to-crypto conversions."
              icon="/landing/chart-rates.svg"
              iconAlt="Chart Rates"
              title="Crypto On/Off-Ramping"
            />
            {/* Cross-Chain Liquidity */}
            <ApplicationCard
              categories="Liquidity, Cross-Chain, Enterprise"
              description="Manage enterprise cross-chain liquidity with provider-agnostic bridge nodes. Test routing logic on Mantle L2 before deploying real money flows."
              icon="/landing/server.svg"
              iconAlt="Server"
              title="Cross-Chain Liquidity"
            />
            {/* L2 Safety */}
            <ApplicationCard
              categories="L2, Safety, Testing"
              description="Test your routing logic safely on Mantle L2. Experiment with workflows before deploying to production."
              icon="/landing/credit-card-sync.svg"
              iconAlt="Sync"
              title="L2 Safety"
            />
            {/* Modular Nodes */}
            <ApplicationCard
              disableHoverShadow
              categories="Modularity, Flexibility, Design"
              description="Each step is a modular node that can be arranged visually. Configure deposit, mint, swap, bridge, redeem, transfer, vault, wait, and partition nodes to build your workflow."
              icon="/landing/credit-card.svg"
              iconAlt="Card"
              title="Modular Node Design"
            />
            {/* Enterprise Integration */}
            <ApplicationCard
              disableHoverShadow
              categories="API, Enterprise, Backend"
              description="Enterprise-friendly with API entrypoints and workflow storage. Designed for integration into enterprise backend pipelines with authentication and API key management."
              icon="/landing/hand-credit-card.svg"
              iconAlt="Hand Card"
              title="Enterprise Integration"
            />
            {/* Provider Selection */}
            <ApplicationCard
              disableHoverShadow
              categories="Providers, Choice, Flexibility"
              description="Select preferred issuers, swap providers, and bridges. Choose between multiple liquidity providers and DEX aggregators for optimal execution."
              icon="/landing/transfer-data.svg"
              iconAlt="Transfer"
              title="Provider Selection"
            />
          </div>

          {/* Gradient Overlay */}
          <div
            className="absolute bottom-0 left-0 w-full h-32 pointer-events-none z-10"
            style={{
              background:
                "linear-gradient(to top, hsl(var(--background)) 38.84%, rgba(255,255,255,0) 100%)",
            }}
          />
        </div>

        <div className="flex flex-col items-center w-full px-4">
          <Button
            className="px-6 py-3 rounded-xl backdrop-blur-md font-bold transition-all duration-200 min-h-12 w-full sm:w-auto"
            variant="outline"
          >
            Explore more applications
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Applications;
