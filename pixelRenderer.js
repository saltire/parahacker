var Renderer = function (game, canvas) {
    this.game = game;

    this.canvas = canvas;

    this.hscale = this.canvas.width / 64;
    this.vscale = this.canvas.height / 64;

    this.c = canvas.getContext('2d');
    this.c.scale(this.hscale, this.vscale);

    this.c.lineWidth = 1;
    this.c.lineCap = 'square';
    this.c.lineJoin = 'miter';

    this.backgroundColor = '#666';
    this.timerColor = '#fff';

    this.ready = false;
    this.frame = new Image();
    this.frame.src = './frame.png';
    this.frame.onload = this.imageLoaded.bind(this);
};

Renderer.prototype.imageLoaded = function () {
    this.ready = true;
};

Renderer.prototype.drawFrame = function (ts) {
    if (!this.ready) {
        return;
    }

    // Fill canvas with background.
    this.c.fillStyle = this.backgroundColor;
    this.c.fillRect(0, 0, 64, 64);

    // Draw frame image.
    this.c.imageSmoothingEnabled = false;
    this.c.mozImageSmoothingEnabled = false;
    this.c.drawImage(this.frame, 0, 0);

    // Draw timer.
    this.drawTimer(ts);

    // Draw lights.
    this.drawTopLight();
    game.rowLights.forEach(this.drawRowLight.bind(this));

    // Draw player sides.
    this.game.players.forEach(this.drawPlayerSide.bind(this));
};

Renderer.prototype.drawTimer = function (ts) {
    var timerLength;
    if (this.game.stage === 'warmup' || this.game.stage === 'game') {
        // Fill a percentage of the timer bar.
        timerLength = 32 * this.game.timer;
        this.c.fillStyle = this.timerColor;
    }
    else if (this.game.stage === 'gameover') {
        // Fill the timer bar with the color of the winning player.
        timerLength = 32;
        this.c.fillStyle = this.game.topLight === null ? '#000' : this.game.players[this.game.topLight].color;
    }

    if (timerLength > 0) {
        this.c.fillRect(32 - timerLength, 0, timerLength * 2, 1);
        this.c.fillRect(32 - timerLength, 63, timerLength * 2, 1);
    }
};

Renderer.prototype.drawTopLight = function () {
    this.c.fillStyle = this.game.topLight === null ? '#000' : this.game.players[this.game.topLight].color;
    this.c.fillRect(28, 4, 8, 8);
};

Renderer.prototype.drawRowLight = function (side, row) {
    var t = 13 + row * 4;
    this.c.fillStyle = this.game.players[side].color;
    this.c.fillRect(28, t, 8, 3);
};

Renderer.prototype.drawPlayerSide = function (player) {
    this.c.setTransform((player.side ? -1 : 1) * this.hscale, 0, 0, this.vscale, player.side ? this.canvas.width : 0, 0);

    // Draw side bar.
    this.c.fillStyle = player.color;
    this.c.fillRect(3, 4, 2, 56);

    // Draw node area.
    this.c.fillStyle = '#666';
    this.c.fillRect(6, 5, 21, 3);
    for (var i = 0; i < player.nodes; i++) {
        this.drawNode(7.5 + i * 4, 6.5, player.color);
    }

    // Draw wires.
    player.wires.forEach(this.drawWire.bind(this, player));

    // Draw current node.
    if (player.currentRow > -1) {
        this.drawNode(7.5, 14.5 + (player.currentRow) * 4, player.color);
    }
};

Renderer.prototype.drawNode = function (x, y, color) {
    this.c.fillStyle = color;
    this.c.strokeStyle = '#000';
    this.c.beginPath();
    this.c.moveTo(x, y);
    this.c.lineTo(x, y - 1);
    this.c.lineTo(x + 1, y - 1);
    this.c.lineTo(x + 2, y);
    this.c.lineTo(x + 1, y + 1);
    this.c.lineTo(x, y + 1);
    this.c.lineTo(x, y);
    this.c.fill();
    this.c.stroke();
};

Renderer.prototype.drawWire = function (player, wire) {
    this.drawWireType[wire.type.name].call(this, wire, 14.5 + wire.topRow * 4, player.color);

    // Draw nodes on all the starting rows that have them.
    wire.type.startRows.forEach(function (startRow) {
        if (wire.nodes[startRow]) {
            this.drawNode(10.5, 14.5 + (wire.topRow + startRow) * 4, player.color);
        }
    }, this);
};

Renderer.prototype.drawWireType = {
    straight: function (wire, y, color) {
        this.c.strokeStyle = wire.nodes[0] ? color : '#000';
        this.c.beginPath();
        this.c.moveTo(5.5, y);
        this.c.lineTo(27.5, y);
        this.c.stroke();
    },
    zigzag: function (wire, y, color) {
        this.c.strokeStyle = wire.nodes[0] ? color : '#000';
        this.c.beginPath();
        this.c.moveTo(5.5, y);
        this.c.lineTo(16.5, y);
        this.c.lineTo(16.5, y + 4);
        this.c.lineTo(27.5, y + 4);
        this.c.stroke();
    },
    fork: function (wire, y, color) {
        this.c.strokeStyle = wire.nodes[1] ? color : '#000';
        this.c.beginPath();
        this.c.moveTo(5.5, y + 4);
        this.c.lineTo(16.5, y + 4);
        this.c.lineTo(16.5, y);
        this.c.lineTo(27.5, y);
        this.c.moveTo(16.5, y + 4);
        this.c.lineTo(16.5, y + 8);
        this.c.lineTo(27.5, y + 8);
        this.c.stroke();
    },
    fork2: function (wire, y, color) {
        this.c.strokeStyle = wire.nodes[0] ? color : '#000';
        this.c.beginPath();
        this.c.moveTo(5.5, y);
        this.c.lineTo(16.5, y);
        this.c.lineTo(16.5, y + 4);
        this.c.stroke();

        this.c.strokeStyle = wire.nodes[2] ? color : '#000';
        this.c.beginPath();
        this.c.moveTo(5.5, y + 8);
        this.c.lineTo(16.5, y + 8);
        this.c.lineTo(16.5, y + 4);
        this.c.stroke();

        this.c.strokeStyle = wire.nodes[0] && wire.nodes[2] ? color : '#000';
        this.c.beginPath();
        this.c.moveTo(16.5, y + 4);
        this.c.lineTo(27.5, y + 4);
        this.c.stroke();
    }
};

Renderer.prototype.onClick = function (x, y) {
    var row = Math.floor((y - 13) / 4);
    if (row < 0 || row >= 12) {
        return;
    }

    if (x >= 6 && x <= 26) {
        this.game.players[0].onRowSelect(row);
    }
    else if (x >= 37 && x <= 57) {
        this.game.players[1].onRowSelect(row);
    }
};
