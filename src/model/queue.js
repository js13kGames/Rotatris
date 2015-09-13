define('model/queue', ['utils'], function (Utils) {
    function Queue(size) {
        this.size = size || 16;
        this.q = [];
        this.idx = 0;
    }
    Utils.extend.call(Queue.prototype, {
        push: function (item) {
            this.q.push(item);
            if (this.q.length > this.idx * 2 && this.idx > this.size) {
                this.q = this.q.slice(this.idx);
                this.idx = 0;
            }
        },
        pull: function () {
            return this.q[this.idx++];
        },
        isEmpty: function () {
            return this.q.length === this.idx;
        }
    });
    return Queue;
});
