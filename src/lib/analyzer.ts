import JSZip from "jszip";
import type { WorkspaceData, SkillGroup, ProjectItem, TimelineItem, EducationItem } from "./types";

/**
 * Parse a workspace zip and extract structured data for site generation.
 */
export async function analyzeWorkspace(file: File): Promise<WorkspaceData> {
  const zip = await JSZip.loadAsync(file);

  // Helper: read a file inside the zip (trying multiple path prefixes)
  const readFile = async (relativePath: string): Promise<string | null> => {
    // The zip might have a root folder or not
    for (const prefix of ["", "workspace/", findRootFolder(zip)]) {
      const entry = zip.file(prefix + relativePath);
      if (entry) return entry.async("string");
    }
    return null;
  };

  // Read all JSON files under skus/factual/
  const factualData: Record<string, unknown> = {};
  const factualHeaders: Record<string, string> = {};

  for (const [path, entry] of Object.entries(zip.files)) {
    if (entry.dir) continue;
    const match = path.match(/skus\/factual\/(sku_\d+)\/(content\.json|header\.md)$/);
    if (match) {
      const skuId = match[1];
      const fileName = match[2];
      const content = await entry.async("string");
      if (fileName === "content.json") {
        try { factualData[skuId] = JSON.parse(content); } catch { /* skip */ }
      } else {
        factualHeaders[skuId] = content;
      }
    }
  }

  // Read procedural skill headers
  const proceduralHeaders: Record<string, string> = {};
  for (const [path, entry] of Object.entries(zip.files)) {
    if (entry.dir) continue;
    const match = path.match(/skus\/procedural\/(skill_\d+)\/header\.md$/);
    if (match) {
      proceduralHeaders[match[1]] = await entry.async("string");
    }
  }

  // Read eureka insights
  const eureka = await readFile("eureka.md");

  // ---- Extract personal info ----
  const personalInfo = findByHeaderKeyword(factualHeaders, factualData, ["个人", "基本信息", "personal"]);
  const educationData = findByHeaderKeyword(factualHeaders, factualData, ["教育", "education"]);
  const skillsData = findByHeaderKeyword(factualHeaders, factualData, ["技能", "skills", "特长"]);
  const workData = findByHeaderKeyword(factualHeaders, factualData, ["工作", "经历", "work", "experience"]);

  // Parse personal info
  const person = (personalInfo ?? {}) as Record<string, string>;
  const name = person["姓名"] || person["name"] || "Your Name";
  const email = person["邮箱"] || person["email"] || "";
  const location = person["现居住地址"] || person["location"] || "";

  // Parse education
  const education = parseEducation(educationData);

  // Parse skills
  const skills = parseSkills(skillsData);

  // Parse work experience -> timeline + projects
  const workItems = Array.isArray(workData) ? workData : workData ? [workData] : [];
  const { timeline, projects } = parseWork(workItems as Record<string, unknown>[]);

  // Read any other markdown files at the root level
  const rootMarkdowns: Record<string, string> = {};
  for (const [path, entry] of Object.entries(zip.files)) {
    if (entry.dir) continue;
    // Match markdown files at the root (or under the root folder prefix) that aren't inside skus/
    const mdMatch = path.match(/^(?:[^/]+\/)?([^/]+\.md)$/);
    if (mdMatch && !path.includes("/skus/")) {
      const filename = mdMatch[1];
      if (filename !== "eureka.md") {
        rootMarkdowns[filename] = await entry.async("string");
      }
    }
  }

  // Build chatbot context from all factual data
  const chatbotContext = buildChatbotContext(
    name, person, education, skills, workItems, eureka,
    factualData, factualHeaders, proceduralHeaders, rootMarkdowns,
  );

  // Generate English versions (simplified transliteration placeholders)
  const nameEn = guessEnglishName(name);

  return {
    name,
    nameEn,
    title: guessTitle(workItems as Record<string, unknown>[]),
    titleEn: guessTitleEn(workItems as Record<string, unknown>[]),
    email,
    location,
    locationEn: location, // keep as-is for cities
    skills,
    skillsEn: skills.map(g => ({ ...g })), // same for now
    projects,
    projectsEn: projects.map(p => ({ ...p })),
    timeline,
    timelineEn: timeline.map(t => ({ ...t })),
    education,
    educationEn: education.map(e => ({ ...e })),
    tags: extractTags(skills),
    tagsEn: extractTags(skills),
    github: extractGithub(person),
    linkedin: "",
    chatbotContext,
  };
}

// ---- Helpers ----

function findRootFolder(zip: JSZip): string {
  const folders = Object.keys(zip.files).filter(p => zip.files[p].dir);
  if (folders.length > 0) {
    const first = folders[0];
    if (!first.includes("/") || first.split("/").filter(Boolean).length === 1) {
      return first.endsWith("/") ? first : first + "/";
    }
  }
  return "";
}

function findByHeaderKeyword(
  headers: Record<string, string>,
  data: Record<string, unknown>,
  keywords: string[]
): unknown | null {
  for (const [skuId, header] of Object.entries(headers)) {
    const lower = header.toLowerCase();
    if (keywords.some(kw => lower.includes(kw))) {
      return data[skuId] ?? null;
    }
  }
  return null;
}

function parseEducation(raw: unknown): EducationItem[] {
  if (!raw) return [{ school: "Your University", degree: "Your Degree", highlights: [] }];
  const items = Array.isArray(raw) ? raw : [raw];
  return items.map((item: unknown) => {
    const r = item as Record<string, unknown>;
    return {
      school: String(r["学校"] || r["school"] || ""),
      degree: String(r["学位"] || r["学历"] || r["degree"] || ""),
      highlights: Array.isArray(r["亮点"] || r["highlights"])
        ? (r["亮点"] || r["highlights"]) as string[]
        : typeof r["亮点"] === "string" || typeof r["highlights"] === "string"
          ? [String(r["亮点"] || r["highlights"])]
          : [],
    };
  });
}

function parseSkills(raw: unknown): SkillGroup[] {
  if (!raw) return [{ title: "Skills", skills: ["Skill 1", "Skill 2"] }];
  if (Array.isArray(raw)) {
    return raw.map((item: unknown) => {
      const r = item as Record<string, unknown>;
      return {
        title: String(r["类别"] || r["title"] || r["category"] || "Skills"),
        skills: Array.isArray(r["技能"] || r["skills"] || r["items"])
          ? ((r["技能"] || r["skills"] || r["items"]) as string[])
          : [],
      };
    });
  }
  // Single object with category keys
  const obj = raw as Record<string, unknown>;
  return Object.entries(obj).map(([key, val]) => ({
    title: key,
    skills: Array.isArray(val) ? val.map(String) : [String(val)],
  }));
}

function parseWork(items: Record<string, unknown>[]): {
  timeline: TimelineItem[];
  projects: ProjectItem[];
} {
  const timeline: TimelineItem[] = [];
  const projects: ProjectItem[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const company = String(item["公司"] || item["company"] || "");
    const position = String(item["职位"] || item["position"] || "");
    const time = String(item["时间"] || item["time"] || "");

    timeline.push({
      date: time,
      title: company ? `${company} · ${position}` : position,
      desc: String(item["职责概述"] || item["description"] || ""),
      active: i === 0,
    });

    const projectList = (item["项目经历"] || item["projects"] || []) as Record<string, unknown>[];
    if (Array.isArray(projectList)) {
      for (const proj of projectList) {
        const workContent = Array.isArray(proj["工作内容"] || proj["content"])
          ? ((proj["工作内容"] || proj["content"]) as string[]).join("；")
          : String(proj["工作内容"] || proj["content"] || "");

        projects.push({
          title: String(proj["项目名称"] || proj["name"] || company),
          org: `${company} · ${time.split("-")[0]?.trim() || ""}`,
          desc: workContent.slice(0, 200),
          tags: extractProjectTags(workContent),
          image: `/images/project-${projects.length + 1}.png`,
          badge: i === 0 ? "Current" : undefined,
        });
      }
    }
  }

  return { timeline, projects: projects.slice(0, 12) };
}

function extractProjectTags(text: string): string[] {
  const tagKeywords = [
    "Python", "SQL", "JavaScript", "TypeScript", "React", "Next.js",
    "FastAPI", "Tailwind", "AI", "LLM", "GPT", "RAG",
    "数据分析", "提示工程", "需求分析", "产品设计", "知识库",
    "DSL", "机器学习", "数据可视化", "PRD",
  ];
  return tagKeywords.filter(kw => text.includes(kw)).slice(0, 4);
}

function extractTags(skills: SkillGroup[]): string[] {
  const all = skills.flatMap(g => g.skills);
  return all.slice(0, 6);
}

function guessTitle(workItems: Record<string, unknown>[]): string {
  if (workItems.length > 0) {
    return String(workItems[0]["职位"] || workItems[0]["position"] || "Creator");
  }
  return "Creator";
}

function guessTitleEn(workItems: Record<string, unknown>[]): string {
  const title = guessTitle(workItems);
  const map: Record<string, string> = {
    "助理业务经理": "Business Analyst",
    "数据分析师": "Data Analyst",
    "产品经理": "Product Manager",
  };
  return map[title] || title;
}

function guessEnglishName(name: string): string {
  // Simple: if Chinese, return pinyin-style; otherwise return as-is
  if (/[\u4e00-\u9fff]/.test(name)) {
    return "Your Name"; // User should customize
  }
  return name;
}

function extractGithub(person: Record<string, string>): string {
  for (const val of Object.values(person)) {
    if (typeof val === "string" && val.includes("github.com")) return val;
  }
  return "";
}

function buildChatbotContext(
  name: string,
  person: Record<string, string>,
  education: EducationItem[],
  skills: SkillGroup[],
  workItems: unknown[],
  eureka: string | null,
  factualData: Record<string, unknown>,
  factualHeaders: Record<string, string>,
  proceduralHeaders: Record<string, string>,
  rootMarkdowns: Record<string, string>,
): string {
  const parts: string[] = [];

  // Basic info summary
  parts.push(`## Basic Info\nName: ${name}\nEmail: ${person["邮箱"] || ""}\nLocation: ${person["现居住地址"] || ""}`);

  // All factual SKUs — include full raw content
  const skuIds = Array.from(
    new Set([...Object.keys(factualHeaders), ...Object.keys(factualData)])
  ).sort();

  if (skuIds.length > 0) {
    parts.push("## All Factual SKUs");
    for (const skuId of skuIds) {
      const header = factualHeaders[skuId];
      const data = factualData[skuId];
      const skuParts: string[] = [`### ${skuId}`];
      if (header) skuParts.push(`**Header:**\n${header}`);
      if (data !== undefined) skuParts.push(`**Content:**\n${JSON.stringify(data, null, 2)}`);
      parts.push(skuParts.join("\n"));
    }
  }

  // All procedural skills — include full raw headers
  const procIds = Object.keys(proceduralHeaders).sort();
  if (procIds.length > 0) {
    parts.push("## All Procedural Skills");
    for (const skillId of procIds) {
      parts.push(`### ${skillId}\n${proceduralHeaders[skillId]}`);
    }
  }

  // Eureka insights — full text
  if (eureka) {
    parts.push(`## Eureka Insights\n${eureka}`);
  }

  // Other root-level markdown files — full text
  for (const [filename, content] of Object.entries(rootMarkdowns)) {
    parts.push(`## ${filename}\n${content}`);
  }

  // Parsed summaries for convenience
  if (education.length) {
    parts.push("## Education (Parsed)\n" + education.map(e => `- ${e.school}, ${e.degree}${e.highlights.length ? ": " + e.highlights.join("; ") : ""}`).join("\n"));
  }
  if (skills.length) {
    parts.push("## Skills (Parsed)\n" + skills.map(g => `- ${g.title}: ${g.skills.join(", ")}`).join("\n"));
  }
  if (workItems.length) {
    parts.push("## Work Experience (Parsed)\n" + JSON.stringify(workItems, null, 2));
  }

  return parts.join("\n\n");
}
