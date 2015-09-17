define('view/menu',
    ['Keyboard', 'view-dom', 'utils'],
    function (Keyboard, View, Utils) {
    function Menu (items) {
        this.direction = 0;
        this.angle = 0;
        this.items = items;
        var view = this.view = new View(window.menuView, 35);
        var color = [255, 255, 255];
        var coords = [-2,-1,0,1,2];
        [
            new View(window.menuLeft, 2),
            new View(window.menuRight, 2)
        ].forEach(function (view, idx) {
            coords.forEach(function (y) {
                coords.forEach(function (x) {
                    if (Math.abs(x) + Math.abs(y) <= 2 &&
                        x * (1-2*idx) <= 0) {
                        view.paint(x, y, color);
                    }
                });
            });
        });
        var sineTable = [0, 1, 0, -1, 0];
        var cos, sin = sineTable[0];
        function getXY (x, y) {
            return [
                x * sin + y * cos,
                y * sin - x * cos
            ];
        }
        items.forEach(function (item, i) {
            //var colorTable = [5,2,7,4,6,3,1];
            function getColor (/*x, y*/) {
                return item.color;
                //return colorCodeToRGB(y%7+1);
            }
            cos = sin;
            sin = sineTable[i+1];
            var offset = 20;
            var j, bitmap;
            for (j = item.lines.length-1; j >= 0; j--) {
                bitmap = item.lines[j];
                view.drawBitmap(bitmap, {
                    offset: offset,
                    getXY: getXY,
                    getColor: getColor
                });
                offset += bitmap.length + 1 /* gap */;
            }
        });
        Keyboard.on(function (event) {
            if (!{left:1,right:1,drop:1}[event]) return;
            this[event]();
        }.bind(this));
        window.menuLeft. onclick = this.left .bind(this);
        window.menuRight.onclick = this.right.bind(this);
        window.menuView. onclick = this.drop .bind(this);
        this.back = this.back.bind(this);
    }
    Utils.extend(Menu.prototype, {
        redraw: function () {
            this.view.rotate(-90 * this.angle);
        },
        left: function () {
            if (this.out) return;
            this.direction += 3;
            this.direction &= 3;
            this.angle--;
            this.redraw();
        },
        right: function () {
            if (this.out) return;
            this.direction += 1;
            this.direction &= 3;
            this.angle++;
            this.redraw();
        },
        drop: function () {
            if (this.out) return;
            this.out = true;
            Utils.hide(window.menu);
            var item = this.items[this.direction];
            Utils.show(item.root);
            item.enter(this.back);
        },
        back: function () {
            if (!this.out) return;
            this.out = false;
            var item = this.items[this.direction];
            Utils.hide(item.root);
            item.leave();
            Utils.show(window.menu);
        }
    });
    return Menu;
});
