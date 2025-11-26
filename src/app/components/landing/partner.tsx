'use client';

import React from "react";

const Partner: React.FC = () => {
  return (
    <div className="flex flex-col items-center gap-5 px-8 lg:px-24 pt-10 pb-16 bg-background">
      <div className="flex flex-col items-center gap-5">

        {/* Text Content */}
        <p className="w-full max-w-7xl opacity-80 text-sm sm:text-base text-center text-muted-foreground px-4">
          Trusted by leading Web3 projects and stablecoin issuers worldwide
        </p>

        {/* Partners */}
        <div className="flex flex-col items-center py-5 gap-4">
          {/* First row - moving to the right */}
          <div className="relative w-full max-w-6xl overflow-hidden">
            <div className="flex animate-scroll-right gap-8 sm:gap-12 lg:gap-16">
              {/* First set of logos */}
              <div className="flex items-center gap-8 sm:gap-12 lg:gap-16 flex-shrink-0">
                <div className="flex justify-center items-center py-3">
                  <img
                    alt="Partner Logo 0"
                    className="w-auto h-14"
                    src="/landing/Logo-0.svg"
                  />
                </div>
                <div className="flex justify-center items-center py-3">
                  <img
                    alt="Partner Logo 1"
                    className="w-auto h-14"
                    src="/landing/Logo-1.svg"
                  />
                </div>
                <div className="flex justify-center items-center py-3">
                  <img
                    alt="Partner Logo 2"
                    className="w-auto h-14"
                    src="/landing/Logo-2.svg"
                  />
                </div>
                <div className="flex justify-center items-center py-3">
                  <img
                    alt="Partner Logo 3"
                    className="w-auto h-14"
                    src="/landing/Logo-3.svg"
                  />
                </div>
                <div className="flex justify-center items-center py-3">
                  <img
                    alt="Partner Logo 4"
                    className="w-auto h-14"
                    src="/landing/Logo-4.svg"
                  />
                </div>
              </div>
              {/* Duplicate set for seamless loop */}
              <div className="flex items-center gap-8 sm:gap-12 lg:gap-16 flex-shrink-0">
                <div className="flex justify-center items-center py-3">
                  <img
                    alt="Partner Logo 0"
                    className="w-auto h-14"
                    src="/landing/Logo-0.svg"
                  />
                </div>
                <div className="flex justify-center items-center py-3">
                  <img
                    alt="Partner Logo 1"
                    className="w-auto h-14"
                    src="/landing/Logo-1.svg"
                  />
                </div>
                <div className="flex justify-center items-center py-3">
                  <img
                    alt="Partner Logo 2"
                    className="w-auto h-14"
                    src="/landing/Logo-2.svg"
                  />
                </div>
                <div className="flex justify-center items-center py-3">
                  <img
                    alt="Partner Logo 3"
                    className="w-auto h-14"
                    src="/landing/Logo-3.svg"
                  />
                </div>
                <div className="flex justify-center items-center py-3">
                  <img
                    alt="Partner Logo 4"
                    className="w-auto h-14"
                    src="/landing/Logo-4.svg"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Second row - moving to the left */}
          <div className="relative w-full max-w-6xl overflow-hidden">
            <div className="flex animate-scroll-left gap-8 sm:gap-12 lg:gap-16">
              {/* First set of logos */}
              <div className="flex items-center gap-8 sm:gap-12 lg:gap-16 flex-shrink-0">
                <div className="flex justify-center items-center py-3">
                  <img
                    alt="Partner Logo 5"
                    className="w-auto h-14"
                    src="/landing/Logo-5.svg"
                  />
                </div>
                <div className="flex justify-center items-center py-3">
                  <img
                    alt="Partner Logo 6"
                    className="w-auto h-14"
                    src="/landing/Logo-6.svg"
                  />
                </div>
                <div className="flex justify-center items-center py-3">
                  <img
                    alt="Partner Logo 7"
                    className="w-auto h-14"
                    src="/landing/Logo-7.svg"
                  />
                </div>
                <div className="flex justify-center items-center py-3">
                  <img
                    alt="Partner Logo 8"
                    className="w-auto h-14"
                    src="/landing/Logo-8.svg"
                  />
                </div>
                <div className="flex justify-center items-center py-3">
                  <img
                    alt="Partner Logo 9"
                    className="w-auto h-14"
                    src="/landing/Logo-9.svg"
                  />
                </div>
              </div>
              {/* Duplicate set for seamless loop */}
              <div className="flex items-center gap-8 sm:gap-12 lg:gap-16 flex-shrink-0">
                <div className="flex justify-center items-center py-3">
                  <img
                    alt="Partner Logo 5"
                    className="w-auto h-14"
                    src="/landing/Logo-5.svg"
                  />
                </div>
                <div className="flex justify-center items-center py-3">
                  <img
                    alt="Partner Logo 6"
                    className="w-auto h-14"
                    src="/landing/Logo-6.svg"
                  />
                </div>
                <div className="flex justify-center items-center py-3">
                  <img
                    alt="Partner Logo 7"
                    className="w-auto h-14"
                    src="/landing/Logo-7.svg"
                  />
                </div>
                <div className="flex justify-center items-center py-3">
                  <img
                    alt="Partner Logo 8"
                    className="w-auto h-14"
                    src="/landing/Logo-8.svg"
                  />
                </div>
                <div className="flex justify-center items-center py-3">
                  <img
                    alt="Partner Logo 9"
                    className="w-auto h-14"
                    src="/landing/Logo-9.svg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Partner;
