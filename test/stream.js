require(['model/stream'], function (Stream) {
    QUnit.module("Stream");
    QUnit.test("event", function (assert) {
        var s = new Stream();
        var calls = 0;
        s.on(function () {
            calls++;
        });
        assert.equal(calls, 0, "doesn't unnecessary called");
        s.push();
        assert.equal(calls, 1, "called after push");
        s.push();
        assert.equal(calls, 2, "called second time");
    });
    QUnit.test("map", function (assert) {
        var value = 0;
        var s = new Stream();
        s.map(function increment (val) {
            return val + 1;
        }).on(function (val) {
            value = val;
        });
        s.push(1);
        assert.equal(value, 2);
    });

    QUnit.test("join", function (assert) {
        var value = 0;
        var s1 = new Stream();
        var s2 = new Stream();
        Stream.join(s1, s2).on(function (val) {
            value = val;
        });
        s1.push(1);
        assert.equal(value, 1);
        s2.push(2);
        assert.equal(value, 2);
    });

    QUnit.test("nth", function (assert) {
        var value = 0;
        var s = new Stream();
        s.nth(2).on(function (val) {
            value = val;
        });
        s.push(1);
        assert.equal(value, 0, "1st push - value unchanged");
        s.push(2);
        assert.equal(value, 0, "2nd push - value still not changed");
        s.push(3);
        assert.equal(value, 1, "3rd push - 1st value came out");
        s.push(4);
        assert.equal(value, 2, "4th push - 2nd value came out");
    });

    QUnit.test("reduce - no initial value", function (assert) {
        var value = 0;
        var s = new Stream();
        s.reduce(function (a, b) {
            return a + b;
        }).on(function (val) {
            value = val;
        });
        s.push(1);
        assert.equal(value, 0);
        s.push(2);
        assert.equal(value, 3);
        s.push(3);
        assert.equal(value, 6);
    });

    QUnit.test("reduce - with initial value", function (assert) {
        var value = 0;
        var s = new Stream();
        s.reduce(function (a, b) {
            return a + b;
        }, 0).on(function (val) {
            value = val;
        });
        s.push(1);
        assert.equal(value, 1);
        s.push(2);
        assert.equal(value, 3);
        s.push(3);
        assert.equal(value, 6);
    });

    QUnit.module("Stream - cooldown");
    QUnit.test("empty queue - instant call", function (assert) {
        // var done = assert.async();
        var s = new Stream();
        var value = 0;
        s.cooldown(100).on(function (val) {
            value = val;
        });
        s.push(1);
        assert.equal(value, 1);
    });
    QUnit.test("2nd value is queued and called", function (assert) {
        var done = assert.async();
        var s = new Stream();
        var value = 0;
        s.cooldown(50).on(function (val) {
            value = val;
        });
        s.push(1);
        s.push(2);
        assert.equal(value, 1);
        setTimeout(function () {
            assert.equal(value, 2);
            done();
        }, 100);
    });
});
