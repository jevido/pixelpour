const { app, clipboard, BrowserWindow, Menu, Tray, globalShortcut} = require('electron')
const request = require('request');
const path = require('path');
const store = require('store')

const uploadUrl = 'https://pixeldrain.com/api/file';
let win = null;
let tray = null;

function onReady() {
	createTray();
	
	if (!store.get('shortcuts')) {
		setShortcuts();
	}
	addListeners();
	createWindow();
}

function createTray() {
	tray = new Tray('assets/images/icon.ico');
	const contextMenu = Menu.buildFromTemplate([
		{label: 'Open', type: 'radio', click: openWindow},
		{label: 'Exit', type: 'radio', click: app.quit}
	]);
	tray.setToolTip('PixelPour!');
	tray.setContextMenu(contextMenu);
	tray.on('double-click', openWindow);
}

function openWindow () {
	if (win) {
		if (win.isMinimized()) {
			win.restore();
		}
		win.focus();
	} else {
		createWindow();
	}
}

function createWindow() {
	// Create the browser window.
	win = new BrowserWindow({
		width: 1200,
		height: 800,
		backgroundColor: '#0d0d0d',
		// frame: false,
		icon: path.join(__dirname, 'assets/images/icon.ico'),
		// alwaysOnTop: true,
		autoHideMenuBar: true,
		webPreferences: {
			nodeIntegration: true
		}
	});

	// and load the index.html of the app.
  win.loadFile('index.html')
}

function setShortcuts() {
	var defaults = {
	//'screenname': 'shortcut',
		'screen:0:0': 'CommandOrControl+Shift+2',
		'screen:1:0': 'CommandOrControl+Shift+1'
	};
	store.set('shortcuts', defaults)
}
async function addListeners() {
	var shortcuts = store.get('shortcuts');
	// Read the store for which shortcuts to use
	for (let index in shortcuts) {
		// Damned variable hoisting
		let shortcut = shortcuts[index];

		globalShortcut.register(shortcut, function() {
			console.debug(shortcut, index);
			win.webContents.send('uploadFile', JSON.stringify({screen: index}));
		})
	}
}


// By god forsaken project..
function alignAndUploadImages(images) {
	// Load first image in

	mergeImg(images).then((img) => {

		console.log(img.getBuffer("image/png", err => {
			throw err;
		}));
		// img.write('test.png', () => {console.log('test')})
		// uploadImage(img.bitmap.data);
	});
}

function pad(digit) {	return digit < 10 ? '0'+digit:digit; }
app.on('ready', onReady)

app.on('will-quit', () => {
	globalShortcut.unregisterAll();
});
