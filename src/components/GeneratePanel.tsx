"use client";

import { useState } from "react";
import type { WorkspaceData, UserSelections } from "@/lib/types";
import { SITE_TYPE_OPTIONS, ALL_LAYOUT_OPTIONS, ALL_THEME_OPTIONS } from "@/lib/questions";
import { getImageTasks } from "@/lib/image-prompts";

interface Props {
  data: WorkspaceData;
  selections: UserSelections;
}

export default function GeneratePanel({ data, selections }: Props) {
  const [status, setStatus] = useState<"idle" | "generating" | "images" | "installing" | "ready" | "error">("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [imageProgress, setImageProgress] = useState("");

  const siteLabel = selections.siteType === "custom"
    ? `自定义：${selections.customSiteType || "自定义"}`
    : SITE_TYPE_OPTIONS.find(o => o.value === selections.siteType)?.label || "";
  const layoutLabel = selections.layout === "custom"
    ? `自定义：${selections.customLayout || "自定义"}`
    : ALL_LAYOUT_OPTIONS.find(o => o.value === selections.layout)?.label || "";
  const themeLabel = selections.theme === "custom"
    ? `自定义：${selections.customTheme || "自定义"}`
    : ALL_THEME_OPTIONS.find(o => o.value === selections.theme)?.label || "";

  const enabledFeatures = Object.entries(selections.features)
    .filter(([, v]) => v)
    .map(([k]) => k);

  const handleGenerate = async () => {
    setStatus("generating");
    setErrorMsg("");
    try {
      // 1. Generate code files
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, selections }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Generation failed");
      }

      const { url } = await res.json();

      // 2. Generate AI images if needed
      const theme = selections.theme || "minimalist";
      const imageTasks = getImageTasks(theme, data.name, data.projects.map(p => ({ title: p.title, tags: p.tags })));

      if (imageTasks.length > 0) {
        setStatus("images");
        for (const task of imageTasks) {
          setImageProgress(`正在生成：${task.filename}...`);
          try {
            await fetch("/api/generate-image", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                prompt: task.prompt,
                filename: task.filename,
                style: theme,
              }),
            });
          } catch {
            // Image generation is best-effort, don't block on failure
            console.warn(`Failed to generate image: ${task.filename}`);
          }
        }
      }

      setStatus("installing");

      // 3. Wait for dev server to boot (poll until ready, max 30s)
      const maxWait = 30_000;
      const interval = 1_000;
      const start = Date.now();
      while (Date.now() - start < maxWait) {
        try {
          const health = await fetch(url, { mode: "no-cors" });
          if (health) break;
        } catch {
          // Server not ready yet
        }
        await new Promise(r => setTimeout(r, interval));
      }

      setPreviewUrl(url);
      setStatus("ready");
      setShowPreview(true);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
      setStatus("error");
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Summary card */}
      <div className="rounded-2xl border border-line bg-white/[0.03] p-6 mb-6" style={{ animation: "fadeSlideUp 0.4s ease forwards" }}>
        <h3 className="font-semibold text-text mb-4">配置摘要</h3>
        <div className="space-y-3 text-sm">
          <Row label="所有者" value={data.name} />
          <Row label="网站类型" value={siteLabel} />
          <Row label="页面布局" value={layoutLabel} />
          <Row label="视觉风格" value={themeLabel} />
          <div className="flex justify-between items-start">
            <span className="text-text-muted">功能</span>
            <div className="flex flex-wrap gap-1 justify-end max-w-[240px]">
              {enabledFeatures.map((f) => (
                <span key={f} className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent">{f}</span>
              ))}
            </div>
          </div>
          <div className="border-t border-line pt-3 space-y-2">
            <div className="flex justify-between items-start">
              <span className="text-text-muted">项目</span>
              <div className="flex flex-wrap gap-1 justify-end max-w-[280px]">
                {data.projects.map((p) => (
                  <span key={p.title} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-text-muted">{p.title}</span>
                ))}
              </div>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-text-muted">技能</span>
              <div className="flex flex-wrap gap-1 justify-end max-w-[280px]">
                {data.skills.flatMap((g) => g.skills).slice(0, 12).map((s) => (
                  <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-text-muted">{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {status === "error" && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {errorMsg}
        </div>
      )}

      {/* Generate button */}
      {status !== "ready" && (
        <button
          onClick={handleGenerate}
          disabled={status !== "idle" && status !== "error"}
          className={`
            w-full py-4 rounded-xl font-semibold text-sm transition-all duration-300
            ${status !== "idle" && status !== "error"
              ? "bg-accent/20 text-accent border border-accent/30 cursor-wait"
              : "bg-accent text-white hover:bg-accent/90 shadow-lg shadow-accent/20 hover:shadow-accent/30"
            }
          `}
        >
          {status === "generating" ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner /> 正在生成文件...
            </span>
          ) : status === "images" ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner /> {imageProgress || "正在生成 AI 图片..."}
            </span>
          ) : status === "installing" ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner /> 正在安装依赖并启动服务...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              生成并预览
            </span>
          )}
        </button>
      )}

      {/* Preview result */}
      {status === "ready" && previewUrl && (
        <div style={{ animation: "fadeSlideUp 0.4s ease forwards" }}>
          {/* URL bar */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-green/10 border border-green/20 mb-4">
            <div className="w-8 h-8 rounded-lg bg-green/20 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-green">网站已上线！</p>
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-accent hover:underline break-all"
              >
                {previewUrl}
              </a>
            </div>
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors"
            >
              打开
            </a>
          </div>

          {/* Toggle preview */}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="w-full text-sm text-text-muted hover:text-text py-2 flex items-center justify-center gap-2 transition-colors"
          >
            <svg className={`w-4 h-4 transition-transform ${showPreview ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            {showPreview ? "隐藏预览" : "显示预览"}
          </button>

          {/* Iframe preview */}
          {showPreview && (
            <div className="mt-3 rounded-2xl border border-line overflow-hidden bg-white" style={{ animation: "fadeSlideUp 0.3s ease forwards" }}>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] border-b border-line">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
                  <div className="w-3 h-3 rounded-full bg-green/60" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-xs text-text-muted">{previewUrl}</span>
                </div>
              </div>
              <iframe
                src={previewUrl}
                className="w-full border-0"
                style={{ height: "600px" }}
                title="Website Preview"
              />
            </div>
          )}

          {/* Re-generate button */}
          <button
            onClick={() => { setStatus("idle"); setShowPreview(false); }}
            className="w-full mt-4 py-3 rounded-xl text-sm text-text-muted hover:text-text border border-line hover:border-accent/30 transition-all"
          >
            使用不同配置重新生成
          </button>

          <p className="text-xs text-text-muted text-center mt-4">
            生成的文件在 <code className="text-accent">output/</code> 目录。可自定义 <code className="text-accent">src/i18n/translations.ts</code>，图片放入 <code className="text-accent">public/images/</code>。
          </p>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-text-muted">{label}</span>
      <span className="text-text font-medium text-right">{value}</span>
    </div>
  );
}

function Spinner() {
  return <div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />;
}
