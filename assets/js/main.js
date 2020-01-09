const {clipboard, electron, shell, ipcRenderer} = require('electron');
var screenCapture = new ScreenCapture();

const store = require('store')

// import ScreenCapture from 'ScreenCapture.js';
const uploadSuccessfullSound = new Audio('assets/misc/snap.mp3');


ipcRenderer.on('uploadFile', async function (event, message) {
  message = JSON.parse(message);
	var file = await screenCapture.getScreenShot(function(file, name) {
    file = dataURItoBlob(file);
    uploadFile(file, name)
  }, message.screen);
})

$('body').on('dragover', function(e) {
	e.preventDefault();
	e.stopPropagation();
});

$('body').on('dragenter', function(e) {
	e.preventDefault();
	e.stopPropagation();
});

$('body').on('drop', function(e){
	if (e.originalEvent.dataTransfer && e.originalEvent.dataTransfer.files.length) {
		e.preventDefault();
		e.stopPropagation();
		/*UPLOAD FILES HERE*/
		uploadFiles(e.originalEvent.dataTransfer.files);
	}
});

$('.upload-btn-wrapper .btn').click(() => {$('#uploadFile').click()});
$('#uploadFile').on('change', function() {
	if ($(this)[0].files) {
		uploadFiles($(this)[0].files);
	}
});

function uploadFiles(files) {
	for (var index in files) {
		var file = files[index];
		uploadFile(file);
	}
}

function uploadFile(file, filename) {
	if (typeof file != 'object' && typeof file != 'string') return;
	var formData = new FormData();
	// formData.append('file', file.img, file.name);

	if (filename) {
		file.name = filename;
	}
	formData.append("file", file);

	$.ajax({
		url : 'https://pixeldrain.com/api/file',
		type : 'POST',
		data : formData,
		processData: false,  // tell jQuery not to process the data
		contentType: false,  // tell jQuery not to set contentType
		success : function(data) {
			const lastUrl = 'https://pixeldrain.com/u/'+data.id;
			clipboard.writeText(lastUrl);
			createUploadedFile(data, file);
		}
	});
}

function createUploadedFile(data, file) {
	file = file || {};
	const date = new Date();
	const fileName = file.name || data.id;
	const lastUrl = 'https://pixeldrain.com/u/'+data.id;
	const thumbnail = 'https://pixeldrain.com/api/file/'+data.id+'/thumbnail';
	const time = +date.getHours()+':'+pad(date.getMinutes())

	uploadSuccessfullSound.play();

	const prepender = `
	<div class="col-md-4">
		<div class="card mb-4 shadow-sm">
			<img class="bd-placeholder-img card-img-top" width="100%" height="225" src="${thumbnail}"/>
			<div class="card-body">
				<p class="card-text">${fileName}</p>
				<div class="d-flex justify-content-between align-items-center">
					<div class="btn-group">
						<a onclick="newBrowserWindow('${lastUrl}')" oldonclick="window.open('${lastUrl}', '_blank', 'nodeIntegration=no')" class="btn btn-sm btn-outline-secondary" target="_BLANK">View</a>
						<button type="button" class="btn btn-sm btn-outline-secondary" onclick="clipboard.writeText(\'${lastUrl}\');">Copy</button>
					</div>
					<small class="text-muted">${time}</small>
				</div>
			</div>
		</div>
	</div>
	`;

	$('#uploaded-files').prepend(prepender);
}

function pad(digit) {	return digit < 10 ? '0'+digit:digit; }


function newBrowserWindow(url, options) {
	const { BrowserWindow } = require('electron').remote;
	let wind = new BrowserWindow({
		width: 1200,
		height: 800,
		backgroundColor: '#312450',
		frame: false,
		// alwaysOnTop: true,
		webPreferences: {
			nodeIntegration: false
		}
	});	
	wind.loadURL(url);
}

$('.open-external').on('click', function(ev) {
	ev.preventDefault();
	shell.openExternal($(this).prop('href'));
})

$(document).ready(async function() {
	var screenSources = await screenCapture.getSources();
	var enumerate = 0;
	var currentContainer = 0;

	for (var index in screenSources) {
		if (enumerate % 3 == 0) {
			currentContainer = enumerate;
			$('.shortcuts').append(`<div class="container-${currentContainer} d-block text-center"/>`)
		}
		file = await screenCapture.getThumbnail(screenSources[index].id)

		$(`.shortcuts .container-${currentContainer}`).append(`<img class="img-thumbnail screen image mx-1" src="${file.img}" data-title="${file.text}" alt="${file.text}">`)
		enumerate++
  }
  
  $('.shortcuts .screen').on('click', function() {
    var $this = $(this);
    var _this = this;

    $('.modal .modal-title #screen-name').text($this.data('title'))
    $('.modal #shortcut').text('')
    $('.modal').modal();
  });

  var buffer  = {};
  var stillPressed = {};
  var keys    = {};
  let lastKeyTime = Date.now();

  
  $('.modal #save').on('click', function() {
    setShortcut(buffer)
  })

  function setShortcut(screen, keystroke) {
    var shortcuts = store.get('shortcuts');
    shortcuts[screen] = keystroke;
    store.set('shortcuts', shortcuts)
  }

  document.addEventListener('keydown', (ev) => {
    // ev.preventDefault();
    const key = ev.keyCode;
    const currentTime = Date.now();

    if (currentTime - lastKeyTime > 1000) { // 1.500 seconds for setting a shortcut
      keys = {};
      buffer = {};
    }

    stillPressed[key] = true;
    buffer[key] = true;
    keys[ev.code] = true;
    lastKeyTime = currentTime;


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

})


var delay = (function() {
  var timer = 0;
  return function(callback, ms) {
    clearTimeout(timer);
    timer = setTimeout(callback, ms);
  };
})();
// Would be cool, to add windows manually as well, so you can shortcut VS Code for example





// As far i could read in a minute, formdata doesnt accept datauri's, so we transform it into a blob
function dataURItoBlob(dataURI) {
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