define('model/ticker', ['model/stream', 'utils'], function (Stream, Utils) {
    function tick() {
        this.stream.push();
        if (this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(this.tick, this.interval);
        this.lastStart = now();
    }
    function now () {
        return window.performance ? window.performance.now() : Date.now ? Date.now() : +new Date();
    }
    function Ticker() {
        this.running = false;
        this.interval = 1000;
        this.stream = new Stream();
        this.lastStart = 0;
        this.passed = 0;
        this.timer = 0;
        this.tick = tick.bind(this);
    }
    Utils.extend.call(Ticker.prototype, {
        start: function () {
            if (this.running) { return; }
            this.running = true;
            if (this.passed > this.interval) {
                return this.tick();
            }
            this.timer = setTimeout(this.tick, this.interval - this.passed);
            this.lastStart = now() - this.passed;
        },
        stop: function () {
            if (!this.running) { return; }
            this.running = false;
            clearTimeout(this.timer);
            this.timer = 0;
            this.passed = now() - this.lastStart;
        },
        setInterval: function (time) {
            this.interval = time;
            if (this.running) {
                this.stop();
                this.start();
            }
        },
    });
    return Ticker;
});
