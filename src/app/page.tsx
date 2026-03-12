"use client";

import { useState, useCallback } from "react";
import type { WorkspaceData, UserSelections, SiteType, ThemeStyle } from "@/lib/types";
import { INITIAL_SELECTIONS, WIZARD_STEPS } from "@/lib/types";
import { analyzeWorkspace } from "@/lib/analyzer";
import { getAutoLayout, getStylesForSiteType } from "@/lib/questions";

import StepIndicator from "@/components/StepIndicator";
import UploadZone from "@/components/UploadZone";
import QuestionCard from "@/components/QuestionCard";
import SpecPanel from "@/components/SpecPanel";
import GeneratePanel from "@/components/GeneratePanel";

export default function Home() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [workspaceData, setWorkspaceData] = useState<WorkspaceData | null>(null);
  const [selections, setSelections] = useState<UserSelections>({ ...INITIAL_SELECTIONS });
  const [error, setError] = useState<string | null>(null);

  const currentStepId = WIZARD_STEPS[step]?.id;

  const handleUpload = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeWorkspace(file);
      setWorkspaceData(data);
      setStep(1);
    } catch (e) {
      setError(`解析工作区失败：${e instanceof Error ? e.message : "未知错误"}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const canNext = (): boolean => {
    switch (currentStepId) {
      case "upload": return false;
      case "siteType": return !!selections.siteType;
      case "theme": return !!selections.theme;
      case "spec": return false;
      case "generate": return false;
      default: return false;
    }
  };

  const next = () => {
    if (!canNext()) return;
    if (step < WIZARD_STEPS.length - 1) setStep(step + 1);
  };

  const back = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="wizard-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 pb-12">
        {/* Header */}
        <header className="pt-10 pb-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            创建<span className="text-accent">任意</span>简历网站
          </h1>
          <p className="text-sm text-text-muted mt-1">
            上传工作区，选择风格，一键生成个人简历网站
          </p>
        </header>

        {/* Step Indicator */}
        <StepIndicator currentStep={step} />

        {/* Step Content */}
        <div className="mt-4">
          {/* Step title */}
          <div className="text-center mb-8 step-content" key={`title-${step}`}>
            <h2 className="text-xl font-bold">{WIZARD_STEPS[step].title}</h2>
            <p className="text-sm text-text-muted mt-1">{WIZARD_STEPS[step].subtitle}</p>
          </div>

          {/* Error display */}
          {error && (
            <div className="max-w-xl mx-auto mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Step body */}
          <div className="step-content" key={`body-${step}`}>
            {currentStepId === "upload" && (
              <UploadZone onFileAccepted={handleUpload} loading={loading} />
            )}

            {currentStepId === "siteType" && (
              <QuestionCard
                options={[
                  { value: "portfolio", icon: "briefcase", label: "个人简历网站", desc: "展示你的职业经历、项目、技能和教育背景" },
                  { value: "brand", icon: "star", label: "品牌官网", desc: "专业品牌形象，强烈视觉识别" },
                  { value: "custom", icon: "pencil", label: "自定义", desc: "用自己的话描述理想的网站类型" },
                ]}
                selected={selections.siteType}
                onSelect={(v) => setSelections({ ...selections, siteType: v as SiteType })}
                customText={selections.customSiteType}
                onCustomTextChange={(t) => setSelections({ ...selections, customSiteType: t })}
              />
            )}

            {currentStepId === "theme" && (
              <QuestionCard
                options={getStylesForSiteType(selections.siteType).map(o => ({
                  value: o.value,
                  icon: o.icon,
                  label: o.label,
                  desc: o.desc,
                  preview: o.preview,
                }))}
                selected={selections.theme}
                onSelect={(v) => {
                  const autoLayout = getAutoLayout(v, selections.siteType, selections.customTheme);
                  setSelections({ ...selections, theme: v as ThemeStyle, layout: autoLayout });
                }}
                customText={selections.customTheme}
                onCustomTextChange={(t) => {
                  const autoLayout = getAutoLayout("custom", selections.siteType, t);
                  setSelections({ ...selections, customTheme: t, layout: autoLayout });
                }}
              />
            )}

            {currentStepId === "spec" && workspaceData && (
              <SpecPanel
                data={workspaceData}
                onUpdate={(updated) => setWorkspaceData(updated)}
                onConfirm={() => setStep(step + 1)}
              />
            )}

            {currentStepId === "generate" && workspaceData && (
              <GeneratePanel data={workspaceData} selections={selections} />
            )}
          </div>
        </div>

        {/* Navigation */}
        {currentStepId !== "upload" && (
          <div className="flex justify-between items-center mt-10 max-w-3xl mx-auto">
            <button
              onClick={back}
              className="flex items-center gap-2 text-sm text-text-muted hover:text-text px-5 py-2.5 rounded-xl border border-line hover:border-accent/30 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              上一步
            </button>

            {currentStepId !== "generate" && currentStepId !== "spec" && (
              <button
                onClick={next}
                disabled={!canNext()}
                className={`
                  flex items-center gap-2 text-sm px-6 py-2.5 rounded-xl font-medium transition-all
                  ${canNext()
                    ? "bg-accent text-white hover:bg-accent/90 shadow-lg shadow-accent/20"
                    : "bg-white/5 text-text-muted cursor-not-allowed"
                  }
                `}
              >
                下一步
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
