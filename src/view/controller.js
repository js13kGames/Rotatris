define('view/controller',
    ['model/game', 'model/figure', 'Keyboard', 'model/stream', 'model/ticker', 'view-dom', 'utils'],
    function (Game, Figure, Keyboard, Stream, Ticker, View, Utils) {
    /**
     * @param {number} level
     * @return {number}
     */
    function getSpeed (level) {
        var fps;
        if (level >= 29) {
            fps = 1;
        } else if (level >= 19) {
            fps = 2;
        } else {
            fps = [48,43,38,33,28,23,18,13,8,6,5,5,5,4,4,4,3,3,3][level];
        }
        return Math.round(1000 * fps / 60);
    }
    /**
     * @param {number}
     * @param {number}
     * @return {number}
     */
    function getLineScores (level, lines, wave) {
        return [0,40,100,300,1200][lines] * (level + 1) * Math.pow(wave, 2);
    }
    function Controller (SIZE) {
        this.game = new Game(SIZE);
        this.game.over = true;
        this.view = new View(window.matrix, SIZE);
        this.figureView = new View(window.figure, 2);
        this.nextView = new View(window.next, 2);
        this.figureStream = new Stream();
        this.currentFigureStream = this.figureStream.nth(1);
        this.ticker = new Ticker();
        this.points = 0;
        this.lines = 0;
        this.pointStream = new Stream();
        this.figureGenerator = {
            get: function () {
                return Figure.get(Utils.rand(19));
            }
        };
        this.setupEvents();
        this.setupAnimations();
    }
    function drawFigure (view, figure) {
        Utils.hide(window.figure);
        view.clear();
        figure.list.forEach(function (c) {
            view.paint(c.x-2, c.y-2, figure.color);
        });
        setTimeout(Utils.show.bind(null, window.figure), 0);
    }
    Utils.extend.call(Controller.prototype, {
        /** @param {number} @param {boolean} */
        updateLines: function (lines, set) {
            this.lines = !set * this.lines + lines;
            this.level = Math.floor(this.lines / 10);
            window.level.innerHTML = this.level;
            this.ticker.setInterval(getSpeed(this.level));
        },
        /** @param {number} @param {boolean} */
        updatePoints: function (points, set) {
            this.points = !set * this.points + points;
            window.points.innerHTML = this.points;
        },
        onUpdateState: function () {
            var style = window.figure.style;
            var game = this.game;
            style.left = ((15 + game.position) << 4) + 'px';
            style.top  = ((15 - game.distance - 5) << 4) + 'px';
            this.view.rotate(-90 * game.angle);
        },
        onGameOver: function (event) {
            if (event === 'over') {
                this.ticker.stop();
                Utils.hide(window.playfield);
                Utils.show(window.gameOver);
                Utils.pressAnyKey(this.back);
            }
        },
        onUpdateRadius: function (radius) {
            if (radius) {
                this.figureStream.push(this.figureGenerator.get());
            }
            this.view.fillRings(radius);
        },
        onKeyPress: function (name) {
            if ((!this.game.over) &&
                (!this.animation || (name !== 'tick' && name !== 'drop'))) {
                this.game[name]();
            }
        },
        pause: function () {
            this.ticker.stop();
            Utils.hide(window.game);
        },
        resume: function () {
            this.ticker.start();
            Utils.show(window.game);
        },
        /** @param {View} @param {Figure} */
        setupEvents: function () {
            this.pointStream.on(this.updatePoints.bind(this));
            this.figureStream.on(drawFigure.bind(null, this.nextView));
            this.currentFigureStream.on(drawFigure.bind(null, this.figureView));
            this.currentFigureStream.on(this.game.next.bind(this.game));
            this.ticker.stream.on(this.game.tick.bind(this.game, true));

            var gameStreams = this.game.streams;
            gameStreams.position.on(this.onUpdateState.bind(this));
            this.pointStream.append(gameStreams.drop.map(function (event) {
                var distance = Math.floor(event.hard / 3) +
                               Math.floor(event.soft / 5);
                if (distance === 5) distance = 7;
                return (distance + 1) * (this.level + 1);
            }.bind(this)));
            gameStreams.size.on(this.onUpdateRadius.bind(this));
            gameStreams.misc.on(this.onGameOver.bind(this));
            Keyboard.on(this.onKeyPress.bind(this));
            window.controls.onclick = function (event) {
                var button = event.target;
                var code = (button.dataset || {}).code;
                if (code) {
                    this.onKeyPress(code);
                }
            }.bind(this);
        },
        onCollapse: function (event) {
            this.animation = true;
            var view = this.view;
            var timeout = view.ANIMATION_TIME;
            this.ticker.stop();
            event.remove.forEach(function burnBlock (args) {
                view.burn.apply(view, args);
            });
            this.updateLines(event.layers.length);
            this.pointStream.push(getLineScores(this.level, event.layers.length, event.wave));
            setTimeout(function animateMoveAndMerge () {
                event.move.forEach(function moveBlock (args) {
                    view.move.apply(view, args);
                });
                event.merge.forEach(function mergeBlock (arg) {
                    view.merge(arg);
                });
            }, timeout * 1.1);
            if (event.wave === event.totalWaves) {
                setTimeout(function restartTicker () {
                    this.animation = false;
                    if (!this.zen) {
                        this.ticker.start();
                    }
                }.bind(this), timeout * 2.2);
            }
        },
        onCellSet: function (args) {
            this.view.paint.apply(this.view, args);
        },
        setupAnimations: function () {
            var view = this.view;
            var timeout = view.ANIMATION_TIME;
            var modelStreams = this.game.model.streams;
            modelStreams.set.on(this.onCellSet.bind(this));
            modelStreams.collapse.cooldown(timeout*2.2).on(this.onCollapse.bind(this));
        },
        reset: function (back) {
            this.back = back;
            this.animation = false;
            this.updatePoints(0, true);
            this.updateLines(0, true);
            this.view.clear();
            this.game.reset();
            if (this.zen) {
                Utils.hide(window.stats);
            } else {
                Utils.show(window.stats);
            }
            Utils.hide(window.gameOver);
            this.game.model.set(0, 0, [255,255,255]);
            this.ticker.stop();
            this.ticker.setInterval(getSpeed(0));
            if (!this.zen) {
                this.ticker.start();
            }
            this.figureStream.push(this.figureGenerator.get());
            this.figureStream.push(this.figureGenerator.get());
            Utils.show(window.playfield);
        }
    });
    return Controller;
});
