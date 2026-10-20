import { describe, it, expect } from "vitest";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

// Media is served from /public/assets with root-relative paths so the same
// files work on the Lovable preview and on Vercel. The old .asset.json CDN
// pointers belong to other projects and 404 on this site's origin — the page
// must never import them.
const publicAssets = join(__dirname, "../../public/assets");
const required = ["iss-video.mp4", "goddard.jpg", "oppenheimer.jpg", "boss-portrait.png"];

describe("media assets", () => {
  for (const name of required) {
    it(`public/assets/${name} exists as a real binary file`, () => {
      const p = join(publicAssets, name);
      expect(existsSync(p)).toBe(true);
      expect(statSync(p).size).toBeGreaterThan(1024);
    });
  }

  it("the homepage references media only via root-relative /assets paths", () => {
    const route = readFileSync(join(__dirname, "../routes/index.tsx"), "utf8");
    expect(route).not.toContain(".asset.json");
    expect(route).not.toContain("/src/assets");
    expect(route).not.toMatch(/src="\.\//);
    for (const name of required) {
      expect(route).toContain(`/assets/${name}`);
    }
    expect(route.match(/src=\{issVideo\}/g)).toHaveLength(2);
  });
});
