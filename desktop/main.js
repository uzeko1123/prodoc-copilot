const { app, BrowserWindow } = require("electron/main");
const path = require("node:path");

const WEB_ROOT = "http://localhost:5173";
const APP_URL = `${WEB_ROOT}/dashboard`;

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    autoHideMenuBar: true,
    icon: path.join(__dirname, "public", "icon.png"),
  });

  win.webContents.on("will-navigate", (event, url) => {
    if (url.replace(/\/$/, "") === WEB_ROOT) {
      event.preventDefault();
      win.loadURL(APP_URL);
    }
  });

  win.loadURL(APP_URL);
}

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
