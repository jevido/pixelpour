const {
  app,
  ipcMain,
  BrowserWindow,
  Menu,
  Tray,
  globalShortcut,
} = require("electron");
const path = require("path");
const Store = require("electron-store");

const store = new Store();
let win = null;
let tray = null;
let icon;

// Allowed insecure shit, like the insecure little bitch that i am
app.commandLine.appendSwitch('ignore-certificate-errors', 'true');

// Set an icon based on OS
switch (process.platform) {
  case "win32":
    icon = "assets/images/icons/icon.ico";
    break;
  case "darwin":
    icon = "assets/images/icons/mac/icon.icns";
    break;
  // case 'sunos':
  // case 'freebsd':
  // case 'aix':
  // case 'openbsd':
  // case 'linux':
  default:
    icon = "assets/images/icons/png/256x256.png";
}

function onReady() {
  if (!store.get("shortcuts")) {
    setShortcuts();
  }
  addListeners();
  createWindow();
  createTray();
}

function createTray() {
  tray = new Tray(icon);
  const contextMenu = Menu.buildFromTemplate([
    { label: "Open", click: openWindow },
    {
      label: "Exit",
      click: function () {
        win.isQuitting = true;
        win.close();
      },
    },
  ]);
  tray.setToolTip("PixelPour!");
  tray.setContextMenu(contextMenu);
  tray.on("double-click", openWindow);
}

function openWindow() {
  win.show();
}

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: "#0d0d0d",
    frame: false,
    transparent: true,
    icon: path.join(__dirname, icon),
    // alwaysOnTop: true,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  win.on("minimize", function (event) {
    event.preventDefault();
    win.minimize();
  });

  win.on("close", function (event) {
    if (process.platform == "win32" || process.platform == "darwin") {
      if (!win.isQuitting) {
        event.preventDefault();
        win.hide();
        return false;
      }
    }
  });

  // and load the index.html of the app.
  win.loadFile("index.html");
}

function setShortcuts() {
  var defaults = {
    //'screenname': 'shortcut',
    "screen:0:0": "CommandOrControl+Shift+1",
    "screen:1:0": "CommandOrControl+Shift+2",
    edit: "CommandOrControl+Shift+4",
  };
  store.set("shortcuts", defaults);
}

async function addListeners() {
  var shortcuts = store.get("shortcuts");

  // Read the store for which shortcuts to use
  for (let index in shortcuts) {
    // Damned variable hoisting
    let shortcut = shortcuts[index];

    globalShortcut.register(shortcut, function () {
      win.webContents.send("keystroke", JSON.stringify({ screen: index }));
    });
  }
}

ipcMain.on("set-keystrokes", (event, data) => {
  let shortcuts = store.get("shortcuts");
  let json = JSON.parse(data);
  let keyStroke = Object.keys(json.keyStroke).join("+");
  keyStroke = keyStroke.replace("ControlLeft", "Ctrl");
  keyStroke = keyStroke.replace("ControlRight", "Ctrl");
  keyStroke = keyStroke.replace("MetaLeft", "Cmd");
  keyStroke = keyStroke.replace("MetaRight", "Cmd");
  keyStroke = keyStroke.replace("AltLeft", "Alt");
  keyStroke = keyStroke.replace("AltRight", "Alt");
  keyStroke = keyStroke.replace("ShiftLeft", "Shift");
  keyStroke = keyStroke.replace("ShiftRight", "Shift");
  keyStroke = keyStroke.replace("Digit", "");
  keyStroke = keyStroke.replace("Key", "");

  shortcuts[json.screen] = keyStroke;
  store.set("shortcuts", shortcuts);
});

ipcMain.on("set-state-keystrokes", (event, state) => {
  globalShortcut.unregisterAll();

  if (state == "on") {
    addListeners();
  }
});

// By god forsaken project..
function alignAndUploadImages(images) {
  // Load first image in

  mergeImg(images).then((img) => {
    console.log(
      img.getBuffer("image/png", (err) => {
        throw err;
      })
    );
    // img.write('test.png', () => {console.log('test')})
    // uploadImage(img.bitmap.data);
  });
}

function pad(digit) {
  return digit < 10 ? "0" + digit : digit;
}
app.on("ready", onReady);

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});
