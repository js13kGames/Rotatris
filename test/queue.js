require(['model/queue'], function (Queue) {
    QUnit.module("Queue");
    QUnit.test("new queue is empty", function (assert) {
        var q = new Queue();
        assert.equal(q.isEmpty(), true);
    });
    QUnit.test("write-read", function (assert) {
        var q = new Queue();
        q.push(1);
        assert.equal(q.pull(), 1, 'correct value is pulled back');
        assert.equal(q.isEmpty(), true, 'emptied after a pull');
    });
    QUnit.test("write-read 2", function (assert) {
        var q = new Queue();
        q.push(1);
        q.push(2);
        assert.equal(q.pull(), 1, 'correct value is pulled back');
        assert.equal(q.isEmpty(), false, 'not emptied until all values are pulled');
        assert.equal(q.pull(), 2, 'correct value is pulled back');
        assert.equal(q.isEmpty(), true, 'emptied after a pull');
    });
});
