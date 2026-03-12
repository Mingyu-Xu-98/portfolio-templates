import type { ThemeStyle } from "./types";

/**
 * Generate a hero background image prompt based on the visual style.
 * Returns null for styles that don't need AI-generated images.
 */
export function getHeroImagePrompt(theme: ThemeStyle): string | null {
  const noText = "absolutely no text, no letters, no words, no characters, no writing, no symbols, no watermarks";
  switch (theme) {
    case "cyberpunk":
      return `A futuristic cyberpunk cityscape at night with neon cyan and magenta lights reflecting on wet streets, holographic billboards, dark atmosphere with rain, digital art style, wide cinematic aspect ratio, ${noText}`;
    case "ghibli":
      return `A wide panoramic Studio Ghibli style landscape painting. Rolling green hills covered in wildflowers, a winding dirt path through meadows, fluffy white cumulus clouds in a soft blue sky, distant mountains with snow-capped peaks, golden sunset light filtering through clouds. Warm watercolor style, dreamy atmosphere, soft color palette with sage greens, sky blues, warm creams and golden tones. Hayao Miyazaki inspired painting. ${noText}, 16:9 aspect ratio, high resolution`;
    case "glassmorphism":
      return `Abstract digital art background with smooth flowing gradient blobs in purple, blue, and pink tones, dreamy bokeh light effects, soft glow, dark background, suitable as a website hero background, ${noText}`;
    case "retro":
      return `A vintage retro style illustration with muted warm tones, old film grain texture effect, classic 1970s poster aesthetic with geometric patterns and warm sunset colors, paper texture, ${noText}`;
    case "cinematic":
      return `Dramatic cinematic landscape with sweeping vistas, professional film color grading, dark moody atmosphere with rich shadows and highlights, anamorphic lens flare, wide ultra-cinematic aspect ratio, ${noText}`;
    case "bold-creative":
      return `Abstract colorful geometric art with bold vivid colors, energetic dynamic composition, striking contrasting shapes and patterns, high visual impact, modern graphic design aesthetic, ${noText}`;
    case "editorial":
      return `Elegant minimal still life arrangement with a premium aesthetic, muted sophisticated tones, clean negative space, high-end editorial magazine style photography, soft diffused lighting, ${noText}`;
    case "nature":
      return `Lush natural landscape with rich earth tones, organic beauty of forests and meadows, dappled sunlight filtering through leaves, serene and immersive natural environment, ${noText}`;
    case "gradient-mesh":
      return `Abstract flowing gradient mesh art with vivid purple, pink, and teal colors blending seamlessly, smooth liquid-like transitions, modern digital art aesthetic, ${noText}`;
    case "neo-tokyo":
      return `Japanese urban neon cityscape at night, anime-inspired aesthetic, glowing pink and cyan neon signs reflecting on rain-soaked streets, dense futuristic architecture, vibrant and atmospheric, ${noText}`;
    case "tpl-business":
      return `Abstract futuristic digital network with glowing purple nodes and connections, dark background, tech corporate aesthetic, ${noText}`;
    case "tpl-resume-bold":
      return `Bold abstract geometric composition with vivid pink and cyan shapes, brutalist design, high contrast, ${noText}`;
    case "tpl-resume-dark":
      return `Dark abstract ambient light scene with subtle indigo glow orbs, ultra-minimal, sophisticated, ${noText}`;
    case "minimalist":
    case "brutalist":
    case "custom":
    default:
      return null;
  }
}

/**
 * Generate an avatar image prompt matching the visual style.
 * NOT a human portrait — instead generates a stylized icon/mascot/symbol.
 */
function getAvatarPrompt(theme: ThemeStyle): string {
  const noText = "absolutely no text, no letters, no words, no characters, no writing, no symbols, no watermarks";
  switch (theme) {
    case "cyberpunk":
      return `A glowing neon geometric avatar icon, holographic crystal shape with cyan and magenta light rays, dark background, futuristic digital art, abstract non-human symbol, no face no person, ${noText}`;
    case "ghibli":
      return `A cute Studio Ghibli style watercolor painting of an adorable fluffy orange tabby cat sitting upright with big expressive round eyes, wearing a tiny green leaf scarf, soft warm lighting, dreamy pastel background with floating dandelion seeds, Miyazaki watercolor illustration style, gentle and whimsical, circular portrait crop, ${noText}`;
    case "glassmorphism":
      return `An abstract frosted glass orb icon with soft purple and blue gradients inside, bokeh light effects around it, translucent crystal sphere, dark background, no person no face, ${noText}`;
    case "retro":
      return `A vintage retro style illustrated camera icon with warm sepia tones, film grain texture, 1970s poster aesthetic, classic analog design, no person no face, ${noText}`;
    case "brutalist":
      return `A bold geometric abstract icon with thick black lines and red accent, stark minimalist composition, raw concrete texture background, brutalist design, no person no face, ${noText}`;
    case "cinematic":
      return `A dramatic dark film clapperboard icon with golden light rays, cinematic moody atmosphere, rich contrast, professional film aesthetic, no person no face, ${noText}`;
    case "bold-creative":
      return `A vibrant abstract paint splash icon with vivid red yellow blue green colors, energetic burst shape, modern graphic art, playful creative explosion, no person no face, ${noText}`;
    case "editorial":
      return `An elegant minimal fountain pen nib icon on cream paper background, sophisticated muted gold and black tones, editorial luxury aesthetic, no person no face, ${noText}`;
    case "nature":
      return `A beautiful illustrated oak tree icon with rich green leaves and warm brown trunk, earth tones, organic natural style, gentle sunlight, watercolor feel, no person no face, ${noText}`;
    case "gradient-mesh":
      return `An abstract flowing gradient sphere with vivid purple pink and teal colors morphing together, smooth liquid blob shape, modern digital art, no person no face, ${noText}`;
    case "neo-tokyo":
      return `A glowing Japanese torii gate icon with neon pink and cyan lights, rain effects, anime-inspired urban aesthetic, dark night background, no person no face, ${noText}`;
    case "tpl-business":
      return `A glowing purple geometric cube icon with holographic tech circuit patterns, dark background, futuristic corporate symbol, no person no face, ${noText}`;
    case "tpl-resume-bold":
      return `A bold geometric star shape icon with vivid pink and cyan halves, thick black outline, hard shadow, brutalist pop art style, no person no face, ${noText}`;
    case "tpl-resume-dark":
      return `A subtle glowing indigo glass orb icon floating in ultra-dark space, minimal ambient light, sophisticated dark aesthetic, no person no face, ${noText}`;
    case "minimalist":
      return `A perfectly minimal geometric circle and line abstract icon, black on white, clean Swiss design aesthetic, mathematical precision, no person no face, ${noText}`;
    default:
      return `An abstract geometric crystal icon with soft gradient colors, modern minimal design, no person no face, ${noText}`;
  }
}

/**
 * Translate common Chinese tech/project tags to English concepts for image generation.
 * This prevents the image model from trying to render Chinese characters.
 */
const TAG_MAP: Record<string, string> = {
  "需求分析": "requirements analysis", "产品设计": "product design", "大模型落地": "AI deployment",
  "提示工程": "prompt engineering", "DSL设计": "domain language design", "架构设计": "system architecture",
  "流程编排": "workflow orchestration", "数据分析": "data analytics", "数据可视化": "data visualization",
  "机器学习": "machine learning", "知识库": "knowledge base", "智能问答": "intelligent QA",
  "用户画像": "user profiling", "竞品分析": "competitive analysis", "原型设计": "prototyping",
  "小程序开发": "mini app development", "交互地图": "interactive map", "物种收集": "species collection",
  "知识问答": "knowledge quiz", "游戏化学习": "gamified learning", "回归分析": "regression analysis",
  "指标体系构建": "metrics framework", "PRD 撰写": "product spec writing",
};

function translateTag(tag: string): string {
  return TAG_MAP[tag] || tag;
}

/**
 * Describe what a project is about in English only, for image generation.
 * Avoids passing Chinese text to the image model.
 */
function describeProject(index: number, tags: string[]): string {
  const englishTags = tags.slice(0, 3).map(translateTag);
  const concepts: string[] = [
    "a knowledge management library with glowing books and scrolls",
    "an AI language model system with flowing data streams and light orbs",
    "a negotiation training arena with two parties at a table",
    "an ecology exploration scene with wildlife and nature",
    "a financial data dashboard with charts and graphs",
    "a creative workshop with tools and colorful materials",
    "a technology workspace with screens and connected devices",
    "a research laboratory with scientific instruments",
  ];
  const concept = concepts[index % concepts.length];
  return `${concept}, related to ${englishTags.join(", ")}`;
}

/**
 * Generate a project card image prompt based on theme and project info.
 * Uses only English descriptions - never includes Chinese text in prompts.
 */
function getProjectImagePrompt(theme: ThemeStyle, _projectTitle: string, projectTags: string[], projectIndex: number): string {
  const noText = "absolutely no text, no letters, no words, no characters, no writing, no kanji, no symbols, no watermarks";
  const styleHints: Record<string, string> = {
    cyberpunk: "dark neon-lit digital interface style, cyan and magenta tones",
    minimalist: "clean minimal flat illustration, monochrome with subtle accent",
    ghibli: "Studio Ghibli watercolor style, warm soft colors with sage greens, sky blues, warm creams and golden tones, hand-painted, Hayao Miyazaki inspired, dreamy atmosphere, painterly texture",
    glassmorphism: "frosted glass aesthetic, soft gradient background, translucent elements",
    retro: "vintage retro poster style, muted warm tones, film grain texture",
    brutalist: "bold raw geometric shapes, high contrast black and white with red accent",
    cinematic: "dramatic cinematic lighting, dark moody tones, film color grading",
    "bold-creative": "vivid colorful abstract art, energetic dynamic composition",
    editorial: "elegant editorial photography style, muted sophisticated tones",
    nature: "earth tones, organic natural elements, warm sunlight",
    "gradient-mesh": "flowing gradient mesh colors, purple pink teal, modern digital art",
    "neo-tokyo": "anime-inspired neon urban aesthetic, pink and cyan glow",
    "tpl-business": "professional tech corporate style, purple tones, sleek digital",
    "tpl-resume-bold": "bold pop art style, vivid pink and cyan, thick outlines",
    "tpl-resume-dark": "ultra-dark ambient style, subtle indigo glow, minimal",
  };
  const style = styleHints[theme] || "modern clean digital illustration";
  const description = describeProject(projectIndex, projectTags);
  return `Abstract illustration of ${description}, ${style}, suitable as a project card thumbnail, ${noText}, 16:9 aspect ratio`;
}

/**
 * Returns all image generation tasks for a given style.
 * Each task has a prompt and target filename.
 */
export function getImageTasks(
  theme: ThemeStyle,
  _userName: string,
  projects?: { title: string; tags: string[] }[],
): { prompt: string; filename: string }[] {
  const tasks: { prompt: string; filename: string }[] = [];

  // Avatar image (always generated)
  tasks.push({ prompt: getAvatarPrompt(theme), filename: "avatar.png" });

  // Hero/background image (style-dependent)
  const heroPrompt = getHeroImagePrompt(theme);
  if (heroPrompt) {
    // Ghibli uses full-screen background named differently
    const bgFilename = theme === "ghibli" ? "ghibli-background.png" : "hero-bg.png";
    tasks.push({ prompt: heroPrompt, filename: bgFilename });
  }

  // Chatbot spirit icon for Ghibli
  if (theme === "ghibli") {
    tasks.push({
      prompt: `A cute Studio Ghibli style small forest spirit character, round and fluffy, similar to a kodama or small totoro. Soft sage green and white colors, big friendly sparkling eyes, tiny leaf on top of its head. Clean illustration on a warm cream background with soft glow. Kawaii Miyazaki style. Absolutely no text, no letters, no words, no characters, no writing, no watermarks.`,
      filename: "chatbot-spirit.png",
    });
  }

  // Project card images
  if (projects) {
    projects.forEach((p, i) => {
      tasks.push({
        prompt: getProjectImagePrompt(theme, p.title, p.tags, i),
        filename: `project-${i + 1}.png`,
      });
    });
  }

  return tasks;
}
