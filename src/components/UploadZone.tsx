"use client";

import { useState, useRef, useCallback } from "react";

interface Props {
  onFileAccepted: (file: File) => void;
  loading: boolean;
}

export default function UploadZone({ onFileAccepted, loading }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (file.name.endsWith(".zip") || file.type === "application/zip" || file.type === "application/x-zip-compressed") {
        onFileAccepted(file);
      }
    },
    [onFileAccepted],
  );

  return (
    <div className="max-w-xl mx-auto">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
        onClick={() => inputRef.current?.click()}
        className={`
          relative cursor-pointer rounded-2xl border-2 border-dashed p-16
          flex flex-col items-center justify-center gap-4
          transition-all duration-300
          ${dragOver ? "border-accent bg-accent/5 scale-[1.02]" : "border-line hover:border-accent/40 hover:bg-white/[0.02]"}
          ${loading ? "pointer-events-none opacity-60" : ""}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".zip"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />

        {loading ? (
          <>
            <div className="w-12 h-12 border-3 border-accent/30 border-t-accent rounded-full animate-spin" />
            <p className="text-text-muted text-sm">正在分析工作区...</p>
          </>
        ) : (
          <>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${dragOver ? "bg-accent/20" : "bg-white/5"}`}>
              <svg className={`w-8 h-8 transition-colors ${dragOver ? "text-accent" : "text-text-muted"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-text font-medium">
                拖拽 <span className="text-accent">workspace.zip</span> 到这里
              </p>
              <p className="text-text-muted text-sm mt-1">或点击选择文件</p>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-1.5 h-1.5 rounded-full bg-accent/50" />
              <span className="text-xs text-text-muted">支持包含 SKU 知识结构的工作区压缩包</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
