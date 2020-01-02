const {clipboard, electron, shell} = require('electron');
// import ScreenCapture from 'ScreenCapture.js';
const uploadSuccessfullSound = new Audio('assets/misc/snap.mp3');

require('electron').ipcRenderer.on('uploadedFile', function(event, message) {
	message = JSON.parse(message);

	createUploadedFile(message, {name: message.name});
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

function uploadFile(file) {
	if (typeof file != 'object') return;
	var formData = new FormData();
	formData.append('file', file);

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
	var screenCapture = new ScreenCapture();
	var screenSources = await screenCapture.getSources();

	for (var index in screenSources) {
		createUploadedFile(screenCapture.capture(screenSources[index]));
	}
})