var addon = require('../build/Release/addon');
var timer = require('../timer.js').timer

var cam = new addon.FireFlyWrap();
console.log( 'num cameras' , cam.getNumCameras())
console.log("start Camera 0 ", cam.startCamera())



// below syncs the projector with the white frame

cam.autoGain(false);
cam.autoExposure(false);
cam.autoWhiteBalance(false);
cam.triggerOff(true);//True uses the cable
cam.frameRate();
cam.triggerDelay(0.0094)//(0.000)
cam.gain(2);
cam.exposure(90);

var redThreshold =  function(r, g, b) {
            var threshold = 50,
                dx = r-255,
                dy = g-128,
                dz = b-128;

           /* if ((r) >= threshold ) {
                return true;
            }
*/
            return Math.sqrt(dx*dx + dy*dy + dz*dz);
        }
/*
function search(){
  timer.start()
  var buf = cam.takePhoto();
  if( buf ){
    var bestIndex = 0;
    var bestThresh = 1000;
  for( var i=0 ; i < buf.length-3; i=i+3){
    var r = buf[i];
    var g = buf[i+1];
    var b = buf[i+2];
    var thresh = redThreshold(r,g,b);
    if( thresh < bestThresh){
     bestThresh = thresh;
     bestIndex = Number(i);
    }
  }
  var bestxy = [Math.floor( (bestIndex%(3*640))/3  ), Math.floor( bestIndex/(3*640) ) ]
  console.log( 'index: ' ,  bestIndex)
  console.log( 'xy', bestxy)
  console.log("search took", timer.stop(), "ms")
  setTimeout( search,200)
  }else{
   console.log( "FAIL") 
  }
}
*/
var integralImage = new Array( 640*480);
function searchIntegral(){
  var radius = 5;
  timer.start()
  var buf = cam.takePhoto();
  if( buf ){
    for( var x = 0; x < 640; x++){
     for(var y = 0; y < 480; y++){
       var i1 = y * 640 + x;
       var i2 = i1 * 3;
       var r = buf[i2];
       var g = buf[i2 + 1]
       var b = buf[i2 + 2]
       var thresh = Math.floor(redThreshold(r,g,b));
       var up = 0;
       var left = 0;
       var ul = 0;
       if( y > 0){ up = integralImage[i1-640]  }
       if( x > 0){ left = integralImage[i1 -1]  }
       if( x > 0 && y > 0){ ul = integralImage[i1-640-1] }
       integralImage[i1] = thresh + up + left - ul;
       //if( x == 0 && y < 10){
	//console.log( thresh, integralImage[i1])
       //}
       
     }
    }
    var bestVal = Number.MAX_VALUE;
    var bestIndex = 0;
   for( var x = radius + 1; x < 640; x++){
    for(var y = radius + 1; y < 480; y++){
      var i1 = y * 640 + x;
      var up = integralImage[i1 - 640 * radius];
      var left = integralImage[i1 - radius];
      var ul = integralImage[i1 - 640*radius - radius];
      var lr = integralImage[i1]
      var val = lr - left - up + ul; 
      if( val < bestVal){
	bestVal = val;
	bestIndex = i1;
      }
    }
   }
   var bestxy = [Math.floor( bestIndex%(640) ), Math.floor( bestIndex/(640) ) ]
  console.log( 'index: ' ,  bestIndex, 'bestVal', bestVal)
  
  console.log( 'xy', bestxy)
  console.log("search took", timer.stop(), "ms")
    setTimeout( searchIntegral,200)
  }else{
    console.log( "FAIL") 
  }
}

searchIntegral()



