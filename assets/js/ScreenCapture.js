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

ScreenCapture.prototype.getScreenShot = function(callback, screen) {
	var _this = this;
	_this.callback = callback;
	_this.screen = screen;
	imageFormat = 'image/jpeg';
	
	this.handleStream = (stream) => {
			// Create hidden video tag
			var video = document.createElement('video');
			video.style.cssText = 'position:absolute;top:-10000px;left:-10000px;';
			
			// Event connected to stream
			video.onloadedmetadata = function () {
					// Set video ORIGINAL height (screenshot)
					video.style.height = this.videoHeight + 'px'; // videoHeight
					video.style.width = this.videoWidth + 'px'; // videoWidth

					video.play();

					// Create canvas
					var canvas = document.createElement('canvas');
					canvas.width = this.videoWidth;
					canvas.height = this.videoHeight;
					var ctx = canvas.getContext('2d');
					// Draw video on canvas
					ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

					if (_this.callback) {
							// Save screenshot to base64
							_this.callback(canvas.toDataURL(imageFormat), _this.generateName());
					} else {
							console.warn('Need callback!');
					}

					// Remove hidden video tag
					video.remove();
					try {
						// Destroy connect to stream
						stream.getTracks()[0].stop();
					} catch (e) {}
			}
			
			video.srcObject = stream;
			document.body.appendChild(video);
	};

	this.handleError = function(e) {
			console.log(e);
	};

	desktopCapturer.getSources({ types: ['screen'] }).then(async sources => {
		for (const source of sources) {
      // Filter: main screen
      console.debug(source.id, _this.screen)
      if (source.id != _this.screen) continue;
      
			if ((source.name === "Entire screen") || (source.name === "Screen 1") || (source.name === "Screen 2")) {
				try{
					const stream = await navigator.mediaDevices.getUserMedia({
						audio: false,
						video: {
							mandatory: {
								chromeMediaSource: 'desktop',
								chromeMediaSourceId: source.id,
								minWidth: 1280,
								maxWidth: 4000,
								minHeight: 720,
								maxHeight: 4000
							}
						}
					});
					_this.handleStream(stream);
				} catch (e) {
					_this.handleError(e);
				}
			}
		}
	});
}

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

	return stream;
}


