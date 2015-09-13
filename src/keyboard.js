define('Keyboard', ['model/stream'], function (Stream) {
    var stream = new Stream();
    var enabled = true;
    stream.disable = function () { enabled = false; };
    stream.enable = function () { enabled = true; };
    document.onkeydown = function (event) {
        if (!enabled) return;
        var code = event.keyCode;
        var shift = event.shiftKey;
        var ctrl = event.ctrlKey || event.metaKey;
        switch (code) {
        case 13:
        case 32:
            stream.push('drop');
            break;
        case 37:
            if (ctrl) {
                stream.push('corotate');
            } else if (shift) {
                stream.push('LEFT');
            } else {
                stream.push('left');
            }
            break;
        case 39:
            if (ctrl) {
                stream.push('rotate');
            } else if (shift) {
                stream.push('RIGHT');
            } else {
                stream.push('right');
            }
            break;
        case 40:
            stream.push('tick');
            break;
        case 38:
            stream.push('rotate');
            break;
        case 80:
            stream.push('pause');
            break;
        }
    };
    return stream;
});
