'use client';

import React from 'react';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingHero } from '@/components/landing/LandingHero';
import { LandingDevicePreview } from '@/components/landing/LandingDevicePreview';
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
        {/* 1. Hero Section */}
        <LandingHero />

        {/* 2. Interactive Phone Device Preview & Banner Placeholder */}
        <LandingDevicePreview />

        {/* 3. 3-Step Process (How It Works) */}
        <LandingHowItWorks />

        {/* 4. Features: The Basics vs The Advanced */}
        <LandingFeaturesMatrix />

        {/* 5. Clear Pricing Plans (Plan Gratis vs Plan Emprendedor) */}
        <LandingPricing />

        {/* 6. Frequently Asked Questions */}
        <LandingFAQ />
      </main>

      {/* Bottom Conversion Banner & Footer */}
      <LandingFooter />
    </div>
  );
}
