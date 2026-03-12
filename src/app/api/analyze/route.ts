import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import type { WorkspaceData, SkillGroup, ProjectItem, TimelineItem, EducationItem } from "@/lib/types";

/**
 * Parse a resume zip that contains a simple content.json format.
 * Falls back to the standard SKU analyzer if the simple format isn't found.
 */
async function parseResumeZip(buffer: ArrayBuffer): Promise<WorkspaceData> {
  const zip = await JSZip.loadAsync(buffer);

  // Find content.json (may be at root or in a subfolder)
  let contentJson: string | null = null;
  for (const [path, entry] of Object.entries(zip.files)) {
    if (!entry.dir && path.endsWith("content.json")) {
      contentJson = await entry.async("string");
      break;
    }
  }

  if (!contentJson) {
    // Fallback to standard analyzer
    const { analyzeWorkspace } = await import("@/lib/analyzer");
    return analyzeWorkspace(buffer as unknown as File);
  }

  const raw = JSON.parse(contentJson);
  const en = raw.en || {};

  // Parse skills into groups
  const rawSkills: string[] = raw.skills || [];
  const skillGroups: SkillGroup[] = [];
  if (rawSkills.length > 0) {
    // Split skills into chunks of 4-5 for display
    const frontend = rawSkills.filter((s: string) =>
      /react|vue|angular|next|nuxt|svelte|tailwind|css|html|figma|design/i.test(s)
    );
    const backend = rawSkills.filter((s: string) =>
      /node|python|go|java|rust|sql|postgres|mysql|redis|graphql|mongo|docker|aws|azure|gcp/i.test(s)
    );
    const other = rawSkills.filter((s: string) =>
      !frontend.includes(s) && !backend.includes(s)
    );
    if (frontend.length > 0) skillGroups.push({ title: "前端 / 设计", skills: frontend });
    if (backend.length > 0) skillGroups.push({ title: "后端 / 基础设施", skills: backend });
    if (other.length > 0) skillGroups.push({ title: "其他", skills: other });
    if (skillGroups.length === 0) skillGroups.push({ title: "技能", skills: rawSkills });
  }

  const enSkills: string[] = en.skills || rawSkills;
  const enSkillGroups: SkillGroup[] = [];
  if (enSkills.length > 0) {
    const fe = enSkills.filter((s: string) =>
      /react|vue|angular|next|nuxt|svelte|tailwind|css|html|figma|design/i.test(s)
    );
    const be = enSkills.filter((s: string) =>
      /node|python|go|java|rust|sql|postgres|mysql|redis|graphql|mongo|docker|aws|azure|gcp/i.test(s)
    );
    const ot = enSkills.filter((s: string) => !fe.includes(s) && !be.includes(s));
    if (fe.length > 0) enSkillGroups.push({ title: "Frontend / Design", skills: fe });
    if (be.length > 0) enSkillGroups.push({ title: "Backend / Infra", skills: be });
    if (ot.length > 0) enSkillGroups.push({ title: "Other", skills: ot });
    if (enSkillGroups.length === 0) enSkillGroups.push({ title: "Skills", skills: enSkills });
  }

  // Parse experience into timeline
  const timeline: TimelineItem[] = (raw.experience || []).map((exp: { role: string; company: string; period: string; description: string }, i: number) => ({
    date: exp.period,
    title: `${exp.company} · ${exp.role}`,
    desc: exp.description,
    active: i === 0,
  }));

  const timelineEn: TimelineItem[] = (en.experience || raw.experience || []).map((exp: { role: string; company: string; period: string; description: string }, i: number) => ({
    date: exp.period,
    title: `${exp.company} · ${exp.role}`,
    desc: exp.description,
    active: i === 0,
  }));

  // Parse projects
  const projects: ProjectItem[] = (raw.projects || []).map((p: { name: string; description: string; link?: string }) => ({
    title: p.name,
    org: "",
    desc: p.description,
    tags: [],
    image: "",
    link: p.link || "",
    badge: "",
  }));

  const projectsEn: ProjectItem[] = (en.projects || raw.projects || []).map((p: { name: string; description: string; link?: string }) => ({
    title: p.name,
    org: "",
    desc: p.description,
    tags: [],
    image: "",
    link: p.link || "",
    badge: "",
  }));

  // Parse education
  const education: EducationItem[] = (raw.education || []).map((e: { school: string; degree: string; period?: string; highlights?: string[] }) => ({
    school: e.school,
    degree: e.degree + (e.period ? ` (${e.period})` : ""),
    highlights: e.highlights || [],
  }));

  const educationEn: EducationItem[] = (en.education || raw.education || []).map((e: { school: string; degree: string; period?: string; highlights?: string[] }) => ({
    school: e.school,
    degree: e.degree + (e.period ? ` (${e.period})` : ""),
    highlights: e.highlights || [],
  }));

  // Build tags from skills (first 4-6)
  const tags = rawSkills.slice(0, 6);
  const tagsEn = enSkills.slice(0, 6);

  // Bio tags
  const bioTags = [raw.title || "", raw.location || ""].filter(Boolean);
  const bioTagsEn = [en.title || raw.title || "", en.location || raw.location || ""].filter(Boolean);

  const github = raw.socialLinks?.GitHub || raw.socialLinks?.github || "";
  const linkedin = raw.socialLinks?.LinkedIn || raw.socialLinks?.linkedin || "";

  return {
    name: raw.name || "Your Name",
    nameEn: en.name || raw.name || "Your Name",
    title: raw.title || "",
    titleEn: en.title || raw.title || "",
    email: raw.email || "",
    location: raw.location || "",
    locationEn: en.location || raw.location || "",
    skills: skillGroups,
    skillsEn: enSkillGroups,
    projects,
    projectsEn,
    timeline,
    timelineEn,
    education,
    educationEn,
    tags,
    tagsEn,
    bio: raw.bio || "",
    bioEn: en.bio || raw.bio || "",
    bioTags,
    bioTagsEn,
    github,
    linkedin,
    chatbotContext: JSON.stringify(raw, null, 2),
  };
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    const buffer = await file.arrayBuffer();
    const data = await parseResumeZip(buffer);
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
