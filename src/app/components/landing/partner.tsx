"use client";

import type React from "react";
import { firstRowLogos, secondRowLogos } from "@/data/partner-logos";

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
              <div className="flex items-center gap-8 sm:gap-12 lg:gap-16 flex-shrink-0">
                {firstRowLogos.map(({ name, Icon }) => (
                  <div
                    key={name}
                    className="flex justify-center items-center py-3"
                  >
                    <Icon
                      className="w-auto h-14 opacity-60 hover:opacity-100 transition-opacity duration-300"
                      aria-label={name}
                    />
                  </div>
                ))}
              </div>
              {/* Duplicate set for seamless loop */}
              <div className="flex items-center gap-8 sm:gap-12 lg:gap-16 flex-shrink-0">
                {firstRowLogos.map(({ name, Icon }) => (
                  <div
                    key={`${name}-duplicate`}
                    className="flex justify-center items-center py-3"
                  >
                    <Icon
                      className="w-auto h-14 opacity-60 hover:opacity-100 transition-opacity duration-300"
                      aria-label={name}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Second row - moving to the left */}
          <div className="relative w-full max-w-6xl overflow-hidden">
            <div className="flex animate-scroll-left gap-8 sm:gap-12 lg:gap-16">
              {/* First set of logos */}
              <div className="flex items-center gap-8 sm:gap-12 lg:gap-16 flex-shrink-0">
                {secondRowLogos.map(({ name, Icon }) => (
                  <div
                    key={name}
                    className="flex justify-center items-center py-3"
                  >
                    <Icon
                      className="w-auto h-14 opacity-60 hover:opacity-100 transition-opacity duration-300"
                      aria-label={name}
                    />
                  </div>
                ))}
              </div>
              {/* Duplicate set for seamless loop */}
              <div className="flex items-center gap-8 sm:gap-12 lg:gap-16 flex-shrink-0">
                {secondRowLogos.map(({ name, Icon }) => (
                  <div
                    key={`${name}-duplicate`}
                    className="flex justify-center items-center py-3"
                  >
                    <Icon
                      className="w-auto h-14 opacity-60 hover:opacity-100 transition-opacity duration-300"
                      aria-label={name}
                    />
                  </div>
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
