(function (win, doc, exports, AccelHandler) {

    'use strict';

    var ele = doc.querySelector('.sample');
    var acc = new AccelHandler(ele);


    //acc.on(AccelHandler.EventType.START, function (e) {
    //    console.log('start', e);
    //});

    acc.on(AccelHandler.EventType.MOVE, function (e) {
        ele.style.top = e.position + 'px';
    });

    //acc.on(AccelHandler.EventType.END, function (e) {
    //    console.log('end', e);
    //});

}(window, document, window, window.AccelHandler));
