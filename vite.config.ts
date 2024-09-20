import { defineConfig } from "vite";
import { crx, defineManifest } from "@crxjs/vite-plugin";

const manifest = defineManifest({
  manifest_version: 3,
  name: "yt-music-speed-normalizer",
  version: "1.0.1",
  description: "YouTubeで音楽再生時に自動で再生速度を1倍に戻してくれるChrome拡張機能です。",
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
