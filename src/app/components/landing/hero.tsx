"use client";

import type React from "react";
import { Button } from "@/components/ui/button";

const Hero: React.FC = () => {
  return (
    <div className="flex flex-col items-center px-8 lg:px-24 pt-20 lg:pt-28 pb-16 lg:pb-20 bg-background">
      <div className="flex flex-col items-center relative gap-12 lg:gap-16">
        <div className="flex flex-col items-center gap-8 lg:gap-12">
          {/* Text Content */}
          <div className="flex flex-col items-center gap-4 lg:gap-6">
            <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-card border border-border shadow-lg">
              <img alt="Sparkle" className="w-4 h-4 lg:w-5 lg:h-5" src="/landing/Sparkle.svg" />
              <p className="text-sm lg:text-base font-medium text-center text-muted-foreground">
                Codeless Stablecoin Orchestration Builder
              </p>
            </div>
            <p className="w-full max-w-4xl text-2xl sm:text-3xl lg:text-5xl font-bold text-center text-foreground px-4 leading-tight lg:leading-[1.15]">
              Stablecoin creation made as easy as{" "}
              <span className="bg-gradient-to-r from-primary via-blue-500 to-purple-500 bg-clip-text text-transparent">
                drag-and-drop
              </span>
              .
            </p>

            <div className="flex items-start gap-2 px-4 lg:px-5 mt-2">
              <p className="w-full max-w-3xl text-sm lg:text-base text-center text-muted-foreground leading-relaxed">
                Integrating stablecoin is hard, we made it easier using drag and drop. A visual
                drag-and-drop builder that allows businesses to design stablecoin movement workflows
                on Mantle L2.
              </p>
            </div>
          </div>

          {/* Card Background */}
          <div className="w-full max-w-6xl h-64 sm:h-80 lg:h-96 relative overflow-hidden rounded-2xl lg:rounded-3xl bg-primary/20 border border-border mx-2 sm:mx-4 flex items-center justify-center">
            <img
              alt="Card Background"
              className="absolute left-0 top-0 w-full h-full object-cover"
              src="/landing/card-background-0.svg"
            />
            <div className="flex flex-col sm:flex-row items-center p-3 sm:p-4 lg:p-6 rounded-full bg-card border-2 sm:border-4 lg:border-5 border-primary/35 gap-2 sm:gap-3 lg:gap-4 animate-smooth-bounce cursor-pointer hover:bg-accent hover:border-primary/50 hover:shadow-lg transition-all duration-300 max-w-[90%] sm:max-w-none relative z-10">
              <img
                alt="Play"
                className="w-10 lg:h-10 flex-shrink-0 dark:brightness-0 dark:invert"
                src="/landing/blue-play.svg"
              />
              <div className="hidden sm:flex flex-col items-center sm:items-start gap-1">
                <p className="text-sm sm:text-base lg:text-lg font-semibold text-foreground text-center sm:text-left leading-tight">
                  Watch introduce video
                </p>
                <div className="flex items-center gap-1 sm:gap-2">
                  <p className="opacity-80 text-xs sm:text-sm text-muted-foreground">5 mins</p>
                  <div className="w-1 h-1 rounded-full bg-muted" />
                  <p className="text-xs sm:text-sm font-medium text-primary">Play video</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
