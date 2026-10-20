import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const PROJECT_ID = "6e231fb4-dcd2-4b22-9c5f-8a9fe3546cf0";
const dir = join(__dirname, "../assets");
const required = ["restored-iss-video.mp4", "goddard-v2.jpg", "oppenheimer-v2.jpg", "restored-boss.png", "restored-boss-portrait.png", "restored-boss-portrait-v2.png"];
const legacy = new Set(["iss-video.mp4.asset.json", "goddard.jpg.asset.json", "oppenheimer.jpg.asset.json", "boss.png.asset.json", "boss-portrait.png.asset.json", "boss-portrait-v2.png.asset.json", "restored-goddard.jpg.asset.json", "restored-oppenheimer.jpg.asset.json"]);

describe("media assets", () => {
  for (const name of required) {
    it(`${name} pointer exists and belongs to this project`, () => {
      const a = JSON.parse(readFileSync(join(dir, `${name}.asset.json`), "utf8"));
      expect(a.project_id).toBe(PROJECT_ID);
      expect(a.url).toMatch(/^\/__l5e\/assets-v1\//);
    });
  }
  it("all non-archived pointers belong to the current project", () => {
    for (const f of readdirSync(dir).filter((f) => f.endsWith(".asset.json") && !legacy.has(f))) {
      expect(JSON.parse(readFileSync(join(dir, f), "utf8")).project_id).toBe(PROJECT_ID);
    }
  });
  it("the homepage and menu use the restored video and images, never archived pointers", () => {
    const route = readFileSync(join(__dirname, "../routes/index.tsx"), "utf8");
    expect(route.match(/src=\{issVideo.url\}/g)).toHaveLength(2);
    for (const file of legacy) expect(route).not.toContain(`@/assets/${file}`);
    for (const name of ["restored-iss-video.mp4", "goddard-v2.jpg", "oppenheimer-v2.jpg", "restored-boss-portrait-v2.png"]) {
      expect(route).toContain(`@/assets/${name}.asset.json`);
    }
  });
});
