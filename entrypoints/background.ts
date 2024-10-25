import { defineBackground } from "wxt/sandbox";

const hash = async (text: string): Promise<string> => {
  const uint8 = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", uint8);
  return Array.from(new Uint8Array(digest))
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("");
};

export default defineBackground(() => {
  const debounce = <F extends (...args: any[]) => any>(f: F, wait: number) => {
    let timeout: any;
    return (...args: Parameters<F>): Promise<ReturnType<F>> => {
      return new Promise((resolve) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => resolve(f(...args)), wait);
      });
    };
  };

  const sendMessage = debounce(async (tabId: number) => {
    const res = await chrome.tabs.sendMessage<{ type: string }>(tabId, { type: "run" }).catch((e) => {
      console.error(e);
    });
    console.log("message sent", res);
  }, 500);

  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (!changeInfo.url) {
      return true;
    }
    if (!changeInfo.url.startsWith("https://www.youtube.com/watch?")) {
      return true;
    }
    const res = await sendMessage(tabId);
    console.log("message sent", res);
    return true;
  });

  let textContentHash = "";
  chrome.runtime.onMessage.addListener((message: { type: string; data?: string }, sender, sendResponse) => {
    switch (message.type) {
      case "check": {
        if (message.data === undefined) {
          sendResponse({ data: true });
          return true;
        }
        hash(message.data).then((hash) => {
          sendResponse({ data: textContentHash === "" || textContentHash !== hash, hash });
          return true;
        });
        return true;
      }
      case "save": {
        if (message.data === undefined) {
          return true;
        }
        hash(message.data).then((hash) => {
          textContentHash = hash;
          return true;
        });
        return true;
      }
    }
  });
});
