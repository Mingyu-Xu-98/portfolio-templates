export interface WorkspaceData {
  name: string;
  nameEn: string;
  title: string;
  titleEn: string;
  email: string;
  location: string;
  locationEn: string;
  skills: SkillGroup[];
  skillsEn: SkillGroup[];
  projects: ProjectItem[];
  projectsEn: ProjectItem[];
  timeline: TimelineItem[];
  timelineEn: TimelineItem[];
  education: EducationItem[];
  educationEn: EducationItem[];
  tags: string[];
  tagsEn: string[];
  github?: string;
  linkedin?: string;
  chatbotContext: string;
}

export interface SkillGroup {
  title: string;
  skills: string[];
}

export interface ProjectItem {
  title: string;
  org: string;
  desc: string;
  tags: string[];
  image: string;
  link?: string;
  badge?: string;
}

export interface TimelineItem {
  date: string;
  title: string;
  desc: string;
  active?: boolean;
}

export interface EducationItem {
  school: string;
  degree: string;
  highlights: string[];
}

// ---- Selection types ----

export type SiteType = "portfolio" | "brand" | "blog" | "landing" | "custom";

export type ThemeStyle = "cyberpunk" | "minimalist" | "ghibli" | "glassmorphism" | "retro" | "brutalist"
  | "cinematic" | "bold-creative" | "editorial" | "nature" | "gradient-mesh" | "neo-tokyo"
  | "tpl-business" | "tpl-resume-bold" | "tpl-resume-dark" | "custom";

export type LayoutType = "two-column" | "split-screen" | "asymmetric" | "f-shape" | "z-shape"
  | "card-grid" | "hero-media" | "masonry" | "magazine" | "fixed-nav" | "hidden-nav"
  | "interactive" | "custom";

export interface QuestionOption<T extends string> {
  value: T;
  icon: string;
  label: string;
  labelEn: string;
  desc: string;
  descEn: string;
  preview?: string;
}

export interface DesignIntelligence {
  style?: { category?: string };
  typography?: { bodyFont?: string; headingFont?: string; cssImport?: string };
}

// ---- Design System (from ui-skill BM25 engine) ----

export interface DesignSystemData {
  query: string;
  pattern: {
    name: string;
    sections: string;
    ctaPlacement: string;
    colorStrategy: string;
    conversionFocus: string;
  };
  style: {
    name: string;
    keywords: string;
    bestFor: string;
    cssKeywords: string;
    designVars: string;
    effects: string;
    performance: string;
    accessibility: string;
  };
  colors: {
    primary: string;
    onPrimary: string;
    secondary: string;
    onSecondary: string;
    accent: string;
    onAccent: string;
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    muted: string;
    mutedForeground: string;
    border: string;
    destructive: string;
    onDestructive: string;
    ring: string;
  };
  typography: {
    pairingName: string;
    headingFont: string;
    bodyFont: string;
    mood: string;
    cssImport: string;
    tailwindConfig: string;
  };
  effects: string;
  antiPatterns: string[];
}

// ---- Feature Flags ----

export interface FeatureFlags {
  chatbot: boolean;
  i18n: boolean;
  darkMode: boolean;
  animations: boolean;
  typewriter: boolean;
  share: boolean;
}

// ---- User Selections ----

export interface UserSelections {
  siteType: SiteType | null;
  theme: ThemeStyle | null;
  layout: LayoutType | null;
  customSiteType: string;
  customTheme: string;
  customLayout: string;
  features: FeatureFlags;
}

export interface WizardStep {
  id: string;
  title: string;
  subtitle: string;
}

export const DEFAULT_FEATURES: FeatureFlags = {
  chatbot: true,
  i18n: true,
  darkMode: false,
  animations: true,
  typewriter: false,
  share: true,
};

export const INITIAL_SELECTIONS: UserSelections = {
  siteType: null,
  theme: null,
  layout: null,
  customSiteType: "",
  customTheme: "",
  customLayout: "",
  features: { ...DEFAULT_FEATURES },
};

export const WIZARD_STEPS: WizardStep[] = [
  { id: "upload",   title: "上传工作区",   subtitle: "上传你的工作区压缩包" },
  { id: "siteType", title: "网站类型",     subtitle: "选择要构建的网站类型" },
  { id: "theme",    title: "视觉风格",     subtitle: "选择一种独特的设计风格" },
  { id: "features", title: "功能选项",     subtitle: "开关额外功能" },
  { id: "generate", title: "生成网站",     subtitle: "预览你的网站" },
];

export interface FeatureOption {
  key: string;
  icon: string;
  label: string;
  desc: string;
  default: boolean;
}

export const FEATURE_OPTIONS: FeatureOption[] = [
  { key: "chatbot",    icon: "message",  label: "AI 聊天机器人",  desc: "由大语言模型驱动的智能对话",     default: true },
  { key: "i18n",       icon: "globe",    label: "中英双语",       desc: "中文 + 英文语言切换",           default: true },
  { key: "darkMode",   icon: "moon",     label: "暗色模式",       desc: "明暗主题切换",                  default: false },
  { key: "animations", icon: "sparkle",  label: "动画效果",       desc: "悬停效果、过渡动画、粒子特效",   default: true },
  { key: "typewriter", icon: "terminal", label: "打字机效果",     desc: "首屏打字动画效果",              default: false },
  { key: "share",      icon: "share",    label: "分享海报",       desc: "一键生成精美分享海报，邀请他人对话", default: true },
];
