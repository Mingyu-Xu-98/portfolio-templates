"use client";

import { WIZARD_STEPS } from "@/lib/types";

interface Props {
  currentStep: number;
}

export default function StepIndicator({ currentStep }: Props) {
  return (
    <div className="flex items-center justify-center gap-1 py-6">
      {WIZARD_STEPS.map((step, vi) => {
        const isActive = vi === currentStep;
        const isDone = vi < currentStep;
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                  ${isActive ? "bg-accent text-white scale-110 shadow-lg shadow-accent/30" : ""}
                  ${isDone ? "bg-accent/20 text-accent" : ""}
                  ${!isActive && !isDone ? "bg-white/5 text-text-muted border border-line" : ""}
                `}
              >
                {isDone ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  vi + 1
                )}
              </div>
              <span
                className={`text-[10px] mt-1.5 whitespace-nowrap transition-colors duration-300 ${
                  isActive ? "text-accent font-medium" : "text-text-muted"
                }`}
              >
                {step.title}
              </span>
            </div>
            {vi < WIZARD_STEPS.length - 1 && (
              <div
                className={`w-8 h-0.5 mx-1 mt-[-14px] rounded-full transition-colors duration-300 ${
                  isDone ? "bg-accent/40" : "bg-line"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
