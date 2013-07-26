node-firefly2
=============

nodejs binding for firefly 2 camera

Introduction:
This is a wrapper for the FlyCapture2 Api from Point Grey research, http://www.ptgrey.com/support/downloads/documents/Doxygen/html/annotated.html.
Currently It only runs only linux, however Windows and Mac "should" be easy to support.
Unfortunatly, Point grey requires one to create a login before downloading the sdk which is at http://www.ptgrey.com/support/downloads/downloads_admin/Index.aspx

Intallation:   
------------
<i> Note: this only works on linux at the moment. Maybe someone could help with the windows version. Hint Hint Nudge Nudge. </i>
* Download and install Point grey SDK from  http://www.ptgrey.com/support/downloads/downloads_admin/Index.aspx
* cd node-firefly2
* npm install


Example:
--------

        var addon = require('../build/Release/addon');
        var fs = require('fs');
        var sys = require('sys');
        var Png = require('png').Png;
        var timer = require('../timer.js').timer
        //
        var cam = new addon.FireFlyWrap();
        console.log( 'num cameras' , cam.getNumCameras())
        console.log("start Camera 0 ", cam.startCamera())
        //
        //set some default parameters.
        cam.autoGain(true);
        cam.autoExposure(true);
        cam.autoWhiteBalance(true);
        cam.triggerOff(false);//True uses the cable. Note don't use true unless you have a cable. It will wait forever. 
        //
        //take a few just to get it warmed up. might help?
        cam.takePhoto();cam.takePhoto();cam.takePhoto();cam.takePhoto()
        var pic = cam.takePhoto();//actually take the picture
        var png2 = new Png(pic,640,480,'rgb')
        var png_image = png2.encodeSync();
        fs.writeFileSync('../pics/png_test.png', png_image.toString('binary'), 'binary');
        
API:
----

* var cam = new addon.FireFlyWrap(); // allways start with this
* cam.getNumCameras() // returns the number of cameras found
* cam.startCamera() // starts using the first camera
* cam.autoGain(false); // turn gain on or off
* cam.autoExposure(false); // turn auto shutter speed on or off
* cam.autoWhiteBalance(false); // turn auto white balance on or off
* cam.gain(2); // manually sets the gain. Note that auto gain must be off for this to work
* cam.exposure(90); // manually sets shutter speed. in milli seconds
* cam.triggerOff(true);//True is off, waits for hardware trigger. If no trigger is connected it will wait forever.
* cam.frameRate(); // sets the fram rate to 90 fps
* cam.triggerDelay(0.000)//  takes a number in seconds to delay between when the cable trigger fires and when the picture is taken. 
* cam.takePhoto(); // takes a picture and returns a node::buffer

      

