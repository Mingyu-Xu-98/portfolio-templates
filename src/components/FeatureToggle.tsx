"use client";

import React from "react";
import type { FeatureFlags } from "@/lib/types";
import { FEATURE_OPTIONS } from "@/lib/questions";

interface Props {
  features: FeatureFlags;
  onChange: (features: FeatureFlags) => void;
}

const ICONS: Record<string, React.ReactNode> = {
  message: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />,
  globe: <><circle cx="12" cy="12" r="9" strokeWidth={1.5} /><path strokeWidth={1.5} d="M3 12h18M12 3c2.5 2.5 4 5.5 4 9s-1.5 6.5-4 9c-2.5-2.5-4-5.5-4-9s1.5-6.5 4-9z" /></>,
  moon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />,
  sparkle: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />,
  terminal: <><rect x="3" y="4" width="18" height="16" rx="2" strokeWidth={1.5} /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 15h4M7 9l3 3-3 3" /></>,
  share: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />,
};

export default function FeatureToggle({ features, onChange }: Props) {
  const toggle = (key: string) => {
    onChange({ ...features, [key]: !features[key as keyof FeatureFlags] });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-3">
      {FEATURE_OPTIONS.map((opt, i) => {
        const enabled = features[opt.key as keyof FeatureFlags];
        return (
          <button
            key={opt.key}
            onClick={() => toggle(opt.key)}
            className={`
              w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-300
              ${enabled
                ? "border-accent bg-accent/5"
                : "border-line hover:border-accent/30 bg-white/[0.02]"
              }
            `}
            style={{ animationDelay: `${i * 60}ms`, animation: "fadeSlideUp 0.35s ease forwards", opacity: 0 }}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${enabled ? "bg-accent/20" : "bg-white/5"}`}>
              <svg className={`w-5 h-5 transition-colors ${enabled ? "text-accent" : "text-text-muted"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {ICONS[opt.icon] || ICONS.sparkle}
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold text-sm ${enabled ? "text-accent" : "text-text"}`}>{opt.label}</h3>
              <p className="text-xs text-text-muted">{opt.desc}</p>
            </div>
            {/* Toggle switch */}
            <div className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 ${enabled ? "bg-accent" : "bg-white/10"}`}>
              <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-5" : "translate-x-0"}`} />
            </div>
          </button>
        );
      })}
    </div>
  );
}
