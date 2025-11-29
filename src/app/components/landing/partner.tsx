"use client";

import type React from "react";
import { firstRowLogos, secondRowLogos } from "@/data/partner-logos";
import { motion } from "motion/react";
import { useInView } from "motion/react";
import { useRef } from "react";

const LogoBox = ({
  name,
  Icon,
  index,
}: {
  name: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  index: number;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={
        isInView
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 0, y: 20, scale: 0.9 }
      }
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.25, 0.4, 0.25, 1],
      }}
      className="flex justify-center items-center"
    >
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
        className="group relative"
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
    </motion.div>
  );
};

const Partner: React.FC = () => {
  return (
    <div className="flex flex-col items-center gap-5 px-8 lg:px-24 pt-10 pb-16">
      <div className="flex flex-col items-center gap-8">
        {/* First row - Staggered fade in */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 lg:gap-8">
          {firstRowLogos.map((logo, index) => (
            <LogoBox key={logo.name} {...logo} index={index} />
          ))}
        </div>

        {/* Second row - Staggered fade in */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 lg:gap-8">
          {secondRowLogos.map((logo, index) => (
            <LogoBox
              key={logo.name}
              {...logo}
              index={index + firstRowLogos.length}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Partner;
