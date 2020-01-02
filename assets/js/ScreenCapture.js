const {desktopCapturer} = require('electron')
var ScreenCapture = function() {
	this.screenSources = [];
  // this.selectedSource = null;
  // this.localStream = null;
}

ScreenCapture.prototype.getSources = async function() {
	var sources = await desktopCapturer.getSources({
		types: ['screen'],
		thumbnailSize: { width: 1280, height: 800 }
	})
	for (var index in sources) {
		this.addSource(sources[index]);
	}
	return this.screenSources;
}

// TBD
ScreenCapture.prototype.getThumbnail = function(id) {
	var sources = await desktopCapturer.getSources({
		types: ['screen'],
		thumbnailSize: { width: 1200, height: 800 }
	})

	return
}
// TBD
ScreenCapture.prototype.generateName = function() {
	const date = new Date();
	const fileName = file.name || data.id;
	const lastUrl = 'https://pixeldrain.com/u/'+data.id;
	const thumbnail = 'https://pixeldrain.com/api/file/'+data.id+'/thumbnail';
	const time = +date.getHours()+':'+pad(date.getMinutes());


	return time;
}

ScreenCapture.prototype.addSource = function(source) {
	source = {
		id: source.id,
		value: source.id.replace(':', ''),
		text: source.name,
		img: source.thumbnail.toDataURL()
	};
	this.screenSources.push(source)
}

ScreenCapture.prototype.capture = async function(source) {
	
	var stream = await navigator.mediaDevices.getUserMedia({
		audio: false,
		video: {
			mandatory: {
				chromeMediaSource: 'desktop',
				chromeMediaSourceId: source.id,
				minWidth: 1280,
				maxWidth: 1280,
				minHeight: 720,
				maxHeight: 720
			}
		}
	})

	console.debug(stream)
	return stream;
}
