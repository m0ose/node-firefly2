console.log("starting laser pointer tracker simple")
//var addon = require('node-firefly2');
//var addon = require('node-firefly2');
var addon = require('../build/Release/addon');

//var fs = require('fs');
var sys = require('sys');
var PNG = require('pngjs').PNG;
var http = require('http');
var url = require('url');
var socketio = require('socket.io')

console.log("starting camera")
var cam = new addon();
console.log("started camera")

cam.verbose(true)
var camCount = cam.getNumCameras();
console.log('num cameras', camCount)
if (!camCount) {
    console.error(" No Camera Detected ")
    process.exit(1) // maybe I should have the server emit an error message
}
console.log("start Camera 0 ", cam.startCamera())

//var whiteDelay = 0.0094;
//var darkDelay = 0.0110;

//  for the vivitec
//
var whiteDelay = 0.00425;
var darkDelay = 0.00750;
var currentTriggerDelay = darkDelay

cam.autoGain(false);
cam.autoExposure(false);
cam.autoWhiteBalance(false);
console.log("trigger", cam.triggerOff(true)) //false);//True uses the cable

console.log(cam.triggerDelay(currentTriggerDelay))
cam.gain(2);
cam.exposure(40);
cam.frameRate()
//take a few just to get it warmed up. might help?
cam.takePhoto();
cam.takePhoto();
cam.takePhoto();
cam.takePhoto()
console.log(cam.getCamInfo())

var _camwidth = 640;
var _camheight = 480;
var readTimeout = 10;
var SEND_MSG_THRESHOLD = -25;

var _PORT = 3000;
var LoopTimeout = null;

//  default cors headers
//
var CORSheaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Credentials": true,
    "Access-Control-Max-Age": "1",
    "Access-Control-Allow-Headers": "X-Requested-With, Access-Control-Allow-Origin, X-HTTP-Method-Override, Content-Type, Authorization, Accept",
    "Content-Type": "image/png"
}

//
//  start a server on 127.0.0.1
//
console.log(cam.getWidth(), cam.getHeight())
var server = http.createServer(function(req, res) {
    var request = url.parse(req.url, true);
    var action = request.pathname;
    if (action == '/image.png') {
        setDelay(whiteDelay)
        res.writeHead(200, CORSheaders);
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
var socket = socketio.listen(server);
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

//
//  send  messages
//
function emitLaserMsg(x, y, confidence) {
    //console.log('sending',x,y, confidence)
    if (confidence < SEND_MSG_THRESHOLD) {
        //  console.log('sending',x,y, confidence)
        socket.sockets.emit('laser', {
            x: x,
            y: y,
            c: Math.abs(confidence)
        });
    }
}


//
// Laser tracking code
//  
var redThreshold = function(r, g, b) {
    var threshold = 50,
        dx = r - 255,
        dy = (g - 255) / 2,
        dz = (b - 128) / 4;

    /* if ((r) >= threshold ) {
     return true;
     }
     */
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

//
//  make image stores
//
var averageImage = new Array(_camwidth * _camheight);

for (var i = 0; i < averageImage.length; i++) {
    averageImage[i] = 0
}

//
//  Search for laser pointer
//
function searchLoop() {
    timer.start()
    var radius = 5;
    setDelay(darkDelay)
    var buf = cam.takePhoto();
    if (buf) {
        var bestVal = Number.MAX_VALUE;
        var bestIndex = 0;
        for (var x = 0; x < _camwidth; x++) {
            for (var y = 0; y < _camheight; y++) {
                var i1 = y * _camwidth + x;
                var i2 = i1 * 3;
                var r = buf[i2];
                var g = buf[i2 + 1]
                var b = buf[i2 + 2]
                var thresh = Math.floor(redThreshold(r, g, b));

                var diff = thresh - averageImage[i1];


                //var valOut = Image.getPoint(x-2*radius,y-2*radius, 5*radius)
                //var val = valIn - valOut;
                if (diff < bestVal) {
                    bestVal = diff;
                    bestIndex = i1;
                }

                averageImage[i1] = Math.floor(0.95 * averageImage[i1] + 0.05 * thresh)
                //if( x == 10 && y < 10){
                //    console.log(  averageImage[i1])
                //}
            }
        }

        var bestxy = [Math.floor(bestIndex % (_camwidth)), Math.floor(bestIndex / (_camwidth))]

        console.log('timer', timer.stop(), bestVal, bestxy)
        //console.log( 'xy', bestxy, 'value', bestVal)
        emitLaserMsg((bestxy[0]) / _camwidth, (bestxy[1]) / _camheight, bestVal)
        LoopTimeout = setTimeout(searchLoop, readTimeout)

    } else {
        console.log("FAIL")
    }
}

//this is sort of for efficiancy
function setDelay(seconds) {
    if (!seconds) {
        return currentTriggerDelay
    }
    if (currentTriggerDelay != seconds) {
        console.log('setting delay', seconds)
        currentTriggerDelay = seconds
        cam.triggerDelay(currentTriggerDelay)
        cam.takePhoto(); //take one photo, to clear old buffer
        cam.takePhoto();
    }
}

var timer = new function() {
        this.time = 0;
        this.start = function() {
            this.time = new Date().getTime()
        }
        this.stop = function() {
            var now = new Date().getTime()
            return now - this.time;
        }
        this.restart = function() {
            var t = this.stop()
            this.start()
            return t
        }
    }


searchLoop()