import { para } from "./client/para";

// Use the background script to open the extension in a new tab if the user is not logged in so that you can use the ParaModal
chrome.action.onClicked.addListener(async () => {
  try {
    const isLoggedIn = await para.isFullyLoggedIn();

    if (!isLoggedIn) {
      console.log("User is not logged in, opening the extension in a new tab.");
      chrome.tabs.create({ url: chrome.runtime.getURL("index.html") });
    } else {
      console.log("User is logged in, opening the extension in a popup window.");
      const width = 400;
      const height = 600;
      const left = (screen.width - width) / 2;
      const top = (screen.height - height) / 2;

      chrome.windows.create({
        url: chrome.runtime.getURL("index.html"),
        type: "popup",
        width: width,
        height: height,
        left: Math.floor(left),
        top: Math.floor(top),
      });
    }
  } catch (error) {
    console.error("Authentication check failed:", error);
    chrome.tabs.create({ url: chrome.runtime.getURL("index.html") });
  }
});
