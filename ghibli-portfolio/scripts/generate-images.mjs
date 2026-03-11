import fs from "fs";
import path from "path";

const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const API_KEY = process.env.OPENROUTER_API_KEY || "YOUR_API_KEY_HERE";
const MODEL = "google/gemini-2.5-flash-image";
const OUT_DIR = path.resolve("public/images");

const IMAGES = [
  {
    name: "ghibli-background.png",
    prompt:
      "A wide panoramic Studio Ghibli style landscape painting. Rolling green hills covered in wildflowers, a winding dirt path through meadows, fluffy white cumulus clouds in a soft blue sky, distant mountains with snow-capped peaks, golden sunset light filtering through clouds. Warm watercolor style, dreamy atmosphere, soft color palette with sage greens, sky blues, warm creams and golden tones. Hayao Miyazaki inspired painting. Extremely detailed, painterly texture. No characters, no text. 16:9 aspect ratio, high resolution.",
  },
  {
    name: "avatar.png",
    prompt:
      "A cute Studio Ghibli style watercolor painting of an adorable fluffy orange tabby cat sitting upright. The cat has big expressive round eyes, wearing a tiny green leaf scarf. Soft warm lighting, dreamy pastel background with floating dandelion seeds. Miyazaki watercolor illustration style, gentle and whimsical. Circular portrait crop. No text. Square 1:1 ratio.",
  },
  {
    name: "project-bank-kb.png",
    prompt:
      "A Studio Ghibli style watercolor illustration of a cozy magical library inside a large tree trunk. Warm golden lantern light illuminating shelves of glowing books. A small wooden desk with an open ledger and quill pen. Vines and flowers growing around the shelves. Warm sage green and golden tones, dreamy atmosphere, Miyazaki painting style. No characters, no text. 16:9 aspect ratio.",
  },
  {
    name: "project-llm.png",
    prompt:
      "A Studio Ghibli style watercolor illustration of a magical workshop with floating glowing orbs of light carrying tiny text symbols. A wooden desk with an ornate crystal ball showing swirling colors. Soft purple and blue magical glow mixed with warm candlelight. Enchanted forest visible through an open window. Miyazaki painting style. No characters, no text. 16:9 aspect ratio.",
  },
  {
    name: "project-deal-dojo.png",
    prompt:
      "A Studio Ghibli style watercolor illustration of two friendly fox spirits sitting across from each other at a low Japanese tea table, having a peaceful conversation. Cherry blossoms falling gently outside a sliding paper door. Warm golden afternoon light. Traditional Japanese room setting. Miyazaki painting style, warm and gentle. No text. 16:9 aspect ratio.",
  },
  {
    name: "project-eco-explorer.png",
    prompt:
      "A Studio Ghibli style watercolor illustration of a magical forest clearing with diverse wildlife. A deer, colorful birds, butterflies, and small woodland creatures gathered around a sparkling stream. Sunbeams filtering through tall ancient trees. Lush green foliage, wildflowers, morning mist. Miyazaki nature painting style. No text. 16:9 aspect ratio.",
  },
  {
    name: "chatbot-spirit.png",
    prompt:
      "A cute Studio Ghibli style small forest spirit character, round and fluffy, similar to a kodama or small totoro. Soft sage green and white colors, big friendly sparkling eyes, tiny leaf on top of its head. Simple clean illustration on a warm cream background with soft glow. Kawaii Miyazaki style, suitable as a chat button icon. No text. Square 1:1 ratio.",
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

    let base64Data = null;

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

    if (!base64Data && typeof message.content === "string") {
      const match = message.content.match(
        /data:image\/\w+;base64,([A-Za-z0-9+/=\n]+)/s
      );
      if (match) base64Data = match[1];
    }

    if (!base64Data) {
      console.error(`No image data found for ${item.name}`);
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

  for (const item of IMAGES) {
    const ok = await generateImage(item);
    if (!ok) console.log(`  -> Failed, continuing...`);
    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log("\nDone! Check public/images/");
}

main();
