const { app, BrowserWindow } = require("electron");
const path = require("node:path");
const { session } = require("electron");

if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 769,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: true,
      contextIsolation: false,
      sandbox: false,
    },
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  const csp =
    "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: https://api.beta.usecapsule.com https://app.beta.usecapsule.com; " +
    "connect-src 'self' https://api.beta.usecapsule.com https://app.beta.usecapsule.com wss://mpc-network.beta.usecapsule.com https://product-assets.sandbox.usecapsule.com https://m.stripe.com; " +
    "img-src 'self' data:; " +
    "style-src 'self' 'unsafe-inline'; " +
    "font-src 'self' https://rsms.me; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://crypto-js.stripe.com; " +
    "frame-src https://js.stripe.com https://m.stripe.network https://m.stripe.com; " +
    "worker-src 'self' blob:;";

  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [csp],
      },
    });
  });
};

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
