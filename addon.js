var addon = require('./build/Release/addon');

var obj = new addon.FireFlyWrap(10);


console.log( 'num cameras' , obj.getNumCameras())
console.log("start Camera 0 ", obj.startCamera())
console.log( obj.getCamInfo() )
console.log("auto gain is ", obj.autoGain(true) )
console.log("auto gain is ", obj.autoGain(false) )
console.log("auto exposure is ", obj.autoExposure(true) )
console.log("auto exposure is ", obj.autoExposure(false) )
console.log("auto exposure is ", obj.autoExposure(false) )
console.log("auto exposure is ", obj.autoExposure(false) )
console.log("exposure value is ", obj.getExposure()) 
console.log("setting exposure value to 48 : ", obj.exposure(48)) 


console.log("set gain to ", obj.gain(24) )
console.log("frame rate", obj.frameRate() )

var pic = obj.takePhoto()
console.log( "take photo ", pic )
console.log( "take grey photo", obj.takePhoto('rgb') )
console.log(obj.getWidth(), obj.getHeight())
console.log("pic length",pic.length, pic[1])
