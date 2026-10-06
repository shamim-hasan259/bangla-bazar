"use client";
import { useState } from "react";

const VerificationSteps = ({ value }: { value: string }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    { title: "Verify your account" },
    { title: `Change the ${value}` },
  ];

  return (
    <div className="relative flex items-center justify-between">
      {/* Line connecting the steps */}
      <div className="absolute w-full h-[2px] bg-slate-800 transform z-0" />

      {steps.map((step, index) => (
        <div key={index} className="flex flex-col items-center">
          <p
            className={`z-10 py-2 px-4 rounded-full ${index === currentStep
                ? "bg-primary-seller text-gray-100"
                : "border border-slate-800 bg-background text-slate-800"
              }`}
          >
            {index + 1}
          </p>
          <p className="text-sm text-center absolute top-12 font-semibold">
            {step.title}
          </p>
        </div>
      ))}
    </div>
  );
};

export default VerificationSteps;
