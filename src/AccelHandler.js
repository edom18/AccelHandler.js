/**
 * Accel handler.
 * @version 0.1
 * @author Kazuya Hiruma
 * @email edo.m18@gmail.com
 */
function AccelHandler (element, callback) {
    this.element_ = element;
    this.callback_ = callback || function (pos) {};
    this.init();
}

//Ariase to prototype.
AccelHandler.fn = AccelHandler.prototype;

AccelHandler.fn.init = function () {
    this.moving_ = false;
    this.prevAcc_ = 0;
    this.acc_     = 0;
    this.prevPos_ = 0;
    this.prevT_   = 0;
    this.v_       = 0;
    this.pos_     = 0;

    this.animationFrame = window.webkitRequestAnimationFrame ||
                          window.mozRequestAnimationFrame ||
                          window.msRequestAnimationFrame ||
                          window.requestAnimationFrame ||
                          function (func) { setTimeout(func, 32) };
};

AccelHandler.fn.move = function (pos) {
    this.callback_(pos);
};

AccelHandler.fn.start_ = function (e) {
    this.moving_  = true;
    this.prevPos_ = e.clientY;
    this.prevT_   = +new Date();
};

AccelHandler.fn.end_ = function (e) {

    this.moving_ = false;

    var self = this,
        abs  = Math.abs,
        v    = this.v_,
        animationFrame = this.animationFrame;

    function loop() {

        self.v_ = v - (v / 30) << 0;
        self.move((self.pos_ -= self.v_));

        if (abs(self.v_) <= 1) {
            self = null;
            loop = null;
            animationFrame = null;
            return;
        }

        animationFrame(loop);
    }

    loop();
};

AccelHandler.fn.move_ = function (e) {

    if (!this.moving_) {
        return;
    }

    var y   = e.clientY,
        now = +new Date(),

        //Time delta.
        t   = now - this.prevT_,

        //Calculate distance.
        dist = y - this.prevPos_,

        //Calculate current velocity.
        v = dist / (t || (t = 1)),

        //Calculate accelaration.
        acc  = (v - this.v_) / t;


    //add accelaration.
    this.acc_ += acc;

    //Keep current time to prevTime.
    this.prevT_ = now;

    //Keep current accelaration to prev accelaration.
    this.prevAcc_ = this.acc_;

    //Keep y position to prev y.
    this.prev_ = y;

    //Keep and calculate velocity.
    this.v_     = v * t;

    //scrolling.
    this.pos_ -= dist;
    this.move(this.pos_);
};
