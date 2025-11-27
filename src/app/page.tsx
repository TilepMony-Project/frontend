"use client";

import Applications from "./components/landing/applications";
import { DotPatternLinearGradient } from "./components/landing/dot-pattern-linear-gradient";
import FAQ from "./components/landing/faq";
import Footer from "./components/landing/footer";
import Header from "./components/landing/header";
import Hero from "./components/landing/hero";
import OurStrategies from "./components/landing/our-strategies";
import Partner from "./components/landing/partner";

export default function LandingPage() {
  return (
    <DotPatternLinearGradient>
    <div className="flex flex-col">
      {/* Header */}
      <Header />

      {/* Hero */}
      <Hero />

      {/* Partner */}
      <Partner />

      {/* Our Strategies */}
      <OurStrategies />

      {/* Applications */}
      <Applications />

      {/* FAQ */}
      <FAQ />

      {/* Footer */}
      <Footer />
    </div>
    </DotPatternLinearGradient>
  );
}
