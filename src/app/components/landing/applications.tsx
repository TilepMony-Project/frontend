'use client';

import React from "react";
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
                Treasury operations made simple
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 lg:px-5">
              <p className="w-full max-w-3xl opacity-80 text-sm lg:text-base text-center text-muted-foreground leading-relaxed">
                Advanced workflow tools enhance efficiency across your entire operation. By automating settlements and monitoring flows in real-time, these tools provide you with the critical insights needed for informed decision-making.
              </p>
            </div>
          </div>
        </div>

        {/* Applications */}
        <div className="flex flex-col items-center gap-10 w-full relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 w-full">
            {/* Visual Orchestration */}
            <ApplicationCard
              categories="DeFi, Treasury, Settlements"
              description="Drag-and-drop nodes to model treasury, settlement, and DeFi flows in minutes. Build complex workflows without writing a single line of code."
              icon="/landing/connect.svg"
              iconAlt="Connect"
              title="Visual Orchestration"
            />
            {/* Safe Execution */}
            <ApplicationCard
              categories="Compliance, Security, Audit"
              description="Node validation, staged simulation, and audit trails keep stablecoin operations compliant and secure at every step."
              icon="/landing/ticket.svg"
              iconAlt="Ticket"
              title="Safe Execution"
            />
            {/* One-Click Deployment */}
            <ApplicationCard
              categories="Mantle L2, Testnet, Production"
              description="Run workflows on Mantle testnet today and graduate to production with no rewrites. Seamless deployment at your fingertips."
              icon="/landing/target.svg"
              iconAlt="Target"
              title="One-Click Deployment"
            />
            {/* Real-Time Monitoring */}
            <ApplicationCard
              categories="Analytics, Monitoring, Alerts"
              description="Monitor your treasury flows in real-time with live dashboards. Get instant alerts when conditions change and stay ahead of the curve."
              icon="/landing/chart-rates.svg"
              iconAlt="Chart Rates"
              title="Real-Time Monitoring"
            />
            {/* Enterprise Security */}
            <ApplicationCard
              categories="Security, Encryption, Access Control"
              description="Rest easy knowing your operations are protected with enterprise-grade security protocols. From encryption to access controls, we prioritize your safety."
              icon="/landing/server.svg"
              iconAlt="Server"
              title="Enterprise Security"
            />
            {/* Team Collaboration */}
            <ApplicationCard
              categories="Teams, Workflows, Permissions"
              description="Work together seamlessly with role-based access controls. Share workflows, review changes, and drive collective success."
              icon="/landing/credit-card-sync.svg"
              iconAlt="Sync"
              title="Team Collaboration"
            />
            {/* Intuitive Interface */}
            <ApplicationCard
              disableHoverShadow
              categories="All Users"
              description="TilepMoney offers an intuitive interface that's easy to navigate, ensuring you spend less time learning and more time building."
              icon="/landing/credit-card.svg"
              iconAlt="Card"
              title="Intuitive Interface"
            />
            {/* Automated Workflows */}
            <ApplicationCard
              disableHoverShadow
              categories="Automation, Efficiency, Scale"
              description="Automate complex treasury operations with conditional logic and triggers. Let TilepMoney handle the heavy lifting."
              icon="/landing/hand-credit-card.svg"
              iconAlt="Hand Card"
              title="Automated Workflows"
            />
            {/* Scale with Confidence */}
            <ApplicationCard
              disableHoverShadow
              categories="Startups, DAOs, Enterprises"
              description="Whether you're a startup or an enterprise, TilepMoney scales with you. Experience robust treasury solutions that adapt to your growth."
              icon="/landing/transfer-data.svg"
              iconAlt="Transfer"
              title="Scale with Confidence"
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
