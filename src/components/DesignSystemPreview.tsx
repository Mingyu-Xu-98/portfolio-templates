"use client";

import { useState } from "react";
import type { DesignSystemData } from "@/lib/types";

interface Props {
  designSystem: DesignSystemData;
  onChange: (ds: DesignSystemData) => void;
}

export default function DesignSystemPreview({ designSystem, onChange }: Props) {
  const [editingColor, setEditingColor] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const ds = designSystem;

  const updateColor = (key: string, value: string) => {
    onChange({
      ...ds,
      colors: { ...ds.colors, [key]: value },
    });
  };

  const updateTypo = (key: string, value: string) => {
    onChange({
      ...ds,
      typography: { ...ds.typography, [key]: value },
    });
  };

  const mainColors: { key: keyof typeof ds.colors; label: string }[] = [
    { key: "primary", label: "Primary" },
    { key: "secondary", label: "Secondary" },
    { key: "accent", label: "Accent" },
    { key: "background", label: "Background" },
    { key: "foreground", label: "Text" },
    { key: "card", label: "Card" },
    { key: "muted", label: "Muted" },
    { key: "border", label: "Border" },
    { key: "destructive", label: "Destructive" },
  ];

  const isDark = isColorDark(ds.colors.background);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Style Summary Card */}
      <div
        className="rounded-2xl border border-line overflow-hidden"
        style={{ animation: "fadeSlideUp 0.4s ease forwards" }}
      >
        {/* Preview Header */}
        <div
          className="p-6 relative overflow-hidden"
          style={{
            background: ds.colors.background,
            color: ds.colors.foreground,
          }}
        >
          <div className="relative z-10">
            <h3
              className="text-2xl font-bold mb-1"
              style={{
                fontFamily: `'${ds.typography.headingFont}', sans-serif`,
                color: ds.colors.primary,
              }}
            >
              {ds.style.name || "Design Preview"}
            </h3>
            <p
              className="text-sm opacity-70"
              style={{ fontFamily: `'${ds.typography.bodyFont}', sans-serif` }}
            >
              {ds.style.bestFor || ds.style.keywords}
            </p>
          </div>
          {/* Accent bar */}
          <div
            className="absolute bottom-0 left-0 right-0 h-1"
            style={{
              background: `linear-gradient(to right, ${ds.colors.primary}, ${ds.colors.accent})`,
            }}
          />
        </div>

        {/* Pattern Info */}
        <div className="p-5 border-b border-line bg-white/[0.02]">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6z" />
            </svg>
            <span className="text-sm font-medium text-text">Layout Pattern</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <InfoItem label="Pattern" value={ds.pattern.name} />
            <InfoItem label="CTA" value={ds.pattern.ctaPlacement} />
            {ds.pattern.sections && (
              <div className="col-span-2">
                <InfoItem label="Sections" value={ds.pattern.sections} />
              </div>
            )}
          </div>
        </div>

        {/* Colors */}
        <div className="p-5 border-b border-line bg-white/[0.02]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" />
              </svg>
              <span className="text-sm font-medium text-text">Color Palette</span>
            </div>
            <span className="text-xs text-text-muted">Click to edit</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {mainColors.map(({ key, label }) => (
              <div key={key} className="relative group">
                <button
                  onClick={() => setEditingColor(editingColor === key ? null : key)}
                  className="w-full"
                >
                  <div
                    className="w-full h-10 rounded-lg border border-white/10 cursor-pointer transition-transform group-hover:scale-105"
                    style={{ backgroundColor: ds.colors[key] }}
                  />
                  <p className="text-[10px] text-text-muted mt-1 text-center truncate">{label}</p>
                  <p className="text-[10px] text-text-muted/60 text-center">{ds.colors[key]}</p>
                </button>
                {editingColor === key && (
                  <div className="absolute top-full left-0 z-20 mt-1 p-2 rounded-lg border border-line bg-bg shadow-xl" style={{ animation: "fadeSlideUp 0.15s ease forwards" }}>
                    <input
                      type="color"
                      value={ds.colors[key]}
                      onChange={(e) => updateColor(key, e.target.value)}
                      className="w-16 h-8 cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={ds.colors[key]}
                      onChange={(e) => updateColor(key, e.target.value)}
                      className="w-20 text-[10px] mt-1 p-1 rounded border border-line bg-transparent text-text text-center"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Color preview strip */}
          <div className="mt-3 flex rounded-lg overflow-hidden h-3">
            <div className="flex-1" style={{ backgroundColor: ds.colors.primary }} />
            <div className="flex-1" style={{ backgroundColor: ds.colors.secondary }} />
            <div className="flex-1" style={{ backgroundColor: ds.colors.accent }} />
            <div className="flex-1" style={{ backgroundColor: ds.colors.background }} />
            <div className="flex-1" style={{ backgroundColor: ds.colors.foreground }} />
          </div>
        </div>

        {/* Typography */}
        <div className="p-5 border-b border-line bg-white/[0.02]">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.068.157 2.148.279 3.238.364.466.037.893.281 1.153.671L12 21l2.652-3.978c.26-.39.687-.634 1.153-.671 1.09-.085 2.17-.207 3.238-.364 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
            <span className="text-sm font-medium text-text">Typography</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-text-muted block mb-1">Heading Font</label>
              <input
                type="text"
                value={ds.typography.headingFont}
                onChange={(e) => updateTypo("headingFont", e.target.value)}
                className="w-full text-sm p-2 rounded-lg border border-line bg-white/[0.03] text-text"
              />
              <p
                className="text-lg font-bold mt-2"
                style={{
                  fontFamily: `'${ds.typography.headingFont}', sans-serif`,
                  color: isDark ? "#fff" : "#000",
                }}
              >
                Aa Bb Cc 123
              </p>
            </div>
            <div>
              <label className="text-[10px] text-text-muted block mb-1">Body Font</label>
              <input
                type="text"
                value={ds.typography.bodyFont}
                onChange={(e) => updateTypo("bodyFont", e.target.value)}
                className="w-full text-sm p-2 rounded-lg border border-line bg-white/[0.03] text-text"
              />
              <p
                className="text-sm mt-2"
                style={{
                  fontFamily: `'${ds.typography.bodyFont}', sans-serif`,
                  color: isDark ? "#ccc" : "#333",
                }}
              >
                The quick brown fox jumps over the lazy dog.
              </p>
            </div>
          </div>
          {ds.typography.mood && (
            <p className="text-xs text-text-muted/60 mt-2">Mood: {ds.typography.mood}</p>
          )}
        </div>

        {/* Effects */}
        {ds.effects && (
          <div className="p-5 border-b border-line bg-white/[0.02]">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
              <span className="text-sm font-medium text-text">Effects & Animation</span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">{ds.effects}</p>
          </div>
        )}

        {/* Anti-patterns */}
        {ds.antiPatterns.length > 0 && (
          <div className="p-5 bg-white/[0.02]">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <span className="text-sm font-medium text-text">Avoid</span>
            </div>
            <ul className="space-y-1">
              {ds.antiPatterns.map((ap, i) => (
                <li key={i} className="text-xs text-red-400/80 flex items-start gap-1.5">
                  <span className="text-red-400 mt-0.5">x</span>
                  {ap}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Advanced: raw design vars */}
      {(ds.style.cssKeywords || ds.style.designVars) && (
        <div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs text-text-muted hover:text-accent flex items-center gap-1 transition-colors"
          >
            <svg className={`w-3 h-3 transition-transform ${showAdvanced ? "rotate-90" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Advanced: CSS keywords & variables
          </button>
          {showAdvanced && (
            <div className="mt-2 p-4 rounded-xl border border-line bg-white/[0.02] text-xs text-text-muted font-mono space-y-2" style={{ animation: "fadeSlideUp 0.2s ease forwards" }}>
              {ds.style.cssKeywords && (
                <div>
                  <span className="text-accent">CSS:</span> {ds.style.cssKeywords}
                </div>
              )}
              {ds.style.designVars && (
                <div>
                  <span className="text-accent">Vars:</span> {ds.style.designVars}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <span className="text-text-muted">{label}:</span>{" "}
      <span className="text-text">{value}</span>
    </div>
  );
}

function isColorDark(hex: string): boolean {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}
