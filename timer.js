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
 exports.timer = timer;