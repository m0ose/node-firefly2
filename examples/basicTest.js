var ff2 = require('../build/Release/addon');

var cam = ff2()
cam.startCamera()
var buf = cam.takePhoto()

console.log("photo taken\n", buf)

