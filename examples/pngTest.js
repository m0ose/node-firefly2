var addon = require('../build/Release/addon');
var fs = require('fs');
var sys = require('sys');
var Png = require('png').Png;
var timer = require('../timer.js').timer


var cam = new addon.FireFlyWrap();
console.log( 'num cameras' , cam.getNumCameras())
console.log("start Camera 0 ", cam.startCamera())

cam.autoGain(true);
cam.autoExposure(true);
cam.autoWhiteBalance(true);
cam.triggerOff(false);//True uses the cable

//take a few just to get it warmed up. might help?
cam.takePhoto();cam.takePhoto();cam.takePhoto();cam.takePhoto()

var pics = []
timer.start()
for( var n=0 ; n < 10 ; n = n + 1){
    pics.push(cam.takePhoto())
}
console.log('taking ' , n , 'pictures. ms', timer.stop() )

//try to convert using node-png
timer.start()
for( var j=0; j < pics.length; j++){
    var p = pics[j]
    var png2 = new Png(p,640,480,'rgb')
    var png_image = png2.encodeSync();
    fs.writeFileSync('../pics/png_test'+ j + '.png', png_image.toString('binary'), 'binary');
}
console.log("converting with node-png", timer.stop())
