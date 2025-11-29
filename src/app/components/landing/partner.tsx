"use client";

import type React from "react";
import { firstRowLogos, secondRowLogos } from "@/data/partner-logos";
import { motion } from "motion/react";

const LogoBox = ({
  name,
  Icon,
}: {
  name: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
}) => {
  return (
    <motion.div
      whileHover={{
        scale: 1.1,
        y: -8,
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 10,
      }}
      className="group relative flex-shrink-0"
    >
      {/* Background box with glassmorphism effect */}
      <div className="relative p-6 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 hover:border-primary/40">
        {/* Glow effect on hover */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/10 group-hover:via-primary/5 group-hover:to-transparent transition-all duration-500" />

        {/* Icon */}
        <div className="relative z-10">
          <Icon
            className="w-12 h-12 transition-all duration-300 opacity-80 group-hover:opacity-100 drop-shadow-lg"
            aria-label={name}
          />
        </div>
      </div>
    </motion.div>
  );
};

const Partner: React.FC = () => {
  return (
    <div className="flex flex-col items-center gap-5 px-8 lg:px-24 pt-10 pb-16">
      <div className="flex flex-col items-center gap-5">
        {/* Partners */}
        <div className="flex flex-col items-center py-5 gap-4">
          {/* First row - moving to the right */}
          <div className="relative w-full max-w-6xl overflow-hidden">
            <div className="flex animate-scroll-right gap-8 sm:gap-12 lg:gap-16">
              {/* First set of logos */}
              <div className="flex items-center gap-8 sm:gap-12 lg:gap-16">
                {firstRowLogos.map(({ name, Icon }) => (
                  <LogoBox key={name} name={name} Icon={Icon} />
                ))}
              </div>
              {/* Duplicate set for seamless loop */}
              <div className="flex items-center gap-8 sm:gap-12 lg:gap-16">
                {firstRowLogos.map(({ name, Icon }) => (
                  <LogoBox key={`${name}-duplicate`} name={name} Icon={Icon} />
                ))}
              </div>
            </div>
          </div>

          {/* Second row - moving to the left */}
          <div className="relative w-full max-w-6xl overflow-hidden">
            <div className="flex animate-scroll-left gap-8 sm:gap-12 lg:gap-16">
              {/* First set of logos */}
              <div className="flex items-center gap-8 sm:gap-12 lg:gap-16">
                {secondRowLogos.map(({ name, Icon }) => (
                  <LogoBox key={name} name={name} Icon={Icon} />
                ))}
              </div>
              {/* Duplicate set for seamless loop */}
              <div className="flex items-center gap-8 sm:gap-12 lg:gap-16">
                {secondRowLogos.map(({ name, Icon }) => (
                  <LogoBox key={`${name}-duplicate`} name={name} Icon={Icon} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Partner;
