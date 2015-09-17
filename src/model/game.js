define('model/game', ['model/matrix', 'model/stream', 'utils'], function (Model, Stream, Utils) {
    var sineTable = [0, 1, 0, -1, 0];
    function Game (size) {
        this.size = size;
        this.model = new Model(size);
        this.streams = {
            position: new Stream(),
            size: new Stream(),
            drop: new Stream(),
            misc: new Stream()
        };
    }
    Utils.extend(Game.prototype, {
        next: function (figure) {
            this.figure = figure;
            this.distance = this.size + (this.size >> 2);
            this.position = 0;
            this.streams.position.push();
        },
        handleDropDistance: function () {
            var dd = this.dropDistance;
            dd.hard = Math.min(dd.hard, this.size);
            dd.soft = Math.min(dd.soft, this.size - dd.hard);
            this.streams.drop.push(dd);
            this.dropDistance = { hard: 0, soft: 0 };
        },
        getFigurePoints: function () {
            if (!this.figure) return [];
            var sin = sineTable[this.direction];
            var cos = sineTable[this.direction + 1];
            var dx = this.position;
            var dy = this.distance + 1;
            return this.figure.list.map(function(figurePoint) {
                return {
                    x: (figurePoint.x + dx) * cos + (figurePoint.y + dy) * sin,
                    y: (figurePoint.y + dy) * cos - (figurePoint.x + dx) * sin
                };
            });
        },
        dropConnect: function () {
            this.handleDropDistance();
            this.getFigurePoints().forEach(function (c) {
                try {
                    this.model.set(c.x, c.y, this.figure.color);
                } catch (e) {
                    if (!this.over) {
                        this.streams.misc.push('over');
                        this.over = true;
                    }
                }
            }, this);
            this.figure = null;
            this.model.collapse();
            this.constraints = this.model.getConstraints();
            this.streams.size.push(Math.max.apply(null, this.constraints));
        },
        doesFigureIntersect: function () {
            return this.getFigurePoints().some(function (c) {
                return this.model.get(c.x, c.y);
            }, this);
        },
        reset: function () {
            this.model._reset();
            this.dropDistance = { hard: 0, soft: 0 };
            this.over = false;
            this.direction = this.angle = 0;
            this.position = 0;
            this.streams.size.push(0);
            this.constraints = [0, 0, 0, 0];
        },
        tick: function (fromTimer) {
            if (this.over) return;
            this.distance--;
            if (!fromTimer) {
                this.dropDistance.soft++;
            }
            if (this.doesFigureIntersect()) {
                if (!fromTimer) {
                    this.dropDistance.soft--;
                }
                this.distance++;
                this.dropConnect();
            }
            this.streams.position.push();
        },
        drop: function () {
            while (!this.doesFigureIntersect()) {
                this.dropDistance.hard++;
                this.distance--;
                if (this.distance < -this.constraints[(this.direction+2) & 3] - this.figure.sizes[1]) {
                    this.streams.misc.push('fallthrough');
                    break;
                }
            }
            this.distance++;
            this.dropDistance.hard--;
            this.dropConnect();
            this.streams.position.push();
        },
        left: function (dontUpdate) {
            var oldAngle = this.angle;
            var oldPosition = this.position;
            var oldDirection = this.direction;
            var prevDirection = (this.direction + 3) & 3;
            if (this.position === Math.max(-this.size, 1 - this.figure.sizes[0] - this.constraints[prevDirection])) {
                this.angle--;
                this.position = Math.min(this.size - this.figure.sizes[0] + 1, this.constraints[this.direction]);
                this.direction = prevDirection;
            } else {
                this.position--;
            }
            if (this.doesFigureIntersect()) {
                // roll back values
                this.angle = oldAngle;
                this.position  = oldPosition;
                this.direction = oldDirection;
            } else if (!dontUpdate) {
                return this.streams.position.push();
            }
        },
        right: function (dontUpdate) {
            var oldAngle = this.angle;
            var oldPosition  = this.position;
            var oldDirection = this.direction;
            var nextDirection = (this.direction + 1) & 3;
            if (this.position === this.constraints[nextDirection]) {
                this.position = Math.max(-this.size, 1 - this.figure.sizes[0] - this.constraints[this.direction]);
                this.angle++;
                this.direction = nextDirection;
            } else {
                this.position++;
            }
            if (this.doesFigureIntersect()) {
                // roll back values
                this.angle = oldAngle;
                this.position  = oldPosition;
                this.direction = oldDirection;
            } else if (!dontUpdate) {
                this.streams.position.push();
            }
        },
        LEFT: function () {
            var direction = this.direction;
            var position;
            do {
                position = this.position;
                this.left(true);
            } while (this.direction == direction && this.position !== position);
            if (this.direction === direction) {
                this.streams.position.push();
            } else {
                this.right();
            }
        },
        RIGHT: function () {
            var direction = this.direction;
            var position;
            do {
                position = this.position;
                this.right(true);
            } while (this.direction == direction && this.position !== position);
            if (this.direction === direction) {
                this.streams.position.push();
            } else {
                this.left();
            }
        },
        rotate: function () {
            var oldAngle = this.angle;
            var oldPosition  = this.position;
            var oldDirection = this.direction;
            var prevDirection = this.direction;
            this.direction = (this.direction + 1) & 3;
            this.angle++;
            var nextDirection = (this.direction + 1) & 3;
            this.position = Math.max(
                -this.size,
                1 - this.figure.sizes[0] - this.constraints[prevDirection],
                Math.min(
                    this.position,
                    this.constraints[nextDirection],
                    this.size - this.figure.sizes[0] + 1
                )
            );
            if (this.doesFigureIntersect()) {
                // roll back values
                this.angle = oldAngle;
                this.position  = oldPosition;
                this.direction = oldDirection;
            } else /*if (!dontUpdate)*/ {
                this.streams.position.push();
            }
        },
        corotate: function () {
            var oldAngle = this.angle;
            var oldPosition  = this.position;
            var oldDirection = this.direction;
            var prevDirection = this.direction;
            this.direction = (this.direction + 3) & 3;
            this.angle--;
            var nextDirection = (this.direction + 3) & 3;
            this.position = Math.max(
                -this.size,
                1 - this.figure.sizes[0] - this.constraints[nextDirection],
                Math.min(
                    this.position,
                    this.constraints[prevDirection],
                    this.size - this.figure.sizes[0] + 1
                )
            );
            if (this.doesFigureIntersect()) {
                // roll back values
                this.angle = oldAngle;
                this.position  = oldPosition;
                this.direction = oldDirection;
            } else /*if (!dontUpdate)*/ {
                this.streams.position.push();
            }
        }
    });
    return Game;
});
