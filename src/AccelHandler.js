/**
 * Accel handler.
 * @version 0.1
 * @author Kazuya Hiruma
 * @email edo.m18@gmail.com
 */

(function (win, doc, exports, undefined) {

    /**
     * AccelHandler class.
     * @constructor
     * @param {Element} element
     */
    function AccelHandler (element) {
        this.init_.apply(this, arguments);
    }

    //Alias to prototype.
    AccelHandler.fn = AccelHandler.prototype;

    ////////////////////////////////////////////////////////////////////////////////

    var isTouch = 'ontouchstart' in window,
        START   = isTouch ? 'touchstart' : 'mousedown',
        MOVE    = isTouch ? 'touchmove'  : 'mousemove',
        END     = isTouch ? 'touchend'   : 'mouseup';

    if (!Function.prototype.bind) {
        Function.prototype.bind = function (obj) {
            var slice = [].slice,
                args = slice.call(arguments, 1),
                self = this,
                nop = function () {},
                bound = function () {
                    return self.apply(this instanceof nop ? this : (obj || {}), args.concat(slice.call(arguments)));
                };

            nop.prototype = self.prototype;
            bound.prototype = new nop();

            return bound;
        };
    }

    ////////////////////////////////////////////////////////////////////////////////

    /**
     * Initialize
     */
    AccelHandler.fn.init_ = function (element) {

        this.element_ = element;

        this.moving_  = false;
        this.prevAcc_ = 0;
        this.acc_     = 0;
        this.prevPos_ = 0;
        this.prevT_   = 0;
        this.v_       = 0;
        this.pos_     = 0;

        this.animationFrame = window.webkitRequestAnimationFrame ||
                              window.mozRequestAnimationFrame    ||
                              window.msRequestAnimationFrame     ||
                              window.requestAnimationFrame       ||
                              function (func) { setTimeout(func, 32); };

        this.setEvents_();
    };

    /*! - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        CLASS PROPETIES.
    - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
    AccelHandler.EventType = {
        START: 'movestart',
        MOVE : 'movemove',
        END  : 'moveend'
    };


    /*! - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        PRIVATE METHOD.
    - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
    AccelHandler.fn.setEvents_ = function () {
        this.element_.addEventListener(START, this.start_.bind(this), false);
        doc.addEventListener(MOVE, this.move_.bind(this), false);
        doc.addEventListener(END, this.end_.bind(this), false);
    };

    /**
     * Start event handler.
     * @param {Event} e
     */
    AccelHandler.fn.start_ = function (e) {
        this.moving_  = true;
        this.prevPos_ = e.clientY;
        this.prevT_   = +new Date();
        this.prevV_   = 0;

        this.trigger(AccelHandler.EventType.START);
    };


    /**
     * End event handler.
     * @param {Event} e
     */
    AccelHandler.fn.end_ = function (e) {

        this.moving_ = false;

        var self = this,
            abs  = Math.abs,
            animationFrame = this.animationFrame;

        function loop() {

            var v = self.v_;

            self.v_ = v - (v / 30) << 0;
            self.trigger(AccelHandler.EventType.MOVE, {
                position: (self.pos_ -= self.v_)
            });

            if (abs(self.v_) <= 1) {
                self.trigger(AccelHandler.EventType.END);
                self.v_ = 0;
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
        this.acc_ += acc * t;

        //Keep current time.
        this.prevT_ = now;

        //Keep current y position.
        this.prevPos_ = y;

        //Keep current velocity.
        this.prevV_ = v;

        //Keep and calculate velocity.
        this.v_ = this.acc_ * t;

        //scrolling.
        this.pos_ -= d;

        this.trigger(AccelHandler.EventType.MOVE, {
            position: this.pos_
        });
    };

    /*! - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        FOR EVENTS.
    - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
    /**
     * @param {string} type Event name.
     * @param {?Object} optData Optional data.
     */
    function trigger (type, optData) {

        var handlers,
            handleArr,
            l,
            func;

        if (!type) {
            return false;
        }

        handlers = this.handlers || (this.handlers = {});
        handleArr = handlers[type] || [];
        l = handleArr.length;

        while(l--) {
            (func = handleArr[l]) &&
            func[0].call(func[1] || this, optData);
        }
    }

    function bind(type, func, context) {
        var handlers = this.handlers || (this.handlers = {});

        if (!type) {
            return false;
        }

        (handlers[type] || (handlers[type] = [])).push([func, context]);
    }

    function one(type, func, context) {

        var self = this;

        function _func () {
            self.off(type, _func);
            func.apply(context, arguments);
            context = null;
            self  = null;
            _func = null;
        }

        this.on(type, _func, context);
    }

    function unbind(type, func) {

        var handlers,
            handleArr,
            i;

        if (!type) {
            return false;
        }

        handlers  = this.handlers || (this.handlers = {});
        handleArr = handlers[type] || [];
        i = handleArr.length;

        if (!func) {
            this.handlers[type] = [];
        }
        else {
            while (i--) {
                handleArr[i][0] === func && handleArr.splice(i, 1);
            }
        }
    }


    /*! - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        DEFINES TO PROTOTYPES.
    - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
    /* ------------------------------------------------
         Trigger the event.
    --------------------------------------------------- */
    AccelHandler.fn.trigger = trigger;
    AccelHandler.fn.fire    = trigger;


    /* ------------------------------------------------
        Bind function.
    --------------------------------------------------- */
    AccelHandler.fn.bind = bind;
    AccelHandler.fn.on   = bind;


    /* ------------------------------------------------
        Invoke at onece.
    --------------------------------------------------- */
    AccelHandler.fn.one = one;


    /* ------------------------------------------------
        Unbind function.
    --------------------------------------------------- */
    AccelHandler.fn.unbind = unbind;
    AccelHandler.fn.off    = unbind;


    /*! - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        EXPORTS
    - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
    exports.AccelHandler = AccelHandler;
}(window, window.document, window));
