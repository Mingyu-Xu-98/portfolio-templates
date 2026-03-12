"use client";

import { useState, useCallback } from "react";
import type { WorkspaceData, SkillGroup, ProjectItem, TimelineItem, EducationItem } from "@/lib/types";

interface Props {
  data: WorkspaceData;
  onUpdate: (data: WorkspaceData) => void;
  onConfirm: () => void;
}

/* ── Helpers ── */

function SectionHeader({
  title, count, empty, expanded, onToggle,
}: {
  title: string; count: number; empty?: boolean; expanded: boolean; onToggle: () => void;
}) {
  return (
    <button onClick={onToggle} className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors rounded-t-xl">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${empty ? "bg-yellow-500" : "bg-emerald-500"}`} />
        <span className="font-semibold text-sm text-text">{title}</span>
        <span className="text-xs text-text-muted">
          {empty ? "(空 - 将跳过)" : `(${count})`}
        </span>
      </div>
      <svg className={`w-4 h-4 text-text-muted transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}

function FieldRow({ label, value, onChange, multiline, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; multiline?: boolean; placeholder?: string;
}) {
  const cls = "w-full bg-white/[0.03] text-text text-sm px-3 py-2 rounded-lg border border-line focus:border-accent focus:outline-none transition-colors";
  return (
    <div className="space-y-1">
      <label className="text-xs text-text-muted">{label}</label>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className={cls + " resize-y"} placeholder={placeholder} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} className={cls} placeholder={placeholder} />
      )}
    </div>
  );
}

function TagEditor({ tags, onChange }: { tags: string[]; onChange: (t: string[]) => void }) {
  const [input, setInput] = useState("");
  const add = () => {
    const v = input.trim();
    if (v && !tags.includes(v)) { onChange([...tags, v]); setInput(""); }
  };
  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      {tags.map((tag, i) => (
        <span key={i} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-accent/10 text-accent">
          {tag}
          <button onClick={() => onChange(tags.filter((_, j) => j !== i))} className="hover:text-red-400 transition-colors">&times;</button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
        placeholder="添加标签..."
        className="text-xs bg-transparent border-none outline-none text-text-muted w-24"
      />
    </div>
  );
}

/* ── Main Component ── */

export default function SpecPanel({ data, onUpdate, onConfirm }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["personal", "bio", "skills", "projects", "timeline", "education"]));

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const update = useCallback(<K extends keyof WorkspaceData>(field: K, value: WorkspaceData[K]) => {
    onUpdate({ ...data, [field]: value });
  }, [data, onUpdate]);

  const updateProject = (idx: number, field: keyof ProjectItem, value: string | string[]) => {
    const arr = [...data.projects];
    arr[idx] = { ...arr[idx], [field]: value };
    update("projects", arr);
  };
  const updateProjectEn = (idx: number, field: keyof ProjectItem, value: string | string[]) => {
    const arr = [...data.projectsEn];
    arr[idx] = { ...arr[idx], [field]: value };
    update("projectsEn", arr);
  };

  const updateTimeline = (idx: number, field: keyof TimelineItem, value: string | boolean) => {
    const arr = [...data.timeline];
    arr[idx] = { ...arr[idx], [field]: value };
    update("timeline", arr);
  };
  const updateTimelineEn = (idx: number, field: keyof TimelineItem, value: string | boolean) => {
    const arr = [...data.timelineEn];
    arr[idx] = { ...arr[idx], [field]: value };
    update("timelineEn", arr);
  };

  const updateSkill = (idx: number, field: keyof SkillGroup, value: string | string[]) => {
    const arr = [...data.skills];
    arr[idx] = { ...arr[idx], [field]: value };
    update("skills", arr);
  };
  const updateSkillEn = (idx: number, field: keyof SkillGroup, value: string | string[]) => {
    const arr = [...data.skillsEn];
    arr[idx] = { ...arr[idx], [field]: value };
    update("skillsEn", arr);
  };

  const updateEdu = (idx: number, field: keyof EducationItem, value: string | string[]) => {
    const arr = [...data.education];
    arr[idx] = { ...arr[idx], [field]: value };
    update("education", arr);
  };
  const updateEduEn = (idx: number, field: keyof EducationItem, value: string | string[]) => {
    const arr = [...data.educationEn];
    arr[idx] = { ...arr[idx], [field]: value };
    update("educationEn", arr);
  };

  const removeProject = (idx: number) => {
    update("projects", data.projects.filter((_, i) => i !== idx));
    update("projectsEn", data.projectsEn.filter((_, i) => i !== idx));
  };
  const removeTimeline = (idx: number) => {
    update("timeline", data.timeline.filter((_, i) => i !== idx));
    update("timelineEn", data.timelineEn.filter((_, i) => i !== idx));
  };
  const removeEdu = (idx: number) => {
    update("education", data.education.filter((_, i) => i !== idx));
    update("educationEn", data.educationEn.filter((_, i) => i !== idx));
  };
  const removeSkill = (idx: number) => {
    update("skills", data.skills.filter((_, i) => i !== idx));
    update("skillsEn", data.skillsEn.filter((_, i) => i !== idx));
  };

  const sectionCard = "rounded-2xl border border-line bg-white/[0.03] mb-4 overflow-hidden";

  return (
    <div className="max-w-3xl mx-auto" style={{ animation: "fadeSlideUp 0.4s ease forwards" }}>
      {/* ── Personal Info ── */}
      <div className={sectionCard}>
        <SectionHeader title="个人信息" count={1} expanded={expanded.has("personal")} onToggle={() => toggle("personal")} />
        {expanded.has("personal") && (
          <div className="px-4 pb-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <FieldRow label="姓名" value={data.name} onChange={(v) => update("name", v)} />
              <FieldRow label="Name (EN)" value={data.nameEn} onChange={(v) => update("nameEn", v)} />
              <FieldRow label="职位" value={data.title} onChange={(v) => update("title", v)} />
              <FieldRow label="Title (EN)" value={data.titleEn} onChange={(v) => update("titleEn", v)} />
              <FieldRow label="邮箱" value={data.email} onChange={(v) => update("email", v)} />
              <FieldRow label="地点" value={data.location} onChange={(v) => update("location", v)} />
              <FieldRow label="Location (EN)" value={data.locationEn} onChange={(v) => update("locationEn", v)} />
              <FieldRow label="GitHub" value={data.github || ""} onChange={(v) => update("github", v)} placeholder="https://github.com/..." />
              <FieldRow label="LinkedIn" value={data.linkedin || ""} onChange={(v) => update("linkedin", v)} placeholder="https://linkedin.com/in/..." />
            </div>
          </div>
        )}
      </div>

      {/* ── Bio ── */}
      <div className={sectionCard}>
        <SectionHeader title="个人简介" count={data.bio ? 1 : 0} empty={!data.bio} expanded={expanded.has("bio")} onToggle={() => toggle("bio")} />
        {expanded.has("bio") && (
          <div className="px-4 pb-4 space-y-3">
            <FieldRow label="简介 (中文)" value={data.bio} onChange={(v) => update("bio", v)} multiline />
            <FieldRow label="Bio (EN)" value={data.bioEn} onChange={(v) => update("bioEn", v)} multiline />
            <div>
              <label className="text-xs text-text-muted mb-1 block">标签</label>
              <TagEditor tags={data.bioTags} onChange={(t) => update("bioTags", t)} />
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">Tags (EN)</label>
              <TagEditor tags={data.bioTagsEn} onChange={(t) => update("bioTagsEn", t)} />
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">关键词标签</label>
              <TagEditor tags={data.tags} onChange={(t) => update("tags", t)} />
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">Keywords (EN)</label>
              <TagEditor tags={data.tagsEn} onChange={(t) => update("tagsEn", t)} />
            </div>
          </div>
        )}
      </div>

      {/* ── Skills ── */}
      <div className={sectionCard}>
        <SectionHeader title="专业技能" count={data.skills.length} empty={data.skills.length === 0} expanded={expanded.has("skills")} onToggle={() => toggle("skills")} />
        {expanded.has("skills") && (
          <div className="px-4 pb-4 space-y-4">
            {data.skills.map((group, i) => (
              <div key={i} className="p-3 rounded-xl border border-line/50 bg-white/[0.02] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="grid grid-cols-2 gap-2 flex-1 mr-2">
                    <input
                      value={group.title}
                      onChange={(e) => updateSkill(i, "title", e.target.value)}
                      className="text-sm font-medium bg-transparent border-none outline-none text-text"
                      placeholder="分组名称"
                    />
                    <input
                      value={data.skillsEn[i]?.title || ""}
                      onChange={(e) => updateSkillEn(i, "title", e.target.value)}
                      className="text-sm bg-transparent border-none outline-none text-text-muted"
                      placeholder="Group name (EN)"
                    />
                  </div>
                  <button onClick={() => removeSkill(i)} className="text-xs text-red-400 hover:text-red-300 shrink-0">删除</button>
                </div>
                <div>
                  <label className="text-xs text-text-muted">技能</label>
                  <TagEditor tags={group.skills} onChange={(t) => updateSkill(i, "skills", t)} />
                </div>
                <div>
                  <label className="text-xs text-text-muted">Skills (EN)</label>
                  <TagEditor tags={data.skillsEn[i]?.skills || []} onChange={(t) => updateSkillEn(i, "skills", t)} />
                </div>
              </div>
            ))}
            <button
              onClick={() => {
                update("skills", [...data.skills, { title: "", skills: [] }]);
                update("skillsEn", [...data.skillsEn, { title: "", skills: [] }]);
              }}
              className="text-xs text-accent hover:text-accent/80 transition-colors"
            >+ 添加技能分组</button>
          </div>
        )}
      </div>

      {/* ── Projects ── */}
      <div className={sectionCard}>
        <SectionHeader title="项目经验" count={data.projects.length} empty={data.projects.length === 0} expanded={expanded.has("projects")} onToggle={() => toggle("projects")} />
        {expanded.has("projects") && (
          <div className="px-4 pb-4 space-y-3">
            {data.projects.map((p, i) => (
              <div key={i} className="p-3 rounded-xl border border-line/50 bg-white/[0.02] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-text">{p.title || `项目 ${i + 1}`}</span>
                  <button onClick={() => removeProject(i)} className="text-xs text-red-400 hover:text-red-300">删除</button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <FieldRow label="项目名" value={p.title} onChange={(v) => updateProject(i, "title", v)} />
                  <FieldRow label="Title (EN)" value={data.projectsEn[i]?.title || ""} onChange={(v) => updateProjectEn(i, "title", v)} />
                  <FieldRow label="组织" value={p.org} onChange={(v) => updateProject(i, "org", v)} />
                  <FieldRow label="Org (EN)" value={data.projectsEn[i]?.org || ""} onChange={(v) => updateProjectEn(i, "org", v)} />
                </div>
                <FieldRow label="描述" value={p.desc} onChange={(v) => updateProject(i, "desc", v)} multiline />
                <FieldRow label="Description (EN)" value={data.projectsEn[i]?.desc || ""} onChange={(v) => updateProjectEn(i, "desc", v)} multiline />
                <div className="grid grid-cols-2 gap-2">
                  <FieldRow label="链接" value={p.link || ""} onChange={(v) => updateProject(i, "link", v)} placeholder="https://..." />
                  <FieldRow label="徽章" value={p.badge || ""} onChange={(v) => updateProject(i, "badge", v)} placeholder="Featured / Open Source" />
                </div>
                <div>
                  <label className="text-xs text-text-muted">标签</label>
                  <TagEditor tags={p.tags} onChange={(t) => updateProject(i, "tags", t)} />
                </div>
              </div>
            ))}
            <button
              onClick={() => {
                const blank: ProjectItem = { title: "", org: "", desc: "", tags: [], image: "" };
                update("projects", [...data.projects, blank]);
                update("projectsEn", [...data.projectsEn, blank]);
              }}
              className="text-xs text-accent hover:text-accent/80 transition-colors"
            >+ 添加项目</button>
          </div>
        )}
      </div>

      {/* ── Timeline ── */}
      <div className={sectionCard}>
        <SectionHeader title="职业经历" count={data.timeline.length} empty={data.timeline.length === 0} expanded={expanded.has("timeline")} onToggle={() => toggle("timeline")} />
        {expanded.has("timeline") && (
          <div className="px-4 pb-4 space-y-3">
            {data.timeline.map((item, i) => (
              <div key={i} className="p-3 rounded-xl border border-line/50 bg-white/[0.02] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-text">{item.title || `经历 ${i + 1}`}</span>
                  <button onClick={() => removeTimeline(i)} className="text-xs text-red-400 hover:text-red-300">删除</button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <FieldRow label="日期" value={item.date} onChange={(v) => updateTimeline(i, "date", v)} />
                  <FieldRow label="Date (EN)" value={data.timelineEn[i]?.date || ""} onChange={(v) => updateTimelineEn(i, "date", v)} />
                  <FieldRow label="标题" value={item.title} onChange={(v) => updateTimeline(i, "title", v)} />
                  <FieldRow label="Title (EN)" value={data.timelineEn[i]?.title || ""} onChange={(v) => updateTimelineEn(i, "title", v)} />
                </div>
                <FieldRow label="描述" value={item.desc} onChange={(v) => updateTimeline(i, "desc", v)} multiline />
                <FieldRow label="Description (EN)" value={data.timelineEn[i]?.desc || ""} onChange={(v) => updateTimelineEn(i, "desc", v)} multiline />
              </div>
            ))}
            <button
              onClick={() => {
                const blank: TimelineItem = { date: "", title: "", desc: "" };
                update("timeline", [...data.timeline, blank]);
                update("timelineEn", [...data.timelineEn, blank]);
              }}
              className="text-xs text-accent hover:text-accent/80 transition-colors"
            >+ 添加经历</button>
          </div>
        )}
      </div>

      {/* ── Education ── */}
      <div className={sectionCard}>
        <SectionHeader title="教育背景" count={data.education.length} empty={data.education.length === 0} expanded={expanded.has("education")} onToggle={() => toggle("education")} />
        {expanded.has("education") && (
          <div className="px-4 pb-4 space-y-3">
            {data.education.map((edu, i) => (
              <div key={i} className="p-3 rounded-xl border border-line/50 bg-white/[0.02] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-text">{edu.school || `教育 ${i + 1}`}</span>
                  <button onClick={() => removeEdu(i)} className="text-xs text-red-400 hover:text-red-300">删除</button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <FieldRow label="学校" value={edu.school} onChange={(v) => updateEdu(i, "school", v)} />
                  <FieldRow label="School (EN)" value={data.educationEn[i]?.school || ""} onChange={(v) => updateEduEn(i, "school", v)} />
                  <FieldRow label="学位" value={edu.degree} onChange={(v) => updateEdu(i, "degree", v)} />
                  <FieldRow label="Degree (EN)" value={data.educationEn[i]?.degree || ""} onChange={(v) => updateEduEn(i, "degree", v)} />
                </div>
                <div>
                  <label className="text-xs text-text-muted">亮点</label>
                  <TagEditor tags={edu.highlights} onChange={(t) => updateEdu(i, "highlights", t)} />
                </div>
                <div>
                  <label className="text-xs text-text-muted">Highlights (EN)</label>
                  <TagEditor tags={data.educationEn[i]?.highlights || []} onChange={(t) => updateEduEn(i, "highlights", t)} />
                </div>
              </div>
            ))}
            <button
              onClick={() => {
                const blank: EducationItem = { school: "", degree: "", highlights: [] };
                update("education", [...data.education, blank]);
                update("educationEn", [...data.educationEn, blank]);
              }}
              className="text-xs text-accent hover:text-accent/80 transition-colors"
            >+ 添加教育经历</button>
          </div>
        )}
      </div>

      {/* ── Confirm button ── */}
      <button
        onClick={onConfirm}
        className="w-full py-4 rounded-xl font-semibold text-sm bg-accent text-white hover:bg-accent/90 shadow-lg shadow-accent/20 hover:shadow-accent/30 transition-all duration-300 mt-2"
      >
        <span className="flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          确认并生成
        </span>
      </button>
    </div>
  );
}
