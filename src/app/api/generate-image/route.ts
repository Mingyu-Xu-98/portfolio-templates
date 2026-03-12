import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const SILICONFLOW_URL = "https://api.siliconflow.cn/v1/images/generations";
const API_KEY = process.env.SILICONFLOW_API_KEY || "";
const OUTPUT_DIR = path.join(process.cwd(), "output");

/**
 * Generate an image via SiliconFlow (FLUX.1-schnell) and save to output/public/images/.
 * Body: { prompt: string; filename: string; style: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { prompt, filename } = (await req.json()) as {
      prompt: string;
      filename: string;
      style: string;
    };

    if (!API_KEY) {
      return NextResponse.json(
        { error: "SILICONFLOW_API_KEY not configured" },
        { status: 500 },
      );
    }

    // Determine image size: square for avatars/icons, 16:9 for backgrounds/projects
    const isSquare = filename === "avatar.png" || filename === "chatbot-spirit.png";
    const imageSize = isSquare ? "1024x1024" : "1024x576";

    const response = await fetch(SILICONFLOW_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "black-forest-labs/FLUX.1-schnell",
        prompt,
        image_size: imageSize,
        num_inference_steps: 20,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("SiliconFlow image error:", errText);
      return NextResponse.json(
        { error: `Image generation failed: ${response.status}` },
        { status: 500 },
      );
    }

    const result = await response.json();
    const imageUrl = result.images?.[0]?.url;

    if (!imageUrl) {
      return NextResponse.json(
        { error: "No image URL in response" },
        { status: 500 },
      );
    }

    // Download the generated image
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) {
      return NextResponse.json(
        { error: "Failed to download generated image" },
        { status: 500 },
      );
    }

    const buffer = Buffer.from(await imgRes.arrayBuffer());
    const imagesDir = path.join(OUTPUT_DIR, "public", "images");
    await fs.mkdir(imagesDir, { recursive: true });
    const savePath = path.join(imagesDir, filename);
    await fs.writeFile(savePath, buffer);

    return NextResponse.json({
      success: true,
      path: `/images/${filename}`,
      size: buffer.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Image generation error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
