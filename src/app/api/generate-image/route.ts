import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY || "";
const OUTPUT_DIR = path.join(process.cwd(), "output");

/**
 * Generate an image via OpenRouter (gpt-5-image-mini) and save to output/public/images/.
 * Body: { prompt: string; filename: string; style: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { prompt, filename } = (await req.json()) as {
      prompt: string;
      filename: string;
      style: string;
    };

    if (!OPENROUTER_KEY) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY not configured" },
        { status: 500 },
      );
    }

    // Call OpenRouter chat completions with image generation model
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-5-image-mini",
        messages: [
          {
            role: "user",
            content: `Generate an image: ${prompt}`,
          },
        ],
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenRouter image error:", errText);
      return NextResponse.json(
        { error: `Image generation failed: ${response.status}` },
        { status: 500 },
      );
    }

    const result = await response.json();

    // Extract base64 image from response: choices[0].message.images[0].image_url.url
    const images = result.choices?.[0]?.message?.images;
    if (!images || images.length === 0) {
      return NextResponse.json(
        { error: "No image in response" },
        { status: 500 },
      );
    }

    const dataUrl = images[0]?.image_url?.url as string;
    if (!dataUrl || !dataUrl.startsWith("data:image/")) {
      return NextResponse.json(
        { error: "Invalid image data in response" },
        { status: 500 },
      );
    }

    // Parse base64 data URL: "data:image/png;base64,..."
    const base64Data = dataUrl.split(",")[1];
    if (!base64Data) {
      return NextResponse.json(
        { error: "Could not parse base64 image data" },
        { status: 500 },
      );
    }

    const buffer = Buffer.from(base64Data, "base64");
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
