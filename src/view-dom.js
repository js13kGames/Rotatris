define('view-dom', ['utils'], function (/*Utils*/) {
    function parity (x, y) {
        return Math.max(Math.abs(x), Math.abs(y)) & 1;
    }
    /**
     * @constructor
     * @struct
     * @type {View}
     *
     * @param {HTMLElement}
     * @param {number}
     */
    function View (el, size) {
        var sizeInPixels = (size*2+1) << 4;
        el.style.width = sizeInPixels + 'px';
        el.style.height = sizeInPixels + 'px';
        /** @type {number} */
        var rings = 0;
        /** @type {Object<string,HTMLElement>} */
        var map = {};
        /** @property {number} */
        this.ANIMATION_TIME = 250;
        /**
         * @param {CSSStyleDeclaration} style
         * @param {number} x
         * @param {number} y
         */
        function placeCell(style, x, y) {
            style.left = ((size + x) << 4) + 'px';
            style.top  = ((size - y) << 4) + 'px';
        }
        /**
         * @param {number} angle
         */
        this.rotate = function (angle) {
            var style = el.style;
            style.WebkitTransform =
            style.MozTransform =
            style.transform = 'rotate(' + angle + 'deg)';
        };
        /**
         * @param {number} x
         * @param {number} y
         * @param {number[]|number} color
         */
        this.paint = function (x, y, color) {
            var key = x + '_' + y;
            var cell, style;
            if (!color) return;
            if (map[key]) {
                map[key].style.background = 'rgb(' + color + ')';
                return;
            }
            cell = document.createElement('div');
            map[key] = cell;
            style = cell.style;
            placeCell(style, x, y);
            cell.className = 'cell cell' + parity(x, y);
            style.transition = 'all ' + this.ANIMATION_TIME + 'ms ease-out';
            style.background = 'rgb(' + color + ')';
            el.appendChild(cell);
        };
        /**
         * @param {number} x
         * @param {number} y
         */
        this.burn = function (x, y) {
            var key = x + '_' + y;
            var cell = map[key];
            if (!cell) return;
            var inner = document.createElement('div');
            var style = inner.style;
            cell.appendChild(inner);
            style.opacity = 0;
            style.background = 'white';
            style.height = '100%';
            style.transition = 'all ' + this.ANIMATION_TIME + 'ms ease-out';
            setTimeout(function () {
                style.opacity = 1;
                style.boxShadow = '0 0 10px white';
            }, 0);
            setTimeout(function () {
                el.removeChild(cell);
                map[key] = null;
            }, this.ANIMATION_TIME);
        };
        this.clear = function () {
            rings = 0;
            map = {};
            el.innerHTML = '';
        };
        /**
         * @param {number} fromX
         * @param {number} fromY
         * @param {number} toX
         * @param {number} toY
         */
        this.move = function (fromX, fromY, toX, toY) {
            var key = fromX + '_' + fromY;
            var cell = map[key];
            if (!cell) return;
            placeCell(cell.style, toX, toY);
            setTimeout(function () {
                map[key] = null;
                map[toX + '_' + toY] = cell;
                cell.className = 'cell cell' + parity(toX, toY);
            }, this.ANIMATION_TIME);
        };
        /**
         * @param {CellMoveEvent} params
         */
        this.merge = function (params) {
            var cells = params.from.map(function (item) {
                return map[item.join('_')];
            }).filter(Boolean);
            var to = params.to;
            cells.forEach(function (cell) {
                var style = cell.style;
                placeCell(style, to[0], to[1]);
                style.opacity = 0;
            });
            setTimeout(function () {
                params.from.forEach(function (item) {
                    map[item.join('_')] = null;
                });
                cells.forEach(el.removeChild.bind(el));
                if (params.color) {
                    this.paint(to[0], to[1], params.color);
                }
            }.bind(this), this.ANIMATION_TIME / 2);
        };
        /**
         * @param {number}
         */
        this.fillRings = function (newRings) {
            var s;
            for (s = rings-1; s >= newRings; s--) {
                el.removeChild(document.getElementById('ring' + s));
            }
            for (s = rings; s < newRings; s++) {
                var ring = document.createElement('div');
                ring.id = 'ring' + s;
                ring.className = 'ring';
                var style = ring.style;
                style.left =
                style.top  = (size - s) * 16 - 1 + 'px';
                style.width  =
                style.height = (s << 5) + 15 + 'px';
                el.appendChild(ring);
            }
            rings = newRings;
        };
        this.drawBitmap = function (bitmap, options) {
            var offset = options.offset || 0;
            var getXY = options.getXY || function (x, y) { return [x, y]; };
            var getColor = options.getColor || function (/*x, y*/) { return [255, 255, 255]; };
            var height = bitmap.length;
            var width = bitmap.reduce(function (a, b) {
                return a | b;
            }).toString(2).length;
            var x, y, xy;
            for (y = 0; y < bitmap.length; y++) {
                for (x = 0; x < width; x++) {
                    if (bitmap[y] >> (width - x - 1) & 1) {
                        xy = getXY(x - (width >> 1), offset + height - y);
                        this.paint(xy[0], xy[1], getColor(x, y));
                    }
                }
            }
        };
    }
    return View;
});
