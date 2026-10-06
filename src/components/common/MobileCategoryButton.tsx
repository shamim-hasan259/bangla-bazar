"use client";

import React from "react";
import { Menu, ChevronDown } from "lucide-react";

const MobileCategoryButton = () => {
  const handleOpenCategories = () => {
    // Focus search or trigger hamburger menu dialog
    const mobileNavTrigger = document.querySelector('[aria-haspopup="dialog"]') as HTMLElement;
    if (mobileNavTrigger) {
      mobileNavTrigger.click();
    }
  };

  return (
    <button
      onClick={handleOpenCategories}
      className="w-full max-w-md h-10 rounded-full bg-gradient-to-r from-[#F85606] to-[#ff7e36] hover:opacity-95 transition-opacity flex items-center justify-center gap-2.5 text-white font-bold text-xs uppercase tracking-wider shadow-sm cursor-pointer border-none focus:outline-none"
    >
      <Menu className="w-4 h-4" />
      <span>Browse Categories</span>
      <ChevronDown className="w-3.5 h-3.5 opacity-80" />
    </button>
  );
};

export default MobileCategoryButton;
