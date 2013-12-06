console.log("starting laser pointer tracker 4")

var addon = require('../build/Release/addon');
var sys = require('sys');
var PNG = require('pngjs').PNG;
var http = require('http');
var url = require('url');
var socketio = require('socket.io')
var utils = require('./utils/utils.js')
var timer = require('../timer.js').timer


var _camwidth = 640;
var _camheight = 480;
var readTimeout = 10;
var SEND_MSG_THRESHOLD = 100;
var _PORT = 3000;
var LoopTimeout = null;
var averageImage;
var cam = new addon();
var whiteDelay = 0.005//0.004;
var darkDelay = 0.001//0.0075;
var socket;
var whiteExpo = 240//90
var blackExpo = 20

//  smoothing
var smoothed = [0, 0]; // or some likely initial value
var smoothing = 100//15; // or whatever is desired
var lastUpdate = new Date;
var lastXY = [0, 0]
var maxLastDist = 0.02


	function init() {

		console.log("starting camera")
		cam.verbose(true)
		var camCount = cam.getNumCameras();
		console.log('num cameras', camCount)
		if (!camCount) {
			console.error(" No Camera Detected ")
			process.exit(1) // maybe I should have the server emit an error message
		}
		console.log("start Camera 0 ", cam.startCamera())
		console.log("started camera")


		setCamDefaults(cam)
		cam.takePhoto();
		cam.takePhoto();
		cam.takePhoto();

		//findLightDark(cam)
		//setCamDefaults(cam)

		// initialise an array or 2
		averageImage = new Float32Array(_camwidth * _camheight) //new Array(_camwidth * _camheight);
		for (var i = 0; i < averageImage.length; i++) {
			averageImage[i] = 0
		}

		startServer()
		searchLoop()
	}
	//
	// search for the dark and light frame for our laser. Note the projector should be displaying a whiteish screen for this to work.
	//
	function findLightDark(cam) {
		// Find the dark and light frames
		timer.start()
		cam.takePhoto();
		cam.takePhoto();
		var keyFrames = utils.findMinMax(cam)
		whiteDelay = keyFrames.high.ms;
		darkDelay = keyFrames.low.ms;
		console.log(keyFrames)
		console.log('time to callibrate light and dark frames', timer.stop())
		setCamDefaults(cam)
		return keyFrames
	}
	//
	// default camera parameters. for this....
	//
	function setCamDefaults(cam) {
		cam.autoGain(false);
		cam.autoExposure(false);
		cam.autoWhiteBalance(false);
		cam.gain(2);
		cam.exposure(whiteExpo);
		cam.triggerOff(true); //True is off, waits for hardware trigger
		cam.frameRate();
		cam.triggerDelay(whiteDelay)
		cam.takePhoto();
	}
	//
	//  Search for laser pointer
	//
var oldVariance = 0;
var lastSearchIter = new Date

	function searchLoop() {
		//console.log('search LOOOPPPPPP!!!!!!!!!!!!!!!!!!!!')
		timer.start()
		var radius = 5;
		//console.log( darkDelay, blackExpo)
		utils.setDelay(cam, darkDelay, blackExpo)
		var buf = cam.takePhoto();

		if (buf) {
			var bestVal = Number.MIN_VALUE;
			var bestIndex = 0;
			var mean = 0
			var variance = 0;
			var samples = 0
			var thresh =  new Float32Array(1)
			var rgb =  new Float32Array(3)
			for (var x = 0; x < _camwidth; x++) {
				for (var y = 0; y < _camheight; y++) {
					var i1 = y * _camwidth + x;
					var i2 = i1 * 3;
					 rgb[0] = buf[i2]/255;
					 rgb[1] = buf[i2 + 1]/255;
					rgb[2] = buf[i2 + 2]/255;
					
					//thresh = //400//Math.floor(brightness(r, g, b));
					thresh[0] = redThreshold(rgb)//brightness(rgb)
					//var gright =  Math.floor(brightness(r, g, b));
					var diff = thresh[0] - averageImage[i1];
					if (diff > bestVal) {
						bestVal = diff;
						bestIndex = i1;
					}

					//if (oldVariance > 1000) {
					//	averageImage[i1] = Math.floor(0.6 * averageImage[i1] + 0.4 * thresh)
					//} else {
					//averageImage[i1] = Math.floor(0.5 * averageImage[i1] + 0.5 * thresh[0])
					//}
					//  find variance because for some reason its slooooow
					//
					/*if (i1 % 1323 == 0) {
						variance += diff * diff
						samples++
					}
*/
				}
			}

			//console.log(variance)

			variance = parseInt(variance / ((samples) - 1))
			oldVariance = variance

			var bestxy = [Math.floor(bestIndex % (_camwidth)), Math.floor(bestIndex / (_camwidth))]
			var now = new Date
			if (now - lastSearchIter > 2000) {
				console.log('search for laser. searchtime:', timer.stop(), 'bestval: ', bestVal, 'x,y:', bestxy, 'variance', variance)
				lastSearchIter = now
			}
			//console.log('xy', bestxy, 'value', bestVal)
			emitLaserMsg((bestxy[0]) / _camwidth, (bestxy[1]) / _camheight,  bestVal)

			LoopTimeout = setTimeout(searchLoop, readTimeout)
		} else {
			console.log("FAIL")
		}
	}


	//
	//  functions needed by the laser point loop
	//
var redThreshold = function(rgb) {
	dx = rgb[0] ,
	dy = ( rgb[1] ) / 2,
	dz = ( rgb[2]) / 4;
	return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
var brightness = function(rgb) {

	return Math.sqrt(rgb[0] * rgb[0] + rgb[1] * rgb[1] + rgb[2] * rgb[2]);
}


	function emitLaserMsg(x, y, confidence) {
		confidence = 255*confidence
		//console.log('sending',x,y, confidence)
		var smoo = smoothedValue([x, y])
		//console.log(smoo[0].toPrecision(4), smoo[1].toPrecision(4))
		if (confidence > SEND_MSG_THRESHOLD) {
			console.log('sending', 'x,y: ', x, y, 'confidence: ', confidence)
			socket.sockets.emit('laser', {
				x: smoo[0],
				y: smoo[1],
				rawX: x,
				rawY: y,
				c: Math.abs(confidence)
			});
		}
	}

	//
	//  Start the damn server
	//  	start a server on 127.0.0.1
	//
	function startServer() {

		console.log(cam.getWidth(), cam.getHeight())
		var server = http.createServer(function(req, res) {
			var request = url.parse(req.url, true);
			var querydata = url.parse(req.url, true).query;
			//console.log(querydata)
			var action = request.pathname;
			if (action == '/image.png') {
				console.log(' image requested', querydata)
				clearTimeout(LoopTimeout)
				var myexp = whiteExpo
				var mydelay = whiteDelay
				console.log(myexp, mydelay)
				if( querydata.exposure &&  Number(querydata.exposure) > 0){
					myexp = Math.min(1000,Math.max(1,Number(querydata.exposure)))
				}
				if( querydata.delay &&  Number(querydata.delay) > 0){
					mydelay = Math.min(1,Math.max(0,Number(querydata.delay)))
				}
				utils.setDelay(cam, mydelay, myexp)
				res.writeHead(200, utils.CORSheaders);
				var pnger = new PNG({
					width: 640,
					height: _camheight
				})
				var photo2 = cam.takePhoto('rgba');
				for (var i = 0; i < pnger.data.length; i++) {
					pnger.data[i] = photo2[i];
				}
				pnger.pack()
				pnger.pipe(res);
				LoopTimeout = setTimeout(searchLoop, 2000)

			} else if (action == "/findMinMax") {
				clearTimeout(LoopTimeout)
				utils.setDelay(cam, whiteDelay, whiteExpo)
				var keyFrames = findLightDark(cam)
				res.writeHead(200, {
					'Content-Type': 'text/plain'
				});
				res.end(" " + JSON.stringify(keyFrames) + " \n");
				LoopTimeout = setTimeout(searchLoop, 500)
			} else {
				res.writeHead(200, {
					'Content-Type': 'text/plain'
				});
				res.end('Hello World \n');
			}
		});
		server.listen(_PORT);
		console.log(" server listening on port 127.0.0.1:" + _PORT)

		//
		//  start socket io server
		//
		socket = socketio.listen(server);
		socket.sockets.on('connection', function(client) {
			console.log('socket on called')
			client.emit('laser', {
				hello: 'world'
			});
			client.on('my other event', function(data) {
				//console.log(data);
			});
		});
		socket.set('log level', 1);
	}



	function smoothedValue(newValue) {
		var now = new Date;
		var elapsedTime = now - lastUpdate;
		//smoothed = [smoothed[0] + elapsedTime * ( newValue[0] - smoothed[0] ) / smoothing, smoothed[1] + elapsedTime * ( newValue[1] - smoothed[1] ) / smoothing];
		var dist = Math.sqrt(Math.pow(smoothed[0] - newValue[0], 2) + Math.pow(smoothed[1] - newValue[1], 2))
		if (dist > maxLastDist) {
			smoothed = newValue
		} else {
			var smoothing2 = 1/(smoothing*dist) + 1
			//smoothed = [smoothed[0] + (newValue[0] - smoothed[0]) / smoothing, smoothed[1] + (newValue[1] - smoothed[1]) / smoothing];
			smoothed = [smoothed[0] + (newValue[0] - smoothed[0]) / smoothing2
			, smoothed[1] + (newValue[1] - smoothed[1]) / smoothing2];

		}
		lastUpdate = now;
		return smoothed;
	}


init()