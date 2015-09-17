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
    var key = 'rotatris.records';
    Utils.extend(Records.prototype, {
        load: function () {
            try {
                this.table = JSON.parse(localStorage.getItem(key)) || defaultTable;
            } catch (e) {
                this.table = defaultTable;
            }
        },
        save: function () {
            try {
                localStorage.setItem(key, JSON.stringify(this.table));
            } catch (e) {}
        },
        position: function (points) {
            for (var idx = 0; idx < 10; idx++) {
                if (points > this.table[idx].points) break;
            }
            return idx;
        },
        add: function (name, points, idx) {
            this.table.splice(idx, 0, {
                name: name,
                points: points
            });
            this.table = this.table.slice(0, 10 + (idx === 10));
        }
    });
    return Records;
});
