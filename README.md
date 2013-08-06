node-firefly2
=============

nodejs binding for firefly 2 camera

Introduction:
This is a wrapper for the FlyCapture2 Api from Point Grey research, http://www.ptgrey.com/support/downloads/documents/Doxygen/html/annotated.html.
Currently It only runs only linux, however Windows and Mac "should" be easy to support.
Unfortunatly, Point grey requires one to create a login before downloading the sdk which is at http://www.ptgrey.com/support/downloads/downloads_admin/Index.aspx

Intallation:   
------------
<b> Windows and Linux are supported (more or less). Macintosh is not</b>. Point Grey Research does not support an SDK for mac. If someone can find a version it would be a big help

<i>  It compiled once for me on Windows 7, but I would like to learn how to ship with a binary </i>

* get nodejs and npm, from nodejs.org

* Install node-gyp from https://github.com/TooTallNate/node-gyp. Use his installation instructions, they are good.

* Download and install Point grey SDK from  http://www.ptgrey.com/support/downloads/downloads_admin/Index.aspx;

* npm install node-firefly2
 

Example:
--------

        var addon = require('node-firefly2');
        var fs = require('fs');
        var sys = require('sys');
        var Png = require('png').Png;//note doesn't work on windows. use png-sync instead
        //
        var cam = new addon();
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


CHANGES:
-------
*  2013/7/20 : Started this project on linux only.
*  2013/8/2 : Complete rewrite in order to get it to work on Windows. A bi-product is that the code is much cleaner.





      

