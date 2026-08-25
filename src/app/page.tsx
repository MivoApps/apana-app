'use client';

import React from 'react';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingHero } from '@/components/landing/LandingHero';
import { LandingTicker } from '@/components/landing/LandingTicker';
import { LandingDevicePreview } from '@/components/landing/LandingDevicePreview';
import { LandingStoreSimulator } from '@/components/landing/LandingStoreSimulator';
import { LandingHowItWorks } from '@/components/landing/LandingHowItWorks';
import { LandingFeaturesMatrix } from '@/components/landing/LandingFeaturesMatrix';
import { LandingPricing } from '@/components/landing/LandingPricing';
import { LandingFAQ } from '@/components/landing/LandingFAQ';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col selection:bg-[#6cf8bb] selection:text-[#006c49]">
      {/* Top Floating Glassmorphism Navbar */}
      <LandingNavbar />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* 1. Hero Section with Live Badges & Ambient Orbs */}
        <LandingHero />

        {/* 2. Infinite Continuous Marquee Ticker */}
        <LandingTicker />

        {/* 3. Interactive Phone Device Preview */}
        <LandingDevicePreview />

        {/* 4. Live Interactive Store & QR Code Simulator */}
        <div id="simulador">
          <LandingStoreSimulator />
        </div>

        {/* 5. 3-Step Process (How It Works) */}
        <LandingHowItWorks />

        {/* 6. Bento Grid Platform Capabilities */}
        <LandingFeaturesMatrix />

        {/* 7. Transparent Pricing Plans */}
        <LandingPricing />

        {/* 8. Frequently Asked Questions */}
        <LandingFAQ />
      </main>

      {/* Bottom Conversion Banner & Footer */}
      <LandingFooter />
    </div>
  );
}
