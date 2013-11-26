//var addon = require('node-firefly2');

var addon = require('../build/Release/addon');
var utils = require('./utils/utils.js');

var cam = new addon();
cam.verbose(true)

utils.findMinMax(cam)
utils.sleepHack(cam,8000)
