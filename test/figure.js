require(['model/figure'], function (Figure) {
    QUnit.module("figure");
    QUnit.test("sizes", function (assert) {
        var index, figure;
        var sizes = [
            [3,2],[2,3],[3,2],[2,3],
            [3,2],[2,3],[3,2],[2,3],
            [3,2],[2,3],[3,2],[2,3],
            [3,2],[2,3],
            [3,2],[2,3],
            [4,1],[1,4],
            [2,2]
        ];
        for (index = 0; index < 19; index++) {
            figure = Figure.get(index);
            assert.deepEqual(figure.sizes, sizes[index], 'figure #' + index);
        }
    });
});
