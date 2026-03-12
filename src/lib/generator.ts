import type { WorkspaceData, UserSelections, ThemeStyle, LayoutType, FeatureFlags, DesignIntelligence } from "./types";

/** Resolve "custom" selections to the closest preset for actual generation */
function resolveSelections(selections: UserSelections): { theme: ThemeStyle; layout: LayoutType } {
  const theme: ThemeStyle = selections.theme === "custom" ? "minimalist" : (selections.theme || "cyberpunk");
  const layout: LayoutType = selections.layout === "custom" ? "card-grid" : (selections.layout || "card-grid");
  return { theme, layout };
}

/** Map each layout to a rendering family for page template selection */
type LayoutFamily = "single" | "sidebar" | "grid" | "split";
const LAYOUT_FAMILY: Record<LayoutType, LayoutFamily> = {
  "two-column": "sidebar",
  "split-screen": "split",
  "asymmetric": "sidebar",
  "f-shape": "single",
  "z-shape": "single",
  "card-grid": "grid",
  "hero-media": "single",
  "masonry": "grid",
  "magazine": "grid",
  "fixed-nav": "single",
  "hidden-nav": "single",
  "interactive": "single",
  "custom": "single",
};

/**
 * Generate all website file contents as a Record<path, content>.
 * Pure function — no I/O side effects. Used both client-side and server-side.
 */
export function generateFileMap(
  data: WorkspaceData,
  selections: UserSelections,
  designIntel?: DesignIntelligence | null,
): Record<string, string> {
  const { theme, layout } = resolveSelections(selections);
  const features = selections.features;
  const files: Record<string, string> = {};

  // If we have design intelligence from ui-ux-pro-max, apply it to override colors/fonts
  const styleConfig = applyDesignIntelligence(theme, designIntel);

  files["package.json"] = genPackageJson();
  files["next.config.ts"] = `import type { NextConfig } from "next";\nconst nextConfig: NextConfig = {};\nexport default nextConfig;\n`;
  files["tsconfig.json"] = genTsConfig();
  files["postcss.config.mjs"] = `const config = { plugins: { "@tailwindcss/postcss": {} } };\nexport default config;\n`;
  files[".gitignore"] = "node_modules/\n.next/\n.env.local\n.DS_Store\n";

  // Build a custom-note header if user provided custom descriptions
  const customNotes: string[] = [];
  if (selections.siteType === "custom" && selections.customSiteType) customNotes.push(`Site type: ${selections.customSiteType}`);
  if (selections.layout === "custom" && selections.customLayout) customNotes.push(`Layout: ${selections.customLayout}`);
  if (selections.theme === "custom" && selections.customTheme) customNotes.push(`Theme: ${selections.customTheme}`);
  if (designIntel?.style?.category) customNotes.push(`Design Intelligence: ${designIntel.style.category}`);
  const customHeader = customNotes.length > 0
    ? `/* ==== DESIGN CONTEXT ====\n${customNotes.map(n => ` * ${n}`).join("\n")}\n * ======================== */\n\n`
    : "";

  files["src/app/layout.tsx"] = genLayout(data, theme, features, styleConfig);
  files["src/app/globals.css"] = customHeader + genGlobalCSS(theme, layout, features, styleConfig);
  files["src/app/page.tsx"] = genPage(data, layout, theme, features);
  files["src/i18n/translations.ts"] = genTranslations(data);
  files["src/components/LanguageProvider.tsx"] = genLanguageProvider();

  if (features.typewriter) files["src/components/TypewriterHero.tsx"] = genTypewriterHero();
  if (features.darkMode) files["src/components/ThemeToggle.tsx"] = genThemeToggle();
  if (features.chatbot) {
    files["src/components/ChatBot.tsx"] = genChatBot();
    files["src/app/api/chat/route.ts"] = genChatRoute(data);
  }
  if (features.share) {
    files["src/components/SharePoster.tsx"] = genSharePoster();
  }

  // Style-specific extra components
  if (theme === "cyberpunk") {
    files["src/components/ParticleBackground.tsx"] = genParticleBackground();
  }
  if (theme === "retro") {
    files["src/components/GrainOverlay.tsx"] = genGrainOverlay();
  }

  files["public/images/README.txt"] = "Place your project images and avatar.png here.\n";

  return files;
}

// ---- File generators ----

function genPackageJson(): string {
  return JSON.stringify({
    name: "my-resume",
    version: "1.0.0",
    type: "module",
    scripts: { dev: "next dev", build: "next build", start: "next start" },
    dependencies: {
      "@tailwindcss/postcss": "^4.2.1",
      "@types/node": "^25.4.0",
      "@types/react": "^19.2.14",
      next: "^16.1.6",
      postcss: "^8.5.8",
      react: "^19.2.4",
      "react-dom": "^19.2.4",
      qrcode: "^1.5.4",
      tailwindcss: "^4.2.1",
      typescript: "^5.9.3",
    },
  }, null, 2);
}

function genTsConfig(): string {
  return JSON.stringify({
    compilerOptions: {
      target: "ES2017", lib: ["dom", "dom.iterable", "esnext"],
      allowJs: true, skipLibCheck: true, strict: true, noEmit: true,
      esModuleInterop: true, module: "esnext", moduleResolution: "bundler",
      resolveJsonModule: true, isolatedModules: true, jsx: "preserve",
      incremental: true, plugins: [{ name: "next" }],
      paths: { "@/*": ["./src/*"] },
    },
    include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
    exclude: ["node_modules"],
  }, null, 2);
}

/** Return style-specific background JSX markup */
function getStyleBgMarkup(theme: ThemeStyle): string {
  switch (theme) {
    case "cyberpunk": return `<div className="cyber-grid" /><div className="scanlines" /><ParticleBackground />`;
    case "glassmorphism": return `<div className="glass-bg"><div className="blob blob-1" /><div className="blob blob-2" /><div className="blob blob-3" /></div>`;
    case "ghibli": return `<div className="ghibli-clouds" />`;
    case "retro": return `<GrainOverlay />`;
    case "cinematic": return `<div className="cinematic-bg" /><div className="letterbox-top" /><div className="letterbox-bottom" />`;
    case "bold-creative": return `<div className="bold-bg"><div className="shape shape-1" /><div className="shape shape-2" /><div className="shape shape-3" /></div>`;
    case "gradient-mesh": return `<div className="mesh-bg"><div className="blob blob-1" /><div className="blob blob-2" /><div className="blob blob-3" /></div>`;
    case "neo-tokyo": return `<div className="neotokyo-bg" />`;
    case "tpl-resume-bold": return `<div className="bold-resume-bg"><div className="shape shape-1" /><div className="shape shape-2" /><div className="shape shape-3" /></div>`;
    case "tpl-resume-dark": return `<div className="dark-resume-bg"><div className="blob blob-1" /><div className="blob blob-2" /><div className="blob blob-3" /></div>`;
    case "nature": return "";
    case "editorial": return "";
    default: return "";
  }
}

function genLayout(data: WorkspaceData, theme: ThemeStyle, features: FeatureFlags, resolved?: ResolvedStyle): string {
  const bgThemes = ["ghibli", "nature", "cinematic"];
  const bodyClassMap: Partial<Record<ThemeStyle, string>> = { ghibli: "ghibli-bg", nature: "nature-bg", cinematic: "cinematic-page-bg" };
  const bodyClass = bgThemes.includes(theme) ? (bodyClassMap[theme] || "") : "";
  const darkScript = features.darkMode ? `
      <script dangerouslySetInnerHTML={{ __html: \`
        (function(){var t=localStorage.getItem('theme');if(t)document.documentElement.setAttribute('data-theme',t);})();
      \`}} />` : "";

  // External fonts - prefer design intelligence fonts, fall back to defaults
  let fontLinks = "";
  if (resolved?.fontImport) {
    // Design intelligence provided a CSS @import, convert to <link> for <head>
    // Extract the URL from: @import url('...');
    const urlMatch = resolved.fontImport.match(/url\(['"]?([^'"]+)['"]?\)/);
    if (urlMatch) {
      fontLinks = `\n        <link href="${urlMatch[1]}" rel="stylesheet" />`;
    }
  }
  if (!fontLinks) {
    const fontMap: Partial<Record<ThemeStyle, string>> = {
      cyberpunk: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap",
      ghibli: "https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;700&display=swap",
      minimalist: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap",
      cinematic: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&family=Playfair+Display:wght@300;400;700&display=swap",
      "bold-creative": "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;900&display=swap",
      editorial: "https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap",
      nature: "https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700&display=swap",
      "gradient-mesh": "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap",
      "neo-tokyo": "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&family=JetBrains+Mono:wght@400;500&display=swap",
      "tpl-resume-bold": "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap",
      "tpl-resume-dark": "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap",
    };
    const url = fontMap[theme];
    if (url) fontLinks = `\n        <link href="${url}" rel="stylesheet" />`;
  }

  return `import type { Metadata } from "next";
import "./globals.css";
import LanguageProvider from "@/components/LanguageProvider";

export const metadata: Metadata = {
  title: "${data.name} - Resume",
  description: "${data.title}",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh" suppressHydrationWarning>${darkScript}
      <head>${fontLinks}
      </head>
      <body className="${bodyClass}">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
`;
}

// ---- CSS Generation ----

function genGlobalCSS(theme: ThemeStyle, layout: LayoutType, features: FeatureFlags, resolved?: ResolvedStyle): string {
  const config = resolved || applyDesignIntelligence(theme);
  // Font @import must come BEFORE @import "tailwindcss" (CSS spec: @import must precede all rules)
  const fontImportLine = config.fontImport ? `${config.fontImport}\n` : "";
  const base = `${fontImportLine}@import "tailwindcss";

@theme {
${Object.entries(config.colors).map(([k, v]) => `  --color-${k}: ${v};`).join("\n")}
  --font-sans: ${config.fontSans};
  --font-heading: ${config.fontHeading};
  --font-mono: "SF Mono", "Fira Code", Menlo, Consolas, monospace;
  --radius-card: ${config.borderRadius};
}
`;

  const lightTheme = features.darkMode ? genLightThemeOverride(theme) : "";

  const baseStyles = `
body {
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-sans);
  line-height: 1.6;
  overflow-x: hidden;${features.darkMode ? "\n  transition: background-color 0.4s ease, color 0.4s ease;" : ""}
}
::selection { background-color: var(--color-accent); color: white; }
html { scroll-behavior: smooth; }
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--color-text-muted); border-radius: 999px; }
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
`;

  const family = LAYOUT_FAMILY[layout] || "single";
  const isLeftAligned = family === "sidebar" || family === "split" || layout === "f-shape";
  const sectionHeading = `
.section-heading {
  font-size: 1.75rem; font-weight: 700;
  margin-bottom: 2.5rem;
  position: relative;
  padding-bottom: 0.75rem;${isLeftAligned ? "" : "\n  text-align: center;"}
}
.section-heading::after {
  content: "";
  position: absolute;
  bottom: 0; ${isLeftAligned ? "left: 0;" : "left: 50%; transform: translateX(-50%);"}
  width: 40px; height: 3px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--color-accent), var(--color-accent-alt));
}
`;

  const cardStyle = genCardStyle(theme);
  const layoutCSS = genLayoutCSS(layout, theme);
  const animationCSS = features.animations ? genAnimationCSS(theme) : "";
  const chatCSS = features.chatbot ? genChatCSS() : "";

  return base + lightTheme + baseStyles + sectionHeading + cardStyle + layoutCSS + animationCSS + chatCSS;
}

interface ResolvedStyle {
  colors: Record<string, string>;
  fontSans: string;
  fontHeading: string;
  fontImport: string;
  borderRadius: string;
}


/**
 * Merge hardcoded STYLE_CONFIG with DesignIntelligence from ui-ux-pro-max skill.
 */
function applyDesignIntelligence(
  theme: ThemeStyle,
  intel?: DesignIntelligence | null,
): ResolvedStyle {
  const base = STYLE_CONFIG[theme] || STYLE_CONFIG.minimalist;
  if (!intel) return { ...base, fontImport: "" };
  const colors = { ...base.colors };
  const t = intel.typography;
  let fontSans = base.fontSans;
  let fontHeading = base.fontHeading;
  let fontImport = "";

  if (t?.bodyFont) {
    fontSans = `"${t.bodyFont}", ${base.fontSans}`;
  }
  if (t?.headingFont) {
    fontHeading = `"${t.headingFont}", ${base.fontHeading}`;
  }
  if (t?.cssImport) {
    fontImport = t.cssImport;
  }

  return { colors, fontSans, fontHeading, fontImport, borderRadius: base.borderRadius };
}

const STYLE_CONFIG: Record<ThemeStyle, {
  colors: Record<string, string>;
  fontSans: string;
  fontHeading: string;
  borderRadius: string;
}> = {
  cyberpunk: {
    colors: {
      bg: "#0a0a1a", "bg-card": "rgba(10,15,30,0.7)", "bg-card-solid": "#0e1225",
      "bg-tag": "rgba(0,255,240,0.08)", text: "#e0e8f0", "text-muted": "#6b7fa0",
      accent: "#00fff0", "accent-soft": "rgba(0,255,240,0.1)", "accent-alt": "#ff00ff",
      line: "rgba(0,255,240,0.12)", green: "#00ff88",
    },
    fontSans: '"JetBrains Mono", "Fira Code", "SF Mono", Menlo, monospace',
    fontHeading: '"JetBrains Mono", "Fira Code", monospace',
    borderRadius: "4px",
  },
  minimalist: {
    colors: {
      bg: "#ffffff", "bg-card": "#f8f8f8", "bg-card-solid": "#f5f5f5",
      "bg-tag": "rgba(0,0,0,0.04)", text: "#111111", "text-muted": "#888888",
      accent: "#111111", "accent-soft": "rgba(0,0,0,0.04)", "accent-alt": "#555555",
      line: "rgba(0,0,0,0.08)", green: "#111111",
    },
    fontSans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, sans-serif',
    fontHeading: '"Inter", -apple-system, sans-serif',
    borderRadius: "2px",
  },
  ghibli: {
    colors: {
      bg: "#f5efe6", "bg-card": "rgba(255,253,247,0.78)", "bg-card-solid": "#fffdf7",
      "bg-tag": "rgba(125,155,95,0.12)", text: "#3d3929", "text-muted": "#8a7f6e",
      accent: "#7d9b5f", "accent-soft": "rgba(125,155,95,0.15)", "accent-alt": "#e8a87c",
      line: "rgba(139,119,90,0.18)", green: "#7d9b5f",
    },
    fontSans: '"Noto Serif SC", Georgia, "Times New Roman", serif',
    fontHeading: '"Noto Serif SC", Georgia, serif',
    borderRadius: "20px",
  },
  glassmorphism: {
    colors: {
      bg: "#0f0720", "bg-card": "rgba(255,255,255,0.08)", "bg-card-solid": "rgba(30,20,60,0.9)",
      "bg-tag": "rgba(139,92,246,0.12)", text: "#f0e8ff", "text-muted": "#a090c0",
      accent: "#8b5cf6", "accent-soft": "rgba(139,92,246,0.15)", "accent-alt": "#f093fb",
      line: "rgba(255,255,255,0.1)", green: "#34d399",
    },
    fontSans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontHeading: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    borderRadius: "20px",
  },
  retro: {
    colors: {
      bg: "#f4e8c1", "bg-card": "rgba(244,232,193,0.8)", "bg-card-solid": "#efe0b8",
      "bg-tag": "rgba(160,82,45,0.1)", text: "#2d2d2d", "text-muted": "#6b5b4b",
      accent: "#c0392b", "accent-soft": "rgba(192,57,43,0.1)", "accent-alt": "#d4881c",
      line: "rgba(100,80,50,0.2)", green: "#27ae60",
    },
    fontSans: 'Georgia, "Times New Roman", "Noto Serif SC", serif',
    fontHeading: '"Courier New", Courier, monospace',
    borderRadius: "2px",
  },
  brutalist: {
    colors: {
      bg: "#ffffff", "bg-card": "#ffffff", "bg-card-solid": "#ffffff",
      "bg-tag": "#000000", text: "#000000", "text-muted": "#333333",
      accent: "#ff0000", "accent-soft": "rgba(255,0,0,0.08)", "accent-alt": "#0000ff",
      line: "#000000", green: "#000000",
    },
    fontSans: 'Arial, Helvetica, sans-serif',
    fontHeading: '"Arial Black", "Impact", sans-serif',
    borderRadius: "0px",
  },
  cinematic: {
    colors: {
      bg: "#0a0a14", "bg-card": "rgba(26,26,46,0.85)", "bg-card-solid": "#1a1a2e",
      "bg-tag": "rgba(233,69,96,0.1)", text: "#e8e0d4", "text-muted": "#7a7580",
      accent: "#e94560", "accent-soft": "rgba(233,69,96,0.12)", "accent-alt": "#c9a96e",
      line: "rgba(233,69,96,0.12)", green: "#c9a96e",
    },
    fontSans: '"DM Sans", -apple-system, BlinkMacSystemFont, sans-serif',
    fontHeading: '"Playfair Display", Georgia, serif',
    borderRadius: "4px",
  },
  "bold-creative": {
    colors: {
      bg: "#fffbeb", "bg-card": "#ffffff", "bg-card-solid": "#fff5d6",
      "bg-tag": "rgba(255,107,107,0.12)", text: "#1a1a2e", "text-muted": "#666666",
      accent: "#ff6b6b", "accent-soft": "rgba(255,107,107,0.1)", "accent-alt": "#4d96ff",
      line: "rgba(0,0,0,0.08)", green: "#6bcb77",
    },
    fontSans: '"Space Grotesk", -apple-system, sans-serif',
    fontHeading: '"Space Grotesk", Impact, sans-serif',
    borderRadius: "16px",
  },
  editorial: {
    colors: {
      bg: "#faf9f6", "bg-card": "#ffffff", "bg-card-solid": "#f5f2ec",
      "bg-tag": "rgba(120,100,80,0.08)", text: "#2c2c2c", "text-muted": "#8a8078",
      accent: "#b8860b", "accent-soft": "rgba(184,134,11,0.08)", "accent-alt": "#6b4e3d",
      line: "rgba(120,100,80,0.15)", green: "#6b4e3d",
    },
    fontSans: '"Libre Baskerville", Georgia, "Times New Roman", serif',
    fontHeading: '"Playfair Display", Georgia, serif',
    borderRadius: "2px",
  },
  nature: {
    colors: {
      bg: "#f0ebe3", "bg-card": "rgba(255,252,245,0.85)", "bg-card-solid": "#f5f0e8",
      "bg-tag": "rgba(45,80,22,0.1)", text: "#2d3a1e", "text-muted": "#6b7a5e",
      accent: "#2d5016", "accent-soft": "rgba(45,80,22,0.1)", "accent-alt": "#c4a882",
      line: "rgba(45,80,22,0.15)", green: "#5a7247",
    },
    fontSans: '"Nunito", -apple-system, BlinkMacSystemFont, sans-serif',
    fontHeading: '"Nunito", -apple-system, sans-serif',
    borderRadius: "24px",
  },
  "gradient-mesh": {
    colors: {
      bg: "#0f0f1a", "bg-card": "rgba(255,255,255,0.06)", "bg-card-solid": "rgba(20,15,40,0.9)",
      "bg-tag": "rgba(161,140,209,0.15)", text: "#f0eaf8", "text-muted": "#a090c0",
      accent: "#a18cd1", "accent-soft": "rgba(161,140,209,0.12)", "accent-alt": "#ff9a9e",
      line: "rgba(255,255,255,0.08)", green: "#96fbc4",
    },
    fontSans: '"Plus Jakarta Sans", -apple-system, sans-serif',
    fontHeading: '"Plus Jakarta Sans", -apple-system, sans-serif',
    borderRadius: "16px",
  },
  "neo-tokyo": {
    colors: {
      bg: "#0d0d0d", "bg-card": "rgba(26,10,46,0.8)", "bg-card-solid": "#1a0a2e",
      "bg-tag": "rgba(255,46,99,0.1)", text: "#e0d8f0", "text-muted": "#7a6b90",
      accent: "#ff2e63", "accent-soft": "rgba(255,46,99,0.12)", "accent-alt": "#08d9d6",
      line: "rgba(255,46,99,0.15)", green: "#08d9d6",
    },
    fontSans: '"Noto Sans JP", "JetBrains Mono", sans-serif',
    fontHeading: '"Noto Sans JP", "JetBrains Mono", sans-serif',
    borderRadius: "4px",
  },
  "tpl-business": {
    colors: {
      bg: "#0a0a1a", "bg-card": "rgba(26,16,64,0.7)", "bg-card-solid": "#1a1040",
      "bg-tag": "rgba(108,99,255,0.1)", text: "#e0e0f0", "text-muted": "#8080a0",
      accent: "#6c63ff", "accent-soft": "rgba(108,99,255,0.12)", "accent-alt": "#a855f7",
      line: "rgba(108,99,255,0.15)", green: "#22d3ee",
    },
    fontSans: '"Inter", -apple-system, sans-serif',
    fontHeading: '"Inter", -apple-system, sans-serif',
    borderRadius: "12px",
  },
"tpl-resume-bold": {
    colors: {
      bg: "#FDF2F8", "bg-card": "#ffffff", "bg-card-solid": "#ffffff",
      "bg-tag": "rgba(236,72,153,0.08)", text: "#1a1a1a", "text-muted": "#6b7280",
      accent: "#EC4899", "accent-soft": "rgba(236,72,153,0.1)", "accent-alt": "#0891B2",
      line: "rgba(0,0,0,0.12)", green: "#0891B2",
    },
    fontSans: '"Inter", -apple-system, sans-serif',
    fontHeading: '"Inter", -apple-system, sans-serif',
    borderRadius: "0px",
  },
  "tpl-resume-dark": {
    colors: {
      bg: "#050506", "bg-card": "rgba(17,17,24,0.8)", "bg-card-solid": "#111118",
      "bg-tag": "rgba(94,106,210,0.1)", text: "#e0e0e8", "text-muted": "#6b6b80",
      accent: "#5E6AD2", "accent-soft": "rgba(94,106,210,0.12)", "accent-alt": "#8b5cf6",
      line: "rgba(94,106,210,0.12)", green: "#34d399",
    },
    fontSans: '"Inter", -apple-system, sans-serif',
    fontHeading: '"Inter", -apple-system, sans-serif',
    borderRadius: "999px",
  },
  custom: {
    colors: {
      bg: "#ffffff", "bg-card": "#f8f8f8", "bg-card-solid": "#f5f5f5",
      "bg-tag": "rgba(0,0,0,0.04)", text: "#111111", "text-muted": "#888888",
      accent: "#111111", "accent-soft": "rgba(0,0,0,0.04)", "accent-alt": "#555555",
      line: "rgba(0,0,0,0.08)", green: "#111111",
    },
    fontSans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontHeading: '-apple-system, sans-serif',
    borderRadius: "12px",
  },
};

function genLightThemeOverride(theme: ThemeStyle): string {
  // Light themes don't need an override
  const lightThemes: ThemeStyle[] = ["ghibli", "minimalist", "retro", "brutalist", "bold-creative", "editorial", "nature", "tpl-resume-bold"];
  if (lightThemes.includes(theme)) return "";
  return `
[data-theme="light"] {
  --color-bg: #f0f0f8 !important;
  --color-bg-card: rgba(255,255,255,0.7) !important;
  --color-bg-card-solid: #ffffff !important;
  --color-bg-tag: rgba(108,99,255,0.08) !important;
  --color-text: #1a1a2e !important;
  --color-text-muted: #6b7280 !important;
  --color-line: rgba(0,0,0,0.08) !important;
}
`;
}

function genCardStyle(theme: ThemeStyle): string {
  switch (theme) {
    case "cyberpunk":
      return `
.card {
  background: var(--color-bg-card);
  backdrop-filter: blur(12px);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-card);
  overflow: hidden;
  position: relative;
  transition: border-color 0.3s, box-shadow 0.3s;
}
.card:hover {
  border-color: var(--color-accent);
  box-shadow: 0 0 20px rgba(0,255,240,0.15), inset 0 0 20px rgba(0,255,240,0.03);
}
.card::after {
  content: "";
  position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, var(--color-accent), transparent);
  opacity: 0; transition: opacity 0.3s;
}
.card:hover::after { opacity: 1; }
`;
    case "minimalist":
      return `
.card {
  background: transparent;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-card);
  overflow: hidden;
  position: relative;
  transition: border-color 0.3s;
}
.card:hover { border-color: var(--color-text); }
`;
    case "ghibli":
      return `
.card {
  background: var(--color-bg-card);
  backdrop-filter: blur(8px) saturate(1.2);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-card);
  box-shadow: 0 2px 12px rgba(139,119,90,0.08);
  overflow: hidden;
  position: relative;
  transition: transform 0.4s cubic-bezier(0.4,0,0.2,1), box-shadow 0.4s ease;
}
.card:hover {
  transform: translateY(-4px) rotate(-0.5deg);
  box-shadow: 0 12px 32px rgba(139,119,90,0.14);
}
`;
    case "glassmorphism":
      return `
.card {
  background: rgba(255,255,255,0.06);
  backdrop-filter: blur(20px) saturate(1.4);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: var(--radius-card);
  overflow: hidden;
  position: relative;
  transition: transform 0.4s, border-color 0.4s, box-shadow 0.4s;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
}
.card:hover {
  transform: translateY(-4px);
  border-color: rgba(255,255,255,0.2);
  box-shadow: 0 16px 48px rgba(139,92,246,0.15);
}
.card::before {
  content: "";
  position: absolute; inset: 0;
  border-radius: inherit;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%);
  pointer-events: none; z-index: 1;
}
`;
    case "retro":
      return `
.card {
  background: var(--color-bg-card);
  border: 2px solid var(--color-line);
  border-radius: var(--radius-card);
  overflow: hidden;
  position: relative;
  box-shadow: 4px 4px 0 var(--color-line);
  transition: transform 0.2s, box-shadow 0.2s;
}
.card:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 var(--color-line);
}
`;
    case "brutalist":
      return `
.card {
  background: var(--color-bg-card);
  border: 3px solid var(--color-text);
  border-radius: 0;
  overflow: hidden;
  position: relative;
  box-shadow: 6px 6px 0 var(--color-text);
  transition: transform 0.15s, box-shadow 0.15s;
}
.card:hover {
  transform: translate(-3px, -3px);
  box-shadow: 9px 9px 0 var(--color-text);
}
`;
    case "cinematic":
      return `
.card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-card);
  overflow: hidden;
  position: relative;
  transition: transform 0.5s cubic-bezier(0.25,0.1,0.25,1), box-shadow 0.5s;
  box-shadow: 0 4px 20px rgba(0,0,0,0.4);
}
.card:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 40px rgba(233,69,96,0.15), 0 4px 20px rgba(0,0,0,0.4);
}
.card::after {
  content: "";
  position: absolute; inset: 0;
  background: linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.5));
  pointer-events: none; z-index: 1;
}
`;
    case "bold-creative":
      return `
.card {
  background: var(--color-bg-card);
  border: 3px solid var(--color-text);
  border-radius: var(--radius-card);
  overflow: hidden;
  position: relative;
  transition: transform 0.3s, background 0.3s;
}
.card:hover {
  transform: rotate(-1deg) scale(1.03);
  background: var(--color-accent-soft);
}
`;
    case "editorial":
      return `
.card {
  background: var(--color-bg-card);
  border-bottom: 2px solid var(--color-line);
  border-radius: 0;
  overflow: hidden;
  position: relative;
  padding-bottom: 1rem;
  transition: border-color 0.3s;
}
.card:hover {
  border-color: var(--color-accent);
}
`;
    case "nature":
      return `
.card {
  background: var(--color-bg-card);
  backdrop-filter: blur(6px);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-card);
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 16px rgba(45,80,22,0.06);
  transition: transform 0.4s cubic-bezier(0.4,0,0.2,1), box-shadow 0.4s;
}
.card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 40px rgba(45,80,22,0.12);
}
`;
    case "gradient-mesh":
      return `
.card {
  background: rgba(255,255,255,0.04);
  backdrop-filter: blur(24px) saturate(1.3);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: var(--radius-card);
  overflow: hidden;
  position: relative;
  transition: transform 0.4s, border-color 0.4s, box-shadow 0.4s;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
}
.card:hover {
  transform: translateY(-4px);
  border-color: rgba(161,140,209,0.3);
  box-shadow: 0 16px 48px rgba(161,140,209,0.15);
}
.card::before {
  content: "";
  position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(161,140,209,0.05) 0%, rgba(255,154,158,0.05) 100%);
  pointer-events: none; z-index: 1;
}
`;
    case "neo-tokyo":
      return `
.card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-card);
  overflow: hidden;
  position: relative;
  transition: border-color 0.3s, box-shadow 0.3s;
}
.card:hover {
  border-color: var(--color-accent);
  box-shadow: 0 0 24px rgba(255,46,99,0.2), 0 0 48px rgba(8,217,214,0.08);
}
.card::after {
  content: "";
  position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, var(--color-accent), var(--color-accent-alt));
  opacity: 0; transition: opacity 0.3s;
}
.card:hover::after { opacity: 1; }
`;
    case "tpl-resume-bold":
      return `
.card {
  background: var(--color-bg-card);
  border: 3px solid var(--color-text);
  border-radius: 0;
  overflow: hidden;
  position: relative;
  box-shadow: 6px 6px 0 var(--color-accent);
  transition: transform 0.2s, box-shadow 0.2s;
}
.card:hover {
  transform: translate(-3px, -3px);
  box-shadow: 9px 9px 0 var(--color-accent), 12px 12px 0 var(--color-accent-alt);
}
.card::before {
  content: "";
  position: absolute; top: 0; left: 0; width: 4px; height: 100%;
  background: linear-gradient(180deg, var(--color-accent), var(--color-accent-alt));
  z-index: 2;
}
`;
    case "tpl-resume-dark":
      return `
.card {
  background: var(--color-bg-card);
  backdrop-filter: blur(20px) saturate(1.3);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-card);
  overflow: hidden;
  position: relative;
  transition: transform 0.4s, border-color 0.4s, box-shadow 0.4s;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
}
.card:hover {
  transform: translateY(-4px);
  border-color: var(--color-accent);
  box-shadow: 0 16px 48px rgba(94,106,210,0.2), 0 0 0 1px var(--color-accent);
}
.card::after {
  content: "";
  position: absolute; inset: 0;
  border-radius: inherit;
  background: linear-gradient(135deg, rgba(94,106,210,0.05) 0%, transparent 50%);
  pointer-events: none; z-index: 1;
}
`;
    default:
      return `
.card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-card);
  overflow: hidden;
  position: relative;
  transition: transform 0.3s, box-shadow 0.3s;
}
.card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
`;
  }
}

function genLayoutCSS(layout: LayoutType, theme: ThemeStyle = "minimalist"): string {
  const family = LAYOUT_FAMILY[layout] || "single";

  // ---- Sidebar family (two-column, asymmetric) ----
  if (family === "sidebar") {
    const sidebarWidth = layout === "asymmetric" ? "28%" : "35%";
    return `
.two-column-layout { display: flex; min-height: 100vh; }
.sidebar-panel {
  width: ${sidebarWidth}; max-width: ${layout === "asymmetric" ? "320px" : "400px"}; min-width: 280px;
  position: sticky; top: 0; height: 100vh;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 2rem 1.5rem;
}
.sidebar-card {
  background: var(--color-bg-card);
  backdrop-filter: blur(16px) saturate(1.4);
  border: 1px solid var(--color-line);
  border-radius: 24px;
  padding: 2.5rem 2rem;
  box-shadow: 0 4px 24px rgba(0,0,0,0.06);
  text-align: center;
  width: 100%;
}
.content-panel { flex: 1; padding: 3rem 2.5rem; min-height: 100vh; }
.sidebar-nav-link {
  font-size: 0.95rem; font-weight: 500;
  color: var(--color-text-muted);
  transition: color 0.3s; text-decoration: none;
  padding: 0.35rem 0; display: block;
}
.sidebar-nav-link:hover { color: var(--color-accent); }
${layout === "asymmetric" ? `.content-panel .card:nth-child(even) { transform: translateY(24px); }
.content-panel .card:nth-child(even):hover { transform: translateY(20px); }` : ""}
@media (max-width: 768px) {
  .two-column-layout { flex-direction: column; }
  .sidebar-panel { width: 100%; max-width: none; min-width: 0; height: auto; position: relative; padding: 1.5rem; }
  .content-panel { padding: 1.5rem; }
  .content-panel .card:nth-child(even) { transform: none; }
}
`;
  }

  // ---- Split family (split-screen) ----
  if (family === "split") {
    return `
.split-layout { display: flex; min-height: 100vh; }
.split-left {
  width: 50%; position: sticky; top: 0; height: 100vh;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 3rem;
  background: var(--color-bg-card);
  border-right: 1px solid var(--color-line);
}
.split-right { width: 50%; padding: 3rem; overflow-y: auto; }
@media (max-width: 768px) {
  .split-layout { flex-direction: column; }
  .split-left { width: 100%; height: auto; position: relative; border-right: none; border-bottom: 1px solid var(--color-line); padding: 2rem; }
  .split-right { width: 100%; padding: 1.5rem; }
}
`;
  }

  // ---- Grid family (card-grid, masonry, magazine) ----
  if (family === "grid") {
    if (layout === "masonry") {
      return `
.masonry-grid { columns: 3; column-gap: 20px; }
.masonry-grid > * { break-inside: avoid; margin-bottom: 20px; }
@media (max-width: 768px) { .masonry-grid { columns: 1; } }
`;
    }
    if (layout === "magazine") {
      return `
.magazine-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: auto auto;
  gap: 20px;
}
.magazine-feature { grid-row: span 2; }
.magazine-sidebar { display: flex; flex-direction: column; gap: 20px; }
@media (max-width: 768px) {
  .magazine-grid { grid-template-columns: 1fr; }
  .magazine-feature { grid-row: span 1; }
}
`;
    }
    // card-grid (bento)
    return `
.bento-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
.bento-wide { grid-column: span 2; }
@media (max-width: 768px) {
  .bento-grid { grid-template-columns: 1fr; }
  .bento-wide { grid-column: span 1; }
}
`;
  }

  // ---- Single family variations ----
  let extra = "";

  if (layout === "z-shape") {
    extra = `
.zigzag-section { max-width: 1100px; margin: 0 auto; }
.zigzag-section:nth-child(even) .zigzag-inner { flex-direction: row-reverse; }
.zigzag-inner { display: flex; align-items: center; gap: 3rem; }
.zigzag-inner > * { flex: 1; }
@media (max-width: 768px) {
  .zigzag-inner, .zigzag-section:nth-child(even) .zigzag-inner { flex-direction: column; }
}
`;
  }

  if (layout === "hero-media") {
    const isImageStyle = ["ghibli", "nature", "cinematic"].includes(theme);
    extra = `
.hero-media {
  width: 100%; min-height: ${isImageStyle ? "70vh" : "60vh"};
  display: flex; align-items: center; justify-content: center;
  position: relative; overflow: hidden;
  background: linear-gradient(135deg, var(--color-bg-card) 0%, var(--color-bg) 100%);
  background-image: url('/images/hero-bg.png');
  background-size: cover; background-position: center;
}
.hero-media-overlay {
  position: absolute; inset: 0;
  background: ${isImageStyle
    ? "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, var(--color-bg) 90%)"
    : "linear-gradient(to bottom, transparent 20%, var(--color-bg) 100%)"};
  z-index: 1;
}
.hero-media-content { position: relative; z-index: 2; text-align: center; padding: 2rem; }
`;
  }

  if (layout === "hidden-nav") {
    extra = `
.hamburger { display: flex; flex-direction: column; gap: 5px; cursor: pointer; padding: 8px; z-index: 100; }
.hamburger span { display: block; width: 24px; height: 2px; background: var(--color-text); transition: all 0.3s; border-radius: 2px; }
.mobile-menu {
  position: fixed; inset: 0; background: var(--color-bg); z-index: 90;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2rem;
  opacity: 0; pointer-events: none; transition: opacity 0.3s;
}
.mobile-menu.open { opacity: 1; pointer-events: all; }
.mobile-menu a { font-size: 1.5rem; font-weight: 600; color: var(--color-text); text-decoration: none; }
.mobile-menu a:hover { color: var(--color-accent); }
`;
  }

  if (layout === "interactive") {
    extra = `
.scroll-section {
  opacity: 0; transform: translateY(40px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}
.scroll-section.visible { opacity: 1; transform: translateY(0); }
.parallax-bg {
  position: fixed; inset: 0; z-index: 0;
  background: radial-gradient(ellipse at 30% 50%, var(--color-accent-soft) 0%, transparent 60%);
  pointer-events: none;
}
`;
  }

  if (layout === "f-shape") {
    extra = `
.f-layout { max-width: 900px; margin: 0 auto; }
.f-layout .section-heading { text-align: left; }
.f-layout .section-heading::after { left: 0; transform: none; }
`;
  }

  if (layout === "fixed-nav") {
    extra = `
.fixed-top-nav {
  position: sticky; top: 0; z-index: 50;
  background: var(--color-bg-card); backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--color-line);
  padding: 0 2rem;
}
.fixed-top-nav ul {
  display: flex; gap: 2rem; list-style: none;
  max-width: 1100px; margin: 0 auto; padding: 0;
  height: 56px; align-items: center;
}
.fixed-top-nav a {
  font-size: 0.9rem; font-weight: 600; color: var(--color-text-muted);
  text-decoration: none; transition: color 0.3s;
  padding: 4px 0; border-bottom: 2px solid transparent;
}
.fixed-top-nav a:hover, .fixed-top-nav a.active {
  color: var(--color-accent); border-bottom-color: var(--color-accent);
}
`;
  }

  return extra;
}

function genAnimationCSS(theme: ThemeStyle): string {
  // Style-specific background effects
  let bgEffects = "";
  if (theme === "cyberpunk") {
    bgEffects = `
/* Cyberpunk grid background */
.cyber-grid {
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background-image:
    linear-gradient(rgba(0,255,240,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,255,240,0.03) 1px, transparent 1px);
  background-size: 60px 60px;
}
.cyber-grid::after {
  content: ""; position: absolute; inset: 0;
  background: radial-gradient(ellipse at 50% 0%, rgba(0,255,240,0.08) 0%, transparent 60%);
}
/* Scanline overlay */
.scanlines {
  position: fixed; inset: 0; pointer-events: none; z-index: 1;
  background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px);
}
`;
  } else if (theme === "glassmorphism") {
    bgEffects = `
.glass-bg {
  position: fixed; inset: 0; overflow: hidden; pointer-events: none; z-index: 0;
  background: linear-gradient(135deg, #0f0720 0%, #1a0535 30%, #0d1b3e 60%, #0f0720 100%);
}
.glass-bg .blob { position: absolute; border-radius: 50%; filter: blur(120px); }
.glass-bg .blob-1 { width: 600px; height: 600px; background: rgba(139,92,246,0.3); top: -20%; right: -5%; animation: float1 20s ease-in-out infinite; }
.glass-bg .blob-2 { width: 500px; height: 500px; background: rgba(240,147,251,0.2); bottom: -10%; left: -10%; animation: float2 25s ease-in-out infinite; }
.glass-bg .blob-3 { width: 400px; height: 400px; background: rgba(96,165,250,0.15); top: 40%; left: 30%; animation: float3 22s ease-in-out infinite; }
@keyframes float1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-60px,40px) scale(1.1)} }
@keyframes float2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(50px,-30px) scale(1.08)} }
@keyframes float3 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-30px,-40px) scale(0.9)} }
`;
  } else if (theme === "ghibli") {
    bgEffects = `
.ghibli-bg {
  position: relative;
  background: linear-gradient(180deg, #d4e7c5 0%, #f5efe6 30%, #f5efe6 100%);
}
.ghibli-bg::before {
  content: ""; position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background-image: url('/images/hero-bg.png');
  background-size: cover; background-position: center;
  opacity: 0.12;
}
.ghibli-clouds {
  position: fixed; top: 0; left: 0; right: 0; height: 200px;
  pointer-events: none; z-index: 0; overflow: hidden;
}
.ghibli-clouds::before, .ghibli-clouds::after {
  content: ""; position: absolute; border-radius: 50%; background: rgba(255,255,255,0.6);
}
.ghibli-clouds::before {
  width: 300px; height: 100px; top: 20px; left: 10%;
  box-shadow: 40px -20px 0 20px rgba(255,255,255,0.5), 100px -10px 0 30px rgba(255,255,255,0.4);
  animation: cloudDrift 40s linear infinite;
}
.ghibli-clouds::after {
  width: 250px; height: 80px; top: 40px; left: 60%;
  box-shadow: 30px -15px 0 15px rgba(255,255,255,0.5), 80px -5px 0 25px rgba(255,255,255,0.4);
  animation: cloudDrift 55s linear infinite reverse;
}
@keyframes cloudDrift { 0%{transform:translateX(-10%)} 100%{transform:translateX(110vw)} }
`;
  } else if (theme === "cinematic") {
    bgEffects = `
.cinematic-page-bg {
  position: relative;
  background: #0d0d12;
}
.cinematic-page-bg::before {
  content: ""; position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background-image: url('/images/hero-bg.png');
  background-size: cover; background-position: center;
  opacity: 0.08;
}
.cinematic-bg {
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background: radial-gradient(ellipse at 50% 30%, rgba(233,69,96,0.06) 0%, transparent 60%),
              radial-gradient(ellipse at 20% 80%, rgba(201,169,110,0.04) 0%, transparent 50%);
}
/* Letterbox bars */
.letterbox-top, .letterbox-bottom {
  position: fixed; left: 0; right: 0; height: 40px; z-index: 2;
  background: #000; pointer-events: none;
}
.letterbox-top { top: 0; }
.letterbox-bottom { bottom: 0; }
`;
  } else if (theme === "bold-creative") {
    bgEffects = `
.bold-bg {
  position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden;
}
.bold-bg .shape { position: absolute; border-radius: 50%; }
.bold-bg .shape-1 { width: 300px; height: 300px; background: rgba(255,107,107,0.08); top: 10%; right: -5%; }
.bold-bg .shape-2 { width: 200px; height: 200px; background: rgba(77,150,255,0.08); bottom: 20%; left: -3%; }
.bold-bg .shape-3 { width: 150px; height: 150px; background: rgba(255,217,61,0.08); top: 50%; left: 40%; border-radius: 30%; transform: rotate(45deg); }
`;
  } else if (theme === "gradient-mesh") {
    bgEffects = `
.mesh-bg {
  position: fixed; inset: 0; overflow: hidden; pointer-events: none; z-index: 0;
  background: #0f0f1a;
}
.mesh-bg .blob { position: absolute; border-radius: 50%; filter: blur(100px); opacity: 0.5; }
.mesh-bg .blob-1 { width: 500px; height: 500px; background: rgba(161,140,209,0.4); top: -10%; right: -5%; animation: meshFloat1 18s ease-in-out infinite; }
.mesh-bg .blob-2 { width: 400px; height: 400px; background: rgba(255,154,158,0.3); bottom: -5%; left: -5%; animation: meshFloat2 22s ease-in-out infinite; }
.mesh-bg .blob-3 { width: 350px; height: 350px; background: rgba(150,251,196,0.2); top: 50%; left: 40%; animation: meshFloat3 20s ease-in-out infinite; }
@keyframes meshFloat1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-40px,30px) scale(1.15)} }
@keyframes meshFloat2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(50px,-40px) scale(1.1)} }
@keyframes meshFloat3 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-30px,-50px) scale(0.85)} }
`;
  } else if (theme === "neo-tokyo") {
    bgEffects = `
.neotokyo-bg {
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background:
    linear-gradient(180deg, rgba(255,46,99,0.03) 0%, transparent 30%),
    radial-gradient(ellipse at 70% 80%, rgba(8,217,214,0.05) 0%, transparent 50%);
}
.neotokyo-bg::after {
  content: ""; position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(255,46,99,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,46,99,0.02) 1px, transparent 1px);
  background-size: 40px 40px;
}
`;
  } else if (theme === "nature") {
    bgEffects = `
.nature-bg {
  position: relative;
  background: linear-gradient(180deg, #d4c9a8 0%, #f0ebe3 20%, #f0ebe3 100%);
}
.nature-bg::before {
  content: ""; position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background-image: url('/images/hero-bg.png');
  background-size: cover; background-position: center;
  opacity: 0.1;
}
`;
  } else if (theme === "editorial") {
    bgEffects = `
.editorial-bg { position: relative; }
`;
  } else if (theme === "tpl-resume-bold") {
    bgEffects = `
.bold-resume-bg {
  position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden;
}
.bold-resume-bg .shape { position: absolute; }
.bold-resume-bg .shape-1 {
  width: 400px; height: 400px; background: rgba(236,72,153,0.06);
  top: -10%; right: -10%; border-radius: 30% 70% 70% 30%;
  animation: floatBold 12s ease-in-out infinite;
}
.bold-resume-bg .shape-2 {
  width: 300px; height: 300px; background: rgba(8,145,178,0.06);
  bottom: -5%; left: -5%; border-radius: 50%;
  animation: floatBold 10s ease-in-out infinite reverse;
}
.bold-resume-bg .shape-3 {
  width: 200px; height: 200px; background: rgba(236,72,153,0.04);
  top: 40%; left: 50%; border-radius: 20%; transform: rotate(45deg);
  animation: floatBold 14s ease-in-out infinite;
}
@keyframes floatBold { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-20px) rotate(3deg); } }

/* Bold resume — thick borders, hard shadows */
.section-heading {
  font-size: 1.5rem !important; font-weight: 900 !important; text-transform: uppercase !important;
  letter-spacing: 0.05em; border-bottom: 4px solid var(--color-accent); padding-bottom: 0.5rem;
  display: inline-block; margin-bottom: 1.5rem !important;
}
.badge {
  border: 2px solid var(--color-text) !important; border-radius: 0 !important;
  font-weight: 600 !important; box-shadow: 2px 2px 0 var(--color-accent);
}
.contact-icon {
  border: 2px solid var(--color-text) !important; box-shadow: 3px 3px 0 var(--color-accent);
}
.contact-icon:hover { box-shadow: 3px 3px 0 var(--color-accent-alt); }
.avatar-glow { display: none; }
`;
  } else if (theme === "tpl-resume-dark") {
    bgEffects = `
.dark-resume-bg {
  position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden;
}
.dark-resume-bg .blob { position: absolute; border-radius: 50%; filter: blur(80px); }
.dark-resume-bg .blob-1 {
  width: 400px; height: 400px; background: rgba(94,106,210,0.08);
  top: -15%; right: -10%; animation: floatDark 15s ease-in-out infinite;
}
.dark-resume-bg .blob-2 {
  width: 350px; height: 350px; background: rgba(139,92,246,0.06);
  bottom: -10%; left: -5%; animation: floatDark 12s ease-in-out infinite reverse;
}
.dark-resume-bg .blob-3 {
  width: 250px; height: 250px; background: rgba(52,211,153,0.04);
  top: 50%; left: 40%; animation: floatDark 18s ease-in-out infinite;
}
@keyframes floatDark { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-30px); } }

/* Dark resume — pill nav, grain texture overlay */
body::after {
  content: ""; position: fixed; inset: 0; pointer-events: none; z-index: 9999;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
.section-heading {
  background: var(--color-bg-card) !important; display: inline-block;
  padding: 0.4rem 1.2rem !important; border-radius: 999px !important;
  border: 1px solid var(--color-line) !important; font-size: 0.85rem !important;
  letter-spacing: 0.1em; text-transform: uppercase;
}
.badge { border-radius: 999px !important; }
`;
  }

  // Style-specific typography & heading
  let headingStyle = "";
  if (theme === "brutalist") {
    headingStyle = `
h1, h2, h3 { font-family: var(--font-heading); text-transform: uppercase; letter-spacing: -0.02em; }
h1 { font-size: 3rem; line-height: 1; }
`;
  } else if (theme === "cyberpunk") {
    headingStyle = `
h1, h2, h3 { font-family: var(--font-heading); letter-spacing: 0.05em; text-transform: uppercase; }
.section-heading { text-shadow: 0 0 20px rgba(0,255,240,0.3); }
`;
  } else if (theme === "retro") {
    headingStyle = `
h1, h2, h3 { font-family: var(--font-heading); }
`;
  } else if (theme === "cinematic") {
    headingStyle = `
h1, h2, h3 { font-family: var(--font-heading); letter-spacing: 0.02em; }
h1 { font-size: 3.5rem; line-height: 1.1; font-weight: 300; }
.section-heading { font-weight: 300; letter-spacing: 0.1em; text-transform: uppercase; }
`;
  } else if (theme === "bold-creative") {
    headingStyle = `
h1, h2, h3 { font-family: var(--font-heading); letter-spacing: -0.03em; }
h1 { font-size: 3.5rem; line-height: 1; font-weight: 900; }
`;
  } else if (theme === "editorial") {
    headingStyle = `
h1, h2, h3 { font-family: var(--font-heading); font-weight: 400; }
h1 { font-size: 3rem; line-height: 1.15; font-style: italic; }
.section-heading::after { content: ""; display: block; width: 40px; height: 2px; background: var(--color-accent); margin-top: 0.5rem; }
`;
  } else if (theme === "neo-tokyo") {
    headingStyle = `
h1, h2, h3 { font-family: var(--font-heading); letter-spacing: 0.04em; }
.section-heading { text-shadow: 0 0 15px rgba(255,46,99,0.3); }
`;
  }

  // Badge style per theme
  let badgeCSS = "";
  if (theme === "brutalist") {
    badgeCSS = `
.badge {
  font-size: 0.75rem; font-weight: 700; text-transform: uppercase;
  padding: 4px 10px; border-radius: 0;
  background: var(--color-bg-tag); color: #ffffff;
  border: 2px solid var(--color-text);
  display: inline-block; letter-spacing: 0.05em;
}
.badge:hover { background: var(--color-accent); border-color: var(--color-accent); }
`;
  } else if (theme === "cyberpunk") {
    badgeCSS = `
.badge {
  font-size: 0.75rem; font-weight: 500; font-family: var(--font-mono);
  padding: 4px 12px; border-radius: 2px;
  background: rgba(0,255,240,0.06); color: var(--color-accent);
  border: 1px solid rgba(0,255,240,0.2);
  display: inline-block; transition: all 0.2s;
}
.badge:hover { background: rgba(0,255,240,0.12); box-shadow: 0 0 10px rgba(0,255,240,0.15); }
`;
  } else if (theme === "retro") {
    badgeCSS = `
.badge {
  font-size: 0.75rem; font-weight: 600; font-family: var(--font-heading);
  padding: 4px 12px; border-radius: 2px;
  background: var(--color-bg-tag); color: var(--color-text-muted);
  border: 1px solid var(--color-line);
  display: inline-block; transition: all 0.2s;
}
.badge:hover { color: var(--color-accent); border-color: var(--color-accent); }
`;
  } else {
    badgeCSS = `
.badge {
  font-size: 0.8rem; font-weight: 500;
  padding: 5px 12px; border-radius: ${theme === "minimalist" ? "2px" : "var(--radius-card)"};
  background: var(--color-bg-tag);
  color: var(--color-text-muted);
  border: 1px solid var(--color-line);
  transition: transform 0.2s, color 0.2s, background 0.2s, border-color 0.2s;
  display: inline-block;
}
.badge:hover {
  transform: translateY(-2px);
  color: var(--color-accent);
  background: var(--color-accent-soft);
  border-color: var(--color-accent);
}
`;
  }

  // Avatar glow
  const avatarGlow = theme === "cyberpunk"
    ? `.avatar-glow { position: absolute; inset: -8px; border-radius: 50%; background: var(--color-accent); filter: blur(30px); opacity: 0.4; }`
    : theme === "brutalist" || theme === "minimalist"
    ? `.avatar-glow { display: none; }`
    : `.avatar-glow { position: absolute; inset: -8px; border-radius: 50%; background: var(--color-accent); filter: blur(30px); opacity: 0.3; }`;

  return bgEffects + headingStyle + badgeCSS + `
${avatarGlow}
.timeline-line {
  position: absolute; left: 5px; top: 0; bottom: 0; width: 2px;
  background: linear-gradient(to bottom, var(--color-accent), var(--color-accent-alt), transparent);
}
.timeline-dot {
  width: 12px; height: 12px; border-radius: 50%;
  border: 2px solid var(--color-accent);
  background: var(--color-bg);
  flex-shrink: 0;
}
.timeline-dot-active {
  background: var(--color-accent);
  box-shadow: 0 0 0 4px var(--color-accent-soft);
}
.contact-icon {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  color: var(--color-text-muted); transition: color 0.3s, transform 0.3s;
  text-decoration: none;
}
.contact-icon:hover { color: var(--color-accent); transform: scale(1.15) rotate(5deg); }
`;
}

function genChatCSS(): string {
  return `
@keyframes slide-in {
  from { opacity: 0; transform: translateY(16px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.animate-in { animation: slide-in 0.25s ease; }
.tooltip-wrapper { position: relative; }
.tooltip-wrapper .tooltip {
  position: absolute; bottom: calc(100% + 8px); left: 50%; transform: translateX(-50%);
  white-space: nowrap; padding: 6px 12px; border-radius: 8px;
  font-size: 12px; font-weight: 500;
  background: var(--color-bg-card-solid); color: var(--color-text);
  border: 1px solid var(--color-line);
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  opacity: 0; pointer-events: none;
  transition: opacity 0.2s, transform 0.2s;
  transform: translateX(-50%) translateY(4px);
}
.tooltip-wrapper:hover .tooltip { opacity: 1; transform: translateX(-50%) translateY(0); }
`;
}

// ---- Page Generation ----

function genPage(data: WorkspaceData, layout: LayoutType, theme: ThemeStyle, features: FeatureFlags): string {
  const family = LAYOUT_FAMILY[layout] || "single";
  switch (family) {
    case "sidebar": return genSidebarPage(data, layout, theme, features);
    case "split":   return genSplitPage(data, theme, features);
    case "grid":    return genGridPage(data, layout, theme, features);
    case "single":
    default:        return genSingleColumnPage(data, layout, theme, features);
  }
}

function genSingleColumnPage(data: WorkspaceData, layout: LayoutType, theme: ThemeStyle, features: FeatureFlags): string {
  const needsUseState = layout === "hidden-nav";
  const needsUseEffect = layout === "interactive";
  const reactHooks: string[] = [];
  if (needsUseState) reactHooks.push("useState");
  if (needsUseEffect) reactHooks.push("useEffect", "useRef");
  const reactImport = reactHooks.length > 0 ? `import { ${reactHooks.join(", ")} } from "react";` : "";

  const imports = [
    `"use client";`,
    reactImport,
    `import { useLanguage } from "@/components/LanguageProvider";`,
    `import Image from "next/image";`,
    features.typewriter ? `import TypewriterHero from "@/components/TypewriterHero";` : "",
    features.darkMode ? `import ThemeToggle from "@/components/ThemeToggle";` : "",
    features.chatbot ? `import ChatBot from "@/components/ChatBot";` : "",
    features.share ? `import SharePoster from "@/components/SharePoster";` : "",
    theme === "cyberpunk" ? `import ParticleBackground from "@/components/ParticleBackground";` : "",
    theme === "retro" ? `import GrainOverlay from "@/components/GrainOverlay";` : "",
  ].filter(Boolean).join("\n");
  const wrapClass = layout === "f-shape" ? "f-layout" : "";
  const sectionClass = layout === "interactive" ? "scroll-section" : "";

  const styleBg = getStyleBgMarkup(theme);

  // --- Navbar variations ---
  let navbar: string;
  if (layout === "hidden-nav") {
    navbar = `
        {/* Hidden Nav */}
        <div className="fixed top-4 right-4 z-50">
          <div className="flex items-center gap-2">
            <button onClick={toggle} className="text-sm text-text-muted hover:text-text px-3 py-1.5 rounded-full border border-line bg-bg/80 backdrop-blur-xl transition-colors">
              {lang === "zh" ? "EN" : "\\u4e2d"}
            </button>
            ${features.darkMode ? "<ThemeToggle />" : ""}
            <button onClick={() => setMenuOpen(!menuOpen)} className="hamburger bg-bg/80 backdrop-blur-xl rounded-full border border-line">
              <span /><span /><span />
            </button>
          </div>
        </div>
        <div className={\`mobile-menu \${menuOpen ? "open" : ""}\`}>
          <a href="#projects" onClick={() => setMenuOpen(false)}>{t.nav.projects}</a>
          <a href="#timeline" onClick={() => setMenuOpen(false)}>{t.nav.timeline}</a>
          <a href="#skills" onClick={() => setMenuOpen(false)}>{t.nav.skills}</a>
          <a href="#education" onClick={() => setMenuOpen(false)}>{t.nav.education}</a>
        </div>`;
  } else if (layout === "fixed-nav") {
    navbar = `
        {/* Fixed Navigation */}
        <nav className="fixed-top-nav">
          <ul>
            <li><span className="font-bold text-text">{lang === "zh" ? "${data.name}" : "${data.nameEn}"}</span></li>
            <li className="flex-1" />
            <li><a href="#projects">{t.nav.projects}</a></li>
            <li><a href="#timeline">{t.nav.timeline}</a></li>
            <li><a href="#skills">{t.nav.skills}</a></li>
            <li><a href="#education">{t.nav.education}</a></li>
            <li>
              <button onClick={toggle} className="text-sm text-text-muted hover:text-accent px-3 py-1 rounded-full border border-line transition-colors">
                {lang === "zh" ? "EN" : "\\u4e2d"}
              </button>
            </li>
            ${features.darkMode ? "<li><ThemeToggle /></li>" : ""}
          </ul>
        </nav>`;
  } else {
    navbar = `
        {/* Navbar */}
        <nav className="sticky top-0 z-50 bg-bg/80 backdrop-blur-xl border-b border-line">
          <div className="max-w-[1100px] mx-auto px-6 h-16 flex items-center justify-between">
            <span className="font-bold text-lg">{lang === "zh" ? "${data.name}" : "${data.nameEn}"}</span>
            <div className="hidden md:flex items-center gap-6">
              <a href="#projects" className="text-sm text-text-muted hover:text-text transition-colors">{t.nav.projects}</a>
              <a href="#timeline" className="text-sm text-text-muted hover:text-text transition-colors">{t.nav.timeline}</a>
              <a href="#skills" className="text-sm text-text-muted hover:text-text transition-colors">{t.nav.skills}</a>
              <a href="#education" className="text-sm text-text-muted hover:text-text transition-colors">{t.nav.education}</a>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={toggle} className="text-sm text-text-muted hover:text-text px-3 py-1.5 rounded-full border border-line transition-colors">
                {lang === "zh" ? "EN" : "\\u4e2d"}
              </button>
              ${features.darkMode ? "<ThemeToggle />" : ""}
            </div>
          </div>
        </nav>`;
  }

  // --- Hero variations ---
  let hero: string;
  if (layout === "hero-media") {
    hero = `
        {/* Hero Media */}
        <section className="hero-media">
          <div className="hero-media-overlay" />
          <div className="hero-media-content">
            <div className="relative w-[140px] h-[140px] mx-auto mb-6">
              <div className="avatar-glow" />
              <div className="w-[140px] h-[140px] rounded-full overflow-hidden relative z-10 border-2 border-line">
                <Image src="/images/avatar.png" alt="" width={140} height={140} className="w-full h-full object-cover" unoptimized />
              </div>
            </div>
            ${features.typewriter ? "<TypewriterHero />" : `<h1 className="text-4xl md:text-5xl font-bold mb-3">{lang === "zh" ? "${data.name}" : "${data.nameEn}"}</h1>
            <p className="text-xl text-text-muted">{lang === "zh" ? "${data.title}" : "${data.titleEn}"}</p>`}
            <div className="flex flex-wrap justify-center gap-2 mt-8">
              {t.hero.tags.map((tag) => (<span key={tag} className="badge">{tag}</span>))}
            </div>
          </div>
        </section>`;
  } else {
    hero = `
        {/* Hero */}
        <section className="max-w-[1100px] mx-auto px-6 pt-20 pb-12${sectionClass ? ` ${sectionClass}` : ""}">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
            <div className="relative w-[120px] h-[120px] shrink-0">
              <div className="avatar-glow" />
              <div className="w-[120px] h-[120px] rounded-full overflow-hidden relative z-10 border-2 border-line">
                <Image src="/images/avatar.png" alt="" width={120} height={120} className="w-full h-full object-cover" unoptimized />
              </div>
            </div>
            <div className="flex-1">
              ${features.typewriter ? "<TypewriterHero />" : `<h1 className="text-3xl font-bold mb-2">{lang === "zh" ? "${data.name}" : "${data.nameEn}"}</h1>
              <p className="text-text-muted">{lang === "zh" ? "${data.title}" : "${data.titleEn}"}</p>`}
              <div className="flex flex-wrap gap-2 mt-6">
                {t.hero.tags.map((tag) => (<span key={tag} className="badge">{tag}</span>))}
              </div>
            </div>
          </div>
        </section>`;
  }

  // --- Projects section variations ---
  let projects: string;
  if (layout === "z-shape") {
    projects = `
        {/* Projects – Z-Shape */}
        <section id="projects" className="px-6 py-16${sectionClass ? ` ${sectionClass}` : ""}">
          <h2 className="section-heading">{t.sections.projects}</h2>
          <div className="space-y-16">
            {t.projects.map((p, i) => (
              <div key={i} className="zigzag-section">
                <div className="zigzag-inner">
                  <div className="card overflow-hidden">
                    {p.image && <div className="w-full h-48 bg-bg-card"><Image src={p.image} alt={p.title} width={600} height={300} className="w-full h-full object-cover" unoptimized /></div>}
                    <div className="p-6">
                      <h3 className="font-semibold text-lg mb-1">{p.title}</h3>
                      <p className="text-xs text-text-muted">{p.org}</p>
                      <p className="text-sm text-text-muted mt-3 leading-relaxed">{p.desc}</p>
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {p.tags.map((tag) => (<span key={tag} className="badge text-xs">{tag}</span>))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    {"badge" in p && p.badge && (
                      <span className="text-sm bg-green/15 text-green px-4 py-1.5 rounded-full font-medium">{p.badge}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>`;
  } else {
    projects = `
        {/* Projects */}
        <section id="projects" className="max-w-[1100px] mx-auto px-6 py-16${sectionClass ? ` ${sectionClass}` : ""}">
          <h2 className="section-heading">{t.sections.projects}</h2>
          <div className="grid md:grid-cols-2 gap-5">
            {t.projects.map((p, i) => (
              <div key={i} className="card overflow-hidden">
                {p.image && <div className="w-full h-40 bg-bg-card"><Image src={p.image} alt={p.title} width={600} height={300} className="w-full h-full object-cover" unoptimized /></div>}
                <div className="relative z-10 p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-base">{p.title}</h3>
                      <p className="text-xs text-text-muted mt-0.5">{p.org}</p>
                    </div>
                    {"badge" in p && p.badge && (
                      <span className="text-xs bg-green/15 text-green px-2.5 py-0.5 rounded-full font-medium">{p.badge}</span>
                    )}
                  </div>
                  <p className="text-sm text-text-muted mb-3 leading-relaxed line-clamp-3">{p.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.tags.map((tag) => (<span key={tag} className="badge text-xs">{tag}</span>))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>`;
  }

  // --- Interactive scroll observer ---
  const scrollScript = layout === "interactive" ? `
  const sectionsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); });
    }, { threshold: 0.1 });
    sectionsRef.current?.querySelectorAll(".scroll-section").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);` : "";

  const hiddenNavState = layout === "hidden-nav" ? `\n  const [menuOpen, setMenuOpen] = useState(false);` : "";

  return `${imports}

export default function Home() {
  const { lang, t, toggle } = useLanguage();${hiddenNavState}${scrollScript}

  return (
    <div className="min-h-screen relative bg-bg text-text">
      ${styleBg}
      ${layout === "interactive" ? `<div className="parallax-bg" />` : ""}
      <div className="relative z-10${wrapClass ? ` ${wrapClass}` : ""}"${layout === "interactive" ? ` ref={sectionsRef}` : ""}>
        ${navbar}

        ${hero}

        ${projects}

        {/* Timeline */}
        <section id="timeline" className="max-w-[1100px] mx-auto px-6 py-16${sectionClass ? ` ${sectionClass}` : ""}">
          <h2 className="section-heading">{t.sections.timeline}</h2>
          <div className="${layout === "f-shape" ? "" : "max-w-2xl mx-auto "}relative pl-8">
            <div className="timeline-line" />
            {t.timeline.map((item, i) => (
              <div key={i} className="relative flex gap-6 mb-10 last:mb-0">
                <div className={\`timeline-dot mt-1 \${"active" in item && item.active ? "timeline-dot-active" : ""}\`} />
                <div className="flex-1 pb-2">
                  <span className="text-sm text-accent font-medium">{item.date}</span>
                  <h3 className="text-base font-semibold mt-1">{item.title}</h3>
                  <p className="text-sm text-text-muted mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Skills */}
        <section id="skills" className="max-w-[1100px] mx-auto px-6 py-16${sectionClass ? ` ${sectionClass}` : ""}">
          <h2 className="section-heading">{t.sections.skills}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {t.skills.map((group, i) => (
              <div key={i} className="card p-5">
                <div className="relative z-10">
                  <h3 className="font-semibold text-sm mb-3 text-accent">{group.title}</h3>
                  <div className="flex flex-wrap gap-2">
                    {group.skills.map((s) => (<span key={s} className="badge">{s}</span>))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Education */}
        <section id="education" className="max-w-[1100px] mx-auto px-6 py-16${sectionClass ? ` ${sectionClass}` : ""}">
          <h2 className="section-heading">{t.sections.education}</h2>
          <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {t.education.map((edu, i) => (
              <div key={i} className="card p-5">
                <div className="relative z-10">
                  <h3 className="font-semibold text-sm">{edu.school}</h3>
                  <p className="text-xs text-text-muted">{edu.degree}</p>
                  <div className="space-y-2 mt-3">
                    {edu.highlights.map((item) => (
                      <div key={item} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                        <span className="text-sm text-text-muted">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="max-w-[1100px] mx-auto px-6 py-16${sectionClass ? ` ${sectionClass}` : ""}">
          <h2 className="section-heading">{t.sections.contact}</h2>
          <div className="flex justify-center gap-12 flex-wrap">
            <a href="mailto:${data.email}" className="contact-icon">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/></svg>
              <span className="text-sm font-medium">Email</span>
            </a>
            ${data.github ? `<a href="${data.github}" target="_blank" className="contact-icon">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              <span className="text-sm font-medium">GitHub</span>
            </a>` : ""}
          </div>
        </section>

        <footer className="border-t border-line">
          <div className="max-w-[1100px] mx-auto px-6 py-8 text-center">
            <p className="text-sm text-text-muted">{t.footer}</p>
          </div>
        </footer>
      </div>
      ${features.share ? "<SharePoster />" : ""}
      ${features.chatbot ? "<ChatBot />" : ""}
    </div>
  );
}
`;
}

function genSidebarPage(data: WorkspaceData, _layout: LayoutType, theme: ThemeStyle, features: FeatureFlags): string {
  const imports = [
    `"use client";`,
    `import Image from "next/image";`,
    `import { useLanguage } from "@/components/LanguageProvider";`,
    features.chatbot ? `import ChatBot from "@/components/ChatBot";` : "",
    features.share ? `import SharePoster from "@/components/SharePoster";` : "",
    theme === "cyberpunk" ? `import ParticleBackground from "@/components/ParticleBackground";` : "",
    theme === "retro" ? `import GrainOverlay from "@/components/GrainOverlay";` : "",
  ].filter(Boolean).join("\n");

  const styleBg = getStyleBgMarkup(theme);

  return `${imports}

export default function Home() {
  const { lang, t, toggle } = useLanguage();

  return (
    <>${styleBg}
      <div className="two-column-layout">
        <aside className="sidebar-panel">
          <div className="sidebar-card">
            <div className="relative w-28 h-28 mx-auto mb-5">
              <div className="avatar-glow" />
              <Image src="/images/avatar.png" alt="" width={112} height={112} className="relative z-10 w-full h-full rounded-full object-cover border-3 border-white/60 shadow-lg" unoptimized />
            </div>
            <h1 className="text-xl font-bold text-text mb-1">{lang === "zh" ? "${data.name}" : "${data.nameEn}"}</h1>
            <p className="text-sm text-text-muted mb-5">{lang === "zh" ? "${data.title}" : "${data.titleEn}"}</p>
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {t.hero.tags.slice(0, 4).map((tag) => (<span key={tag} className="badge">{tag}</span>))}
            </div>
            <nav className="flex flex-col gap-1 mb-6">
              {([["projects", t.nav.projects], ["timeline", t.nav.timeline], ["skills", t.nav.skills], ["education", t.nav.education]] as const).map(([id, label]) => (
                <a key={id} href={\`#\${id}\`} className="sidebar-nav-link">{label}</a>
              ))}
            </nav>
            <div className="flex justify-center gap-5 mb-5">
              <a href="mailto:${data.email}" className="contact-icon">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </a>
            </div>
            <button onClick={toggle} className="text-xs text-text-muted hover:text-accent border border-line rounded-full px-4 py-1.5 transition-colors">
              {lang === "zh" ? "EN" : "\\u4e2d"}
            </button>
          </div>
        </aside>

        <main className="content-panel">
          <section id="projects" className="mb-14">
            <h2 className="section-heading">{t.sections.projects}</h2>
            <div className="grid grid-cols-2 gap-5">
              {t.projects.map((p) => (
                <div key={p.title} className="card overflow-hidden">
                  {p.image && <div className="w-full h-32 bg-bg-card"><Image src={p.image} alt={p.title} width={400} height={200} className="w-full h-full object-cover" unoptimized /></div>}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <h3 className="font-bold text-sm text-text">{p.title}</h3>
                        <p className="text-xs text-text-muted">{p.org}</p>
                      </div>
                      {p.badge && <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/15 text-accent font-medium">{p.badge}</span>}
                    </div>
                    <p className="text-xs text-text-muted mt-2 leading-relaxed line-clamp-3">{p.desc}</p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {p.tags.map((tag) => (<span key={tag} className="badge text-[11px]">{tag}</span>))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="timeline" className="mb-14">
            <h2 className="section-heading">{t.sections.timeline}</h2>
            <div className="relative pl-6">
              <div className="timeline-line" />
              <div className="space-y-6">
                {t.timeline.map((item) => (
                  <div key={item.title} className="relative flex gap-4">
                    <div className={\`timeline-dot \${item.active ? "timeline-dot-active" : ""}\`} />
                    <div className="card flex-1 p-4">
                      <span className="text-xs font-semibold text-accent">{item.date}</span>
                      <h3 className="font-bold text-sm text-text mt-1">{item.title}</h3>
                      <p className="text-xs text-text-muted mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="skills" className="mb-14">
            <h2 className="section-heading">{t.sections.skills}</h2>
            <div className="grid grid-cols-2 gap-4">
              {t.skills.map((group) => (
                <div key={group.title} className="card p-4">
                  <h3 className="font-bold text-sm text-text mb-3">{group.title}</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {group.skills.map((s) => (<span key={s} className="badge">{s}</span>))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="education" className="mb-14">
            <h2 className="section-heading">{t.sections.education}</h2>
            <div className="grid grid-cols-2 gap-5">
              {t.education.map((edu) => (
                <div key={edu.school} className="card p-5">
                  <h3 className="font-bold text-sm text-text">{edu.school}</h3>
                  <p className="text-xs text-text-muted mt-1">{edu.degree}</p>
                  <ul className="mt-3 space-y-1.5">
                    {edu.highlights.map((h) => (
                      <li key={h} className="text-xs text-text-muted flex items-start gap-2">
                        <span className="text-accent mt-0.5">&#8226;</span>{h}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <footer className="text-center text-xs text-text-muted py-8 border-t border-line">{t.footer}</footer>
        </main>
      </div>
      ${features.share ? "<SharePoster />" : ""}
      ${features.chatbot ? "<ChatBot />" : ""}
    </>
  );
}
`;
}

function genGridPage(data: WorkspaceData, layout: LayoutType, theme: ThemeStyle, features: FeatureFlags): string {
  const imports = [
    `"use client";`,
    `import { useLanguage } from "@/components/LanguageProvider";`,
    `import Image from "next/image";`,
    features.typewriter ? `import TypewriterHero from "@/components/TypewriterHero";` : "",
    features.darkMode ? `import ThemeToggle from "@/components/ThemeToggle";` : "",
    features.chatbot ? `import ChatBot from "@/components/ChatBot";` : "",
    features.share ? `import SharePoster from "@/components/SharePoster";` : "",
    theme === "cyberpunk" ? `import ParticleBackground from "@/components/ParticleBackground";` : "",
    theme === "retro" ? `import GrainOverlay from "@/components/GrainOverlay";` : "",
  ].filter(Boolean).join("\n");

  // Style-specific background
  const styleBg = getStyleBgMarkup(theme);

  // Grid class and item class differ per layout variant
  let gridClass: string;
  let itemClass: string;
  if (layout === "masonry") {
    gridClass = "masonry-grid";
    itemClass = "card p-5";
  } else if (layout === "magazine") {
    gridClass = "magazine-grid";
    itemClass = "card p-5";
  } else {
    // card-grid (bento)
    gridClass = "bento-grid";
    itemClass = 'card p-5';
  }

  const projectItems = layout === "magazine"
    ? `{t.projects.map((p, i) => (
              <div key={i} className={\`card overflow-hidden \${i === 0 ? "magazine-feature" : ""}\`}>
                {p.image && <div className={\`w-full bg-bg-card \${i === 0 ? "h-56" : "h-36"}\`}><Image src={p.image} alt={p.title} width={600} height={300} className="w-full h-full object-cover" unoptimized /></div>}
                <div className="relative z-10 p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-base">{p.title}</h3>
                      <p className="text-xs text-text-muted mt-0.5">{p.org}</p>
                    </div>
                    {"badge" in p && p.badge && (
                      <span className="text-xs bg-green/15 text-green px-2.5 py-0.5 rounded-full font-medium">{p.badge}</span>
                    )}
                  </div>
                  <p className="text-sm text-text-muted mb-3 leading-relaxed">{p.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.tags.map((tag) => (<span key={tag} className="badge text-xs">{tag}</span>))}
                  </div>
                </div>
              </div>
            ))}`
    : layout === "card-grid"
    ? `{t.projects.map((p, i) => (
              <div key={i} className={\`card overflow-hidden \${i === 0 ? "bento-wide" : ""}\`}>
                {p.image && <div className="w-full h-40 bg-bg-card"><Image src={p.image} alt={p.title} width={600} height={300} className="w-full h-full object-cover" unoptimized /></div>}
                <div className="relative z-10 p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-base">{p.title}</h3>
                      <p className="text-xs text-text-muted mt-0.5">{p.org}</p>
                    </div>
                    {"badge" in p && p.badge && (
                      <span className="text-xs bg-green/15 text-green px-2.5 py-0.5 rounded-full font-medium">{p.badge}</span>
                    )}
                  </div>
                  <p className="text-sm text-text-muted mb-3 leading-relaxed line-clamp-3">{p.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.tags.map((tag) => (<span key={tag} className="badge text-xs">{tag}</span>))}
                  </div>
                </div>
              </div>
            ))}`
    : `{t.projects.map((p, i) => (
              <div key={i} className="card overflow-hidden">
                {p.image && <div className="w-full h-40 bg-bg-card"><Image src={p.image} alt={p.title} width={600} height={300} className="w-full h-full object-cover" unoptimized /></div>}
                <div className="relative z-10 p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-base">{p.title}</h3>
                      <p className="text-xs text-text-muted mt-0.5">{p.org}</p>
                    </div>
                    {"badge" in p && p.badge && (
                      <span className="text-xs bg-green/15 text-green px-2.5 py-0.5 rounded-full font-medium">{p.badge}</span>
                    )}
                  </div>
                  <p className="text-sm text-text-muted mb-3 leading-relaxed">{p.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.tags.map((tag) => (<span key={tag} className="badge text-xs">{tag}</span>))}
                  </div>
                </div>
              </div>
            ))}`;

  return `${imports}

export default function Home() {
  const { lang, t, toggle } = useLanguage();

  return (
    <div className="min-h-screen relative bg-bg text-text">
      ${styleBg}
      <div className="relative z-10">
        <nav className="sticky top-0 z-50 bg-bg/80 backdrop-blur-xl border-b border-line">
          <div className="max-w-[1100px] mx-auto px-6 h-16 flex items-center justify-between">
            <span className="font-bold text-lg">{lang === "zh" ? "${data.name}" : "${data.nameEn}"}</span>
            <div className="hidden md:flex items-center gap-6">
              <a href="#projects" className="text-sm text-text-muted hover:text-text transition-colors">{t.nav.projects}</a>
              <a href="#timeline" className="text-sm text-text-muted hover:text-text transition-colors">{t.nav.timeline}</a>
              <a href="#skills" className="text-sm text-text-muted hover:text-text transition-colors">{t.nav.skills}</a>
              <a href="#education" className="text-sm text-text-muted hover:text-text transition-colors">{t.nav.education}</a>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={toggle} className="text-sm text-text-muted hover:text-text px-3 py-1.5 rounded-full border border-line transition-colors">
                {lang === "zh" ? "EN" : "\\u4e2d"}
              </button>
              ${features.darkMode ? "<ThemeToggle />" : ""}
            </div>
          </div>
        </nav>

        <section className="max-w-[1100px] mx-auto px-6 pt-20 pb-12">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
            <div className="relative w-[120px] h-[120px] shrink-0">
              <div className="avatar-glow" />
              <div className="w-[120px] h-[120px] rounded-full overflow-hidden relative z-10 border-2 border-line">
                <Image src="/images/avatar.png" alt="" width={120} height={120} className="w-full h-full object-cover" unoptimized />
              </div>
            </div>
            <div className="flex-1">
              ${features.typewriter ? "<TypewriterHero />" : `<h1 className="text-3xl font-bold mb-2">{lang === "zh" ? "${data.name}" : "${data.nameEn}"}</h1>
              <p className="text-text-muted">{lang === "zh" ? "${data.title}" : "${data.titleEn}"}</p>`}
              <div className="flex flex-wrap gap-2 mt-6">
                {t.hero.tags.map((tag) => (<span key={tag} className="badge">{tag}</span>))}
              </div>
            </div>
          </div>
        </section>

        <section id="projects" className="max-w-[1100px] mx-auto px-6 py-16">
          <h2 className="section-heading">{t.sections.projects}</h2>
          <div className="${gridClass}">
            ${projectItems}
          </div>
        </section>

        <section id="timeline" className="max-w-[1100px] mx-auto px-6 py-16">
          <h2 className="section-heading">{t.sections.timeline}</h2>
          <div className="max-w-2xl mx-auto relative pl-8">
            <div className="timeline-line" />
            {t.timeline.map((item, i) => (
              <div key={i} className="relative flex gap-6 mb-10 last:mb-0">
                <div className={\`timeline-dot mt-1 \${"active" in item && item.active ? "timeline-dot-active" : ""}\`} />
                <div className="flex-1 pb-2">
                  <span className="text-sm text-accent font-medium">{item.date}</span>
                  <h3 className="text-base font-semibold mt-1">{item.title}</h3>
                  <p className="text-sm text-text-muted mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="skills" className="max-w-[1100px] mx-auto px-6 py-16">
          <h2 className="section-heading">{t.sections.skills}</h2>
          <div className="${gridClass === "bento-grid" ? "bento-grid" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"}">
            {t.skills.map((group, i) => (
              <div key={i} className="card p-5">
                <div className="relative z-10">
                  <h3 className="font-semibold text-sm mb-3 text-accent">{group.title}</h3>
                  <div className="flex flex-wrap gap-2">
                    {group.skills.map((s) => (<span key={s} className="badge">{s}</span>))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="education" className="max-w-[1100px] mx-auto px-6 py-16">
          <h2 className="section-heading">{t.sections.education}</h2>
          <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {t.education.map((edu, i) => (
              <div key={i} className="card p-5">
                <div className="relative z-10">
                  <h3 className="font-semibold text-sm">{edu.school}</h3>
                  <p className="text-xs text-text-muted">{edu.degree}</p>
                  <div className="space-y-2 mt-3">
                    {edu.highlights.map((item) => (
                      <div key={item} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                        <span className="text-sm text-text-muted">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="contact" className="max-w-[1100px] mx-auto px-6 py-16">
          <h2 className="section-heading">{t.sections.contact}</h2>
          <div className="flex justify-center gap-12 flex-wrap">
            <a href="mailto:${data.email}" className="contact-icon">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/></svg>
              <span className="text-sm font-medium">Email</span>
            </a>
            ${data.github ? `<a href="${data.github}" target="_blank" className="contact-icon">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              <span className="text-sm font-medium">GitHub</span>
            </a>` : ""}
          </div>
        </section>

        <footer className="border-t border-line">
          <div className="max-w-[1100px] mx-auto px-6 py-8 text-center">
            <p className="text-sm text-text-muted">{t.footer}</p>
          </div>
        </footer>
      </div>
      ${features.share ? "<SharePoster />" : ""}
      ${features.chatbot ? "<ChatBot />" : ""}
    </div>
  );
}
`;
}

function genSplitPage(data: WorkspaceData, theme: ThemeStyle, features: FeatureFlags): string {
  const imports = [
    `"use client";`,
    `import { useLanguage } from "@/components/LanguageProvider";`,
    `import Image from "next/image";`,
    features.typewriter ? `import TypewriterHero from "@/components/TypewriterHero";` : "",
    features.darkMode ? `import ThemeToggle from "@/components/ThemeToggle";` : "",
    features.chatbot ? `import ChatBot from "@/components/ChatBot";` : "",
    features.share ? `import SharePoster from "@/components/SharePoster";` : "",
    theme === "cyberpunk" ? `import ParticleBackground from "@/components/ParticleBackground";` : "",
    theme === "retro" ? `import GrainOverlay from "@/components/GrainOverlay";` : "",
  ].filter(Boolean).join("\n");

  const styleBg = getStyleBgMarkup(theme);

  return `${imports}

export default function Home() {
  const { lang, t, toggle } = useLanguage();

  return (
    <>
      ${styleBg}
      <div className="split-layout">
        <div className="split-left">
          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className="avatar-glow" />
              <Image src="/images/avatar.png" alt="" width={128} height={128} className="relative z-10 w-full h-full rounded-full object-cover border-2 border-line" unoptimized />
            </div>
            ${features.typewriter ? "<TypewriterHero />" : `<h1 className="text-3xl font-bold mb-2">{lang === "zh" ? "${data.name}" : "${data.nameEn}"}</h1>
            <p className="text-text-muted mb-6">{lang === "zh" ? "${data.title}" : "${data.titleEn}"}</p>`}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {t.hero.tags.map((tag) => (<span key={tag} className="badge">{tag}</span>))}
            </div>
            <nav className="flex flex-col gap-2 mb-8">
              <a href="#projects" className="text-sm text-text-muted hover:text-accent transition-colors">{t.nav.projects}</a>
              <a href="#timeline" className="text-sm text-text-muted hover:text-accent transition-colors">{t.nav.timeline}</a>
              <a href="#skills" className="text-sm text-text-muted hover:text-accent transition-colors">{t.nav.skills}</a>
              <a href="#education" className="text-sm text-text-muted hover:text-accent transition-colors">{t.nav.education}</a>
            </nav>
            <div className="flex justify-center gap-4 mb-6">
              <a href="mailto:${data.email}" className="contact-icon">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </a>
              ${data.github ? `<a href="${data.github}" target="_blank" className="contact-icon">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>` : ""}
            </div>
            <div className="flex justify-center gap-2">
              <button onClick={toggle} className="text-xs text-text-muted hover:text-accent border border-line rounded-full px-4 py-1.5 transition-colors">
                {lang === "zh" ? "EN" : "\\u4e2d"}
              </button>
              ${features.darkMode ? "<ThemeToggle />" : ""}
            </div>
          </div>
        </div>

        <div className="split-right">
          <section id="projects" className="mb-14">
            <h2 className="section-heading">{t.sections.projects}</h2>
            <div className="space-y-4">
              {t.projects.map((p, i) => (
                <div key={i} className="card overflow-hidden">
                  {p.image && <div className="w-full h-40 bg-bg-card"><Image src={p.image} alt={p.title} width={600} height={300} className="w-full h-full object-cover" unoptimized /></div>}
                  <div className="relative z-10 p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-base">{p.title}</h3>
                        <p className="text-xs text-text-muted mt-0.5">{p.org}</p>
                      </div>
                      {"badge" in p && p.badge && (
                        <span className="text-xs bg-green/15 text-green px-2.5 py-0.5 rounded-full font-medium">{p.badge}</span>
                      )}
                    </div>
                    <p className="text-sm text-text-muted mb-3 leading-relaxed">{p.desc}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {p.tags.map((tag) => (<span key={tag} className="badge text-xs">{tag}</span>))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="timeline" className="mb-14">
            <h2 className="section-heading">{t.sections.timeline}</h2>
            <div className="relative pl-6">
              <div className="timeline-line" />
              {t.timeline.map((item, i) => (
                <div key={i} className="relative flex gap-4 mb-8 last:mb-0">
                  <div className={\`timeline-dot mt-1 \${"active" in item && item.active ? "timeline-dot-active" : ""}\`} />
                  <div className="flex-1">
                    <span className="text-sm text-accent font-medium">{item.date}</span>
                    <h3 className="font-semibold mt-1">{item.title}</h3>
                    <p className="text-sm text-text-muted mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="skills" className="mb-14">
            <h2 className="section-heading">{t.sections.skills}</h2>
            <div className="grid grid-cols-2 gap-4">
              {t.skills.map((group, i) => (
                <div key={i} className="card p-4">
                  <div className="relative z-10">
                    <h3 className="font-semibold text-sm mb-3 text-accent">{group.title}</h3>
                    <div className="flex flex-wrap gap-2">
                      {group.skills.map((s) => (<span key={s} className="badge">{s}</span>))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="education" className="mb-14">
            <h2 className="section-heading">{t.sections.education}</h2>
            <div className="space-y-4">
              {t.education.map((edu, i) => (
                <div key={i} className="card p-5">
                  <div className="relative z-10">
                    <h3 className="font-semibold text-sm">{edu.school}</h3>
                    <p className="text-xs text-text-muted">{edu.degree}</p>
                    <div className="space-y-2 mt-3">
                      {edu.highlights.map((item) => (
                        <div key={item} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                          <span className="text-sm text-text-muted">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <footer className="text-center text-sm text-text-muted py-8 border-t border-line">{t.footer}</footer>
        </div>
      </div>
      ${features.share ? "<SharePoster />" : ""}
      ${features.chatbot ? "<ChatBot />" : ""}
    </>
  );
}
`;
}

// ---- Component generators ----

function genTranslations(data: WorkspaceData): string {
  const zh = {
    nav: { projects: "项目经验", timeline: "职业经历", skills: "专业技能", education: "教育背景", contact: "联系方式" },
    hero: {
      lines: [`> Hello World`, `> ${data.name}`, `> ${data.title}`, `> ${data.location} · ${data.email}`],
      tags: data.tags,
    },
    sections: { projects: "项目经验", timeline: "职业经历", skills: "专业技能", education: "教育背景", contact: "联系方式" },
    projects: data.projects.map(p => ({ title: p.title, org: p.org, desc: p.desc, tags: p.tags, image: p.image, link: p.link || "", badge: p.badge || "" })),
    timeline: data.timeline,
    skills: data.skills,
    education: data.education,
    footer: `\u00A9 ${new Date().getFullYear()} ${data.name}. 保留所有权利。`,
    chatbot: {
      title: `${data.name} AI`,
      subtitle: "有什么想问的？",
      welcome: `你好！可以问我关于${data.name}的经历和技能。`,
      placeholder: "输入你的问题...",
      send: "发送",
      tooltip: "AI 对话",
      suggestions: ["你是做什么的？", "介绍一下你的工作经历", "你有哪些专业技能？"],
    },
    share: {
      button: "分享",
      title: "邀请好友",
      invite: `欢迎来和 ${data.name} 的 AI 分身聊天`,
      desc: `这里有我的完整简历资料，包括项目经验、专业技能、职业经历等，你可以向我的 AI 分身提任何问题`,
      cta: "点击链接，开始对话 →",
      save: "保存海报",
      copy: "复制链接",
      copied: "已复制！",
      projectTags: data.projects.slice(0, 4).map(p => p.title),
      skillTags: data.skills.flatMap(g => g.skills).slice(0, 6),
    },
  };
  const en = {
    nav: { projects: "Projects", timeline: "Experience", skills: "Skills", education: "Education", contact: "Contact" },
    hero: {
      lines: [`> Hello World`, `> ${data.nameEn || data.name}`, `> ${data.titleEn || data.title}`, `> ${data.locationEn || data.location} · ${data.email}`],
      tags: data.tagsEn || data.tags,
    },
    sections: { projects: "Projects", timeline: "Experience", skills: "Skills", education: "Education", contact: "Contact" },
    projects: (data.projectsEn || data.projects).map(p => ({ title: p.title, org: p.org, desc: p.desc, tags: p.tags, image: p.image, link: p.link || "", badge: p.badge || "" })),
    timeline: data.timelineEn || data.timeline,
    skills: data.skillsEn || data.skills,
    education: data.educationEn || data.education,
    footer: `\u00A9 ${new Date().getFullYear()} ${data.nameEn || data.name}. All rights reserved.`,
    chatbot: {
      title: `${data.nameEn || data.name} AI`,
      subtitle: "Ask me anything",
      welcome: `Hi! Ask me about ${data.nameEn || data.name}'s experience and skills.`,
      placeholder: "Type your question...",
      send: "Send",
      tooltip: "Chat with AI",
      suggestions: ["What do you do?", "Tell me about your projects", "What are your skills?"],
    },
    share: {
      button: "Share",
      title: "Invite Friends",
      invite: `Chat with ${data.nameEn || data.name}'s AI Avatar`,
      desc: `Here's my full resume — projects, skills, career experience and more. Ask my AI avatar anything!`,
      cta: "Click the link to start chatting →",
      save: "Save Poster",
      copy: "Copy Link",
      copied: "Copied!",
      projectTags: (data.projectsEn || data.projects).slice(0, 4).map(p => p.title),
      skillTags: (data.skillsEn || data.skills).flatMap(g => g.skills).slice(0, 6),
    },
  };

  return `export const translations = {
  zh: ${JSON.stringify(zh, null, 2)},
  en: ${JSON.stringify(en, null, 2)},
} as const;

export type Lang = keyof typeof translations;
export type Translations = (typeof translations)[Lang];
`;
}

function genLanguageProvider(): string {
  return `"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { translations, Lang, Translations } from "@/i18n/translations";

interface LanguageContextType {
  lang: Lang;
  t: Translations;
  toggle: () => void;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "zh",
  t: translations.zh,
  toggle: () => {},
});

export function useLanguage() {
  return useContext(LanguageContext);
}

export default function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("zh");

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Lang | null;
    if (saved && translations[saved]) setLang(saved);
  }, []);

  const toggle = () => {
    const next = lang === "zh" ? "en" : "zh";
    setLang(next);
    localStorage.setItem("lang", next);
  };

  return (
    <LanguageContext.Provider value={{ lang, t: translations[lang], toggle }}>
      {children}
    </LanguageContext.Provider>
  );
}
`;
}

function genTypewriterHero(): string {
  return `"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "./LanguageProvider";

export default function TypewriterHero() {
  const { t } = useLanguage();
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [done, setDone] = useState(false);
  const lines = t.hero.lines;

  useEffect(() => {
    setDisplayedLines([]); setCurrentLine(0); setCurrentChar(0); setDone(false);
  }, [t]);

  useEffect(() => {
    if (done) return;
    if (currentLine >= lines.length) { setDone(true); return; }
    const line = lines[currentLine];
    if (currentChar < line.length) {
      const timer = setTimeout(() => {
        setDisplayedLines(prev => { const u = [...prev]; u[currentLine] = line.slice(0, currentChar + 1); return u; });
        setCurrentChar(c => c + 1);
      }, 40);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => { setCurrentLine(l => l + 1); setCurrentChar(0); setDisplayedLines(prev => [...prev, ""]); }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentLine, currentChar, done, lines]);

  return (
    <div className="font-mono text-sm md:text-base space-y-1 min-h-[160px]">
      {displayedLines.map((line, i) => (
        <div key={i} className="flex items-start">
          <span className={line.startsWith(">") ? "text-accent" : "text-text-muted"}>
            {line.startsWith("> ") ? (<><span className="text-green mr-2">&gt;</span><span className="text-text">{line.slice(2)}</span></>) : line}
          </span>
          {i === currentLine && !done && <span className="inline-block w-2.5 h-5 bg-accent ml-0.5 animate-pulse" />}
        </div>
      ))}
      {done && <div className="flex items-center"><span className="text-green mr-2">&gt;</span><span className="inline-block w-2.5 h-5 bg-accent animate-pulse" /></div>}
    </div>
  );
}
`;
}

function genThemeToggle(): string {
  return `"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) { setDark(saved === "dark"); document.documentElement.setAttribute("data-theme", saved); }
  }, []);

  const toggle = () => {
    const next = dark ? "light" : "dark";
    setDark(!dark);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  };

  return (
    <button onClick={toggle} className="text-text-muted hover:text-text p-2 rounded-full border border-line transition-colors" aria-label="Toggle theme">
      {dark ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" strokeWidth={2}/><path strokeWidth={2} d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
      )}
    </button>
  );
}
`;
}

function genParticleBackground(): string {
  return `"use client";

import { useEffect, useRef } from "react";

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const particles: { x: number; y: number; vx: number; vy: number; r: number; a: number }[] = [];
    const COUNT = 80;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.5,
        a: Math.random() * 0.5 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = \`rgba(0,255,240,\${p.a})\`;
        ctx.fill();
      }
      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = \`rgba(0,255,240,\${0.08 * (1 - dist / 120)})\`;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}
`;
}

function genGrainOverlay(): string {
  return `"use client";

export default function GrainOverlay() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-50 opacity-[0.06]"
      style={{
        backgroundImage: \`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")\`,
        backgroundRepeat: "repeat",
      }}
    />
  );
}
`;
}

function genSharePoster(): string {
  return `"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import QRCode from "qrcode";
import { useLanguage } from "./LanguageProvider";

export default function SharePoster() {
  const { t, lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const share = t.share;

  const drawPoster = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 750, H = 1300;
    canvas.width = W;
    canvas.height = H;
    const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.scale(dpr, dpr);

    // --- Background gradient ---
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    const s = getComputedStyle(document.documentElement);
    const accent = s.getPropertyValue("--color-accent").trim() || "#6366f1";
    const bg = s.getPropertyValue("--color-bg").trim() || "#0a0a0f";
    bgGrad.addColorStop(0, bg);
    bgGrad.addColorStop(0.5, mixColor(bg, accent, 0.15));
    bgGrad.addColorStop(1, mixColor(bg, accent, 0.25));
    ctx.fillStyle = bgGrad;
    roundRect(ctx, 0, 0, W, H, 0);

    // --- Decorative circles ---
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = accent;
    ctx.beginPath(); ctx.arc(W * 0.85, H * 0.12, 180, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(W * 0.1, H * 0.75, 120, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;

    // --- Glass card ---
    const cardX = 50, cardY = 80, cardW = W - 100, cardH = H - 160;
    ctx.save();
    ctx.fillStyle = isLight(bg) ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.06)";
    ctx.strokeStyle = isLight(bg) ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.1)";
    ctx.lineWidth = 1;
    roundRect(ctx, cardX, cardY, cardW, cardH, 24);
    ctx.stroke();
    ctx.restore();

    const textColor = s.getPropertyValue("--color-text").trim() || "#ffffff";
    const mutedColor = s.getPropertyValue("--color-text-muted").trim() || "#9ca3af";
    const cx = W / 2;

    // --- Avatar circle ---
    const avatarY = cardY + 70;
    ctx.save();
    ctx.fillStyle = mixColor(accent, bg, 0.3);
    ctx.beginPath(); ctx.arc(cx, avatarY, 52, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    // Avatar icon (person silhouette)
    ctx.fillStyle = accent;
    ctx.beginPath(); ctx.arc(cx, avatarY - 8, 16, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx, avatarY + 24, 26, 18, 0, Math.PI, 0, true); ctx.fill();
    ctx.restore();

    // --- Name ---
    const nameY = avatarY + 80;
    ctx.fillStyle = textColor;
    ctx.font = "bold 36px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    const name = lang === "zh" ? t.hero.lines[1]?.replace("> ", "") : t.hero.lines[1]?.replace("> ", "");
    ctx.fillText(name || "", cx, nameY);

    // --- Title ---
    ctx.fillStyle = mutedColor;
    ctx.font = "18px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    const title = t.hero.lines[2]?.replace("> ", "") || "";
    ctx.fillText(title, cx, nameY + 34);

    // --- Divider ---
    const divY = nameY + 64;
    const divGrad = ctx.createLinearGradient(cardX + 60, divY, cardX + cardW - 60, divY);
    divGrad.addColorStop(0, "transparent");
    divGrad.addColorStop(0.3, accent);
    divGrad.addColorStop(0.7, accent);
    divGrad.addColorStop(1, "transparent");
    ctx.strokeStyle = divGrad;
    ctx.globalAlpha = 0.4;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cardX + 60, divY);
    ctx.lineTo(cardX + cardW - 60, divY);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // --- Invite text ---
    const inviteY = divY + 50;
    ctx.fillStyle = textColor;
    ctx.font = "bold 28px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.fillText(share.invite, cx, inviteY);

    // --- Description ---
    ctx.fillStyle = mutedColor;
    ctx.font = "16px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    const descLines = wrapText(ctx, share.desc, cardW - 120);
    descLines.forEach((line, i) => {
      ctx.fillText(line, cx, inviteY + 44 + i * 26);
    });

    // --- Project tags ---
    let nextY = inviteY + 44 + descLines.length * 26 + 30;
    const drawTagRow = (label: string, items: string[], color: string) => {
      if (items.length === 0) return;
      ctx.fillStyle = mutedColor;
      ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(label, cx, nextY);
      nextY += 22;
      ctx.font = "13px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
      // Measure and center tags
      let totalW = 0;
      const widths = items.map((tag) => {
        const w = ctx.measureText(tag).width + 24;
        totalW += w + 6;
        return w;
      });
      totalW -= 6;
      // Wrap to multiple lines if needed
      const maxLineW = cardW - 80;
      let lineX = cx - Math.min(totalW, maxLineW) / 2;
      let lineW = 0;
      items.forEach((tag, i) => {
        if (lineW + widths[i] > maxLineW && lineW > 0) {
          nextY += 32;
          lineW = 0;
          const remaining = items.slice(i).reduce((s, _, j) => s + widths[i + j] + 6, -6);
          lineX = cx - Math.min(remaining, maxLineW) / 2;
        }
        ctx.fillStyle = isLight(bg) ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.08)";
        roundRect(ctx, lineX + lineW, nextY, widths[i], 28, 14);
        ctx.fillStyle = color;
        ctx.textAlign = "center";
        ctx.fillText(tag, lineX + lineW + widths[i] / 2, nextY + 19);
        lineW += widths[i] + 6;
      });
      nextY += 42;
    };

    drawTagRow(lang === "zh" ? "\\u{1F4C2} 项目经验" : "\\u{1F4C2} Projects", share.projectTags || [], accent);
    drawTagRow(lang === "zh" ? "\\u{2B50} 专业技能" : "\\u{2B50} Skills", share.skillTags || [], textColor);

    // --- CTA ---
    const ctaY = nextY;
    ctx.fillStyle = accent;
    roundRect(ctx, cx - 180, ctaY, 360, 48, 24);
    ctx.fillStyle = isLight(accent) ? "#000" : "#fff";
    ctx.font = "bold 17px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(share.cta, cx, ctaY + 31);

    // --- QR Code (drawn async) ---
    const qrY = ctaY + 64;
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (url) {
      QRCode.toDataURL(url, { width: 240, margin: 1, color: { dark: "#000000", light: "#ffffff" } })
        .then((dataUrl: string) => {
          const img = new Image();
          img.onload = () => {
            const qrSize = 120;
            const qrX = cx - qrSize / 2;
            // White background with rounded corners
            ctx.fillStyle = "#ffffff";
            roundRect(ctx, qrX - 10, qrY - 10, qrSize + 20, qrSize + 20, 14);
            // Draw QR image
            ctx.drawImage(img, qrX, qrY, qrSize, qrSize);
            // Scan hint below QR
            ctx.fillStyle = mutedColor;
            ctx.font = "13px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
            ctx.textAlign = "center";
            ctx.globalAlpha = 0.6;
            ctx.fillText(lang === "zh" ? "扫码访问" : "Scan to visit", cx, qrY + qrSize + 24);
            ctx.globalAlpha = 1;
          };
          img.src = dataUrl;
        })
        .catch(() => {
          // Fallback: just show URL text
          ctx.fillStyle = mutedColor;
          ctx.font = "13px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
          ctx.textAlign = "center";
          ctx.globalAlpha = 0.6;
          ctx.fillText(url, cx, qrY + 20);
          ctx.globalAlpha = 1;
        });
    }
  }, [open, lang, t, share]);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(drawPoster, 50);
      return () => clearTimeout(timer);
    }
  }, [open, drawPoster]);

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "share-poster.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <>
      {/* Floating share button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-6 z-50 w-12 h-12 rounded-full bg-accent text-white shadow-lg shadow-accent/25 hover:shadow-accent/40 hover:scale-110 transition-all flex items-center justify-center group"
        title={share.button}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        <span className="absolute left-full ml-3 px-3 py-1 bg-bg-card-solid text-text text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg border border-line">
          {share.button}
        </span>
      </button>

      {/* Modal overlay */}
      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative bg-bg-card-solid rounded-2xl shadow-2xl max-w-[420px] w-full max-h-[90vh] overflow-auto border border-line"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: "fadeSlideUp 0.3s ease forwards" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h3 className="font-bold text-lg text-text">{share.title}</h3>
              <button onClick={() => setOpen(false)} className="text-text-muted hover:text-text p-1 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Canvas poster */}
            <div className="px-5 flex justify-center">
              <canvas
                ref={canvasRef}
                className="rounded-xl shadow-inner w-full"
                style={{ maxWidth: 375 }}
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 p-5">
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 rounded-xl bg-accent text-white font-medium text-sm hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                {share.save}
              </button>
              <button
                onClick={handleCopy}
                className={\`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 border \${copied ? "bg-green/10 border-green/30 text-green" : "border-line text-text hover:border-accent/30"}\`}
              >
                {copied ? (
                  <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>{share.copied}</>
                ) : (
                  <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>{share.copy}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// --- Canvas helpers ---

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split("");
  const lines: string[] = [];
  let line = "";
  for (const char of words) {
    const test = line + char;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = char;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function hexToRgb(hex: string): [number, number, number] {
  hex = hex.replace("#", "");
  if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  return [parseInt(hex.slice(0,2),16), parseInt(hex.slice(2,4),16), parseInt(hex.slice(4,6),16)];
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r,g,b].map(v => Math.round(v).toString(16).padStart(2,"0")).join("");
}

function mixColor(c1: string, c2: string, ratio: number): string {
  try {
    const [r1,g1,b1] = hexToRgb(c1);
    const [r2,g2,b2] = hexToRgb(c2);
    return rgbToHex(r1+(r2-r1)*ratio, g1+(g2-g1)*ratio, b1+(b2-b1)*ratio);
  } catch { return c1; }
}

function isLight(hex: string): boolean {
  try {
    const [r,g,b] = hexToRgb(hex);
    return (r*299 + g*587 + b*114) / 1000 > 128;
  } catch { return false; }
}

`;
}

function genChatBot(): string {
  return `"use client";

import { useState, useRef, useEffect } from "react";
import { useLanguage } from "./LanguageProvider";

interface Message { role: "user" | "assistant"; content: string; }

export default function ChatBot() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs); setInput(""); setLoading(true);
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: newMsgs }) });
      if (!res.ok) throw new Error();
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let content = "";
      setMessages([...newMsgs, { role: "assistant", content: "" }]);
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        content += decoder.decode(value, { stream: true });
        setMessages([...newMsgs, { role: "assistant", content }]);
      }
    } catch {
      setMessages([...newMsgs, { role: "assistant", content: "Sorry, something went wrong." }]);
    } finally { setLoading(false); }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <button onClick={() => setOpen(!open)} className="w-14 h-14 rounded-full shadow-lg bg-accent flex items-center justify-center text-white transition-transform hover:scale-105">
          {open ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          )}
        </button>
      </div>
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-h-[520px] bg-bg-card-solid border border-line rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in">
          <div className="px-4 py-3 border-b border-line">
            <p className="text-sm font-semibold">{t.chatbot.title}</p>
            <p className="text-xs text-text-muted">{t.chatbot.subtitle}</p>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-[300px]">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-sm text-text-muted text-center py-2">{t.chatbot.welcome}</p>
                <div className="space-y-2">
                  {t.chatbot.suggestions.map((s) => (
                    <button key={s} onClick={() => send(s)} className="w-full text-left text-sm bg-bg-tag hover:bg-accent/10 text-text-muted hover:text-accent px-3 py-2 rounded-lg border border-line hover:border-accent/30 transition-colors">{s}</button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={\`flex \${msg.role === "user" ? "justify-end" : "justify-start"}\`}>
                <div className={\`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed whitespace-pre-wrap \${msg.role === "user" ? "bg-accent text-white rounded-br-sm" : "bg-bg-tag text-text rounded-bl-sm"}\`}>
                  {msg.content || (loading && i === messages.length - 1 ? "..." : "")}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <div className="px-4 py-3 border-t border-line">
            <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder={t.chatbot.placeholder} disabled={loading} className="flex-1 bg-bg text-text text-sm px-3 py-2 rounded-lg border border-line focus:border-accent focus:outline-none placeholder:text-text-muted disabled:opacity-50" />
              <button type="submit" disabled={loading || !input.trim()} className="bg-accent hover:bg-accent/80 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-sm transition-colors">{t.chatbot.send}</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
`;
}

function genChatRoute(data: WorkspaceData): string {
  const ctx = data.chatbotContext.replace(/`/g, "\\`").replace(/\$/g, "\\$");
  return `import { NextRequest } from "next/server";

const SYSTEM_PROMPT = \`You are ${data.name}'s AI avatar. Answer based on the following profile. Use first person. Be concise (under 200 words).

${ctx}\`;

export async function POST(req: NextRequest) {
  const { messages } = await req.json();
  const apiKey = process.env.SILICONFLOW_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "API key not configured. Set SILICONFLOW_API_KEY in .env.local" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }

  const response = await fetch("https://api.siliconflow.cn/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: \`Bearer \${apiKey}\` },
    body: JSON.stringify({
      model: "Pro/zai-org/GLM-5",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      temperature: 0.7, max_tokens: 1024, stream: true,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    return new Response(JSON.stringify({ error: err }), { status: response.status, headers: { "Content-Type": "application/json" } });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;
          const data = trimmed.slice(6);
          if (data === "[DONE]") { controller.close(); return; }
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) controller.enqueue(encoder.encode(content));
          } catch {}
        }
      }
      controller.close();
    },
  });

  return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
`;
}
