"use client";

import React, { useRef, useEffect } from "react";

interface Props<T extends string> {
  options: {
    value: T;
    icon: string;
    label: string;
    desc: string;
    preview?: string;
  }[];
  selected: T | null;
  onSelect: (value: T) => void;
  customText?: string;
  onCustomTextChange?: (text: string) => void;
}

const ICONS: Record<string, React.ReactNode> = {
  briefcase: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />,
  star: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />,
  pencil: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />,
  rocket: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />,
  "style-cyber": <><path strokeLinecap="round" strokeWidth={1.5} d="M4 4h4l2 2h8v3" /><path strokeLinecap="round" strokeWidth={1.5} d="M20 20h-4l-2-2H6v-3" /><circle cx="12" cy="12" r="2" strokeWidth={1.5} /><path strokeLinecap="round" strokeWidth={1} d="M12 8v2M12 14v2M8 12h2M14 12h2" /></>,
  "style-minimal": <><rect x="6" y="6" width="12" height="12" strokeWidth={1.5} /><path strokeLinecap="round" strokeWidth={1.5} d="M9 12h6" /></>,
  "style-ghibli": <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 18c2-3 5-4 9-4s7 1 9 4" /><circle cx="8" cy="10" r="3" strokeWidth={1.5} /><circle cx="15" cy="8" r="4" strokeWidth={1.5} /><path strokeLinecap="round" strokeWidth={1.5} d="M12 21v-7" /></>,
  "style-glass": <><rect x="4" y="4" width="16" height="16" rx="4" strokeWidth={1.5} opacity={0.5} /><rect x="6" y="6" width="12" height="12" rx="3" strokeWidth={1.5} /><path strokeLinecap="round" strokeWidth={1.5} d="M6 10h12M10 6v12" opacity={0.3} /></>,
  "style-retro": <><rect x="4" y="5" width="16" height="14" rx="1" strokeWidth={1.5} /><circle cx="12" cy="12" r="3" strokeWidth={1.5} /><path strokeLinecap="round" strokeWidth={1.5} d="M4 8h16" /><circle cx="17" cy="6.5" r="0.5" fill="currentColor" /></>,
  "style-brutal": <><rect x="4" y="4" width="14" height="14" strokeWidth={2.5} /><rect x="6" y="6" width="14" height="14" strokeWidth={2.5} fill="none" /><path strokeLinecap="round" strokeWidth={2.5} d="M10 13h6" /></>,
  "style-cinema": <><rect x="2" y="6" width="20" height="12" rx="1" strokeWidth={1.5} /><path strokeLinecap="round" strokeWidth={1.5} d="M2 9h20M2 15h20" /><circle cx="12" cy="12" r="2" strokeWidth={1.5} /></>,
  "style-bold": <><path strokeLinecap="round" strokeWidth={2.5} d="M4 12h16" /><path strokeLinecap="round" strokeWidth={2.5} d="M8 7h12" /><path strokeLinecap="round" strokeWidth={2.5} d="M6 17h10" /><circle cx="5" cy="7" r="2" fill="currentColor" /></>,
  "style-editorial": <><path strokeLinecap="round" strokeWidth={1.5} d="M4 6h16M4 10h10M4 14h14M4 18h8" /><path strokeLinecap="round" strokeWidth={2} d="M4 4v16" /></>,
  "style-nature": <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21c-4-2-8-6-8-11 0-3 2-6 5-7 1.5-.5 3 0 3 0s1.5-.5 3 0c3 1 5 4 5 7 0 5-4 9-8 11z" /><path strokeLinecap="round" strokeWidth={1.5} d="M12 21v-8M9 15c1-1 2-2 3-4 1 2 2 3 3 4" /></>,
  "style-gradient": <><circle cx="8" cy="10" r="5" strokeWidth={1.5} opacity={0.6} /><circle cx="16" cy="14" r="5" strokeWidth={1.5} opacity={0.6} /><circle cx="12" cy="8" r="4" strokeWidth={1.5} opacity={0.6} /></>,
  "style-neotokyo": <><path strokeLinecap="round" strokeWidth={1.5} d="M6 20V8l3-4h6l3 4v12" /><path strokeLinecap="round" strokeWidth={1.5} d="M6 14h12" /><rect x="9" y="14" width="2" height="3" strokeWidth={1} /><rect x="13" y="14" width="2" height="3" strokeWidth={1} /><path strokeLinecap="round" strokeWidth={1.5} d="M3 20h18" /><circle cx="12" cy="10" r="1" fill="currentColor" /></>,
  "style-tpl-business": <><rect x="3" y="3" width="18" height="18" rx="3" strokeWidth={1.5} /><path strokeLinecap="round" strokeWidth={1.5} d="M3 9h18M9 9v12" /><circle cx="15" cy="14" r="2" strokeWidth={1.5} /></>,
  "style-tpl-ghibli": <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 18c2-3 5-4 9-4s7 1 9 4" /><circle cx="8" cy="10" r="3" strokeWidth={1.5} /><circle cx="15" cy="8" r="4" strokeWidth={1.5} /><path strokeLinecap="round" strokeWidth={1.5} d="M12 21v-7" /></>,
  "style-tpl-bold": <><rect x="3" y="3" width="18" height="18" strokeWidth={2.5} /><path strokeLinecap="round" strokeWidth={2.5} d="M8 9h8M8 13h5" /><circle cx="17" cy="17" r="3" strokeWidth={2} fill="currentColor" /></>,
  "style-tpl-dark": <><rect x="3" y="3" width="18" height="18" rx="9" strokeWidth={1.5} /><circle cx="12" cy="12" r="3" strokeWidth={1.5} /><path strokeLinecap="round" strokeWidth={1} d="M12 6v2M12 16v2M6 12h2M16 12h2" opacity={0.5} /></>,
  "layout-two": <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 4h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z" /><path strokeLinecap="round" strokeWidth={1.5} d="M15 4v16" /><path strokeLinecap="round" strokeWidth={1.5} d="M7 9h5M7 12h5" /></>,
  "layout-split": <><rect x="3" y="4" width="8" height="16" rx="1.5" strokeWidth={1.5} /><rect x="13" y="4" width="8" height="16" rx="1.5" strokeWidth={1.5} /></>,
  "layout-asym": <><rect x="3" y="4" width="6" height="16" rx="1.5" strokeWidth={1.5} /><rect x="11" y="4" width="10" height="9" rx="1.5" strokeWidth={1.5} /><rect x="11" y="15" width="10" height="5" rx="1.5" strokeWidth={1.5} /></>,
  "layout-f": <><path strokeLinecap="round" strokeWidth={1.5} d="M5 5h14M5 9h10M5 13h12M5 17h6" /><rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={1.5} /></>,
  "layout-z": <><path strokeLinecap="round" strokeWidth={1.5} d="M5 6h14M19 6L5 18M5 18h14" /><rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={1.5} /></>,
  "layout-bento": <><rect x="4" y="4" width="7" height="7" rx="1.5" strokeWidth={1.5} /><rect x="13" y="4" width="7" height="4" rx="1.5" strokeWidth={1.5} /><rect x="13" y="10" width="7" height="10" rx="1.5" strokeWidth={1.5} /><rect x="4" y="13" width="7" height="7" rx="1.5" strokeWidth={1.5} /></>,
  "layout-hero": <><rect x="3" y="3" width="18" height="9" rx="1.5" strokeWidth={1.5} /><path strokeLinecap="round" strokeWidth={1.5} d="M6 15h5M13 15h5M6 18h5M13 18h5" /></>,
  "layout-masonry": <><rect x="3" y="3" width="5" height="8" rx="1" strokeWidth={1.3} /><rect x="10" y="3" width="5" height="5" rx="1" strokeWidth={1.3} /><rect x="17" y="3" width="4" height="10" rx="1" strokeWidth={1.3} /><rect x="3" y="13" width="5" height="5" rx="1" strokeWidth={1.3} /><rect x="10" y="10" width="5" height="8" rx="1" strokeWidth={1.3} /><rect x="17" y="15" width="4" height="5" rx="1" strokeWidth={1.3} /></>,
  "layout-magazine": <><rect x="3" y="3" width="10" height="8" rx="1.5" strokeWidth={1.5} /><rect x="15" y="3" width="6" height="4" rx="1" strokeWidth={1.3} /><rect x="15" y="9" width="6" height="4" rx="1" strokeWidth={1.3} /><rect x="3" y="13" width="6" height="5" rx="1" strokeWidth={1.3} /><rect x="11" y="15" width="10" height="5" rx="1" strokeWidth={1.3} /><rect x="11" y="13" width="4" height="3" rx="1" strokeWidth={1.3} /></>,
  "layout-fixednav": <><rect x="3" y="3" width="18" height="3" rx="1" strokeWidth={1.5} fill="currentColor" opacity={0.2} /><path strokeLinecap="round" strokeWidth={1.5} d="M6 10h12M6 14h8M6 18h10" /></>,
  "layout-hiddennav": <><rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={1.5} /><path strokeLinecap="round" strokeWidth={2} d="M7 7h3M7 10h3M7 13h3" /></>,
  "layout-interactive": <><rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={1.5} /><circle cx="12" cy="12" r="3" strokeWidth={1.5} /><path strokeLinecap="round" strokeWidth={1.5} d="M12 6v3M12 15v3M6 12h3M15 12h3" /></>,
  message: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />,
  globe: <><circle cx="12" cy="12" r="9" strokeWidth={1.5} /><path strokeWidth={1.5} d="M3 12h18M12 3c2.5 2.5 4 5.5 4 9s-1.5 6.5-4 9c-2.5-2.5-4-5.5-4-9s1.5-6.5 4-9z" /></>,
  sparkle: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />,
  terminal: <><rect x="3" y="4" width="18" height="16" rx="2" strokeWidth={1.5} /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 15h4M7 9l3 3-3 3" /></>,
};

export default function QuestionCard<T extends string>({ options, selected, onSelect, customText, onCustomTextChange }: Props<T>) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isCustomSelected = selected === "custom";

  useEffect(() => {
    if (isCustomSelected && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isCustomSelected]);

  return (
    <div className="max-w-3xl mx-auto">
      <div className={`grid gap-4 ${options.length <= 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-3"}`}>
        {options.map((opt, i) => {
          const isSelected = selected === opt.value;
          const isCustom = opt.value === "custom";
          return (
            <button
              key={opt.value}
              onClick={() => onSelect(opt.value)}
              className={`
                group relative text-left p-5 rounded-2xl border-2 transition-all duration-300
                ${isCustom ? "border-dashed" : ""}
                ${isSelected
                  ? "border-accent bg-accent/5 shadow-lg shadow-accent/10"
                  : "border-line hover:border-accent/40 bg-white/[0.02] hover:bg-white/[0.04]"
                }
              `}
              style={{ animationDelay: `${i * 60}ms`, animation: "fadeSlideUp 0.35s ease forwards", opacity: 0 }}
            >
              {/* Selection indicator */}
              <div className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? "border-accent bg-accent" : "border-line"}`}>
                {isSelected && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>

              {/* Preview swatch */}
              {opt.preview && (
                <div className="w-full h-12 rounded-lg mb-3 border border-line" style={{ background: opt.preview }} />
              )}

              {/* Icon */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${isSelected ? "bg-accent/20" : "bg-white/5 group-hover:bg-accent/10"}`}>
                <svg className={`w-5 h-5 transition-colors ${isSelected ? "text-accent" : "text-text-muted group-hover:text-accent"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {ICONS[opt.icon] || ICONS.star}
                </svg>
              </div>

              <h3 className={`font-semibold text-sm mb-1 transition-colors ${isSelected ? "text-accent" : "text-text"}`}>
                {opt.label}
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">{opt.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Custom text input area - appears when "custom" is selected */}
      {isCustomSelected && onCustomTextChange && (
        <div
          className="mt-5 rounded-2xl border-2 border-accent/30 bg-accent/[0.03] p-5"
          style={{ animation: "fadeSlideUp 0.3s ease forwards" }}
        >
          <label className="block text-sm font-medium text-text mb-2">
            描述你的需求
          </label>
          <textarea
            ref={textareaRef}
            value={customText || ""}
            onChange={(e) => onCustomTextChange(e.target.value)}
            placeholder="例如：赛博朋克风格的简历网站，带有霓虹灯光效果和终端风格的首屏..."
            rows={3}
            className="w-full bg-white/[0.03] text-text text-sm px-4 py-3 rounded-xl border border-line focus:border-accent focus:outline-none placeholder:text-text-muted/50 resize-none leading-relaxed"
          />
          <p className="text-xs text-text-muted mt-2">
            你的描述将作为参考，系统会使用最匹配的模板作为起点。
          </p>
        </div>
      )}
    </div>
  );
}
