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

cam.autoGain(true);
cam.autoExposure(true);
cam.autoWhiteBalance(true);
cam.triggerOff(false);//True uses the cable
cam.frameRate()
//take a few just to get it warmed up. might help?
cam.takePhoto();
cam.takePhoto();
cam.takePhoto();
cam.takePhoto()
console.log(cam.getCamInfo())

var pics = []
timer.start()
for (var n = 0; n < 10; n = n + 1) {
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
    pnger.pack().pipe(fs.createWriteStream('../pics/pngjs' + j + '.png'));
}
console.log("converting with javascript-png", timer.stop())

setInterval( function(){
 if( !cam.takePhoto('rgba') )
    {  console.log('errors')};
    cam.startCamera()// there is a bug when windows falls asleep, that messes up the pictures for some reason. this helps fix it by restarting the camera every 30 seconds
    console.log('.')
 }, 30000)

//
//  start a server on 127.0.0.1:3000
//
console.log(cam.getWidth(), cam.getHeight())
var server = http.createServer(function (req, res) {
    var headers = {};
    headers["Access-Control-Allow-Origin"] = "*";
    headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
    headers["Access-Control-Allow-Credentials"] = true;
    headers["Access-Control-Max-Age"] = '86400'; // 24 hours
    headers["Access-Control-Allow-Headers"] = "X-Requested-With, Access-Control-Allow-Origin, X-HTTP-Method-Override, Content-Type, Authorization, Accept";
    headers['Content-Type'] = 'image/png';

    res.writeHead(200, headers);
    var pnger = new PNG({width: 640, height: 480})
    var photo2 = cam.takePhoto('rgba');
    for (var i = 0; i < pnger.data.length; i++) {
        pnger.data[i] = photo2[i];
    }
    pnger.pack()
    pnger.pipe(res);
});
server.listen(3000);


console.log(" server listening on port 127.0.0.1:3000")
