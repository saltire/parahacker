var scale = 10;


// Canvas and context

var canvas = document.getElementById('game');
canvas.width = 64 * scale;
canvas.height = 64 * scale;

var c = canvas.getContext('2d');


// Event handlers

canvas.addEventListener('click', function (e) {
    game.onClick(Math.floor(e.offsetX / scale), Math.floor(e.offsetY / scale));
}, false);


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

Game.prototype.onClick = function (x, y) {
    var row = Math.floor((y - 13) / 4);
    if (row < 0 || row >= 12) {
        return;
    }

    if (x >= 6 && x <= 26) {
        this.players[0].onRowSelect(row);
    }
    else if (x >= 37 && x <= 57) {
        this.players[1].onRowSelect(row);
    }
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
                top: 14.5 + row * 4,
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

var Renderer = function (game, scale) {
    this.game = game;

    this.scale = scale || 1;
    c.scale(scale, scale);

    c.lineWidth = 1;
    c.lineCap = 'square';
    c.lineJoin = 'miter';

    this.background = '#666';

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

Renderer.prototype.drawTopLight = function () {
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

Renderer.prototype.drawRowLight = function (side, row) {
    var t = 13 + row * 4;
    c.fillStyle = side !== null ? this.game.players[side].color : this.background;
    c.fillRect(28, t, 8, 3);
};

Renderer.prototype.drawPlayerSide = function (player) {
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

Renderer.prototype.drawNode = function (x, y, color) {
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

Renderer.prototype.drawWire = function (player, wire) {
    this.drawWireType[wire.type.name](wire, player.color);

    // Draw nodes on all the starting rows that have them.
    wire.type.startRows.forEach(function (startRow) {
        if (wire.nodes[startRow]) {
            this.drawNode(7, wire.top + startRow * 4, player.color);
        }
    }, this);
};

Renderer.prototype.drawWireType = {
    straight: function (wire, color) {
        c.strokeStyle = wire.nodes[0] ? color : '#000';
        c.beginPath();
        c.moveTo(5.5, wire.top);
        c.lineTo(27.5, wire.top);
        c.stroke();
    },
    zigzag: function (wire, color) {
        c.strokeStyle = wire.nodes[0] ? color : '#000';
        c.beginPath();
        c.moveTo(5.5, wire.top);
        c.lineTo(16.5, wire.top);
        c.lineTo(16.5, wire.top + 4);
        c.lineTo(27.5, wire.top + 4);
        c.stroke();
    },
    fork: function (wire, color) {
        c.strokeStyle = wire.nodes[1] ? color : '#000';
        c.beginPath();
        c.moveTo(5.5, wire.top + 4);
        c.lineTo(16.5, wire.top + 4);
        c.lineTo(16.5, wire.top);
        c.lineTo(27.5, wire.top);
        c.moveTo(16.5, wire.top + 4);
        c.lineTo(16.5, wire.top + 8);
        c.lineTo(27.5, wire.top + 8);
        c.stroke();
    },
    fork2: function (wire, color) {
        c.strokeStyle = wire.nodes[0] ? color : '#000';
        c.beginPath();
        c.moveTo(5.5, wire.top);
        c.lineTo(16.5, wire.top);
        c.lineTo(16.5, wire.top + 4);
        c.stroke();

        c.strokeStyle = wire.nodes[2] ? color : '#000';
        c.beginPath();
        c.moveTo(5.5, wire.top + 8);
        c.lineTo(16.5, wire.top + 8);
        c.lineTo(16.5, wire.top + 4);
        c.stroke();

        c.strokeStyle = wire.nodes[0] && wire.nodes[2] ? color : '#000';
        c.beginPath();
        c.moveTo(16.5, wire.top + 4);
        c.lineTo(27.5, wire.top + 4);
        c.stroke();
    }
};


// Start game loop

var game = new Game();
var renderer = new Renderer(game, scale);

function drawFrame(ts) {
    renderer.drawFrame(ts);
    window.requestAnimationFrame(drawFrame);
}
window.requestAnimationFrame(drawFrame);
