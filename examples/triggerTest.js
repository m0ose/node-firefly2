//var addon = require('node-firefly2');
var addon = require('../build/Release/addon');

var fs = require('fs');
var sys = require('sys');
var timer = require('../timer.js').timer
var PNG = require('pngjs').PNG;
//var http = require('http');

var cam = new addon();
console.log('num cameras', cam.getNumCameras())
console.log(" start Camera 0 ", cam.startCamera())

cam.autoGain(false);
cam.autoExposure(false);
cam.autoWhiteBalance(false);
cam.gain(2);
cam.exposure(90);
cam.triggerOff(true);//True is off, waits for hardware trigger
cam.frameRate();
cam.triggerDelay(0.000)
cam.triggerDelay(0.120)
cam.triggerDelay(0.120)
cam.triggerDelay(0.120)
cam.triggerDelay(0.000)



cam.takePhoto();
cam.takePhoto();
cam.takePhoto();
cam.takePhoto()
console.log(cam.getCamInfo())

var pics = []
timer.start()
for (var n = 0; n < 64; n = n + 1) {
	cam.triggerDelay(n/4000)
    pics.push(cam.takePhoto('rgba'))
}
console.log('taking ', n, 'pictures. ms', timer.stop())

//try to convert using node-png
timer.start()
var pnger;
for (var j = 0; j < pics.length; j++) {
    pnger = new PNG({width: 640, height: 640})
    var ph = pics[j]
    for (var i = 0; i < pnger.data.length; i++) {
        pnger.data[i] = ph[i]//12
    }
    pnger.pack().pipe(fs.createWriteStream('../pics/trigjs' + j + '.png'));
}
console.log("converting with javascript-png", timer.stop())

//console.log("converting with node-png", timer.stop())
