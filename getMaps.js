var request = require('request');
var fs = require('fs');
var async = require('async');
var mkdirp = require('mkdirp');

var baseURL = "http://map.guildblacksails.com/images/world/";
var basePath = "www/img/maps/world/";

var download = function(uri, imagePath, imageName, cb, errorCb) {
	request.head(uri, function(err, res, body){
		if(err) errorCb(err);
		if(res.statusCode == 200) {
			mkdirp(imagePath, function (err) {
				if (err) errorCb(err);
				request(uri).pipe(fs.createWriteStream(imagePath + imageName)).on('close', cb).on('error', errorCb);
			});
		} else {
			errorCb(new Error("file did not exist"));
		}
	});
}

var getMaxTile = function(zoom) {
	return maxTilesAtZoomLevel[zoom] != null ? maxTilesAtZoomLevel[zoom] : {x: 0, y: 0};
}

var maxTilesAtZoomLevel = {
	1: {x: 1, y: 1},
	2: {x: 2, y: 2},
	3: {x: 4, y: 4},
	4: {x: 8, y: 8},
	5: {x: 16, y: 17},
	6: {x: 32, y: 34},
	7: {x: 65, y: 68},
}

imagesToDownload = [];

for(var zoom = 1; zoom < 8; zoom++) {
	for(var x = 0; x < maxTilesAtZoomLevel[zoom].x + 1; x++) {
		for(var y = 0; y < maxTilesAtZoomLevel[zoom].y + 1; y++) {
			imagesToDownload.push({path: zoom + "/" + x + "/", name: y + ".jpg"});
		}
	}
}

console.log("queued " + imagesToDownload.length + " for download.");

async.eachLimit(imagesToDownload, 100, function(image, callback){
	download(baseURL + image.path + image.name, basePath + image.path, image.name, function(){
		console.log("Loaded map tile: " + image.path + image.name);
		callback();
	}, function(err) {
		console.log("error downloading file: " + image.path + image.name);
		callback();
	});
});