require(['model/matrix'], function (Model) {
    function fillRing (model, level) {
        var c;
        for (c = -level; c <= level; c++) {
            model.set(c, level, 1);
            model.set(c,-level, 1);
            model.set( level,c, 1);
            model.set(-level,c, 1);
        }
    }
    QUnit.module("model basics");
    QUnit.test("empty", function (assert) {
        var m = new Model(2);
        var x, y;
        for (y = -2; y <= 2; y++)
            for (x = -2; x <= 2; x++)
                assert.equal(m.get(x, y), 0);
    });
    QUnit.test("read-back", function (assert) {
        var m = new Model(2);
        m.set(1, 1, 1);
        assert.equal(m.get(1, 1), 1, 'set to 1');
        m.set(1, 1, 0);
        assert.equal(m.get(1, 1), 0, 'set back to 0');
    });
    QUnit.test("read-back neg.indices", function (assert) {
        var m = new Model(2);
        m.set(-1,-1, 1);
        assert.equal(m.get(-1,-1), 1, 'set to 1');
        m.set(-1,-1, 0);
        assert.equal(m.get(-1,-1), 0, 'set back to 0');
    });

    QUnit.module("constraints");
    QUnit.test("trivial", function (assert) {
        var m = new Model(2);
        assert.deepEqual(m.getConstraints(), [0,0,0,0]);
        m.set(-1, 0, 1);
        assert.deepEqual(m.getConstraints(), [0,0,0,1]);
        m.set(0, 1, 1);
        assert.deepEqual(m.getConstraints(), [1,0,0,1]);
        m.set(1, -1, 1);
        assert.deepEqual(m.getConstraints(), [1,1,1,1]);
    });
    QUnit.test("longer with spaces", function (assert) {
        var m = new Model(10);
        m.set( 3, 2, 1);
        m.set(-5,-4, 1);
        assert.deepEqual(m.getConstraints(), [2,3,4,5]);
    });

    QUnit.module("collapsing");
    QUnit.test("basic", function (assert) {
        var m = new Model(2);
        var x, y;
        m.set(0, 0, 1);
        fillRing(m, 1);
        var result;
        m.streams.collapse.on(function (event) {
            result = event.layers;
        });
        m.collapse();
        for (y = -1; y <= 1; y++)
            for (x = -1; x <= 1; x++)
                assert.equal(!m.get(x, y), !!(x||y), 'collapsed items are emptied');
        assert.deepEqual(result, [1], 'collapsed levels are reported');
    });
    QUnit.test("top level is cleared", function (assert) {
        var m = new Model(1);
        var x, y;
        m.set(0, 0, 1);
        fillRing(m, 1);
        m.collapse();
        for (y = -1; y <= 1; y++)
            for (x = -1; x <= 1; x++)
                assert.equal(!m.get(x, y), !!(x||y), 'collapsed items are emptied');
    });
    QUnit.test("collapsing affects external", function (assert) {
        var m = new Model(5);
        m.set(0, 0, 1);
        fillRing(m, 1);
        m.set(5, 0, 1);
        m.collapse();
        assert.equal(m.get(5, 0, 1), 0, 'top item is removed');
        assert.equal(m.get(4, 0, 1), 1, 'and placed to the new position');
    });

    QUnit.test("shaking waves", function (assert) {
        var m = new Model(5);
        fillRing(m, 1);
        fillRing(m, 3);
        fillRing(m, 5);
        var result;
        m.streams.collapse.on(function (event) {
            result = event.layers;
        });
        m.collapse();
        assert.deepEqual(result, [1,3,5], 'wave 1');
    });

    QUnit.test("multi-shake", function (assert) {
        var m = new Model(5);
        fillRing(m, 1);
        fillRing(m, 2);
        fillRing(m, 3);
        m.set(2, 2, 0);
        m.set(2, 3, 0);
        m.set(3, 2, 0);
        var result = [];
        m.streams.collapse.on(function (event) {
            result.push(event.layers);
        });
        m.collapse();
        assert.deepEqual(result, [[1],[1],[1]], 'triple-wave');
    });
});
