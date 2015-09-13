define('model/figure', ['utils'], function (Utils) {
    function Figure(code, color) {
        var width  = 0;
        var height = 0;
        var x, y, list = [];
        for (y = 0; y < 4; y++)
        for (x = 0; x < 4; x++)
        if ((code >> (y << 2) + x) & 1) {
            list.push({ x: x, y: y });
            width = Math.max(width, x);
            height = Math.max(height, y);
        }
        this.list = list;
        this.sizes = [width+1, height+1];
        this.color = color;
    }
    var codes = [
        0x10027, 0x10232, 0x10072, 0x10131, // T
        0x20071, 0x20113, 0x20047, 0x20322, // J
        0x30017, 0x30311, 0x30074, 0x30223, // L
        0x40063, 0x40132, // S
        0x50036, 0x50231, // Z
        0x6000F, 0x61111, // I
        0x70033, // O
    ];
    Figure.get = function (idx) {
        var code = codes[idx];
        return new Figure(code & 0xFFFF, Utils.colorCodeToRGB(code >> 16));
    };
    return Figure;
});
