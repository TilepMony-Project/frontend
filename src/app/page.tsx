'use client';

import Header from './components/landing/header';
import Hero from './components/landing/hero';
import Partner from './components/landing/partner';
import OurStrategies from './components/landing/our-strategies';
import Applications from './components/landing/applications';
import FAQ from './components/landing/faq';
import Footer from './components/landing/footer';

export default function LandingPage() {
  return (
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
  );
}
