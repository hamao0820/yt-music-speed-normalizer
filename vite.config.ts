import { defineConfig } from "vite";
import { crx, defineManifest } from "@crxjs/vite-plugin";

const manifest = defineManifest({
  manifest_version: 3,
  name: "yt-music-speed-normalizer",
  version: "1.0.2",
  description:
    'YouTubeで音楽再生時に自動で再生速度を1倍に戻してくれるChrome拡張機能です。言語が"日本語"、"English (US)"、"中文 (简体)"のいずれかに設定されていない場合は正常に動作しない可能性があります。',
  icons: {
    16: "icons/icon16.png",
    48: "icons/icon48.png",
    128: "icons/icon128.png",
  },
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
