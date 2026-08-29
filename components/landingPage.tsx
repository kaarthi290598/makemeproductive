"use client";

import React from "react";
import { LandingHeader } from "./landing/landing-header";
import { LandingHero } from "./landing/landing-hero";
import { FeaturesBentoGrid } from "./landing/features-bento-grid";
import { WorkflowComparison } from "./landing/workflow-comparison";
import { LandingFaq } from "./landing/landing-faq";
import { LandingCta } from "./landing/landing-cta";
import { LandingFooter } from "./landing/landing-footer";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-white text-slate-900 transition-colors selection:bg-emerald-500/20 selection:text-emerald-700 dark:bg-[#090d16] dark:text-white dark:selection:text-emerald-300">
      {/* Header */}
      <LandingHeader />

      {/* Main Page Flow */}
      <main className="flex flex-col">
        {/* Hero Section with Live Mockup */}
        <LandingHero />

        {/* 6-in-1 Features Bento Grid */}
        <FeaturesBentoGrid />

        {/* Workflow Comparison (Old vs ToolCity) */}
        <WorkflowComparison />

        {/* Interactive FAQ */}
        <LandingFaq />

        {/* Bottom Conversion CTA */}
        <LandingCta />
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
