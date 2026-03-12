import type { ThemeStyle } from "./types";

/**
 * Generate a hero background image prompt based on the visual style.
 * Returns null for styles that don't need AI-generated images.
 */
export function getHeroImagePrompt(theme: ThemeStyle): string | null {
  switch (theme) {
    case "cyberpunk":
      return `A futuristic cyberpunk cityscape at night with neon cyan and magenta lights reflecting on wet streets, holographic billboards, dark atmosphere with rain, digital art style, wide cinematic aspect ratio, no text or letters`;
    case "ghibli":
      return `A beautiful Studio Ghibli style watercolor landscape illustration with rolling green hills, fluffy white clouds in a soft blue sky, a small cozy cottage surrounded by wildflowers, warm golden sunlight, hand-painted aesthetic, dreamy and whimsical, no text or letters`;
    case "glassmorphism":
      return `Abstract digital art background with smooth flowing gradient blobs in purple, blue, and pink tones, dreamy bokeh light effects, soft glow, dark background, suitable as a website hero background, no text or letters`;
    case "retro":
      return `A vintage retro style illustration with muted warm tones, old film grain texture effect, classic 1970s poster aesthetic with geometric patterns and warm sunset colors, paper texture, no text or letters`;
    case "cinematic":
      return `Dramatic cinematic landscape with sweeping vistas, professional film color grading, dark moody atmosphere with rich shadows and highlights, anamorphic lens flare, wide ultra-cinematic aspect ratio, no text or letters`;
    case "bold-creative":
      return `Abstract colorful geometric art with bold vivid colors, energetic dynamic composition, striking contrasting shapes and patterns, high visual impact, modern graphic design aesthetic, no text or letters`;
    case "editorial":
      return `Elegant minimal still life arrangement with a premium aesthetic, muted sophisticated tones, clean negative space, high-end editorial magazine style photography, soft diffused lighting, no text or letters`;
    case "nature":
      return `Lush natural landscape with rich earth tones, organic beauty of forests and meadows, dappled sunlight filtering through leaves, serene and immersive natural environment, no text or letters`;
    case "gradient-mesh":
      return `Abstract flowing gradient mesh art with vivid purple, pink, and teal colors blending seamlessly, smooth liquid-like transitions, modern digital art aesthetic, no text or letters`;
    case "neo-tokyo":
      return `Japanese urban neon cityscape at night, anime-inspired aesthetic, glowing pink and cyan neon signs reflecting on rain-soaked streets, dense futuristic architecture, vibrant and atmospheric, no text or letters`;
    case "tpl-business":
      return `Abstract futuristic digital network with glowing purple nodes and connections, dark background, tech corporate aesthetic, no text or letters`;
    case "tpl-resume-bold":
      return `Bold abstract geometric composition with vivid pink and cyan shapes, brutalist design, high contrast, no text or letters`;
    case "tpl-resume-dark":
      return `Dark abstract ambient light scene with subtle indigo glow orbs, ultra-minimal, sophisticated, no text or letters`;
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
  switch (theme) {
    case "cyberpunk":
      return `A glowing neon geometric avatar icon, holographic crystal shape with cyan and magenta light rays, dark background, futuristic digital art, abstract non-human symbol, no face no person, no text`;
    case "ghibli":
      return `A cute Studio Ghibli style illustrated forest spirit creature, small round fluffy nature spirit sitting on a mossy rock, watercolor style, warm soft colors, whimsical and magical, not human, no text`;
    case "glassmorphism":
      return `An abstract frosted glass orb icon with soft purple and blue gradients inside, bokeh light effects around it, translucent crystal sphere, dark background, no person no face, no text`;
    case "retro":
      return `A vintage retro style illustrated camera icon with warm sepia tones, film grain texture, 1970s poster aesthetic, classic analog design, no person no face, no text`;
    case "brutalist":
      return `A bold geometric abstract icon with thick black lines and red accent, stark minimalist composition, raw concrete texture background, brutalist design, no person no face, no text`;
    case "cinematic":
      return `A dramatic dark film clapperboard icon with golden light rays, cinematic moody atmosphere, rich contrast, professional film aesthetic, no person no face, no text`;
    case "bold-creative":
      return `A vibrant abstract paint splash icon with vivid red yellow blue green colors, energetic burst shape, modern graphic art, playful creative explosion, no person no face, no text`;
    case "editorial":
      return `An elegant minimal fountain pen nib icon on cream paper background, sophisticated muted gold and black tones, editorial luxury aesthetic, no person no face, no text`;
    case "nature":
      return `A beautiful illustrated oak tree icon with rich green leaves and warm brown trunk, earth tones, organic natural style, gentle sunlight, watercolor feel, no person no face, no text`;
    case "gradient-mesh":
      return `An abstract flowing gradient sphere with vivid purple pink and teal colors morphing together, smooth liquid blob shape, modern digital art, no person no face, no text`;
    case "neo-tokyo":
      return `A glowing Japanese torii gate icon with neon pink and cyan lights, rain effects, anime-inspired urban aesthetic, dark night background, no person no face, no text`;
    case "tpl-business":
      return `A glowing purple geometric cube icon with holographic tech circuit patterns, dark background, futuristic corporate symbol, no person no face, no text`;
    case "tpl-resume-bold":
      return `A bold geometric star shape icon with vivid pink and cyan halves, thick black outline, hard shadow, brutalist pop art style, no person no face, no text`;
    case "tpl-resume-dark":
      return `A subtle glowing indigo glass orb icon floating in ultra-dark space, minimal ambient light, sophisticated dark aesthetic, no person no face, no text`;
    case "minimalist":
      return `A perfectly minimal geometric circle and line abstract icon, black on white, clean Swiss design aesthetic, mathematical precision, no person no face, no text`;
    default:
      return `An abstract geometric crystal icon with soft gradient colors, modern minimal design, no person no face, no text`;
  }
}

/**
 * Generate a project card image prompt based on theme and project info.
 */
function getProjectImagePrompt(theme: ThemeStyle, projectTitle: string, projectTags: string[]): string {
  const tagHint = projectTags.slice(0, 3).join(", ");
  const styleHints: Record<string, string> = {
    cyberpunk: "dark neon-lit digital interface style, cyan and magenta tones",
    minimalist: "clean minimal flat illustration, monochrome with subtle accent",
    ghibli: "Studio Ghibli watercolor style, warm soft colors, hand-painted",
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
  return `Abstract illustration representing "${projectTitle}" (${tagHint}), ${style}, suitable as a project card thumbnail, no text no letters no words, 16:9 aspect ratio`;
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

  // Hero background image (style-dependent)
  const heroPrompt = getHeroImagePrompt(theme);
  if (heroPrompt) {
    tasks.push({ prompt: heroPrompt, filename: "hero-bg.png" });
  }

  // Project card images
  if (projects) {
    projects.forEach((p, i) => {
      tasks.push({
        prompt: getProjectImagePrompt(theme, p.title, p.tags),
        filename: `project-${i + 1}.png`,
      });
    });
  }

  return tasks;
}
