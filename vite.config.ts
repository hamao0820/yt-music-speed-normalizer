import { defineConfig } from "vite";
import { crx, defineManifest } from "@crxjs/vite-plugin";

const manifest = defineManifest({
  manifest_version: 3,
  name: "yt-music-speed-normalizer",
  version: "1.0.2",
  description:
    'YouTubeで音楽再生時に自動で再生速度を1倍に戻してくれるChrome拡張機能です。音楽の判定は概要欄の文字で判定しているため、言語が"日本語"、"English (US)"、"中文 (简体)"のいずれかに設定されていない場合は正常に動作しない可能性があります。',
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
