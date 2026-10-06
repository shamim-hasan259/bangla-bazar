"use client";

import React, { useState } from "react";
import TopStepNavigation from "./components/TopStepNavigation";
import EffectiveNewProducts from "./components/EffectiveNewProducts";
import PotentialHeroProducts from "./components/PotentialHeroProducts";

export default function WorkbenchPage() {
  // ১ = Find Best Products, ২ = Effective New Products, ৩ = Potential Hero Products, ৪ = Hero Product
  const [activeStep, setActiveStep] = useState<number>(2);

  return (
    <div className="min-h-screen bg-[#f0f2f5]  text-[#2a354f]">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header Title */}
        <h1 className="text-2xl font-bold text-[#1e293b]">Assortment Growth Center</h1>

        {/* Top Stepper Component */}
        <TopStepNavigation activeStep={activeStep} setActiveStep={setActiveStep} />

        {/* Tab Content Render */}
        <div className="transition-all duration-300">
          {activeStep === 1 && (
            <div className="bg-white p-8 rounded-xl shadow-sm text-center border border-gray-100 text-gray-400">
              Find Best Products Content (Opportunity Items)
            </div>
          )}
          
          {activeStep === 2 && <EffectiveNewProducts />}
          
          {activeStep === 3 && <PotentialHeroProducts />}
          
          {activeStep === 4 && (
            <div className="bg-white p-8 rounded-xl shadow-sm text-center border border-gray-100 text-gray-400">
              Hero Product Content (Sales Driver)
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="pt-8 pb-4 flex justify-between text-xs text-gray-400 border-t border-gray-200/60">
          <div>Daraz 2026. All rights reserved.</div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-[#1E60ED]">Daraz University</a>
            <a href="#" className="hover:text-[#1E60ED]">Help Center</a>
            <a href="#" className="hover:text-[#1E60ED]">Daraz Seller App</a>
          </div>
        </footer>
      </div>
    </div>
  );
}