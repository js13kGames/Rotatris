require(['view/controller', 'view/menu', 'view/records', 'view/social', 'Keyboard', 'view-dom', 'utils'],
        function (Controller, Menu, RecordsView, social, Keyboard, View, Utils) {
    Utils.hide(window.menu);
    var bodyClassList = document.body.classList;
    if ('ontouchstart' in document.body) {
        bodyClassList.add('touch');
    }
    var userAgent = navigator.userAgent;
    if (/Macintosh/.test(userAgent) ||
        /like Mac OS/.test(userAgent)) {
        bodyClassList.add('apple');
    }
    var controller = new Controller(15);
    var bitmaps = {
        ro: [31804, 26214, 26307, 31939, 27843, 26214, 26172],
        ta: [8094, 1599, 1587, 1587, 1599, 1587, 1587],
        tr: [8126, 1587, 1587, 1598, 1590, 1587, 1587],
        is: [415, 432, 432, 414, 387, 387, 446],
        game: [ 63412447, 101703128, 202170328, 216849118, 208656600, 107796696,  65853663],
        over: [126644158, 214723635, 409390131, 409390910, 409390134, 214142003, 126062515],
        mew:  [ 13040387,  15123251,  16171446,  14610870,  13550078,  13025484,  13039820],
        zen:  [  1040227,     55411,    104571,    204399,    399463,    792675,   1040227],
        mode: [831463199, 999922072,1068554456, 900782302, 833673432, 832149912, 831463199],
        info: [ 14212924,  14473318,  14604483,  14409411,  14276803,  14211174,  14211132],
        top:  [  2072126,    406323,    418227,    418238,    418224,    406320,    400944],
        ten:  [  1040227,    202867,    202875,    204399,    202855,    202851,    204643]
    };
    var gameOverView = new View(window.gameOver, 14);
    gameOverView.drawBitmap(bitmaps.game, {});
    gameOverView.drawBitmap(bitmaps.over, { offset: -8 });
    var recordsView = new RecordsView();
    var unused;
    /*var menu = */new Menu([{
        root: window.playfield,
        lines: [bitmaps.mew, bitmaps.game],
        color: Utils.colorCodeToRGB(5),
        enter: function (back) {
            controller.zen = false;
            controller.reset(function () {
                Utils.show(window.records);
                Utils.hide(window.gameOver);
                recordsView.drawWith(controller.points, function () {
                    Utils.pressAnyKey(back);
                });
            });
        },
        leave: function () {
            Utils.hide(window.records);
        }
    }, {
        root: window.playfield,
        lines: [bitmaps.zen, bitmaps.mode],
        color: Utils.colorCodeToRGB(2),
        enter: function (back) {
            controller.zen = true;
            controller.reset(back);
        },
        leave: function () {
            Utils.hide(window.gameOver);
        },
    }, {
        root: window.about,
        lines: [bitmaps.game, bitmaps.info],
        color: Utils.colorCodeToRGB(6),
        enter: function (back) {
            Utils.show(window.keySheet);
            Utils.show(window.scoringSheet);
            Utils.pressAnyKey(back);
        },
        leave: function () {
            Utils.hide(window.keySheet);
            Utils.hide(window.scoringSheet);
            unused = window.gameInfo.offsetHeight;
        }
    }, {
        root: window.records,
        lines: [bitmaps.top, bitmaps.ten],
        color: Utils.colorCodeToRGB(3),
        enter: function (back) {
            recordsView.drawTable();
            Utils.pressAnyKey(back);
        },
        leave: function () {
        }
    }]);
    // intro
    /*var views = */['ro', 'ta', 'tr', 'is'].map(function (syllableName) {
        var elt = document.createElement('div');
        elt.id = 'intro-' + syllableName;
        elt.className = 'intro';
        window.intro.appendChild(elt);
        var view = new View(elt, 7);
        view.drawBitmap(bitmaps[syllableName], { offset: -4 });
        return view;
    });
    //Utils.pressAnyKey(function breakIntro () {
        // views.forEach(function (view) { view.burnAll(); });
    var firstShow = true;
    Keyboard.on(function (name) {
        if (name === 'drop') firstShow = false;
    });
    setTimeout(function () {
        if (firstShow) {
            Utils.show(window.menu);
        }
    }, 1800);
});
