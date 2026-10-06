"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface Step {
  id: number;
  badge?: string;
  orangeBadge?: string;
  title: string;
  subtitle: string;
  href?: string;
}

interface TopStepNavigationProps {
  activeStep: number;
  setActiveStep: (id: number) => void;
}

export default function TopStepNavigation({ activeStep, setActiveStep }: TopStepNavigationProps) {
  const router = useRouter();

  const steps: Step[] = [
    {
      id: 1,
      badge: "Listing New Products",
      title: "Find Best Products",
      subtitle: "Opportunity Items",
      href: "/dashboard/seller/products/opportunity-center",
    },
    {
      id: 2,
      orangeBadge: "Get first order",
      title: "Effective New Products",
      subtitle: "Trending New Products",
    },
    {
      id: 3,
      orangeBadge: "Accelerate Growth",
      title: "Potential Hero Products",
      subtitle: "High Demand, Quality Products",
    },
    {
      id: 4,
      badge: "Coming Soon",
      title: "Hero Product",
      subtitle: "Sales Driver",
    },
  ];

  const handleClick = (step: Step) => {
    if (step.href) {
      router.push(step.href);
    } else {
      setActiveStep(step.id);
    }
  };

  return (
    <div className="w-full bg-[#f4f6f9]">
      {/* মেইন কন্টেইনার ফ্লেক্সিবল রাখা হয়েছে যাতে চ্যাভরনগুলো গায়ে গায়ে লেগে থাকে */}
      <div className="flex flex-col md:flex-row w-full items-stretch gap-y-2 md:gap-y-0 bg-transparent">
        {steps.map((step, idx) => {
          const isActive = activeStep === step.id;

          // ১. ইমেজের মতো পারফেক্ট অ্যারো/চ্যাভরন শেপের ক্লিপ-পাথ (ডেস্কটপের জন্য)
          let clipClass = "md:[clip-path:polygon(0%_0%,_calc(100%_-_16px)_0%,_100%_50%,_calc(100%_-_16px)_100%,_0%_100%,_16px_50%)] md:mr-[-14px]";
          
          if (idx === 0) {
            // প্রথম কার্ড (বামে সোজা, ডানে তীর)
            clipClass = "md:[clip-path:polygon(0%_0%,_calc(100%_-_16px)_0%,_100%_50%,_calc(100%_-_16px)_100%,_0%_100%)] md:mr-[-14px] rounded-l-lg";
          } else if (idx === steps.length - 1) {
            // শেষ কার্ড (বামে তীর, ডানে সোজা)
            clipClass = "md:[clip-path:polygon(0%_0%,_100%_0%,_100%_100%,_0%_100%,_16px_50%)] rounded-r-lg";
          }

          return (
            <div
              key={step.id}
              onClick={() => handleClick(step)}
              className={`relative flex-1 cursor-pointer transition-all duration-150 select-none ${clipClass} ${
                isActive
                  ? "bg-[#FFF7F2] border border-[#1E60ED] md:border-none z-10"
                  : "bg-white hover:bg-gray-50"
              }`}
            >
              {/* ২. একটিভ কার্ডের চারপাশে নিখুঁত অরেঞ্জ বর্ডার (ক্লিপ-পাথ ফ্রেন্ডলি বর্ডার মিমিক) */}
              {isActive && (
                <div className="absolute inset-0 bg-[#1E60ED] -z-10 md:block hidden" style={{ padding: "1.5px" }}>
                  <div className={`w-full h-full bg-[#FFF7F2] ${clipClass}`} />
                </div>
              )}

              {/* ৩. কার্ডের ভেতরের কন্টেন্ট প্যাডিং ও পজিশন */}
              <div className="w-full h-full pt-4 pb-5 pl-8 pr-6 flex flex-col justify-center">
                
                {/* ব্যাজ সেকশন */}
                <div className="h-5 mb-1.5 flex items-center">
                  {step.badge && (
                    <span className="text-[11px] px-2 py-0.5 rounded border border-gray-100 bg-gray-50 text-gray-500 font-medium">
                      {step.badge}
                    </span>
                  )}
                  {step.orangeBadge && (
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
                        isActive
                          ? "bg-[#1E60ED] text-white"
                          : "bg-blue-50/50 border border-orange-100 text-[#1E60ED]"
                      }`}
                    >
                      {step.orangeBadge}
                    </span>
                  )}
                </div>

                {/* রেডিও ডট + টাইটেল */}
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                      isActive ? "border-[#1E60ED] bg-white" : "border-gray-300 bg-white"
                    }`}
                  >
                    {isActive && <div className="w-2 h-2 bg-[#1E60ED] rounded-full" />}
                  </div>
                  
                  <h3 className="font-bold text-[14px] text-gray-800 tracking-tight flex items-center gap-1.5">
                    {step.title}
                    {step.id === 3 && (
                      <span className="text-[12px] text-blue-500 hover:underline cursor-pointer font-normal">
                        Learn more
                      </span>
                    )}
                  </h3>
                </div>

                {/* সাবটাইটেল */}
                <p className="text-[11px] text-gray-400 ml-5 mt-0.5">
                  {step.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}