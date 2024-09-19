import { ChromeMessage } from "./type";

const debounce = <F extends (...args: any[]) => any>(f: F, wait: number) => {
  let timeout: number;
  return (...args: Parameters<F>): Promise<ReturnType<F>> => {
    return new Promise((resolve) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => resolve(f(...args)), wait);
    });
  };
};

const sendMessage = debounce(async (tabId: number) => {
  const res = await chrome.tabs.sendMessage<ChromeMessage>(tabId, { type: "run" }).catch((e) => {
    console.error(e);
  });
  console.log("message sent", res);
}, 500);

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (!changeInfo.url) {
    return;
  }
  if (!changeInfo.url.startsWith("https://www.youtube.com/watch?")) {
    return;
  }
  const res = await sendMessage(tabId);
});
