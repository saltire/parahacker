var PixelRenderer = function (game, canvas, scale) {
    this.game = game;

    this.canvas = canvas;

    this.scale = scale || 1;
    this.canvas.width = 64 * this.scale;
    this.canvas.height = 64 * this.scale;

    this.c = canvas.getContext('2d');
    this.c.scale(this.scale, this.scale);

    this.c.lineWidth = 1;
    this.c.lineCap = 'square';
    this.c.lineJoin = 'miter';

    this.background = '#666';

    this.ready = false;
    this.frame = new Image();
    this.frame.src = './frame.png';
    this.frame.onload = this.imageLoaded.bind(this);
};

PixelRenderer.prototype.imageLoaded = function () {
    this.ready = true;
};

PixelRenderer.prototype.drawFrame = function (ts) {
    if (!this.ready) {
        return;
    }

    // Fill canvas with background.
    this.c.fillStyle = this.background;
    this.c.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw frame image.
    this.c.imageSmoothingEnabled = false;
    this.c.mozImageSmoothingEnabled = false;
    this.c.drawImage(this.frame, 0, 0);

    // Draw lights.
    this.drawTopLight();
    game.rowLights.forEach(this.drawRowLight.bind(this));

    // Draw player sides.
    this.game.players.forEach(this.drawPlayerSide.bind(this));
};

PixelRenderer.prototype.drawTopLight = function () {
    var counts = [0, 0];
    this.game.rowLights.forEach(function (side) {
        if (side !== null) {
            counts[side] += 1;
        }
    });

    if (counts[0] > counts[1]) {
        this.c.fillStyle = this.game.players[0].color;
    }
    else if (counts[0] < counts[1]) {
        this.c.fillStyle = this.game.players[1].color;
    }
    else {
        this.c.fillStyle = '#000';
    }

    this.c.fillRect(28, 4, 8, 8);
};

PixelRenderer.prototype.drawRowLight = function (side, row) {
    var t = 13 + row * 4;
    this.c.fillStyle = side !== null ? this.game.players[side].color : this.background;
    this.c.fillRect(28, t, 8, 3);
};

PixelRenderer.prototype.drawPlayerSide = function (player) {
    this.c.setTransform((player.side ? -1 : 1) * this.scale, 0, 0, this.scale, player.side ? this.canvas.width : 0, 0);

    // Draw side bar.
    this.c.fillStyle = player.color;
    this.c.fillRect(3, 4, 2, 56);

    // Draw node area.
    this.c.fillStyle = '#666';
    this.c.fillRect(6, 5, 21, 3);
    for (var i = 0; i < player.nodes; i++) {
        this.drawNode(7.5 + i * 4, 6.5, player.color);
    }

    player.wires.forEach(this.drawWire.bind(this, player));
};

PixelRenderer.prototype.drawNode = function (x, y, color) {
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

PixelRenderer.prototype.drawWire = function (player, wire) {
    this.drawWireType[wire.type.name].call(this, wire, 14.5 + wire.row * 4, player.color);

    // Draw nodes on all the starting rows that have them.
    wire.type.startRows.forEach(function (startRow) {
        if (wire.nodes[startRow]) {
            this.drawNode(7, 14.5 + (wire.row + startRow) * 4, player.color);
        }
    }, this);
};

PixelRenderer.prototype.drawWireType = {
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

PixelRenderer.prototype.onClick = function (x, y) {
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
