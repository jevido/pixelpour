'use strict';

const electron = require('electron');
const delay = require('delay');

const settings = require('./settings');

const {BrowserWindow, systemPreferences} = electron;

const croppers = new Map();
let notificationId = null;

const closeAllCroppers = () => {
  const {screen} = electron;

  screen.removeAllListeners('display-removed');
  screen.removeAllListeners('display-added');

  for (const [id, cropper] of croppers) {
    cropper.destroy();
    croppers.delete(id);
  }

  if (notificationId !== null) {
    // systemPreferences.unsubscribeWorkspaceNotification(notificationId);
    notificationId = null;
  }
};

const openCropper = (display, activeDisplayId, image) => {
  const {id, bounds} = display;
  const {x, y, width, height} = bounds;

  const cropper = new BrowserWindow({
    x,
    y,
    width,
    height,
    // enableLargerThanScreen: true,
    resizable: false,
    moveable: false,
    frame: false,
    backgroundColor: '#312450',
    // transparent: true,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true
    }
  });

  cropper.loadFile('./../cropperWindow.html')
  cropper.focus();

  // cropper.on('closed', closeAllCroppers);
  // croppers.set(id, cropper);
  return cropper;
};

const openCropperWindow = (image) => {
  closeAllCroppers();
  const {screen} = electron;
  const displays = screen.getAllDisplays();
  const activeDisplayId = screen.getDisplayNearestPoint(screen.getCursorScreenPoint()).id;

  for (const display of displays) {
    openCropper(display, activeDisplayId, image);
  }

  croppers.get(activeDisplayId).focus();
  // let screenLoc = screen.getCursorScreenPoint();
};



const preventDefault = event => event.preventDefault();

const isCropperOpen = () => croppers.size > 0;


const getCursorLocation = function () {
	const {screen} = electron;

	return screen.getCursorScreenPoint();
}

module.exports = {
	openCropperWindow,
	getCursorLocation,
  isCropperOpen
};