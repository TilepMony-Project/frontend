"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { useFadeInOnScroll } from "@/hooks/use-scroll-animations";
import { TemplateMiniPreview } from "./template-mini-preview";
import { workflowTemplates } from "@/features/dashboard/data/templates";
import { cn } from "@/lib/utils";

// Template metadata for display
const TEMPLATE_DISPLAY_DATA: Record<string, { shortDescription: string }> = {
  "cross-border-treasury-transfer": {
    shortDescription:
      "Multi-branch IDR→USD treasury flow with vault & partition",
  },
  "automated-onramp-investment-vault": {
    shortDescription:
      "Fiat onboarding to USDC investment vault with auto-withdraw",
  },
  "scheduled-salary-distribution": {
    shortDescription:
      "Monthly salary distribution to multiple employee wallets",
  },
  "corporate-invoice-settlement": {
    shortDescription: "B2B invoice settlement with due date scheduling",
  },
};

const TemplateShowcase: React.FC = () => {
  const [activeTemplateId, setActiveTemplateId] = useState(
    workflowTemplates[0]?.id || ""
  );

  // Animation refs
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
  const containerRef = useFadeInOnScroll({
    delay: 0.3,
    y: 40,
    scale: 0.95,
    blur: 4,
    duration: 1.2,
    ease: "power3.out",
  });

  const activeTemplate = workflowTemplates.find(
    (t) => t.id === activeTemplateId
  );

  return (
    <div
      id="templates"
      className="flex flex-col items-center gap-16 px-8 lg:px-24 pt-20 lg:pt-32 pb-20 lg:pb-28"
    >
      <div className="flex flex-col items-center gap-16 w-full max-w-6xl">
        {/* Header */}
        <div className="flex flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-6">
            <div
              ref={badgeRef as React.RefObject<HTMLDivElement>}
              className="group flex items-center gap-2 px-3 py-2 rounded-2xl border-[1px] bg-card shadow-lg hover:shadow-xl border-primary/40 dark:border-white/40 hover:border-primary dark:hover:border-primary/40 transition-all duration-300 hover:bg-gradient-to-r hover:from-card hover:to-primary/5 hover:cursor-default"
            >
              <Sparkles className="w-5 h-5 text-primary group-hover:rotate-12 transition-transform duration-300" />
              <p className="text-base font-medium text-center text-muted-foreground group-hover:text-primary transition-colors duration-300">
                Ready-to-Use Templates
              </p>
            </div>
            <div className="flex items-center gap-2 px-4">
              <h2
                ref={headlineRef as React.RefObject<HTMLHeadingElement>}
                className="w-full max-w-3xl mx-auto text-2xl sm:text-3xl lg:text-4xl font-bold text-center leading-tight"
              >
                <span className="block text-gray-900 dark:text-gray-100">
                  Skip the Boring Part.
                </span>
                <span className="block bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Start Here
                </span>
              </h2>
            </div>
            <div
              ref={descriptionRef as React.RefObject<HTMLDivElement>}
              className="flex items-center gap-2 px-4 lg:px-5"
            >
              <p className="w-full max-w-2xl opacity-80 text-sm lg:text-base text-center text-muted-foreground leading-relaxed">
                Production-ready workflows. Just plug and play. </p>
            </div>
          </div>
        </div>

        {/* Tabbed Template Viewer */}
        <div
          ref={containerRef as React.RefObject<HTMLDivElement>}
          className="w-full"
        >
          <div className="flex flex-col overflow-hidden rounded-2xl border border-primary/30 dark:border-white/20 bg-card shadow-xl">
            {/* Tabs Row */}
            <div className="flex flex-wrap gap-2 p-3 border-b border-border bg-gradient-to-b from-muted/50 to-muted/20">
              {workflowTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setActiveTemplateId(template.id)}
                  className={cn(
                    "relative flex flex-col items-start gap-1 px-4 py-3 rounded-xl text-left transition-all duration-300 min-w-[160px]",
                    "border",
                    activeTemplateId === template.id
                      ? "bg-gradient-to-br from-card to-primary/5 border-primary/50 shadow-lg shadow-primary/10"
                      : "bg-card/50 border-transparent hover:bg-card hover:border-primary/30 hover:shadow-md"
                  )}
                >
                  <span
                    className={cn(
                      "text-sm font-bold transition-colors",
                      activeTemplateId === template.id
                        ? "text-primary"
                        : "text-foreground"
                    )}
                  >
                    {template.category}
                  </span>
                  <span
                    className={cn(
                      "text-xs transition-colors line-clamp-2",
                      activeTemplateId === template.id
                        ? "text-foreground/80"
                        : "text-muted-foreground"
                    )}
                  >
                    {TEMPLATE_DISPLAY_DATA[template.id]?.shortDescription
                      .split(" ")
                      .slice(0, 4)
                      .join(" ")}
                    ...
                  </span>
                  {activeTemplateId === template.id && (
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-primary/50" />
                  )}
                </button>
              ))}

              {/* Trigger Tab - "You can" */}
              <Link
                href="/dashboard"
                className="group relative flex flex-col items-start gap-1 px-4 py-3 rounded-xl text-left transition-all duration-300 min-w-[160px] border border-dashed border-primary/40 hover:border-primary hover:bg-gradient-to-br hover:from-primary/5 hover:to-primary/10 hover:shadow-lg"
              >
                <span className="text-sm font-bold text-primary flex items-center gap-1.5">
                  You
                  <span className="text-foreground">can</span>
                </span>
                <span className="text-xs text-muted-foreground group-hover:text-foreground/80 transition-colors flex items-center gap-1">
                  🚀 Build your own workflow
                </span>
              </Link>
            </div>

            {/* Preview Canvas */}
            <div className="relative w-full h-72 md:h-96 lg:h-[450px] bg-gradient-to-b from-muted/10 to-muted/30">
              <TemplateMiniPreview
                key={activeTemplateId}
                templateId={activeTemplateId}
              />

              {/* Category Badge */}
              <div className="absolute top-4 left-4 z-10">
                <span className="px-2.5 py-1 rounded-full bg-primary/90 text-[10px] font-bold text-white uppercase tracking-wide">
                  {activeTemplate?.category}
                </span>
              </div>
            </div>

            {/* Template Info Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 border-t border-border bg-card">
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-bold text-foreground">
                  {activeTemplate?.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {TEMPLATE_DISPLAY_DATA[activeTemplateId]?.shortDescription ||
                    activeTemplate?.description}
                </p>
              </div>
              <Link
                href={`/dashboard?template=${activeTemplateId}`}
                className="group flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-colors shrink-0"
              >
                Use Template
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateShowcase;
