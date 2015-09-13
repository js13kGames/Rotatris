require(['model/ticker'], function (Ticker) {
    QUnit.module("Ticker");
    QUnit.test("it ticks", function (assert) {
        var done = assert.async();
        var ticker = new Ticker();
        ticker.setInterval(50);
        var ticks = 0;
        ticker.stream.on(function () { ticks++; });
        ticker.start();
        setTimeout(function () {
            ticker.stop();
            assert.equal(ticks, 6, "6 ticks in 300ms");
            done();
        }, 330);
    });
    QUnit.test("quick restart", function (assert) {
        var done = assert.async();
        var ticker = new Ticker();
        ticker.setInterval(50);
        var ticks = 0;
        ticker.stream.on(function () { ticks++; });
        ticker.start();
        ticker.stop();
        setTimeout(function () {
            ticker.start();
            setTimeout(function () {
                ticker.stop();
                assert.ok(ticks, 4, "4 ticks in 200ms");
                done();
            }, 220);
        }, 110);
    });
    QUnit.test("start - stop - start", function (assert) {
        var done = assert.async();
        var ticker = new Ticker();
        ticker.setInterval(50);
        var ticks = 0;
        ticker.stream.on(function () { ticks++; });
        ticker.start();
        setTimeout(function () {
            ticker.stop();
            setTimeout(function () {
                ticker.start();
                setTimeout(function () {
                    ticker.stop();
                    assert.equal(ticks, 4, "4 ticks in two 100ms interval");
                    done();
                }, 110);
            }, 110);
        }, 110);
    });

    QUnit.test("many short stops", function (assert) {
        var done = assert.async();
        var ticker = new Ticker();
        ticker.setInterval(50);
        var ticks = 0;
        ticker.stream.on(function () { ticks++; });
        ticker.start();
        var timer = setInterval(function () {
            ticker.stop();
            setTimeout(function () {
                ticker.start();
            }, 0);
        }, 30);
        setTimeout(function () {
            ticker.stop();
            clearInterval(timer);
            assert.equal(ticks, 6, "6 ticks in two 100ms interval");
            done();
        }, 350);
    });
});
