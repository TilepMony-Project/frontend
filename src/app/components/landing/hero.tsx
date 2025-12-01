"use client";

import type React from "react";
import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { AuroraText } from "@/components/ui/aurora-text";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useFadeInOnScroll } from "@/hooks/use-scroll-animations";

const Hero: React.FC = () => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  // Cinematic animation refs with enhanced effects
  const badgeRef = useFadeInOnScroll({ 
    delay: 0, 
    y: 20, 
    scale: 0.85, 
    blur: 6,
    duration: 0.8,
    ease: "power3.out"
  });
  const headlineRef = useFadeInOnScroll({ 
    delay: 0.2, 
    y: 50, 
    scale: 0.92,
    blur: 6,
    duration: 1.6,
    ease: "power4.out"
  });
  const descriptionRef = useFadeInOnScroll({ 
    delay: 0.4, 
    y: 30, 
    scale: 0.95,
    duration: 1.3,
    ease: "power3.out"
  });
  const cardRef = useFadeInOnScroll({ 
    delay: 0.6, 
    y: 60, 
    scale: 0.9,
    blur: 10,
    duration: 1.8,
    ease: "power4.out"
  });

  return (
    <div
      id="demo"
      className="flex flex-col items-center px-8 lg:px-24 pt-20 lg:pt-28 pb-16 lg:pb-20"
    >
      <div className="flex flex-col items-center relative gap-12 lg:gap-16">
        <div className="flex flex-col items-center gap-8 lg:gap-12">
          {/* Text Content */}
          <div className="flex flex-col items-center gap-4 lg:gap-6">
            <div
              ref={badgeRef as React.RefObject<HTMLDivElement>}
              className="group flex items-center gap-2 px-3 py-2 rounded-2xl border-[1px] bg-card shadow-lg hover:shadow-xl border-primary dark:border-white/40 hover:border-primary dark:hover:border-primary transition-all duration-300 hover:bg-gradient-to-r hover:from-card hover:to-primary/5 hover:cursor-default"
            >
              <img
                alt="Sparkle"
                className="w-4 h-4 lg:w-5 lg:h-5 group-hover:rotate-12 transition-transform duration-300"
                src="/landing/Sparkle.svg"
              />
              <p className="text-sm lg:text-base font-medium text-center text-muted-foreground group-hover:text-primary transition-colors duration-300">
                Codeless Stablecoin Orchestration Builder
              </p>
            </div>
            <p
              ref={headlineRef as React.RefObject<HTMLParagraphElement>}
              className="w-full max-w-4xl text-2xl sm:text-4xl lg:text-6xl font-bold text-center text-foreground leading-tight lg:leading-[1.3]"
            >
              Stablecoin creation made as easy as{" "}
              <AuroraText
                className="text-wrap break-words whitespace-nowrap"
                colors={["#f5c0b1", "#a79ee2", "#1296e7", "#91e5e8"]}
                speed={1.4}
              >
                drag-and-drop
              </AuroraText>
            </p>

            <div
              ref={descriptionRef as React.RefObject<HTMLDivElement>}
              className="flex items-start gap-2 px-4 lg:px-5 mt-2"
            >
              <p className="w-full max-w-3xl text-sm lg:text-base text-center text-muted-foreground leading-[1.3] lg:leading-[1.6]">
                Integrating stablecoin is hard, we made it easier using drag and
                drop. A visual drag-and-drop builder that allows businesses to
                design stablecoin movement workflows on Mantle L2.
              </p>
            </div>
          </div>

          {/* Card Background */}
          <div
            ref={cardRef as React.RefObject<HTMLDivElement>}
            className="w-full max-w-6xl h-64 sm:h-80 lg:h-96 relative overflow-hidden rounded-2xl lg:rounded-3xl bg-primary/20 border border-border mx-2 sm:mx-4 flex items-center justify-center"
          >
            <Image
              alt="Card Background"
              className="object-cover"
              src="/landing/card-background-0.svg"
              fill
              priority
            />
            <div
              onClick={() => setIsVideoOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setIsVideoOpen(true);
                }
              }}
              className="flex flex-col sm:flex-row items-center p-3 sm:p-4 lg:p-6 rounded-full bg-card border-2 sm:border-4 lg:border-5 border-primary/35 gap-2 sm:gap-3 lg:gap-4 animate-smooth-bounce cursor-pointer hover:bg-accent hover:border-primary/50 hover:shadow-lg transition-all duration-300 max-w-[90%] sm:max-w-none relative z-10"
            >
              <img
                alt="Play"
                className="w-10 lg:h-10 flex-shrink-0 dark:brightness-0 dark:invert"
                src="/landing/blue-play.svg"
              />
              <div className="hidden sm:flex flex-col items-center sm:items-start gap-1">
                <p className="text-sm sm:text-base lg:text-lg font-semibold text-foreground text-center sm:text-left leading-tight">
                  Watch demo video
                </p>
                <div className="flex items-center gap-1 sm:gap-2">
                  <p className="opacity-80 text-xs sm:text-sm text-muted-foreground">
                    5 mins
                  </p>
                  <div className="w-1 h-1 rounded-full bg-muted" />
                  <p className="text-xs sm:text-sm font-medium text-primary">
                    Play video
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
        <DialogContent className="max-w-4xl w-[95vw] p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Introduction Video</DialogTitle>
          </DialogHeader>
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            <iframe
              className="absolute top-0 left-0 w-full h-full rounded-lg"
              src="https://www.youtube.com/embed/J7g9R8PETHc?si=DdWOgIBKA8Easuck"
              title="TilepMoney Introduction Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Hero;
