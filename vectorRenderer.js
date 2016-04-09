var VectorRenderer = function (game, canvas, scale) {
    this.game = game;

    this.canvas = canvas;

    this.scale = scale || 1;
    this.canvas.width = 800 * this.scale;
    this.canvas.height = 600 * this.scale;

    this.c = canvas.getContext('2d');
    this.c.scale(this.scale, this.scale);

    this.c.lineWidth = 4;
    this.c.lineCap = 'square';
    this.c.lineJoin = 'bevel';

    this.background = '#666';
};

VectorRenderer.prototype.drawFrame = function (ts) {
    // Fill canvas with background.
    this.c.fillStyle = this.background;
    this.c.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw lights.
    this.drawTopLight();
    game.rowLights.forEach(this.drawRowLight.bind(this));

    // Draw player sides.
    this.game.players.forEach(this.drawPlayerSide.bind(this));
};

VectorRenderer.prototype.drawTopLight = function () {
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
    this.c.strokeStyle = '#000';
    this.c.fillRect(360, 20, 80, 80);
    this.c.strokeRect(360, 20, 80, 80);
};

VectorRenderer.prototype.drawRowLight = function (side, row) {
    var t = 100 + row * 40;

    this.c.fillStyle = side !== null ? this.game.players[side].color : this.background;
    this.c.strokeStyle = '#000';
    this.c.fillRect(360, t, 80, 40);
    this.c.strokeRect(360, t, 80, 40);
};

VectorRenderer.prototype.drawPlayerSide = function (player) {
    this.c.setTransform((player.side ? -1 : 1) * this.scale, 0, 0, this.scale, player.side ? this.canvas.width : 0, 0);

    // Draw side bar.
    this.c.fillStyle = player.color;
    this.c.strokeStyle = '#000';
    this.c.fillRect(20, 20, 20, 560);
    this.c.strokeRect(20, 20, 20, 560);

    // Draw node area.
    this.c.fillStyle = '#666';
    this.c.fillRect(50, 40, 300, 40);
    for (var i = 0; i < player.nodes; i++) {
        this.drawNode(55 + i * 30, 60, player.color);
    }

    // Draw wires.
    player.wires.forEach(this.drawWire.bind(this, player));

    // Draw current node.
    if (player.currentRow > -1) {
        this.drawNode(55, 120 + (player.currentRow) * 40, player.color);
    }
};

VectorRenderer.prototype.drawNode = function (x, y, color) {
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

VectorRenderer.prototype.drawWire = function (player, wire) {
    this.drawWireType[wire.type.name].call(this, wire, 120 + wire.topRow * 40, player.color);

    // Draw nodes on all the starting rows that have them.
    wire.type.startRows.forEach(function (startRow) {
        if (wire.nodes[startRow]) {
            this.drawNode(75, 120 + (wire.topRow + startRow) * 40, player.color);
        }
    }, this);
};

VectorRenderer.prototype.drawWireType = {
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

VectorRenderer.prototype.onClick = function (x, y) {
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
