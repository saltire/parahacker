var Renderer = function (game, canvas) {
    this.game = game;

    this.canvas = canvas;

    this.hscale = this.canvas.width / 800;
    this.vscale = this.canvas.height / 600;

    this.c = canvas.getContext('2d');
    this.c.scale(this.hscale, this.vscale);

    this.c.lineWidth = 4;
    this.c.lineCap = 'square';
    this.c.lineJoin = 'bevel';

    this.backgroundColor = '#666';
    this.timerColor = '#fff';
};

Renderer.prototype.drawFrame = function () {
    // Fill canvas with background.
    this.c.fillStyle = this.backgroundColor;
    this.c.fillRect(0, 0, 800, 600);

    // Draw timer.
    this.drawTimer();

    // Draw lights.
    this.drawTopLight();
    game.rowLights.forEach(this.drawRowLight.bind(this));

    // Draw player sides.
    this.game.players.forEach(this.drawPlayerSide.bind(this));
};

Renderer.prototype.drawTimer = function () {
    var timerLength;
    if (this.game.stage === 'warmup' || this.game.stage === 'game') {
        // Fill a percentage of the timer bar.
        timerLength = 320 * this.game.timer;
        this.c.strokeStyle = this.timerColor;
    }
    else if (this.game.stage === 'gameover') {
        // Fill the timer bar with the color of the winning player.
        timerLength = 320;
        this.c.strokeStyle = this.game.topLight === null ? '#000' : this.game.players[this.game.topLight].color;
    }

    if (timerLength > 0) {
        this.c.beginPath();
        this.c.moveTo(360, 40);
        this.c.lineTo(360 - timerLength, 40);
        this.c.stroke();

        this.c.beginPath();
        this.c.moveTo(440, 40);
        this.c.lineTo(440 + timerLength, 40);
        this.c.stroke();
    }
};

Renderer.prototype.drawTopLight = function () {
    this.c.fillStyle = this.game.topLight === null ? '#000' : this.game.players[this.game.topLight].color;
    this.c.strokeStyle = '#000';
    this.c.fillRect(360, 20, 80, 80);
    this.c.strokeRect(360, 20, 80, 80);
};

Renderer.prototype.drawRowLight = function (side, row) {
    var t = 100 + row * 40;

    this.c.fillStyle = this.game.players[side].color;
    this.c.strokeStyle = '#000';
    this.c.fillRect(360, t, 80, 40);
    this.c.strokeRect(360, t, 80, 40);
};

Renderer.prototype.drawPlayerSide = function (player) {
    this.c.setTransform((player.side ? -1 : 1) * this.hscale, 0, 0, this.vscale, player.side ? this.canvas.width : 0, 0);

    // Draw side bar.
    this.c.fillStyle = player.color;
    this.c.strokeStyle = '#000';
    this.c.fillRect(20, 20, 20, 560);
    this.c.strokeRect(20, 20, 20, 560);

    // Draw node area.
    this.c.fillStyle = '#666';
    this.c.fillRect(50, 60, 300, 40);
    for (var i = 0; i < player.nodes; i++) {
        this.drawNode(55 + i * 30, 80, player.color);
    }

    // Draw wires.
    player.wires.forEach(this.drawWire.bind(this, player));

    // Draw current node.
    if (player.currentRow > -1) {
        this.drawNode(55, 120 + (player.currentRow) * 40, player.color);
    }
};

Renderer.prototype.drawNode = function (x, y, color) {
    this.c.fillStyle = color;
    this.c.strokeStyle = '#000';
    this.c.beginPath();
    this.c.moveTo(x, y);
    this.c.lineTo(x, y - 10);
    this.c.lineTo(x + 10, y - 10);
    this.c.lineTo(x + 20, y);
    this.c.lineTo(x + 10, y + 10);
    this.c.lineTo(x, y + 10);
    this.c.lineTo(x, y);
    this.c.fill();
    this.c.stroke();
};

Renderer.prototype.drawWire = function (player, wire) {
    this.drawWireType[wire.type.name].call(this, wire, 120 + wire.topRow * 40, player.side, -this.getFrameOffset(1000, 5) * 10);

    // Draw nodes on all the starting rows that have them.
    wire.type.startRows.forEach(function (startRow) {
        if (wire.nodes[startRow]) {
            this.drawNode(75, 120 + (wire.topRow + startRow) * 40, player.color);
        }
    }, this);
};

Renderer.prototype.getFrameOffset = function (period, frameCount) {
    return Math.floor(this.game.ts % period / period * frameCount);
};

Renderer.prototype.drawWireType = {
    straight: function (wire, y, side, offset) {
        this.drawWireSegment([[40, y], [360, y]], wire.nodes[0] ? side : null, offset);
    },
    deadend: function (wire, y, side, offset) {
        this.drawWireSegment([[40, y], [280, y]], wire.nodes[0] ? side : null, offset);
        this.drawDeadEnd(280, y, side);
    },
    fork: function (wire, y, side, offset) {
        this.drawWireSegment([[40, y], [120, y]], wire.nodes[0] ? side : null, offset);
        this.drawDeadEnd(120, y, side);

        this.drawWireSegment([[40, y + 40], [200, y + 40], [200, y], [360, y]], wire.nodes[1] ? side : null, offset);
        this.drawWireSegment([[200, y + 40], [200, y + 80], [360, y + 80]], wire.nodes[1] ? side : null, offset + 160);

        this.drawWireSegment([[40, y + 80], [120, y + 80]], wire.nodes[2] ? side : null, offset);
        this.drawDeadEnd(120, y + 80, side);
    },
    fork2: function (wire, y, side, offset) {
        this.drawWireSegment([[40, y], [200, y]], wire.nodes[0] ? side : null, offset);
        this.drawDeadEnd(200, y, side);

        this.drawWireSegment([[40, y + 40], [280, y + 40], [280, y], [360, y]], wire.nodes[1] ? side : null, offset);
        this.drawWireSegment([[280, y + 40], [280, y + 80], [360, y + 80]], wire.nodes[1] ? side : null, offset + 240);

        this.drawWireSegment([[40, y + 80], [200, y + 80]], wire.nodes[2] ? side : null, offset);
        this.drawDeadEnd(200, y + 80, side);
    },
    revfork: function (wire, y, side, offset) {
        this.drawWireSegment([[40, y + 40], [120, y + 40]], wire.nodes[1] ? side : null, offset);
        this.drawDeadEnd(120, y + 40, side);

        this.drawWireSegment([[40, y], [200, y], [200, y + 40]], wire.nodes[0] ? side : null, offset);
        this.drawWireSegment([[40, y + 80], [200, y + 80], [200, y + 40]], wire.nodes[2] ? side : null, offset);
        this.drawWireSegment([[200, y + 40], [360, y + 40]], wire.nodes[0] && wire.nodes[2] ? side : null, offset);
    }
};

Renderer.prototype.drawWireSegment = function (points, side, offset) {
    var drawSegment = function () {
        // Draw a line based on an array of x,y pairs.
        this.c.beginPath();
        this.c.moveTo.apply(this.c, points[0]);
        points.slice(1).forEach(function (point) {
            this.c.lineTo.apply(this.c, point);
        }, this);
        this.c.stroke();
    }.bind(this);

    this.c.strokeStyle = '#000';
    drawSegment();

    if (side !== null) {
        // Draw a series of dashed lines to create a multicoloured gradient.
        // Actual gradients would look better, but there's no good way yet to
        // align them to the stroke direction or transform them for animation.
        this.c.strokeStyle = this.game.players[side].color;
        this.c.lineDashOffset = offset;

        this.c.setLineDash([0, 12, 6, 32]);
        this.c.globalAlpha = 0.25;
        drawSegment();

        this.c.setLineDash([0, 22, 6, 22]);
        this.c.globalAlpha = 0.5;
        drawSegment();

        this.c.setLineDash([0, 32, 6, 12]);
        this.c.globalAlpha = 0.75;
        drawSegment();

        this.c.setLineDash([0, 42, 6, 2]);
        this.c.globalAlpha = 1;
        drawSegment();

        this.c.setLineDash([]);
    }
};

Renderer.prototype.drawDeadEnd = function (x, y, side) {
    this.c.fillStyle = this.game.players[side].color;
    this.c.strokeStyle = '#000';
    this.c.beginPath();
    this.c.moveTo(x, y);
    this.c.lineTo(x + 6, y - 6);
    this.c.lineTo(x + 12, y - 6);
    this.c.lineTo(x + 12, y + 6);
    this.c.lineTo(x + 6, y + 6);
    this.c.lineTo(x, y);
    this.c.fill();
    this.c.stroke();
};

Renderer.prototype.onClick = function (x, y) {
    var row = Math.floor((y - 100) / 40);
    if (row < 0 || row >= 12) {
        return;
    }

    if (x >= 40 && x <= 360) {
        this.game.players[0].onRowSelect(row);
    }
    else if (x >= 440 && x <= 760) {
        this.game.players[1].onRowSelect(row);
    }
};
