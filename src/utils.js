define('utils', function () {
    return {
        rand: function  (n) {
            return Math.floor(Math.random() * n);
        },
        colorCodeToRGB: function (code) {
        /**
         * T Purple
         * L Orange
         * J Blue
         * S Green
         * Z Red
         * I Cyan
         * O Yellow
         */
            var rgb = [42,34,6,37,8,2,40,10][code];
            return [0,0,0].map(function (_,c) {
                return ((rgb >> (c << 1)) & 3) << 7;
            });
        },
        blendColors: function (colors) {
            var rgb = [0, 0, 0];
            var len = colors.length;
            colors.forEach(function (color) {
                rgb[0] += color[0];
                rgb[1] += color[1];
                rgb[2] += color[2];
            });
            return rgb.map(function (component) {
                return Math.round(component / len);
            });
        },
        pressAnyKey: function (callback) {
            var body = document.body;
            function listen (event) {
                event.stopPropagation();
                body.removeEventListener('click', listen, true);
                body.removeEventListener('keydown', listen, true);
                callback();
            }
            body.addEventListener('click', listen, true);
            body.addEventListener('keydown', listen, true);
        },
        show: function (el) {
            el.classList.remove('hidden');
        },
        hide: function (el) {
            el.classList.add('hidden');
        },
        extend: function () {
            if (this === window) throw new RangeError('wrong this passed');
            [].forEach.call(arguments, function (obj) {
                for (var key in obj) {
                    this[key] = obj[key];
                }
            }, this);
        },
        loadScript: function (document, tagName, id, src) {
            var js, fjs = document.getElementsByTagName(tagName)[0];
            if (document.getElementById(id)) return;
            js = document.createElement(tagName);
            js.id = id;
            js.src = src;
            fjs.parentNode.insertBefore(js, fjs);
        }.bind(null, document, 'script')
    };
});
