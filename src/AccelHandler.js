/**
 * Accel handler.
 * @version 0.1
 * @author Kazuya Hiruma
 * @email edo.m18@gmail.com
 */

/**
 * AccelHandler class.
 * @constructor
 * @param {Element} element
 * @param {?function} callback
 */
function AccelHandler (element, callback) {
    this.element_ = element;
    this.callback_ = callback || function (pos) {};
    this.init();
}

//Alias to prototype.
AccelHandler.fn = AccelHandler.prototype;


/**
 * Initialize
 */
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


/**
 * Trigger the moving event.
 * @param {number} pos
 */
AccelHandler.fn.move = function (pos) {
    this.callback_(pos);
};


/**
 * Start event handler.
 * @param {Event} e
 */
AccelHandler.fn.start_ = function (e) {
    this.moving_  = true;
    this.prevPos_ = e.clientY;
    this.prevT_   = +new Date();
};


/**
 * End event handler.
 * @param {Event} e
 */
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


/**
 * Move event handler.
 * @param {Event} e
 */
AccelHandler.fn.move_ = function (e) {

    if (!this.moving_) {
        return;
    }

    var y   = e.clientY,
        now = +new Date(),

        //Time delta.
        t = now - this.prevT_,

        //Calculate distance.
        d = y - this.prevPos_,

        //Calculate current velocity.
        v = d / (t || (t = 1)),

        //Calculate current accelaration.
        acc  = (v - this.prevV_) / t;


    //Add an accelaration.
    this.acc_ += acc;

    //Keep current time.
    this.prevT_ = now;

    //Keep current y position.
    this.prev_ = y;

    //Keep current velocity.
    this.prevV_ = v;

    //Keep and calculate velocity.
    this.v_ = this.acc_ * t;

    //scrolling.
    this.pos_ -= d;
    this.move(this.pos_);
};
