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

    this.playerGradients = this.game.players.map(function (player) {
        var gradCanvas = document.createElement('canvas');
        gradCanvas.width = 50;
        gradCanvas.height = 1;
        var gradCtx = gradCanvas.getContext('2d');
        var gradient = gradCtx.createLinearGradient(0, 0, 50, 0);
        gradient.addColorStop(0, '#000');
        gradient.addColorStop(1, player.color);
        gradCtx.fillStyle = gradient;
        gradCtx.fillRect(0, 0, 50, 1);
        return this.c.createPattern(gradCanvas, null);
    }, this);
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
    this.drawWireType[wire.type.name].call(this, wire, 120 + wire.topRow * 40, player.side);

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
    straight: function (wire, y, side) {
        var s = wire.nodes[0] ? side : null;
        this.drawWireSegment(40, 360, y, 0, s);
    },
    deadend: function (wire, y, side) {
        var s = wire.nodes[0] ? side : null;
        this.drawWireSegment(40, 280, y, 0, s);
        this.drawDeadEnd(280, y, 0, side);
    },
    fork: function (wire, y, side) {
        var s = wire.nodes[0] ? side : null;
        this.drawWireSegment(40, 120, y, 0, s);
        this.drawDeadEnd(120, y, 0, side);

        s = wire.nodes[1] ? side : null;
        this.drawWireSegment(40, 200, y, 1, s);
        this.drawWireSegment(200, 360, y, 0, s);
        this.drawWireSegment(200, 360, y, 2, s);

        s = wire.nodes[2] ? side : null;
        this.drawWireSegment(40, 120, y, 2, s);
        this.drawDeadEnd(120, y, 2, side);

        this.drawSplitter(200, y, 1, side);
    },
    fork2: function (wire, y, side) {
        var s = wire.nodes[0] ? side : null;
        this.drawWireSegment(40, 200, y, 0, s);
        this.drawDeadEnd(200, y, 0, side);

        s = wire.nodes[1] ? side : null;
        this.drawWireSegment(40, 280, y, 1, s);
        this.drawWireSegment(280, 360, y, 0, s);
        this.drawWireSegment(280, 360, y, 2, s);

        s = wire.nodes[2] ? side : null;
        this.drawWireSegment(40, 200, y, 2, s);
        this.drawDeadEnd(200, y, 2, side);

        this.drawSplitter(280, y, 1, side);
    },
    forkdeadend: function (wire, y, side) {
        var s = wire.nodes[0] ? side : null;
        this.drawWireSegment(40, 120, y, 0, s);
        this.drawDeadEnd(120, y, 0, side);

        s = wire.nodes[1] ? side : null;
        this.drawWireSegment(40, 200, y, 1, s);
        this.drawWireSegment(200, 280, y, 0, s);
        this.drawDeadEnd(280, y, 0, side);
        this.drawWireSegment(200, 360, y, 2, s);

        s = wire.nodes[2] ? side : null;
        this.drawWireSegment(40, 120, y, 2, s);
        this.drawDeadEnd(120, y, 2, side);

        this.drawSplitter(200, y, 1, side);
    },
    forkdeadend2: function (wire, y, side) {
        var s = wire.nodes[0] ? side : null;
        this.drawWireSegment(40, 120, y, 0, s);
        this.drawDeadEnd(120, y, 0, side);

        s = wire.nodes[1] ? side : null;
        this.drawWireSegment(40, 200, y, 1, s);
        this.drawWireSegment(200, 360, y, 0, s);
        this.drawWireSegment(200, 280, y, 2, s);
        this.drawDeadEnd(280, y, 2, side);

        s = wire.nodes[2] ? side : null;
        this.drawWireSegment(40, 120, y, 2, s);
        this.drawDeadEnd(120, y, 2, side);

        this.drawSplitter(200, y, 1, side);
    },
    revfork: function (wire, y, side) {
        var s = wire.nodes[0] ? side : null;
        this.drawWireSegment(40, 200, y, 0, s);

        s = wire.nodes[1] ? side : null;
        this.drawWireSegment(40, 120, y, 1, s);
        this.drawDeadEnd(120, y, 1, side);

        s = wire.nodes[2] ? side : null;
        this.drawWireSegment(40, 200, y, 2, s);

        s = wire.nodes[0] && wire.nodes[2] ? side : null;
        this.drawWireSegment(200, 360, y, 1, s);

        this.drawSplitter(200, y, 1, side, true);
    },
    revfork2: function (wire, y, side) {
        var s = wire.nodes[0] ? side : null;
        this.drawWireSegment(40, 280, y, 0, s);

        s = wire.nodes[1] ? side : null;
        this.drawWireSegment(40, 200, y, 1, s);
        this.drawDeadEnd(200, y, 1, side);

        s = wire.nodes[2] ? side : null;
        this.drawWireSegment(40, 280, y, 2, s);

        s = wire.nodes[0] && wire.nodes[2] ? side : null;
        this.drawWireSegment(280, 360, y, 1, s);

        this.drawSplitter(280, y, 1, side, true);
    },
    revforkdeadend: function (wire, y, side) {
        var s = wire.nodes[0] ? side : null;
        this.drawWireSegment(40, 200, y, 0, s);

        s = wire.nodes[1] ? side : null;
        this.drawWireSegment(40, 120, y, 1, s);
        this.drawDeadEnd(120, y, 1, side);

        s = wire.nodes[2] ? side : null;
        this.drawWireSegment(40, 200, y, 2, s);

        s = wire.nodes[0] && wire.nodes[2] ? side : null;
        this.drawWireSegment(200, 280, y, 1, s);
        this.drawDeadEnd(280, y, 1, side);

        this.drawSplitter(200, y, 1, side, true);
    },
    ring: function (wire, y, side) {
        var s = wire.nodes[0] ? side : null;
        this.drawWireSegment(40, 120, y, 0, s);
        this.drawDeadEnd(120, y, 0, side);

        s = wire.nodes[1] ? side : null;
        this.drawWireSegment(40, 200, y, 1, s);
        this.drawWireSegment(200, 280, y, 0, s);
        this.drawWireSegment(200, 280, y, 2, s);
        this.drawWireSegment(280, 360, y, 1, s);

        s = wire.nodes[2] ? side : null;
        this.drawWireSegment(40, 120, y, 2, s);
        this.drawDeadEnd(120, y, 2, side);

        this.drawSplitter(200, y, 1, side);
        this.drawSplitter(280, y, 1, side, true);
    },
    doublefork: function (wire, y, side) {
        var s = wire.nodes[0] ? side : null;
        this.drawWireSegment(40, 200, y, 0, s);

        s = wire.nodes[1] ? side : null;
        this.drawWireSegment(40, 120, y, 1, s);
        this.drawDeadEnd(120, y, 1, side);

        s = wire.nodes[2] ? side : null;
        this.drawWireSegment(40, 200, y, 2, s);

        s = wire.nodes[0] && wire.nodes[2] ? side : null;
        this.drawWireSegment(200, 280, y, 1, s);
        this.drawWireSegment(280, 360, y, 0, s);
        this.drawWireSegment(280, 360, y, 2, s);

        this.drawSplitter(200, y, 1, side, true);
        this.drawSplitter(280, y, 1, side);
    },
    revbranch: function (wire, y, side) {
        var s = wire.nodes[0] ? side : null;
        this.drawWireSegment(40, 200, y, 0, s);

        s = wire.nodes[1] ? side : null;
        this.drawWireSegment(40, 120, y, 1, s);
        this.drawDeadEnd(120, y, 1, side);

        s = wire.nodes[2] ? side : null;
        this.drawWireSegment(40, 200, y, 2, s);

        s = wire.nodes[0] && wire.nodes[2] ? side : null;
        this.drawWireSegment(200, 280, y, 1, s);

        s = wire.nodes[3] ? side : null;
        this.drawWireSegment(40, 280, y, 3, s);

        s = wire.nodes[0] && wire.nodes[2] && wire.nodes[3] ? side : null;
        this.drawWireSegment(280, 360, y, 2, s);

        this.drawSplitter(200, y, 1, side, true);
        this.drawSplitter(280, y, 2, side, true);
    },
    revforkbranch: function (wire, y, side) {
        this.drawWireType['revfork'].call(this, wire, y, side);

        s = wire.nodes[3] ? side : null;
        this.drawWireSegment(40, 120, y, 3, s);
        this.drawDeadEnd(120, y, 3, side);

        s = wire.nodes[4] ? side: null;
        this.drawWireSegment(40, 200, y, 4, s);
        this.drawWireSegment(200, 280, y, 3, s);
        this.drawWireSegment(280, 360, y, 2, s);
        this.drawWireSegment(280, 360, y, 4, s);
        this.drawWireSegment(200, 360, y, 5, s);

        s = wire.nodes[5] ? side : null;
        this.drawWireSegment(40, 120, y, 5, s);
        this.drawDeadEnd(120, y, 5, side);

        this.drawSplitter(200, y, 4, side);
        this.drawSplitter(280, y, 3, side);
    }
};

Renderer.prototype.drawWireSegment = function (x, x2, y, row, side) {
    y += row * 40;
    var offset = this.getFrameOffset(1000, 5) * 10;
    this.c.strokeStyle = side === null ? '#000' : this.playerGradients[side];
    this.c.beginPath();
    this.c.moveTo(x, y);
    this.c.lineTo(x2, y);
    this.c.translate(offset, 0);
    this.c.stroke();
    this.c.translate(-offset, 0);
};

Renderer.prototype.drawSplitter = function (x, y, row, side, reverse) {
    y += row * 40;
    this.c.fillStyle = this.game.players[side].color;
    this.c.strokeStyle = '#000';
    this.c.beginPath();
    this.c.moveTo(x - 6, y);
    this.c.lineTo(x - 6, y - (reverse ? 44 : 40));
    this.c.lineTo(x + 6, y - (reverse ? 40 : 44));
    this.c.lineTo(x + 6, y + (reverse ? 40 : 44));
    this.c.lineTo(x - 6, y + (reverse ? 44 : 40));
    this.c.lineTo(x - 6, y);
    this.c.fill();
    this.c.stroke();
};

Renderer.prototype.drawDeadEnd = function (x, y, row, side) {
    y += row * 40;
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
