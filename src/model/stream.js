define('model/stream', ['model/queue', 'utils'], function (Queue, Utils) {
    function Stream() {
        this.listeners = [];
    }
    Utils.extend(Stream.prototype, {
        push: function (event) {
            this.listeners.forEach(function (callback) {
                callback(event);
            });
        },
        on: function (callback) {
            this.listeners.push(callback);
            return this;
        },
        map: function (callback) {
            var s = new Stream();
            this.on(function (event) {
                s.push(callback(event));
            });
            return s;
        },
        append: function (s) {
            s.on(this.push.bind(this));
        },
        cooldown: function (timeout) {
            var s = new Stream();
            var queue = new Queue();
            var cooldown = false;
            function autocast () {
                if (!queue.isEmpty()) {
                    cooldown = true;
                    s.push(queue.pull());
                    setTimeout(autocast, timeout);
                } else {
                    cooldown = false;
                }
            }
            this.on(function (event) {
                queue.push(event);
                if (!cooldown) autocast();
            });
            return s;
        },
        nth: function (n) {
            var s = new Stream();
            var idx = 0;
            var buffer = [];
            this.on(function (event) {
                if (buffer.length < n) {
                    buffer.push(event);
                } else {
                    s.push(buffer[idx]);
                    buffer[idx] = event;
                    idx++;
                    idx %= n;
                }
            });
            return s;
        },
        reduce: function (callback, initValue) {
            var s = new Stream();
            this.on(function (event) {
                if (initValue === undefined) {
                    initValue = event;
                } else {
                    s.push(initValue = callback(initValue, event));
                }
            });
            return s;
        }
    });
    Stream.join = function () {
        var s = new Stream();
        var push = s.push.bind(s);
        [].forEach.call(arguments, function (s) { s.on(push); });
        return s;
    };
    return Stream;
});
