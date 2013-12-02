console.log("starting laser pointer tracker simple")

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
var SEND_MSG_THRESHOLD = 40;
var _PORT = 3000;
var LoopTimeout = null;
var averageImage;
var cam = new addon();
var whiteDelay;
var darkDelay;
var socket;


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

	// Find the dark and light frames
	var keyFrames = utils.findMinMax(cam)
	whiteDelay = keyFrames.high.ms;
	darkDelay = keyFrames.low.ms;
	console.log(keyFrames)

	// initialise an array or 2
	averageImage = new Int16Array(_camwidth * _camheight) //new Array(_camwidth * _camheight);
	for (var i = 0; i < averageImage.length; i++) {
		averageImage[i] = 0
	}

	startServer()
	searchLoop()
}

//
//  Search for laser pointer
//
var oldVariance = 0

	function searchLoop() {
		timer.start()
		var radius = 5;
		utils.setDelay(cam, darkDelay)
		var buf = cam.takePhoto();

		if (buf) {
			var bestVal = Number.MAX_VALUE;
			var bestIndex = 0;
			var mean = 0
			var variance = 0;
			var samples = 0
			for (var x = 0; x < _camwidth; x++) {
				for (var y = 0; y < _camheight; y++) {
					var i1 = y * _camwidth + x;
					var i2 = i1 * 3;
					var r = buf[i2];
					var g = buf[i2 + 1]
					var b = buf[i2 + 2]
					var thresh = Math.floor(redThreshold(r, g, b));
					//var gright =  Math.floor(brightness(r, g, b));
					var diff = Math.floor(thresh - averageImage[i1]);
					if (diff < bestVal) {
						bestVal = diff;
						bestIndex = i1;
					}

					if (oldVariance > 1000) {
						averageImage[i1] = Math.floor(0.6 * averageImage[i1] + 0.4 * thresh)
					} else {
						averageImage[i1] = Math.floor(0.1 * averageImage[i1] + 0.9 * thresh)
					}
					//  find variance because for some reason its slooooow
					//
					if (i1 % 1323 == 0) {
						variance += diff * diff
						samples++
					}

				}
			}

			//console.log(variance)

			variance = parseInt(variance / ((samples) - 1))
			oldVariance = variance

			var bestxy = [Math.floor(bestIndex % (_camwidth)), Math.floor(bestIndex / (_camwidth))]

			//console.log( 'xy', bestxy, 'value', bestVal)
			emitLaserMsg((bestxy[0]) / _camwidth, (bestxy[1]) / _camheight, bestVal)

			if (Math.random() > 0.9) {
				console.log('timer', timer.stop(), bestVal, bestxy, variance)
			}
			LoopTimeout = setTimeout(searchLoop, readTimeout)
		} else {
			console.log("FAIL")
		}
	}


	//
	//  functions needed by the laser point loop
	//
var redThreshold = function(r, g, b) {
	dx = r - 255,
	dy = (g - 255) / 2,
	dz = (b - 128) / 4;
	return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
var brightness = function(r, g, b) {

	return Math.sqrt(r * r + g * g + b * b);
}


	function emitLaserMsg(x, y, confidence) {
		confidence = Math.abs(confidence)
		//console.log('sending',x,y, confidence)
		if (confidence > SEND_MSG_THRESHOLD) {
			console.log('sending', x, y, confidence)
			socket.sockets.emit('laser', {
				x: x,
				y: y,
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
			var action = request.pathname;
			if (action == '/image.png') {
				utils.setDelay(cam, whiteDelay)
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
				clearTimeout(LoopTimeout)
				LoopTimeout = setTimeout(searchLoop, 1500)

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

init()