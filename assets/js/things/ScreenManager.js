const { desktopCapturer } = require('electron');


var ScreenManager = function() {

}

ScreenManager.prototype.getSources = async function() {
	let sources = await desktopCapturer.getSources({
		types: ['screen'],
		thumbnailSize: {
			width: 1920,
			height: 1080
		}
	});

	let screenSources = [];
	if (sources) {
		for (let index in sources) {
			let screenSource = sources[index];

			screenSources.push({
				id: screenSource.id,
				value: screenSource.id.replace(':', ''), // TODO: Not sure what i do with this
				text: screenSource.name,
				img: screenSource.thumbnail.toDataURL()
			});
		}
	}

	return screenSources;
}

ScreenManager.prototype.makeScreenshot = async function(screen) {
	let file = await this.getSources().then((sources) => {
		for (let index in sources) {
			if (sources[index].id != screen) continue;

			try {
				return { 
					img: sources[index].img,
					title: this.generateScreenshotName()
				}
			} catch (e) {
				this.handleError(e);
			}
		}
	});

	return file;
}

ScreenManager.prototype.generateScreenshotName = function() {
	var date = new Date()
	return `Screenshot ${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}.png`;
}

ScreenManager.prototype.handleError = function(e) {
	console.error(e);
};

function pad(digit) {	return digit < 10 ? '0'+digit:digit; }

module.exports = {
	ScreenManager: ScreenManager
}