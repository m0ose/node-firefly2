
var addon = require('../build/Release/addon');
//var addon = require('node-firefly2')
var fs = require('fs');
var http = require('http');
var url = require('url');
var Png = require('png').Png;
var timer = require('../timer.js').timer

var util = require('util');


var cam = new addon.FireFlyWrap(10);

console.log( 'num cameras' , cam.getNumCameras())
console.log("start Camera 0 ", cam.startCamera())
var _USE_TRIGGER = false;

if(!_USE_TRIGGER){
  cam.triggerOff(false);//True uses the cable
  cam.autoGain(true);
  cam.autoExposure(true);
  cam.autoWhiteBalance(true);
}
else{
  cam.autoGain(false);
  cam.autoExposure(false);
  cam.autoWhiteBalance(false);
  cam.triggerOff(true);//True uses the cable
  cam.frameRate();
  cam.triggerDelay(0.0094)//(0.000)
  cam.gain(2);
  cam.exposure(90);
}
http.createServer(function(req, res){
  var request = url.parse(req.url, true);
  var action = request.pathname;

  if (action == '/image.png') {
    timer.start();

    var pic = cam.takePhoto()
    if( pic){
      console.log("picture taken")
      var p = pic;
      var png2 = new Png(p,640,480,'rgb')
      var png_image = png2.encodeSync();
      var img = png_image.toString('binary')
      //allow CORS. cross origin sharing
      var headers = {};
      headers["Access-Control-Allow-Origin"] = "*";
      headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
      headers["Access-Control-Allow-Credentials"] = true;
      headers["Access-Control-Max-Age"] = '86400'; // 24 hours
      headers["Access-Control-Allow-Headers"] = "X-Requested-With, Access-Control-Allow-Origin, X-HTTP-Method-Override, Content-Type, Authorization, Accept";
      headers['Content-Type'] = 'image/png'; 

      res.writeHead(200, headers );
      res.end(img, 'binary');
    }
    else{
      console.log("picture NOT taken")
      res.writeHead(200, {'Content-Type': 'text/plain' });
      res.end('woops\n' + pic);
    }
    console.log(timer.stop(), ' ms');

    console.log(util.inspect(process.memoryUsage()));

  } else { 
     res.writeHead(200, {'Content-Type': 'text/plain' });
     res.end('Hello World \n');
  }
}).listen(3000, '70.90.201.217');

