import { ChromeMessage } from "./type";

// 日本語, English (US), 中文 (简体)
const MusicWords = ["音楽", "Music", "音乐"];
const PlaybackSpeedWords = ["再生速度", "Playback speed", "播放速度"];
const NormalWords = ["標準", "Normal", "正常"];

const sleep = (ms: number): Promise<number> => {
  return new Promise<number>((resolve) => setTimeout(resolve, ms));
};

// mustQuerySelector は要素を取得します。要素が見つからない場合はエラーを投げます。
const mustQuerySelector = (receiver: ParentNode, selector: string): HTMLElement => {
  const element = receiver.querySelector(selector);
  if (!element) {
    throw new Error(`element not found: ${selector}`);
  }
  if (!(element instanceof HTMLElement)) {
    throw new Error(`element is not HTMLElement: ${selector}`);
  }
  return element;
};

// mustQuerySelectorAll は要素を取得します。要素が見つからない場合はエラーを投げます。
const mustQuerySelectorAll = (receiver: ParentNode, selector: string): NodeListOf<HTMLElement> => {
  const elements = receiver.querySelectorAll(selector);
  if (elements.length === 0) {
    throw new Error(`elements not found: ${selector}`);
  }
  elements.forEach((element) => {
    if (!(element instanceof HTMLElement)) {
      throw new Error(`element is not HTMLElement: ${selector}`);
    }
  });
  return elements as NodeListOf<HTMLElement>;
};

// checkLabel は要素が指定したテキストを持つかどうかを判定します。
const hasLabel = (element: HTMLElement, text: string): boolean => {
  return mustQuerySelector(element, ".ytp-menuitem-label").textContent === text;
};

// hasSomeLabels は要素が指定したテキストのいずれかを持つかどうかを判定します。
const hasSomeLabels = (element: HTMLElement, texts: string[]): boolean => {
  return texts.some((text) => hasLabel(element, text));
};

// findItemByLabel はリストの中から指定したテキストを持つ要素を探します。
const findItemByLabel = (items: NodeListOf<HTMLElement>, text: string): HTMLElement | undefined => {
  return Array.from(items).find((item) => hasLabel(item, text));
};

// findItemByLabels はリストの中から指定したテキストを持つ要素を探します。
// 複数のテキストが指定された場合、最初に見つかった要素を返します。
const findItemByLabels = (items: NodeListOf<HTMLElement>, texts: string[]): HTMLElement | undefined => {
  for (const text of texts) {
    const item = findItemByLabel(items, text);
    if (item) {
      return item;
    }
  }
  return undefined;
};

// initSettingsPopup は設定用のポップアップを初期化します。
const initSettingsPopup = () => {
  const settingsButton = mustQuerySelector(document, "[data-tooltip-target-id=ytp-settings-button]");
  settingsButton.click();

  const settingsPopup = mustQuerySelector(document, ".ytp-popup.ytp-settings-menu");
  settingsPopup.style.display = "none";
};

// checkIfMusic は現在開いている動画が音楽かどうかを判定します。
const checkIfMusic = (): boolean => {
  const elms = document.querySelectorAll("yt-formatted-string#title");
  return Array.from(elms).some((elm) => {
    const textContent = elm.textContent;
    if (!textContent) {
      return false;
    }
    return MusicWords.some((word) => textContent.includes(word));
  });
};

// checkIfAdvertisement は現在の動画が広告かどうかを判定します。
const checkIfAdvertisement = (): boolean => {
  try {
    const settingsPopup = mustQuerySelector(document, ".ytp-popup.ytp-settings-menu");
    const playRateSettingMenuItems = mustQuerySelectorAll(settingsPopup, ".ytp-menuitem");
    return Array.from(playRateSettingMenuItems).every((item) => !hasSomeLabels(item, PlaybackSpeedWords));
  } catch (e) {
    console.error(e);
    return true;
  }
};

// setPlayRateNormalRate は再生速度を1倍に設定します。
const setPlayRateNormalRate = () => {
  const settingsPopup = mustQuerySelector(document, ".ytp-popup.ytp-settings-menu");

  const settingsMenuItems = mustQuerySelectorAll(settingsPopup, ".ytp-menuitem");
  const playRateSettingMenuItem = findItemByLabels(settingsMenuItems, PlaybackSpeedWords);
  if (!playRateSettingMenuItem) {
    throw new Error("play rate setting menu item not found");
  }
  playRateSettingMenuItem.click();

  const playRateMenuItems = mustQuerySelectorAll(settingsPopup, ".ytp-menuitem");
  const normalPlayRateMenuItem = findItemByLabels(playRateMenuItems, NormalWords);
  if (!normalPlayRateMenuItem) {
    throw new Error("normal play rate menu item not found");
  }
  normalPlayRateMenuItem.click();
};

const main = async () => {
  console.log("running yt-music-speed-normalizer...");
  const isMusic = await new Promise<boolean>(async (resolve) => {
    let summaryColumn: HTMLElement | null = null;
    while (true) {
      summaryColumn = document.querySelector("ytd-watch-metadata");
      if (summaryColumn) {
        break;
      }
      await sleep(100);
    }
    resolve(checkIfMusic());
  });

  if (!isMusic) {
    console.log("this video is not music");
    return;
  }

  initSettingsPopup();

  // 動画の再生が始まるまで待つ
  while (checkIfAdvertisement()) {
    console.log("waiting for video to start...");
    await sleep(1000);
  }

  setPlayRateNormalRate();
  console.log("play rate is normalized");
};

chrome.runtime.onMessage.addListener((message: ChromeMessage, sender, sendResponse) => {
  if (message.type === "run") {
    main();
  }
});
