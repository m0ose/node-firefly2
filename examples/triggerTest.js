//var addon = require('node-firefly2');
var addon = require('../build/Release/addon');
var fs = require('fs');
var sys = require('sys');
var Png = require('png').Png;
var timer = require('../timer.js').timer


var cam = new addon();
console.log( 'num cameras' , cam.getNumCameras())
console.log(" start Camera 0 ", cam.startCamera())

cam.autoGain(false);
cam.autoExposure(false);
cam.autoWhiteBalance(false);
cam.gain(2);
cam.exposure(90);
cam.triggerOff(true);//True is off, waits for hardware trigger
cam.frameRate();
cam.triggerDelay(0.000)

//take a few just to get it warmed up. might help?
cam.takePhoto();cam.takePhoto();cam.takePhoto();cam.takePhoto()

var pics = []
timer.start()
for( var n=0.0000 ; n < 0.0160; n = n + 0.001){
    console.log(n)  
    pics.push(cam.takePhoto())
    cam.triggerDelay(n)
}
console.log('taking pictures. ms', timer.stop() )

//try to convert using node-png
timer.start()
for( var j=0; j < pics.length; j++){
    var p = pics[j]
    var png2 = new Png(p,640,480,'rgb')
    var png_image = png2.encodeSync();
    fs.writeFileSync('../pics/png_node'+ j + '.png', png_image.toString('binary'), 'binary');
}
console.log("converting with node-png", timer.stop())
