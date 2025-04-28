import { para, paraReady } from "./client/para";

chrome.action.onClicked.addListener(async () => {
  try {
    await paraReady;
    const isLoggedIn = await para.isFullyLoggedIn();

    console.log("User logged in status:", isLoggedIn);

    if (!isLoggedIn) {
      chrome.tabs.create({ url: chrome.runtime.getURL("index.html") });
    } else {
      await chrome.action.setPopup({ popup: "index.html" });
      await chrome.action.openPopup();
      await chrome.action.setPopup({ popup: "" });
    }
  } catch (error) {
    console.error("Authentication check failed:", error);
    chrome.tabs.create({ url: chrome.runtime.getURL("index.html") });
  }
});
