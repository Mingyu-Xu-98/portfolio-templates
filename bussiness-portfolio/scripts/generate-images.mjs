import fs from "fs";
import path from "path";

const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const API_KEY = process.env.OPENROUTER_API_KEY || "YOUR_API_KEY_HERE";
const MODEL = "google/gemini-2.5-flash-image";
const OUT_DIR = path.resolve("public/images");

const IMAGES = [
  {
    name: "avatar.png",
    prompt:
      "A cute fluffy orange tabby cat sitting upright, wearing a tiny dark blazer and small round glasses. The cat has big expressive eyes and a gentle smile. Soft warm lighting, dark indigo background with subtle warm bokeh lights. Illustration style, adorable and professional. Circular portrait crop. High quality. No text. Square 1:1 ratio.",
  },
  {
    name: "project-bank-kb.png",
    prompt:
      "A warm photograph of a real wooden desk in a cozy office. On the desk: a neat stack of banking documents, an open laptop showing charts, a coffee cup, and a small potted plant. Soft natural window light from the left. Shallow depth of field, warm color tones. Realistic photography style, professional and inviting. No text. 16:9 aspect ratio.",
  },
  {
    name: "project-llm.png",
    prompt:
      "A realistic photograph of a person typing on a laptop in a modern minimalist workspace. The screen shows a chat conversation interface. Warm desk lamp lighting, a notebook and pen beside the laptop. Cozy and productive atmosphere. Soft bokeh background. Warm color palette. Realistic photography style. No text. 16:9 aspect ratio.",
  },
  {
    name: "project-deal-dojo.png",
    prompt:
      "A realistic photograph of two business professionals shaking hands across a conference table. Warm golden hour light streaming through large windows. Documents and coffee cups on the table. Professional but warm atmosphere. Soft focus background showing a modern office. Realistic photography style. No text. 16:9 aspect ratio.",
  },
  {
    name: "project-eco-explorer.png",
    prompt:
      "A stunning realistic landscape photograph of a lush Chinese mountain valley with a winding river. Morning mist, green forests, colorful wildflowers in the foreground. A few birds flying in the distance. Golden sunrise light. Vibrant natural colors. National Geographic photography style, breathtaking nature scenery. No text. 16:9 aspect ratio.",
  },
  {
    name: "chatbot-robot.png",
    prompt:
      "A cute cartoon cat face icon, round shape, with big sparkling eyes and a cheerful expression. The cat is orange tabby with small pointed ears. Soft purple-blue gradient background glow. Kawaii style, clean vector-like illustration, suitable as a chat button avatar. No text. Square 1:1 ratio.",
  },
];

async function generateImage(item) {
  console.log(`Generating: ${item.name}...`);
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: item.prompt }],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`API error for ${item.name}: ${res.status} ${errText}`);
      return false;
    }

    const data = await res.json();
    const message = data.choices?.[0]?.message;

    if (!message) {
      console.error(`No message in response for ${item.name}`);
      console.log(JSON.stringify(data, null, 2).slice(0, 500));
      return false;
    }

    // Handle different response formats
    let base64Data = null;

    // Format: images array in message (Gemini via OpenRouter)
    if (Array.isArray(message.images)) {
      for (const img of message.images) {
        if (img.type === "image_url" && img.image_url?.url) {
          const match = img.image_url.url.match(
            /^data:image\/\w+;base64,(.+)$/s
          );
          if (match) base64Data = match[1];
        }
      }
    }

    // Fallback: content is array with image parts
    if (!base64Data && Array.isArray(message.content)) {
      for (const part of message.content) {
        if (part.type === "image_url" && part.image_url?.url) {
          const match = part.image_url.url.match(
            /^data:image\/\w+;base64,(.+)$/s
          );
          if (match) base64Data = match[1];
        }
      }
    }

    // Fallback: content is string with base64
    if (!base64Data && typeof message.content === "string") {
      const match = message.content.match(
        /data:image\/\w+;base64,([A-Za-z0-9+/=\n]+)/s
      );
      if (match) base64Data = match[1];
    }

    if (!base64Data) {
      console.error(`No image data found for ${item.name}`);
      // Log first 800 chars of response for debugging
      console.log(
        "Response content:",
        JSON.stringify(message.content).slice(0, 800)
      );
      return false;
    }

    const outPath = path.join(OUT_DIR, item.name);
    fs.writeFileSync(outPath, Buffer.from(base64Data, "base64"));
    console.log(`Saved: ${outPath} (${fs.statSync(outPath).size} bytes)`);
    return true;
  } catch (err) {
    console.error(`Error generating ${item.name}:`, err.message);
    return false;
  }
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  // Generate sequentially to avoid rate limits
  for (const item of IMAGES) {
    const ok = await generateImage(item);
    if (!ok) console.log(`  -> Failed, continuing...`);
    // Small delay between requests
    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log("\nDone! Check public/images/");
}

main();
