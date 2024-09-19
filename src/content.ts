export {};

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

// findItemByLabel はリストの中から指定したテキストを持つ要素を探します。
const findItemByLabel = (items: NodeListOf<HTMLElement>, text: string): HTMLElement | undefined => {
  return Array.from(items).find((item) => hasLabel(item, text));
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
  const titles = document.querySelectorAll("yt-formatted-string#title");
  return Array.from(titles).some((title) => title.textContent === "音楽");
};

// checkIfAdvertisement は現在の動画が広告かどうかを判定します。
const checkIfAdvertisement = (): boolean => {
  try {
    const settingsPopup = mustQuerySelector(document, ".ytp-popup.ytp-settings-menu");
    const playRateSettingMenuItems = mustQuerySelectorAll(settingsPopup, ".ytp-menuitem");
    return Array.from(playRateSettingMenuItems).every((item) => !hasLabel(item, "再生速度"));
  } catch (e) {
    console.error(e);
    return true;
  }
};

// setPlayRateNormalRate は再生速度を1倍に設定します。
const setPlayRateNormalRate = () => {
  const settingsPopup = mustQuerySelector(document, ".ytp-popup.ytp-settings-menu");

  const settingsMenuItems = mustQuerySelectorAll(settingsPopup, ".ytp-menuitem");
  const playRateSettingMenuItem = findItemByLabel(settingsMenuItems, "再生速度");
  if (!playRateSettingMenuItem) {
    throw new Error("play rate setting menu item not found");
  }
  playRateSettingMenuItem.click();
  console.log("play rate setting menu item is clicked");

  const playRateMenuItems = mustQuerySelectorAll(settingsPopup, ".ytp-menuitem");
  const normalPlayRateMenuItem = findItemByLabel(playRateMenuItems, "標準");
  if (!normalPlayRateMenuItem) {
    throw new Error("normal play rate menu item not found");
  }
  normalPlayRateMenuItem.click();
  console.log("normal play rate menu item is clicked");
};

const main = async () => {
  console.log("yt-music-speed-normalizer: main");

  const isMusic = await new Promise<boolean>(async (resolve) => {
    console.log("waiting for ytd-watch-metadata");
    let summaryColumn: HTMLElement | null = null;
    while (true) {
      summaryColumn = document.querySelector("ytd-watch-metadata");
      if (summaryColumn) {
        break;
      }
      await sleep(100);
    }
    console.log("ytd-watch-metadata is found");
    resolve(checkIfMusic());
  });

  if (!isMusic) {
    console.log("not music");
    return;
  }

  initSettingsPopup();

  // 動画の再生が始まるまで待つ
  while (checkIfAdvertisement()) {
    console.log("advertisement");
    await sleep(1000);
  }

  setPlayRateNormalRate();
  console.log("play rate is normalized");
};

window.addEventListener("load", main, false);
