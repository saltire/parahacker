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
    this.background = '#666';

    // fill canvas with background
    c.fillStyle = this.background;
    c.fillRect(0, 0, canvas.width, canvas.height);

    // draw foreground frame
    var frame = new Image();
    frame.src = './frame.png';
    frame.onload = this.drawGame.bind(this, frame);
};

Game.prototype.drawGame = function (frame) {
    c.scale(scale, scale);
    c.imageSmoothingEnabled = false;
    c.mozImageSmoothingEnabled = false;
    c.drawImage(frame, 0, 0);

    // set default line properties
    c.lineWidth = 1;
    c.lineCap = 'square';
    c.lineJoin = 'miter';
    c.strokeStyle = '#000';

    // draw player sides
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

    // draw row lights
    this.rowLights = [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1];
    for (var i = 0; i < 12; i++) {
        this.drawRowLight(i);
    }
};

Game.prototype.setDrawSide = function (side) {
    c.setTransform((side ? -1 : 1) * scale, 0, 0, scale, side ? canvas.width : 0, 0);
};

Game.prototype.drawTopLight = function () {
    var counts = [0, 0];
    this.rowLights.forEach(function (val) {
        if (val !== null) {
            counts[val] += 1;
        }
    });

    if (counts[0] > counts[1]) {
        c.fillStyle = this.players[0].color;
    }
    else if (counts[0] < counts[1]) {
        c.fillStyle = this.players[1].color;
    }
    else {
        c.fillStyle = '#000';
    }

    c.fillRect(28, 4, 8, 8);
};

Game.prototype.drawRowLight = function (row) {
    var t = 13 + row * 4;
    c.fillStyle = this.rowLights[row] !== null ? this.players[this.rowLights[row]].color : this.background;
    c.fillRect(28, t, 8, 3);
};

Game.prototype.setRowLight = function (row, player) {
    this.rowLights[row] = this.players.indexOf(player);
    this.drawRowLight(row);

    this.drawTopLight();
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


var Player = function (game, opts) {
    this.game = game;
    this.color = opts.color;
    this.nodes = opts.nodes;
    this.side = opts.side;
    this.wires = [];
    this.wireAtRow = [];

    this.drawSide();
};

Player.prototype.drawSide = function () {
    this.game.setDrawSide(this.side);

    // Draw side bar
    c.fillStyle = this.color;
    c.fillRect(3, 4, 2, 56);

    // Draw nodes
    this.drawNodeStack();

    // Draw wires
    var row = 0;
    while (row < 12) {
        var wireType = wireTypes[Math.floor(Math.random() * wireTypes.length)];
        if (row + wireType.rows <= 12) {
            var wire = {
                row: row,
                top: 14.5 + row * 4,
                type: wireType,
                nodes: Array(wireType.rows)
            };

            this.drawWire(wire);
            this.wires.push(wire);

            for (var i = 0; i < wireType.rows; i++) {
                this.wireAtRow.push(this.wires.length - 1);
            }
            row += wireType.rows;
        }
    }
};

Player.prototype.drawNode = function (x, y) {
    c.fillStyle = this.color;
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

Player.prototype.drawNodeStack = function () {
    c.fillStyle = '#666';
    c.fillRect(6, 5, 21, 3);

    for (var i = 0; i < this.nodes; i++) {
        this.drawNode(7.5 + i * 4, 6.5);
    }
};

Player.prototype.drawWire = function (wire) {
    wire.type.draw(wire, this.color);

    // Draw nodes on all the starting rows that have them.
    wire.type.startRows.forEach(function (startRow) {
        if (wire.nodes[startRow]) {
            this.drawNode(7, wire.top + startRow * 4);
        }
    }, this);
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

    this.game.setDrawSide(this.side);
    this.drawNodeStack();

    // If there are nodes on all start rows, update the light at each end row.
    // Works for now, but not necessarily the case for future wire types.
    if (wire.type.startRows.every(function (startRow) {
        return wire.nodes[startRow];
    })) {
        wire.type.endRows.forEach(function (endRow) {
            this.game.setRowLight(wire.row + endRow, this);
        }, this);
    }

    this.drawWire(wire);
};


var wireTypes = [
    {
        // Straight
        rows: 1,
        startRows: [0],
        endRows: [0],
        draw: function (wire, color) {
            c.strokeStyle = wire.nodes[0] ? color : '#000';
            c.beginPath();
            c.moveTo(5.5, wire.top);
            c.lineTo(27.5, wire.top);
            c.stroke();
        }
    },
    {
        // Zig-zag
        rows: 2,
        startRows: [0],
        endRows: [1],
        draw: function (wire, color) {
            c.strokeStyle = wire.nodes[0] ? color : '#000';
            c.beginPath();
            c.moveTo(5.5, wire.top);
            c.lineTo(16.5, wire.top);
            c.lineTo(16.5, wire.top + 4);
            c.lineTo(27.5, wire.top + 4);
            c.stroke();
        }
    },
    {
        // Fork
        rows: 3,
        startRows: [1],
        endRows: [0, 2],
        draw: function (wire, color) {
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
        }
    },
    {
        // Reverse fork
        rows: 3,
        startRows: [0, 2],
        endRows: [1],
        draw: function (wire, color) {
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
    }
];


// Start game

var game = new Game();
