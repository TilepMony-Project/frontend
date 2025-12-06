"use client";

import type React from "react";
import { Sparkles, MousePointerClick, PlayCircle } from "lucide-react";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import WorkflowPreview from "./workflow-preview/workflow-preview";
import {
  useFadeInOnScroll,
  useStaggerFade,
} from "@/hooks/use-scroll-animations";

// Custom Bento Card for AI Flow - simpler design without CTA links
interface AIBentoCardProps {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  className?: string;
  visual?: React.ReactNode;
}

const AIBentoCard: React.FC<AIBentoCardProps> = ({
  title,
  subtitle,
  description,
  icon: Icon,
  className = "",
  visual,
}) => {
  return (
    <div
      className={`group relative flex flex-col justify-between overflow-hidden rounded-xl p-6 lg:p-8
        bg-card border border-primary/20 dark:border-white/20
        hover:border-primary dark:hover:border-primary/60
        transition-all duration-300 hover:shadow-lg hover:shadow-primary/10
        ${className}`}
    >
      {/* Background Visual */}
      {visual && (
        <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-300">
          {visual}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <span className="text-xs uppercase tracking-wider text-primary font-medium">
            {subtitle}
          </span>
        </div>

        <h3 className="text-xl lg:text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
          {title}
        </h3>

        <p className="text-sm lg:text-base text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
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
  const gridRef = useFadeInOnScroll({
    delay: 0.3,
    y: 40,
    scale: 0.95,
    blur: 4,
    duration: 1.2,
    ease: "power3.out",
  });
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
      id="features"
      className="flex flex-col items-center gap-16 px-8 lg:px-24 pt-20 lg:pt-32 pb-20 lg:pb-28"
    >
      <div className="flex flex-col items-center gap-16 w-full max-w-7xl">
        <div className="flex flex-col items-center gap-8">
          {/* Text Content */}
          <div className="flex flex-col items-center gap-6">
            <div
              ref={badgeRef as React.RefObject<HTMLDivElement>}
              className="group flex items-center gap-2 px-3 py-2 rounded-2xl border-[1px] bg-card shadow-lg hover:shadow-xl border-primary/40 dark:border-white/40 hover:border-primary dark:hover:border-primary/40 transition-all duration-300 hover:bg-gradient-to-r hover:from-card hover:to-primary/5 hover:cursor-default"
            >
              <Sparkles className="w-5 h-5 text-primary group-hover:rotate-12 transition-transform duration-300" />
              <p className="text-base font-medium text-center text-muted-foreground group-hover:text-primary transition-colors duration-300">
                How TilepMoney Works
              </p>
            </div>
            <div className="flex items-center gap-2 px-4">
              <h2
                ref={headlineRef as React.RefObject<HTMLHeadingElement>}
                className="w-full max-w-3xl mx-auto text-2xl sm:text-3xl lg:text-4xl font-bold text-center leading-tight"
              >
                <span className="text-gray-900 dark:text-gray-100">Turn </span>
                <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Your Words
                </span>
                <span className="text-gray-900 dark:text-gray-100">
                  {" "}
                  into Working Infrastructure 🚀
                </span>
              </h2>
            </div>
            <div
              ref={descriptionRef as React.RefObject<HTMLDivElement>}
              className="flex items-center gap-2 px-4 lg:px-5"
            >
              <p className="w-full max-w-2xl opacity-80 text-sm lg:text-base text-center text-muted-foreground leading-relaxed">
                Describe your treasury strategy as if you're texting a teammate.
                Our AI turns those words into a working architecture—then you
                refine, simulate, and deploy it. All without writing a single
                line of code.
              </p>
            </div>
          </div>
        </div>

        {/* Bento Grid - 3 Step AI Flow */}
        <div
          ref={gridRef as React.RefObject<HTMLDivElement>}
          className="w-full"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 w-full">
            {/* Card 1: AI-Native Generation - Featured/Large (spans 2 cols on lg) */}
            <AIBentoCard
              title="AI-Native Strategy Builder"
              subtitle="Text-to-Infrastructure"
              description={
                'Don\'t start from scratch. Simply type "Move 50% of IDR revenue to Yield Vaults every Friday," and watch our Intent Engine construct the complete node architecture instantly.'
              }
              icon={Sparkles}
              className="lg:col-span-2 min-h-[200px] lg:min-h-[240px]"
            />

            {/* Card 2: Visual Orchestration - Secondary */}
            <AIBentoCard
              title="Visual Orchestration"
              subtitle="No-Code Refinement"
              description={
                "Fine-tune the AI's output on our infinite canvas. Drag and drop modular nodes for Minting, Bridging, and Swapping. Configure logical splits and delays without writing a single line of code."
              }
              icon={MousePointerClick}
              className="min-h-[200px] lg:min-h-[260px]"
            />

            {/* Card 3: Live Execution & Audit - Secondary */}
            <AIBentoCard
              title="Live Execution & Audit"
              subtitle="Simulate then Deploy"
              description="Eliminate risk with Smart Simulation. Run dry-runs on the Mantle Testnet, watch real-time execution logs, and track funds node-by-node with total transparency before committing real capital."
              icon={PlayCircle}
              className="min-h-[200px] lg:min-h-[260px]"
            />
          </div>
        </div>

        {/* Workflow Preview */}
        <div
          ref={workflowRef as React.RefObject<HTMLDivElement>}
          className="w-full max-w-7xl h-96 relative overflow-hidden rounded-3xl bg-primary/20 border-[1px] border-primary/40 dark:border-white/40 flex items-center justify-center"
        >
          <WorkflowPreview />
        </div>
      </div>
    </div>
  );
};

export default OurStrategies;
