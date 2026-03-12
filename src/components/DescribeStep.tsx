"use client";

import { useState } from "react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  loading: boolean;
}

const QUICK_TAGS = [
  { label: "Developer Portfolio", query: "developer portfolio modern minimal" },
  { label: "Creative Designer", query: "creative designer portfolio bold colorful artistic" },
  { label: "Business / Corporate", query: "business corporate professional SaaS" },
  { label: "Blog / Journal", query: "blog journal editorial content writing" },
  { label: "Freelancer", query: "freelancer personal brand services" },
  { label: "Photography", query: "photography portfolio visual gallery dark" },
  { label: "Startup Landing", query: "startup landing page product SaaS modern" },
  { label: "E-commerce", query: "ecommerce shop store product" },
  { label: "Restaurant / Food", query: "restaurant food dining warm organic" },
  { label: "Agency / Studio", query: "agency studio creative services bold" },
];

const STYLE_HINTS = [
  "dark mode", "minimalist", "glassmorphism", "brutalist", "retro vintage",
  "neon cyberpunk", "colorful playful", "elegant editorial", "nature organic",
];

export default function DescribeStep({ value, onChange, loading }: Props) {
  const [showHints, setShowHints] = useState(false);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Text area */}
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Describe your website — e.g. 'A modern developer portfolio with dark mode, showcasing full-stack projects and open source contributions'..."
          className="w-full h-36 p-5 rounded-2xl border border-line bg-white/[0.03] text-text placeholder:text-text-muted/50 focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent/20 transition-all resize-none text-sm leading-relaxed"
          disabled={loading}
        />
        {loading && (
          <div className="absolute inset-0 rounded-2xl bg-bg/50 flex items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-accent">
              <div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
              Generating design system...
            </div>
          </div>
        )}
      </div>

      {/* Quick tags */}
      <div className="mt-5">
        <p className="text-xs text-text-muted mb-2.5 font-medium">Quick start — click to fill:</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_TAGS.map((tag) => (
            <button
              key={tag.label}
              onClick={() => onChange(tag.query)}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded-lg border border-line bg-white/[0.02] text-text-muted hover:text-text hover:border-accent/30 hover:bg-accent/5 transition-all disabled:opacity-50"
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* Style hints */}
      <div className="mt-4">
        <button
          onClick={() => setShowHints(!showHints)}
          className="text-xs text-text-muted hover:text-accent flex items-center gap-1 transition-colors"
        >
          <svg className={`w-3 h-3 transition-transform ${showHints ? "rotate-90" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Add style keywords
        </button>
        {showHints && (
          <div className="flex flex-wrap gap-1.5 mt-2" style={{ animation: "fadeSlideUp 0.2s ease forwards" }}>
            {STYLE_HINTS.map((hint) => (
              <button
                key={hint}
                onClick={() => onChange(value ? `${value} ${hint}` : hint)}
                disabled={loading}
                className="text-xs px-2.5 py-1 rounded-md bg-accent/10 text-accent hover:bg-accent/20 transition-all disabled:opacity-50"
              >
                + {hint}
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-text-muted/60 mt-4 text-center">
        The AI will analyze your description and generate a complete design system — colors, typography, layout, and effects.
      </p>
    </div>
  );
}
