const { clipboard , remote, shell, ipcRenderer } = require('electron');
const { BrowserWindow, screen } = require('electron').remote;


let { ApiManager } = require('./assets/js/things/ApiManager.js');
// let { FileHandler } = require('./assets/js/things/FileHandler.js');
let { ScreenManager } = require('./assets/js/things/ScreenManager.js');
const Store = require('electron-store');

let PixelHandler = function() {
	// Constructor
	this.pixelDrain = 'https://pixeldrain.com/';
	this.apiLink = this.PixelHandler + 'api/';
	this.apiManager = new ApiManager({
		baseLink: this.pixelDrain
	});
	this.fileID = 0; // To keep track of current fileID, can be anything at any time
}

PixelHandler.prototype.screenManager = new ScreenManager();
// PixelHandler.prototype.fileHandler = new FileHandler();
PixelHandler.prototype.store = new Store();

PixelHandler.prototype.addEventHandlers = function() {
	let _this = this;
	let buffer  = {};
  let stillPressed = {};
  let keys    = {};
	let lastKeyTime = Date.now();
	let lastKeyStroke = {};
	let currentScreen = null;
	
	$('#close').on('click', function(ev) {
		var window = remote.getCurrentWindow();
		window.close();
	})

	$('.shortcuts .screen').on('click', function() {
    var $this = $(this);
    let shortcuts = _this.store.get('shortcuts');
		currentScreen = $this.data('id');

		$('.modal .modal-title #screen-name').text($this.data('title'))
    $('.modal #shortcut').text(shortcuts[currentScreen])
    $('.modal').modal();
  });

	$('body').on('dragover', function(ev) {
		ev.preventDefault();
		ev.stopPropagation();
	})
	$('body').on('dragenter', function(ev) {
		ev.preventDefault();
		ev.stopPropagation();
	})

	$('body').on('drop', (ev) => {
		if (ev.originalEvent.dataTransfer && ev.originalEvent.dataTransfer.files.length) {
			ev.preventDefault();
			ev.stopPropagation();

			Array.from(ev.originalEvent.dataTransfer.files).forEach(file => {
				let filedata = {
					title: file.name|| 'Upload'
				}
				this.uploadFile(filedata, file);
			});

		}
	});

	$('.upload-btn-wrapper .btn').click(() => {
		$('#uploadFile').click();
	})

	$('#uploadFile').on('change', function() {
		let files = $(this)[0].files;
		if (files) {
			Array.from(files).forEach(file => {
				console.debug(file);
				let filedata = {
					title: file.name|| 'Upload'
				}
				_this.uploadFile(filedata, file);
			});
		}
	});

	$('.modal #save').on('click', function() {
		if (Object.keys(lastKeyStroke).length > 0) {
			// Reason for handling this, is so we have 1 function in total for setting keystrokes
			ipcRenderer.send('set-keystrokes', JSON.stringify({screen: currentScreen, keyStroke: lastKeyStroke}));
			$('.modal').modal('hide');
		}
	});

	$('.modal').on('shown.bs.modal', function() {
			lastKeyStroke = {};
			ipcRenderer.send('set-state-keystrokes', 'off');
	});

	$('.modal').on('hidden.bs.modal', function() {
		// Enable global keystrokes
		ipcRenderer.send('set-state-keystrokes', 'on');
	});

	document.addEventListener('keydown', (ev) => {
    // ev.preventDefault();
    const key = ev.keyCode;
    const currentTime = Date.now();

    if (currentTime - lastKeyTime > 1000) { // 1 seconds for setting a shortcut
      keys = {};
			buffer = {};
			lastKeyStroke = {};
    }

    stillPressed[key] = true;
    buffer[key] = true;
    keys[ev.code] = true;
		lastKeyTime = currentTime;
		lastKeyStroke = keys;

    $('.modal #shortcut').text(Object.keys(keys).join(" + "));
	});

  document.addEventListener('keyup', function(ev) {
    // Check if at least one button is still pressed
    delete stillPressed[ev.keyCode];
    if (Object.keys(stillPressed).length == 0) {
      buffer = {};
      keys = {};
    }
	})

	ipcRenderer.on('keystroke', (ev, data) => { _this.onKeyStroke(ev, data) } );

	$('.open-external').on('click', function(ev) {
		ev.preventDefault();
		shell.openExternal($(this).prop('href'));
	})
}

PixelHandler.prototype.onKeyStroke = async function(ev, data) {
	let _this = this;
	data = JSON.parse(data);

	if (data.screen == 'edit') {
		let cursor = screen.getCursorScreenPoint();
		let display = screen.getDisplayNearestPoint({x: cursor.x, y: cursor.y});

		let sources = await desktopCapturer.getSources({
			types: ['screen'],
			thumbnailSize: {
				width: display.bounds.width,
				height: display.bounds.height
			}
		});

		if (sources) {
			for (let index in sources) {
				let source = sources[index];
				if (display.id == sources[index].display_id) {					
					let image = source.thumbnail.toDataURL();

					browserwindow = new BrowserWindow({
						fullscreen: true,
						frame: false,
						resizable: true,
						alwaysOnTop: true,
						webPreferences: {
							nodeIntegration: true
						}
					});

					browserwindow.setPosition(display.workArea.x, display.workArea.y)
					browserwindow.center();
					
					browserwindow.loadURL(`file://${__dirname}/assets/js/things/edit/edit.html`);
					browserwindow.webContents.once('dom-ready', function() {
						browserwindow.webContents.send('file', image);
						browserwindow.webContents.on('ipc-message', (ev, key, file) => {
							_this.uploadFile({
								title: 'croppy.jpg',
							}, dataURIToBlob(file))
						})

					})

				}
			}
		}

	} else {
		// Make a screenshot since this can only be executed from the renderer process
		let file = await this.screenManager.makeScreenshot(data.screen);
		let blob = dataURIToBlob(file.img);
		this.uploadFile(file, blob)
	}
}

PixelHandler.prototype.uploadFile = async function(data, file) {
	let _this = this;
	this.fileID++;

	data.img = data.img || '';
	_this.addFile(data.img, data.title, this.fileID);

	let formData = new FormData();
	formData.append('file', file, data.title)

	let onProgress = (uploadID, percentCompleted) => {
		// If i use fileID, i can use the wrong upload
		_this.progressUpload($(`#file-${uploadID} .progressbar`), percentCompleted);
	};

	let onFinish = function(uploadID, data) {
		// Preload image before trying to display
		let image = new Image();
		image.src = data.thumbnail;
		image.onload = () => {
			$(`.uploaded-files #file-${uploadID} .card-img-top`).attr('style', `background-image: url('${image.src}')`);
		}

		let html = `
			<div class="btn-group">
				<a class="btn btn-sm btn-outline-secondary" onclick="newBrowserWindow('${data.url}')">View</a>
				<a class="btn btn-sm btn-outline-secondary" onclick="clipboard.writeText('${data.url}');">Copy</a>
			</div>
		`;
		$(`.uploaded-files #file-${uploadID} .progressbar`).replaceWith(html);
		clipboard.writeText(data.url);
		_this.uploadSuccessfullSound.play();
	};

	_this.apiManager.uploadFile(formData, this.fileID, onProgress, onFinish);
}

PixelHandler.prototype.addFile = function(file, name, fileID) {
	// file can be undefined, since not everything has a thumbnail
	file = file || (this.pixelDrain+'res/img/header_2019.png');


	let html = `
	<div class="card" id="file-${fileID}">
		<div class="card-img-top" style="background-image: url('${file}');" alt="${name}"></div>
		<div class="card-body">
			<h5 class="card-title lead">${name}</h5>
			<!-- <p class="card-text">Text.</p> -->
			<div class="progressbar" data-perc="0">
				<div class="bar color4"><span></span></div>
				<div class="label"><div class="perc"></div></div>
			</div>
		</div>
	</div>
`;

	$('#uploaded-files').prepend(html);
}


PixelHandler.prototype.createScreen = function(title, image, id) {
	return `
	<div class="card">
		<img class="card-img-top screen" src="${image}" data-title="${title}" data-id="${id}" alt="${title}" />
		<h5 class="card-title text-white">${title}</h5>
	</div>
	`;
}

PixelHandler.prototype.createShortcutContainer = function(enumerate) {
	return `
		<div class="container-${enumerate} d-block text-center"/>	
`;
}

PixelHandler.prototype.addScreensToScreen = async function() {
	let screens = await this.screenManager.getSources();
	let enumerate = 0;

	screens[2] = {
		img: screens[1].img,
		text: 'Edit mode',
		id: 'edit'
	}

	if (screens) {
		for (let index in screens) {
			let screen = screens[index];
			let screenHtml = this.createScreen(screen.text, screen.img, screen.id);

			if (enumerate % 3 == 0) { // TODO: calculate 3 based on browserwindow width
				// Add a container
				currentContainer = enumerate;
				$('.shortcuts').append(this.createShortcutContainer(enumerate));
			}

			// Add the image
			$(`.shortcuts .container-${currentContainer}`).append(screenHtml);
			enumerate++;
		}
	}
}

PixelHandler.prototype.progressUpload = function($element, percentCompleted) {
	let duration = percentCompleted*5; // Duration amplifier

	$element.find('.bar').animate({width: percentCompleted+ '%'}, {
		duration: duration,
		step: function(now) {
			let currentProgress = $(this).css('width');
			$element.find('.perc').text(parseInt(now)+'%');
			$element.find('.label').css('left', currentProgress);
		}
	});
}

function newBrowserWindow(url, options) {
	let wind = new BrowserWindow({
		width: 1200,
		height: 800,
		backgroundColor: '#312450',
		autoHideMenuBar: true,
		frame: true,
		// alwaysOnTop: true,
		webPreferences: {
			nodeIntegration: false
		}
	});	
	wind.loadURL(url);
}

PixelHandler.prototype.start = async function() {
	await this.addScreensToScreen()
	this.addEventHandlers();
	this.uploadSuccessfullSound = new Audio('assets/misc/snap.mp3');
}

$(document).ready(function() {
	let pixelHandler = new PixelHandler();
	pixelHandler.start();
});

// TODO: Add to a toolbox script where random functions are stored
function pad(digit) {	return digit < 10 ? '0'+digit:digit; }


// As far i could read in a minute, formdata doesnt accept datauri's, so we transform it into a blob
function dataURIToBlob(dataURI) {
	// convert base64/URLEncoded data component to raw binary data held in a string
	var byteString;
	if (dataURI.split(',')[0].indexOf('base64') >= 0)
			byteString = atob(dataURI.split(',')[1]);
	else
			byteString = unescape(dataURI.split(',')[1]);
	// separate out the mime component
	var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

	// write the bytes of the string to a typed array
	var ia = new Uint8Array(byteString.length);
	for (var i = 0; i < byteString.length; i++) {
			ia[i] = byteString.charCodeAt(i);
	}

	return new Blob([ia], {type:mimeString});
}