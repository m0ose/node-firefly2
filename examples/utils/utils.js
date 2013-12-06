var PNG = require('pngjs').PNG;
var fs = require('fs');
var sys = require('sys');

module.exports = {
	saveBuff2Png: function(buff, filename) {
		var pnger = new PNG({
			width: 640,
			height: 640
		})
		for (var i = 0; i < pnger.data.length; i++) {
			pnger.data[i] = buff[i] //12
		}
		pnger.pack().pipe(fs.createWriteStream(filename));
	},

	currentTriggerDelay: 0,
	currentExposure: 0,
	setDelay: function(cam, seconds, myexposure) {
		if (!(seconds >= 0) || !myexposure) {
			console.log('dang', seconds, myexposure)
			return this.currentTriggerDelay
		}

		var Ichanged = false
		if (this.currentExposure != myexposure && myexposure > 0) {
			console.log('setting myexposure', myexposure)
			this.currentExposure = myexposure
			cam.exposure(myexposure);
			Ichanged = true;
		}
		if (this.currentTriggerDelay != seconds && seconds > 0) {
			console.log('setting delay', seconds)
			this.currentTriggerDelay = seconds
			cam.triggerDelay(this.currentTriggerDelay)
			Ichanged = true
		}
		if (Ichanged) {
			cam.takePhoto(); //take one photo, to clear old buffer
			cam.takePhoto();
		}

	},

	//
	//  this requires a trigger cable to be plugged in
	//
	findMinMax: function(cam) {
		cam.startCamera();
		cam.autoGain(false);
		cam.autoExposure(false);
		cam.autoWhiteBalance(false);
		cam.gain(16);
		cam.exposure(50);
		cam.triggerOff(true); //True is off, waits for hardware trigger
		cam.frameRate();
		cam.triggerDelay(0.000)
		cam.takePhoto();
		cam.takePhoto();


		var pics = []
		for (var n = 0; n < 33; n = n + 1) {
			cam.triggerDelay(n / 4000)
			pics.push(cam.takePhoto('rgba'))
		}

		console.log(cam, pics[4].length)
		//search for light and dark frames
		var imgbuff;

		var darkFrame = {
			index: 0,
			score: Number.MAX_VALUE,
			ms: 0
		} //[0, Number.MAX_VALUE]
		var lightFrame = {
			index: 0,
			score: Number.MIN_VALUE,
			ms: 0
		} //[0, Number.MIN_VALUE]

		for (var j = 0; j < pics.length; j++) {
			imgbuff = pics[j]
			var score = 0
			for (var i = 12; i < imgbuff.length; i = i + 101) {
				var px = Math.sqrt(Math.pow(imgbuff[i - 3], 2) + Math.pow(imgbuff[i - 2], 2) + Math.pow(imgbuff[i - 1], 2) + Math.pow(imgbuff[i], 2))
				score += px
			}

			if (score < darkFrame.score) {
				darkFrame = {
					index: j,
					score: score,
					ms: j / 4000
				} //[j, score, j / 4000]
			}
			if (score > lightFrame.score) {
				lightFrame = {
					index: j,
					score: score,
					ms: j / 4000
				}
			}

			var ph = pics[j]
		}

		console.log("low", darkFrame)
		console.log("high", lightFrame)
		this.saveBuff2Png(pics[darkFrame.index], '../pics/darkFrame.png')
		this.saveBuff2Png(pics[lightFrame.index], '../pics/lightFrame.png')
		cam.gain(2);

		return ({
			low: darkFrame,
			high: lightFrame
		})
	},

	sleepHack: function(cam, timeout) {
		timeout = Math.max(4000, timeout)
		//stupid fuckin windows causes all sorts of problems when the computer goes to sleep. this helps prevent it
		setInterval(function() {
			if (!cam.takePhoto('rgba')) {
				console.log('errors')
			};
			cam.startCamera() // there is a bug when windows falls asleep, that messes up the pictures for some reason. this helps fix it by restarting the camera every 30 seconds
			console.log('.')
		}, timeout)

	},

	CORSheaders: {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Methods": "POST, GET, PUT, DELETE, OPTIONS",
		"Access-Control-Allow-Credentials": true,
		"Access-Control-Max-Age": "1",
		"Access-Control-Allow-Headers": "X-Requested-With, Access-Control-Allow-Origin, X-HTTP-Method-Override, Content-Type, Authorization, Accept",
		"Content-Type": "image/png"
	},

	bar: function() {
		// whatever
	}
};