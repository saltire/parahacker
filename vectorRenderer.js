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
    this.drawWireType[wire.type.name].call(this, wire, 120 + wire.topRow * 40, player.color);

    // Draw nodes on all the starting rows that have them.
    wire.type.startRows.forEach(function (startRow) {
        if (wire.nodes[startRow]) {
            this.drawNode(75, 120 + (wire.topRow + startRow) * 40, player.color);
        }
    }, this);
};

Renderer.prototype.drawWireType = {
    straight: function (wire, y, color) {
        this.c.strokeStyle = wire.nodes[0] ? color : '#000';
        this.c.beginPath();
        this.c.moveTo(40, y);
        this.c.lineTo(360, y);
        this.c.stroke();
    },
    zigzag: function (wire, y, color) {
        this.c.strokeStyle = wire.nodes[0] ? color : '#000';
        this.c.beginPath();
        this.c.moveTo(40, y);
        this.c.lineTo(200, y);
        this.c.lineTo(200, y + 40);
        this.c.lineTo(360, y + 40);
        this.c.stroke();
    },
    zigzag2: function (wire, y, color) {
        this.c.strokeStyle = wire.nodes[1] ? color : '#000';
        this.c.beginPath();
        this.c.moveTo(40, y + 40);
        this.c.lineTo(200, y + 40);
        this.c.lineTo(200, y);
        this.c.lineTo(360, y);
        this.c.stroke();
    },
    fork: function (wire, y, color) {
        this.c.strokeStyle = wire.nodes[1] ? color : '#000';
        this.c.beginPath();
        this.c.moveTo(40, y + 40);
        this.c.lineTo(200, y + 40);
        this.c.lineTo(200, y);
        this.c.lineTo(360, y);
        this.c.moveTo(200, y + 40);
        this.c.lineTo(200, y + 80);
        this.c.lineTo(360, y + 80);
        this.c.stroke();
    },
    fork2: function (wire, y, color) {
        this.c.strokeStyle = wire.nodes[0] ? color : '#000';
        this.c.beginPath();
        this.c.moveTo(40, y);
        this.c.lineTo(200, y);
        this.c.lineTo(200, y + 40);
        this.c.stroke();

        this.c.strokeStyle = wire.nodes[2] ? color : '#000';
        this.c.beginPath();
        this.c.moveTo(40, y + 80);
        this.c.lineTo(200, y + 80);
        this.c.lineTo(200, y + 40);
        this.c.stroke();

        this.c.strokeStyle = wire.nodes[0] && wire.nodes[2] ? color : '#000';
        this.c.beginPath();
        this.c.moveTo(200, y + 40);
        this.c.lineTo(360, y + 40);
        this.c.stroke();
    }
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
