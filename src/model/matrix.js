define('model/matrix', ['model/stream', 'utils'], function (Stream, Utils) {
    function BaseModel (size) {
        this.size = size;
        this.streams = {
            set: new Stream(),
            collapse: new Stream(),
            color: new Stream()
        };
    }
    function readAt(args) {
        return this._get.apply(this, args);
    }
    function compactLayerTo(n, m) {
        if (n === m || !m) return;
        var c, d, corner;
        for (c = 1-m; c < m; c++) {
            this.move( c, n, c, m);
            this.move( c,-n, c,-m);
            this.move( n, c, m, c);
            this.move(-n, c,-m, c);
        }
        var dirs = [1,1,-1,-1,1];
        for (d = 0; d < 4; d++) {
            var signX = dirs[d];
            var signY = dirs[d+1];
            corner = [[n*signX, n*signY]];
            for (c = m; c < n; c++) {
                corner.push([c*signX,n*signY],
                            [n*signX,c*signY]);
            }
            var filled = corner.map(readAt, this).filter(Boolean);
            var color;
            var isThreshold = filled.length > n-m;
            color = isThreshold ? Utils.blendColors(filled) : 0;
            if (color) {
                this.streams.color.push(color);
            }
            if (filled.length) {
                this.event.merge.push({
                    from: corner,
                    to: [m*signX, m*signY],
                    color: color
                });
                corner.forEach(function (item) {
                    this._set(item[0], item[1], 0);
                }, this);
                this._set(m*signX, m*signY, color);
            }
        }
    }
    function collapseIteration () {
        var remove;
        var layersToRemove = [];
        this.event = {
            remove: (remove = []),
            move: [],
            merge: []
        };
        var c, i = 0, z = 0;
        for (c = 1; c <= this.size; c++) {
            if (this.isFullLayer(c)) {
                layersToRemove.push(c);
            }
        }
        for (c = 1; c <= this.size; c++) {
            if (c === layersToRemove[i]) {
                i++;
                var cellsToRemove = this.getLayer(c);
                remove.push.apply(remove, cellsToRemove);
                cellsToRemove.forEach(function (item) {
                    this._set(item[0], item[1], 0);
                }, this);
            } else {
                z++;
            }
            compactLayerTo.call(this, c, z);
        }
        // console.log(this.toString());
        this.event.layers = layersToRemove;
        return layersToRemove.length;
    }
    Utils.extend(BaseModel.prototype, {
        get: function(x, y) {
            if (Math.abs(y) > this.size) return 0; // throw new RangeError('y is out of range');
            if (Math.abs(x) > this.size) return 0; // throw new RangeError('x is out of range');
            return this._get(x, y);
        },
        set: function (x, y, v) {
            if (Math.abs(y) > this.size) throw new RangeError('y is out of range');
            if (Math.abs(x) > this.size) throw new RangeError('x is out of range');
            this.streams.set.push([x, y, v]);
            this._set(x, y, v);
        },
        move: function (fromX, fromY, toX, toY) {
            var value = this._get(fromX, fromY);
            if (!value) return;
            this._set(toX, toY, value);
            this._set(fromX, fromY, 0);
            this.event.move.push([ fromX, fromY, toX, toY ]);
        },
        isFullLayer: function (n) {
            return this.getLayer(n).every(function (item) {
                return this._get(item[0], item[1]);
            }, this);
        },
        collapse: function () {
            var events = [];
            while (collapseIteration.call(this)) {
                events.push(this.event);
            }
            events.forEach(function (event, i) {
                event.wave = i + 1;
                event.totalWaves = events.length;
                this.streams.collapse.push(event);
            }, this);
        },
        getConstraints: function () {
            var layer, c;
            var left = 0, right = 0, top = 0, bottom = 0;
            for (layer = this.size; layer > 0; layer--) {
                for (c = -this.size; c <= this.size; c++) {
                    if (!top    && this.get(c,  layer)) top    = layer;
                    if (!left   && this.get(-layer, c)) left   = layer;
                    if (!right  && this.get( layer, c)) right  = layer;
                    if (!bottom && this.get(c, -layer)) bottom = layer;
                }
            }
            return [top, right, bottom, left];
        },
        getLayer: function (n) {
            var c;
            var out = [[n,n],[-n,n],[n,-n],[-n,-n]];
            for (c = 1-n; c < n; c++) {
                out.push([c, n]);
                out.push([n, c]);
                out.push([c,-n]);
                out.push([-n,c]);
            }
            return out;
        },
        toString: function () {
            var x, y;
            var out = [];
            for (y = -this.size; y <= this.size; y++) {
                var line = [];
                for (x = -this.size; x <= this.size; x++) {
                    line.push(+!!this._get(x, y));
                }
                out.push(line.join(''));
            }
            return out.join('\n');
        }
    });
    function Model (size) {
        function getRow () {
            return Array.apply(null, { length: 2*size+1 }).map(function () { return 0; });
        }
        var state;
        this._get = function(x, y) {
            return state[size - y][size - x];
        };
        this._set = function(x, y, v) {
            state[size - y][size - x] = v;
        };
        this._reset = function () {
            state = [getRow()];
            for (var c = 0; c < size; c++) {
                state.push(getRow(), getRow());
            }
        };
        BaseModel.call(this, size);
    }
    Utils.extend(Model.prototype, BaseModel.prototype);
    return Model;
});
