import { defineConfig } from "wxt";

export default defineConfig({
  outDir: "dist",
  manifest: {
    manifest_version: 3,
    name: "yt-music-speed-normalizer",
    version: "1.0.3",
    description:
      'YouTubeで音楽再生時に自動で再生速度を1倍に戻してくれるChrome拡張機能です。言語が"日本語"、"English (US)"、"中文 (简体)"のいずれかに設定されていない場合は正常に動作しない可能性があります。',
    icons: {
      16: "icon16.png",
      48: "icon48.png",
      128: "icon128.png",
    },
    content_scripts: [
      {
        matches: ["https://www.youtube.com/*"],
        js: ["content-scripts/content.js"],
        run_at: "document_start",
        all_frames: true,
      },
    ],
    background: {
      service_worker: "background.js",
    },
    permissions: ["tabs"],
  },
});
