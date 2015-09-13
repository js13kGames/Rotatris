define('model/records', ['utils'], function (Utils) {
    var defaultTable = [
        { name: 'Alpha Pi',             points: 100000 },
        { name: 'Delta Pi',             points:  50000 },
        { name: 'Kappa Sigma',          points:  31337 },
        { name: 'Beta Gamma',           points:  25000 },
        { name: 'Alpha Sigma',          points:  15000 },
        { name: 'Beta Pi',              points:  10000 },
        { name: 'Beta Pi',              points:   5000 },
        { name: 'Beta Pi',              points:   2500 },
        { name: 'Ignatiy Konyachko',    points:   1000 },
        { name: '',                     points:      0 },
    ];
    function Records() {
        this.load();
    }
    Utils.extend.call(Records.prototype, {
        load: function () {
            try {
                this.table = JSON.parse(localStorage.getItem('rotatris.records')) || defaultTable;
            } catch (e) {
                this.table = defaultTable();
            }
        },
        save: function () {
            try {
                localStorage.setItem('rotatris.records', JSON.stringify(this.table));
            } catch (e) {}
        },
        position: function (points) {
            for (var idx = 0; idx < 10; idx++) {
                if (points > this.table[idx].points) break;
            }
            return idx;
        },
        add: function (name, points, idx) {
            if (idx === 10) return;
            this.table.splice(idx, 0, {
                name: name,
                points: points
            });
            if (this.table.length > 10) {
                this.table.push();
            }
        }
    });
    return Records;
});
