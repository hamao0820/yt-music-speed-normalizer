import { defineConfig } from "vite";
import { crx, defineManifest } from "@crxjs/vite-plugin";

const manifest = defineManifest({
  manifest_version: 3,
  name: "yt-music-speed-normalizer",
  version: "1.0.0",
  description: "youtubeで音楽を再施する時は自動で再生速度を1倍にする拡張機能",
  content_scripts: [
    {
      matches: ["https://www.youtube.com/*"],
      js: ["src/content.ts"],
      run_at: "document_end",
      all_frames: true,
    },
  ],
  background: {
    service_worker: "src/background.ts",
  },
  permissions: ["tabs"],
});

export default defineConfig({
  plugins: [crx({ manifest })],
});
