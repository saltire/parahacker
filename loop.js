// Canvas and context

var canvas = document.getElementById('game');

// Pixel renderer
var scale = 10;
canvas.width = 64 * scale;
canvas.height = 64 * scale;

// Vector renderer
// var scale = 1;
// canvas.width = 800;
// canvas.height = 600;

var c = canvas.getContext('2d');


// Game object

var Game = function () {
    this.players = [
        new Player(this, {
            side: 0,
            color: '#fbfb00',
            nodes: 3
        }),
        new Player(this, {
            side: 1,
            color: '#e600e6',
            nodes: 5
        })
    ];

    this.rowLights = [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1];
};

Game.prototype.setRowLight = function (row, player) {
    this.rowLights[row] = player.side;
};


// Player object

var Player = function (game, opts) {
    this.game = game;
    this.color = opts.color;
    this.nodes = opts.nodes;
    this.side = opts.side;
    this.wires = [];
    this.wireAtRow = [];

    var row = 0;
    while (row < 12) {
        var wireType = this.wireTypes[Math.floor(Math.random() * this.wireTypes.length)];
        if (row + wireType.rows <= 12) {
            var wire = {
                row: row,
                type: wireType,
                nodes: Array(wireType.rows)
            };

            this.wires.push(wire);

            for (var i = 0; i < wireType.rows; i++) {
                this.wireAtRow.push(this.wires.length - 1);
            }
            row += wireType.rows;
        }
    }
};

Player.prototype.onRowSelect = function (row) {
    // Abort if player is out of nodes.
    if (!this.nodes) {
        return;
    }

    var wire = this.wires[this.wireAtRow[row]];
    var wireRow = row - wire.row;

    // Abort if there's already a node on this row or this isn't a starting row.
    if (wire.nodes[wireRow] || wire.type.startRows.indexOf(wireRow) === -1) {
        return;
    }

    wire.nodes[wireRow] = true;
    this.nodes -= 1;

    // If there are nodes on all start rows, update the light at each end row.
    // Works for now, but not necessarily the case for future wire types.
    if (wire.type.startRows.every(function (startRow) {
        return wire.nodes[startRow];
    })) {
        wire.type.endRows.forEach(function (endRow) {
            this.game.setRowLight(wire.row + endRow, this);
        }, this);
    }
};

Player.prototype.wireTypes = [
    {
        name: 'straight',
        rows: 1,
        startRows: [0],
        endRows: [0]
    },
    {
        name: 'zigzag',
        rows: 2,
        startRows: [0],
        endRows: [1]
    },
    {
        name: 'fork',
        rows: 3,
        startRows: [1],
        endRows: [0, 2]
    },
    {
        name: 'fork2',
        rows: 3,
        startRows: [0, 2],
        endRows: [1]
    }
];


// Renderer object

var PixelRenderer = function (game, scale) {
    this.game = game;

    this.scale = scale || 1;
    c.scale(this.scale, this.scale);

    c.lineWidth = 1;
    c.lineCap = 'square';
    c.lineJoin = 'miter';

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
    c.fillStyle = this.background;
    c.fillRect(0, 0, canvas.width, canvas.height);

    // Draw frame image.
    c.imageSmoothingEnabled = false;
    c.mozImageSmoothingEnabled = false;
    c.drawImage(this.frame, 0, 0);

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
        c.fillStyle = this.game.players[0].color;
    }
    else if (counts[0] < counts[1]) {
        c.fillStyle = this.game.players[1].color;
    }
    else {
        c.fillStyle = '#000';
    }

    c.fillRect(28, 4, 8, 8);
};

PixelRenderer.prototype.drawRowLight = function (side, row) {
    var t = 13 + row * 4;
    c.fillStyle = side !== null ? this.game.players[side].color : this.background;
    c.fillRect(28, t, 8, 3);
};

PixelRenderer.prototype.drawPlayerSide = function (player) {
    c.setTransform((player.side ? -1 : 1) * this.scale, 0, 0, this.scale, player.side ? canvas.width : 0, 0);

    // Draw side bar.
    c.fillStyle = player.color;
    c.fillRect(3, 4, 2, 56);

    // Draw node area.
    c.fillStyle = '#666';
    c.fillRect(6, 5, 21, 3);
    for (var i = 0; i < player.nodes; i++) {
        this.drawNode(7.5 + i * 4, 6.5, player.color);
    }

    player.wires.forEach(this.drawWire.bind(this, player));
};

PixelRenderer.prototype.drawNode = function (x, y, color) {
    c.fillStyle = color;
    c.strokeStyle = '#000';
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x, y - 1);
    c.lineTo(x + 1, y - 1);
    c.lineTo(x + 2, y);
    c.lineTo(x + 1, y + 1);
    c.lineTo(x, y + 1);
    c.lineTo(x, y);
    c.fill();
    c.stroke();
};

PixelRenderer.prototype.drawWire = function (player, wire) {
    this.drawWireType[wire.type.name](wire, 14.5 + wire.row * 4, player.color);

    // Draw nodes on all the starting rows that have them.
    wire.type.startRows.forEach(function (startRow) {
        if (wire.nodes[startRow]) {
            this.drawNode(7, 14.5 + (wire.row + startRow) * 4, player.color);
        }
    }, this);
};

PixelRenderer.prototype.drawWireType = {
    straight: function (wire, y, color) {
        c.strokeStyle = wire.nodes[0] ? color : '#000';
        c.beginPath();
        c.moveTo(5.5, y);
        c.lineTo(27.5, y);
        c.stroke();
    },
    zigzag: function (wire, y, color) {
        c.strokeStyle = wire.nodes[0] ? color : '#000';
        c.beginPath();
        c.moveTo(5.5, y);
        c.lineTo(16.5, y);
        c.lineTo(16.5, y + 4);
        c.lineTo(27.5, y + 4);
        c.stroke();
    },
    fork: function (wire, y, color) {
        c.strokeStyle = wire.nodes[1] ? color : '#000';
        c.beginPath();
        c.moveTo(5.5, y + 4);
        c.lineTo(16.5, y + 4);
        c.lineTo(16.5, y);
        c.lineTo(27.5, y);
        c.moveTo(16.5, y + 4);
        c.lineTo(16.5, y + 8);
        c.lineTo(27.5, y + 8);
        c.stroke();
    },
    fork2: function (wire, y, color) {
        c.strokeStyle = wire.nodes[0] ? color : '#000';
        c.beginPath();
        c.moveTo(5.5, y);
        c.lineTo(16.5, y);
        c.lineTo(16.5, y + 4);
        c.stroke();

        c.strokeStyle = wire.nodes[2] ? color : '#000';
        c.beginPath();
        c.moveTo(5.5, y + 8);
        c.lineTo(16.5, y + 8);
        c.lineTo(16.5, y + 4);
        c.stroke();

        c.strokeStyle = wire.nodes[0] && wire.nodes[2] ? color : '#000';
        c.beginPath();
        c.moveTo(16.5, y + 4);
        c.lineTo(27.5, y + 4);
        c.stroke();
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


// Renderer object

var VectorRenderer = function (game, scale) {
    this.game = game;

    this.scale = scale || 1;
    c.scale(this.scale, this.scale);

    c.lineWidth = 4;
    c.lineCap = 'square';
    c.lineJoin = 'bevel';

    this.background = '#666';
};

VectorRenderer.prototype.drawFrame = function (ts) {
    // Fill canvas with background.
    c.fillStyle = this.background;
    c.fillRect(0, 0, canvas.width, canvas.height);

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
        c.fillStyle = this.game.players[0].color;
    }
    else if (counts[0] < counts[1]) {
        c.fillStyle = this.game.players[1].color;
    }
    else {
        c.fillStyle = '#000';
    }
    c.strokeStyle = '#000';
    c.fillRect(360, 20, 80, 80);
    c.strokeRect(360, 20, 80, 80);
};

VectorRenderer.prototype.drawRowLight = function (side, row) {
    var t = 100 + row * 40;

    c.fillStyle = side !== null ? this.game.players[side].color : this.background;
    c.strokeStyle = '#000';
    c.fillRect(360, t, 80, 40);
    c.strokeRect(360, t, 80, 40);
};

VectorRenderer.prototype.drawPlayerSide = function (player) {
    c.setTransform((player.side ? -1 : 1) * this.scale, 0, 0, this.scale, player.side ? canvas.width : 0, 0);

    // Draw side bar.
    c.fillStyle = player.color;
    c.strokeStyle = '#000';
    c.fillRect(20, 20, 20, 560);
    c.strokeRect(20, 20, 20, 560);

    // Draw node area.
    c.fillStyle = '#666';
    c.fillRect(50, 40, 300, 40);
    for (var i = 0; i < player.nodes; i++) {
        this.drawNode(55 + i * 30, 60, player.color);
    }

    player.wires.forEach(this.drawWire.bind(this, player));
};

VectorRenderer.prototype.drawNode = function (x, y, color) {
    c.fillStyle = color;
    c.strokeStyle = '#000';
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x, y - 10);
    c.lineTo(x + 10, y - 10);
    c.lineTo(x + 20, y);
    c.lineTo(x + 10, y + 10);
    c.lineTo(x, y + 10);
    c.lineTo(x, y);
    c.fill();
    c.stroke();
};

VectorRenderer.prototype.drawWire = function (player, wire) {
    this.drawWireType[wire.type.name](wire, 120 + wire.row * 40, player.color);

    // Draw nodes on all the starting rows that have them.
    wire.type.startRows.forEach(function (startRow) {
        if (wire.nodes[startRow]) {
            this.drawNode(60, 120 + (wire.row + startRow) * 40, player.color);
        }
    }, this);
};

VectorRenderer.prototype.drawWireType = {
    straight: function (wire, y, color) {
        c.strokeStyle = wire.nodes[0] ? color : '#000';
        c.beginPath();
        c.moveTo(40, y);
        c.lineTo(360, y);
        c.stroke();
    },
    zigzag: function (wire, y, color) {
        c.strokeStyle = wire.nodes[0] ? color : '#000';
        c.beginPath();
        c.moveTo(40, y);
        c.lineTo(200, y);
        c.lineTo(200, y + 40);
        c.lineTo(360, y + 40);
        c.stroke();
    },
    fork: function (wire, y, color) {
        c.strokeStyle = wire.nodes[1] ? color : '#000';
        c.beginPath();
        c.moveTo(40, y + 40);
        c.lineTo(200, y + 40);
        c.lineTo(200, y);
        c.lineTo(360, y);
        c.moveTo(200, y + 40);
        c.lineTo(200, y + 80);
        c.lineTo(360, y + 80);
        c.stroke();
    },
    fork2: function (wire, y, color) {
        c.strokeStyle = wire.nodes[0] ? color : '#000';
        c.beginPath();
        c.moveTo(40, y);
        c.lineTo(200, y);
        c.lineTo(200, y + 40);
        c.stroke();

        c.strokeStyle = wire.nodes[2] ? color : '#000';
        c.beginPath();
        c.moveTo(40, y + 80);
        c.lineTo(200, y + 80);
        c.lineTo(200, y + 40);
        c.stroke();

        c.strokeStyle = wire.nodes[0] && wire.nodes[2] ? color : '#000';
        c.beginPath();
        c.moveTo(200, y + 40);
        c.lineTo(360, y + 40);
        c.stroke();
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


// Start game loop

var game = new Game();
var renderer = new PixelRenderer(game, scale);
// var renderer = new VectorRenderer(game, scale);

function drawFrame(ts) {
    renderer.drawFrame(ts);
    window.requestAnimationFrame(drawFrame);
}
window.requestAnimationFrame(drawFrame);


// Event handlers

canvas.addEventListener('click', function (e) {
    renderer.onClick(Math.floor(e.offsetX / scale), Math.floor(e.offsetY / scale));
}, false);
