import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { spawn, exec } from "child_process";
import { generateFileMap } from "@/lib/generator";
import { queryDesignIntelligence } from "@/lib/design-intelligence";
import { isTemplateStyle, generateFromTemplate } from "@/lib/template-generator";
import type { WorkspaceData, UserSelections } from "@/lib/types";

const OUTPUT_DIR = path.join(process.cwd(), "output");
const PREVIEW_PORT = 3001;

// Track whether we already have a dev server running
let devServerStarted = false;

async function writeFilesToDisk(files: Record<string, string>) {
  // Clean src/ directory on each generate so stale files don't linger
  const srcDir = path.join(OUTPUT_DIR, "src");
  await fs.rm(srcDir, { recursive: true, force: true });

  for (const [filePath, content] of Object.entries(files)) {
    const fullPath = path.join(OUTPUT_DIR, filePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content, "utf-8");
  }
}

function npmInstall(): Promise<void> {
  return new Promise((resolve, reject) => {
    exec("npm install", { cwd: OUTPUT_DIR, timeout: 120_000 }, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function startDevServer() {
  if (devServerStarted) return;
  devServerStarted = true;

  const child = spawn("npx", ["next", "dev", "--port", String(PREVIEW_PORT)], {
    cwd: OUTPUT_DIR,
    stdio: "ignore",
    detached: true,
    env: { ...process.env, NODE_ENV: "development" },
  });
  child.unref();
}

export async function POST(req: NextRequest) {
  try {
    const { data, selections } = (await req.json()) as {
      data: WorkspaceData;
      selections: UserSelections;
    };

    // 1. Generate files — template-based or standard
    let files: Record<string, string>;

    if (isTemplateStyle(selections.theme)) {
      // Template-based generation: read template files from disk
      files = await generateFromTemplate(data, selections);
    } else {
      // Standard generation with design intelligence
      const designIntel = await queryDesignIntelligence(
        selections.siteType || "portfolio",
        selections.theme || "minimalist",
        selections.customTheme || undefined,
      );
      files = generateFileMap(data, selections, designIntel);
    }

    // 3. Write to disk
    await writeFilesToDisk(files);

    // 4. npm install if needed
    const nodeModulesExists = await fs
      .access(path.join(OUTPUT_DIR, "node_modules"))
      .then(() => true)
      .catch(() => false);

    if (!nodeModulesExists) {
      await npmInstall();
    }

    // 5. Start dev server (idempotent)
    startDevServer();

    // 6. Return the preview URL
    const url = `http://localhost:${PREVIEW_PORT}`;
    return NextResponse.json({ url, port: PREVIEW_PORT });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
