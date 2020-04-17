var ApiManager = function(data) {
	this.baseUrl = data.baseLink;
	this.apiUrl = this.baseUrl + 'api/';
	this.uploadsUrl = this.baseUrl+'u/';
}

ApiManager.prototype.uploadFile = async function(formData, fileID, onProgress, onFinish) {
	let _this = this;

	await $.ajax({
		processData: false,
		contentType: false,
    xhr: function() {
			let xhr = new window.XMLHttpRequest();

			// Upload progress
			xhr.upload.addEventListener("progress", function(evt){
				if (evt.lengthComputable) {
					let percentComplete = parseInt((evt.loaded / evt.total) * 100);
					//Do something with upload progress
					onProgress(fileID, percentComplete)
				}
			}, false);
       return xhr;
    },
    type: 'POST',
    url: this.apiUrl+'file',
    data: formData,
    success: (data) => {
			data = JSON.parse(data);
			data.thumbnail = this.apiUrl+'file/'+data.id+'/thumbnail';
			data.url = this.uploadsUrl+data.id;
			return onFinish(fileID, data);
    }
	});
}

module.exports = {
	ApiManager: ApiManager
}