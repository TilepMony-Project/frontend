"use client";

import type React from "react";
import {
  Sparkles,
  MousePointerClick,
  Settings2,
  PlayCircle,
} from "lucide-react";
import { useFadeInOnScroll } from "@/hooks/use-scroll-animations";
import { cn } from "@/lib/utils";
import Image from "next/image";

// Step card with GIF background
interface StepCardProps {
  step: number;
  title: string;
  description: string;
  icon: React.ElementType;
  gifSrc: string;
  className?: string;
}

const StepCard: React.FC<StepCardProps> = ({
  step,
  title,
  description,
  icon: Icon,
  gifSrc,
  className = "",
}) => {
  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-xl",
        "bg-card border border-primary/20 dark:border-white/20",
        "hover:border-primary dark:hover:border-primary/60",
        "transition-all duration-300 hover:shadow-lg hover:shadow-primary/10",
        className
      )}
    >
      {/* GIF Background - 30% larger */}
      <div className="relative w-full h-64 lg:h-72 overflow-hidden">
        <Image
          src={gifSrc}
          alt={title}
          fill
          className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
          unoptimized // For GIF support
        />
        {/* Gradient overlay - Dark mode only */}
        <div className="hidden dark:block absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-card to-transparent" />

        {/* Step badge */}
        <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/90 backdrop-blur-sm">
          <span className="text-xs font-bold text-white">Step {step}</span>
        </div>
      </div>

      {/* Content - larger padding */}
      <div className="relative z-10 p-6 lg:p-8 pt-3">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        </div>

        <h3 className="text-lg lg:text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
          {title}
        </h3>

        <p className="text-sm text-muted-foreground leading-relaxed">
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

  const steps = [
    {
      step: 1,
      title: "Drag and Drop",
      description:
        "Build your workflow visually. Drag nodes from the library and drop them onto the canvas. Connect them to create your money flow.",
      icon: MousePointerClick,
      gifSrc: "/drag_and_drop.gif",
    },
    {
      step: 2,
      title: "Choose Provider",
      description:
        "Configure each node with your preferred providers. Select issuers, swap DEXes, and bridge protocols that fit your strategy.",
      icon: Settings2,
      gifSrc: "/choose_provider.gif",
    },
    {
      step: 3,
      title: "Run Flow",
      description:
        "Execute your workflow with one click. Watch real-time progress as funds flow through each node from start to finish.",
      icon: PlayCircle,
      gifSrc: "/run_workflow.gif",
    },
  ];

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
                How It Works
              </p>
            </div>
            <div className="flex items-center gap-2 px-4">
              <h2
                ref={headlineRef as React.RefObject<HTMLHeadingElement>}
                className="w-full max-w-3xl mx-auto text-2xl sm:text-3xl lg:text-4xl font-bold text-center leading-tight"
              >
                <span className="text-gray-900 dark:text-gray-100">
                  Build Your{" "}
                </span>
                <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Treasury Flow
                </span>
                <br />
                <span className="text-gray-900 dark:text-gray-100">
                  in 3 Simple Steps
                </span>
              </h2>
            </div>
            <div
              ref={descriptionRef as React.RefObject<HTMLDivElement>}
              className="flex items-center gap-2 px-4 lg:px-5"
            >
              <p className="w-full max-w-2xl opacity-80 text-sm lg:text-base text-center text-muted-foreground leading-relaxed">
                No coding required. Design, configure, and execute your
                stablecoin orchestration workflows with our intuitive visual
                builder.
              </p>
            </div>
          </div>
        </div>

        {/* 3-Step Cards Grid */}
        <div
          ref={gridRef as React.RefObject<HTMLDivElement>}
          className="w-full"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {steps.map((step) => (
              <StepCard
                key={step.step}
                step={step.step}
                title={step.title}
                description={step.description}
                icon={step.icon}
                gifSrc={step.gifSrc}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OurStrategies;
