//var addon = require('node-firefly2');
var addon = require('../build/Release/addon');

var fs = require('fs');
var sys = require('sys');
var timer = require('../timer.js').timer
var PNG = require('pngjs').PNG;
var http = require('http');


var cam = new addon();
cam.verbose(true)
//cam.verbose(true)
//cam.verbose(false)
//cam.verbose(true)


//cam.verbose(false)
console.log('num cameras', cam.getNumCameras())
console.log("start Camera 0 ", cam.startCamera())
cam.autoGain(false);
cam.autoExposure(false);
cam.autoWhiteBalance(false);
cam.gain(2);
cam.exposure(90);
cam.triggerOff(true); //True is off, waits for hardware trigger
cam.frameRate();
cam.triggerDelay(0.000)
cam.takePhoto();
cam.takePhoto();
cam.takePhoto()
console.log(cam.getCamInfo())

function saveBuff2Png(buff, filename) {
    var pnger = new PNG({
        width: 640,
        height: 640
    })
    for (var i = 0; i < pnger.data.length; i++) {
        pnger.data[i] = buff[i] //12
    }
    pnger.pack().pipe(fs.createWriteStream(filename));
}

function findMinMax() {
    var pics = []
    timer.start()
    for (var n = 0; n < 33; n = n + 1) {
        cam.triggerDelay(n / 4000)
        pics.push(cam.takePhoto('rgba'))
    }
    console.log('taking ', n, 'pictures. ms', timer.stop())

    //search for light and dark frames
    timer.start()
    var imgbuff;

    var darkFrame = {index:0, score:  Number.MAX_VALUE, ms:0 }//[0, Number.MAX_VALUE]
    var lightFrame = {index:0, score:  Number.MIN_VALUE, ms:0 }//[0, Number.MIN_VALUE]

    for (var j = 0; j < pics.length; j++) {
        imgbuff = pics[j]
        var score = 0
        for (var i = 0; i < imgbuff.length; i = i + 37) {
            var px = imgbuff[i]
            score += px
        }

        if (score < darkFrame.score) {
            darkFrame = {index:j, score: score, ms:j/4000 }//[j, score, j / 4000]
        }
        if (score > lightFrame.score) {
            lightFrame = {index:j, score: score, ms:j/4000 }
        }

        var ph = pics[j]
    }

    console.log("searched for min and max frames", timer.stop())
    console.log("low", darkFrame)
    console.log("high", lightFrame)
    saveBuff2Png(pics[darkFrame.index], '../pics/darkFrame.png')
    saveBuff2Png(pics[lightFrame.index], '../pics/lightFrame.png')
    return({low:darkFrame, high:lightFrame})
}


findMinMax()