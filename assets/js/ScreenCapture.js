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
ScreenCapture.prototype.getThumbnail = async function(id) {
	var sources = await this.getSources();

	return sources[id];
}
// TBD
ScreenCapture.prototype.generateName = function() {
	var date = new Date()
	return 'Screenshot '+ date.getFullYear()+'-'+date.getMonth()+'-'+pad(date.getDay())+' '+date.getHours()+':'+pad(date.getMinutes())+ '.png';
}

ScreenCapture.prototype.addSource = function(source) {
	source = {
		id: source.id,
		value: source.id.replace(':', ''),
		text: source.name,
		img: source.thumbnail.toDataURL()
	};
	this.screenSources[source.id] = source;

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
