import db from "./db";
import { readdirSync, existsSync } from "fs";
import { join } from "path";

const MANGA_DIR = process.env.MANGA_DIR || "/root/vagabond/VAGABOND";

export function scanManga() {
  const volumes = readdirSync(MANGA_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name.startsWith("vagabond_"))
    .sort((a, b) => {
      const numA = parseInt(a.name.replace("vagabond_", ""));
      const numB = parseInt(b.name.replace("vagabond_", ""));
      return numA - numB;
    });

  db.run("DELETE FROM pages");
  db.run("DELETE FROM volumes");

  for (const volume of volumes) {
    const volumeNum = parseInt(volume.name.replace("vagabond_", ""));
    const imagesDir = join(MANGA_DIR, volume.name, "images");

    if (!existsSync(imagesDir)) {
      console.log(`Skipping ${volume.name}: no images directory`);
      continue;
    }

    const allFiles = readdirSync(imagesDir)
      .filter((f) => /\.(webp|png|jpg|jpeg)$/i.test(f));

    const fileMap = new Map<string, string>();
    for (const f of allFiles) {
      const baseName = f.replace(/\.(webp|png|jpg|jpeg)$/i, "").toLowerCase();
      const existing = fileMap.get(baseName);
      if (!existing || f.endsWith(".webp")) {
        fileMap.set(baseName, f);
      }
    }

    const files = Array.from(fileMap.values()).sort((a, b) => {
      const numA = parseInt(a.match(/\d+/g)?.pop() || "0");
      const numB = parseInt(b.match(/\d+/g)?.pop() || "0");
      return numA - numB;
    });

    if (files.length === 0) {
      console.log(`Skipping ${volume.name}: no image files`);
      continue;
    }

    const result = db.run(
      "INSERT INTO volumes (number, page_count) VALUES (?, ?)",
      [volumeNum, files.length]
    );
    const volumeId = result.lastInsertRowid;

    for (let i = 0; i < files.length; i++) {
      db.run(
        "INSERT INTO pages (volume_id, page_number, filename) VALUES (?, ?, ?)",
        [volumeId, i + 1, files[i]]
      );
    }

    console.log(`Scanned ${volume.name}: ${files.length} pages`);
  }

  return { success: true, volumesScanned: volumes.length };
}

export function getVolumes() {
  return db.query("SELECT * FROM volumes ORDER BY number").all() as Array<{
    id: number;
    number: number;
    page_count: number;
  }>;
}

export function getPage(volumeNum: number, pageNum: number) {
  const volume = db
    .query("SELECT * FROM volumes WHERE number = ?")
    .get(volumeNum) as { id: number; number: number; page_count: number } | null;

  if (!volume) return null;

  const page = db
    .query("SELECT * FROM pages WHERE volume_id = ? AND page_number = ?")
    .get(volume.id, pageNum) as { filename: string } | null;

  if (!page) return null;

  return {
    volume: volumeNum,
    page: pageNum,
    totalPages: volume.page_count,
    filename: page.filename,
    imageUrl: `/images/vagabond_${volumeNum}/images/${encodeURIComponent(page.filename)}`,
  };
}
