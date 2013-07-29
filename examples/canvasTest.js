var addon = require('node-firefly2');
//
var Canvas = require('canvas')
var fs = require('fs');
var sys = require('sys');
var Png = require('png').Png;

var timer = new function(){
    this.time = 0;
    this.start = function(){
        this.time = new Date().getTime()
    }
    this.stop = function(){
        var now = new Date().getTime()
        return now - this.time;
    }
    this.restart = function(){
        var t = this.stop()
        this.start()
        return t
    }
}



var obj = new addon.FireFlyWrap(10);


console.log( 'num cameras' , obj.getNumCameras())
console.log("start Camera 0 ", obj.startCamera())
console.log( obj.getCamInfo() )
console.log("auto gain is ", obj.autoGain(true) )
console.log("auto exposure is ", obj.autoExposure(true) )
obj.triggerOff(false);//True uses the cable
//console.log("set gain to ", obj.gain(200) )
//console.log("set exposure to ", obj.exposure(300) )
obj.frameRate();

//take pictures
var pics = []
timer.start()
for( var n=0 ; n < 30; n++){
    pics.push(obj.takePhoto('rgb'))
}
console.log('taking pictures. ms', timer.stop() )

//prepare to transfer all the data
var cans = []
var ctxs = []
for( var j=0; j < pics.length; j++){
    var can = new Canvas(640,480)
    var ctx = can.getContext('2d')
    cans.push(can)
    ctxs.push(ctx)
}

//try to convert using node-png
timer.start()
for( var j=0; j < pics.length; j++){
    var p = pics[j]
    var png2 = new Png(p,640,480,'rgb')
    var png_image = png2.encodeSync();
    fs.writeFileSync('../pics/png_node'+ j + '.png', png_image.toString('binary'), 'binary');
}
console.log("converting with node-png", timer.stop())

timer.start()
for( var j=0; j < pics.length; j++){
    var p = pics[j]
    var png2 = new Png(p,640,480,'rgb')
    var png_image = png2.encode(function (data, error) {
        if (error) {
            console.log('Error: ' + error.toString());
            process.exit(1);
        }
        //fs.writeFileSync('./png-async.png', data.toString('binary'), 'binary');
    });
    //fs.writeFileSync('./pics/png_node'+ j + '.png', png_image.toString('binary'), 'binary');
}
console.log("converting with node-png assync", timer.stop())


//transfer it to image using javascript
timer.start()
for( var j=0; j < pics.length; j++){
    var pic2 = pics[j]
    var ctx =  ctxs[j]
    var ctxdata = ctx.getImageData(0,0, 640,480)
    var index = 0;
    for( var i=0; i < ctxdata.data.length ; i++){
        if( (i+ 1)%4 == 0 ){
	  ctxdata.data[i] = 255;
	}
	else{
        ctxdata.data[i] = pic2[ index ]
        index++;
	}
    }
    ctx.putImageData(ctxdata,0,0)
}
console.log("transfering ms", timer.stop())

//save it
timer.start()
for( var j=0; j < pics.length; j++){
    var can = cans[j]
    var str = can.toDataURL('image/png')
    var data = str.replace(/^data:image\/\w+;base64,/, "");
    var buf = new Buffer(data, 'base64');
    fs.writeFile('../pics/image'+j+'.png', buf);
}
console.log("saved", timer.stop())


