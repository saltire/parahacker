var canvas = document.getElementById('game');
canvas.width = 800;
canvas.height = 600;
canvas.addEventListener('click', onClick, false);

var c = canvas.getContext('2d');
// set origin point at centre top
c.translate(canvas.width / 2, 0);


// Game object

var Game = function () {
    // draw background
    c.fillStyle = '#000';
    c.fillRect(-canvas.width / 2, 0, canvas.width, canvas.height);
    c.fillStyle = '#666';
    c.fillRect(-canvas.width / 2 + 10, 10, canvas.width - 20, canvas.height - 20);

    // set default line properties
    c.lineWidth = 4;
    c.lineCap = 'square';
    c.lineJoin = 'bevel';
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

    // draw top light
    this.drawTopLight();
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

    c.fillRect(-40, 20, 80, 80);
    c.strokeRect(-40, 20, 80, 80);
};

Game.prototype.drawRowLight = function (row) {
    var t = 100 + row * 40;
    c.fillStyle = this.rowLights[row] !== null ? this.players[this.rowLights[row]].color : '#666';
    c.fillRect(-40, t, 80, 40);
    c.strokeRect(-40, t, 80, 40);
};

Game.prototype.setRowLight = function (row, player) {
    this.rowLights[row] = this.players.indexOf(player);
    this.drawRowLight(row);

    this.drawTopLight();
};

Game.prototype.onClick = function (x, y) {
    var row = Math.floor((y - 100) / 40);
    if (row < 0 || row >= 12) {
        return;
    }

    if (x >= 40 && x <= 360) {
        this.players[0].onRowSelect(row);
    }
    else if (x >= 440 && x <= 760) {
        this.players[1].onRowSelect(row);
    }
};


// Player object

var Player = function (game, opts) {
    this.game = game;
    this.side = opts.side;
    this.color = opts.color;
    this.nodes = opts.nodes;
    this.wires = [];
    this.wireAtRow = [];

    this.drawSide();
};

Player.prototype.setDrawSide = function () {
    c.setTransform(this.side ? -1 : 1, 0, 0, 1, canvas.width / 2, 0);
};

Player.prototype.drawSide = function () {
    this.setDrawSide();
    c.fillStyle = this.color;

    // draw side bar
    c.fillRect(-380, 20, 20, 560);
    c.strokeRect(-380, 20, 20, 560);

    // draw nodes
    this.drawNodeStack();

    // draw wires
    var row = 0;
    while (row < 12) {
        var wireType = wireTypes[Math.floor(Math.random() * wireTypes.length)];
        if (row + wireType.rows <= 12) {
            this.wires.push({
                row: row,
                top: 100 + row * 40,
                type: wireType,
                nodes: Array(wireType.rows)
            });

            for (var i = 0; i < wireType.rows; i++) {
                this.wireAtRow.push(this.wires.length - 1);
            }

            row += wireType.rows;
        }
    }

    this.wires.forEach(this.drawWire, this);
};

Player.prototype.drawNodeStack = function () {
    this.setDrawSide();

    c.fillStyle = '#666';
    c.fillRect(-350, 40, 300, 40);

    for (var i = 0; i < this.nodes; i++) {
        this.drawNode(-345 + i * 30, 60);
    }
};

Player.prototype.drawNode = function (x, y) {
    c.fillStyle = this.color;
    c.strokeStyle = '#000';
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x, y - 10);
    c.lineTo(x + 20, y);
    c.lineTo(x, y + 10);
    c.lineTo(x, y);
    c.fill();
    c.stroke();
};

Player.prototype.drawWire = function (wire) {
    wire.type.draw(wire, this.color);

    // Draw nodes on all the starting rows that have them.
    wire.type.startRows.forEach(function (startRow) {
        if (wire.nodes[startRow]) {
            this.drawNode(-340, wire.top + startRow * 40 + 20);
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

    this.setDrawSide();
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


// Generation data

var wireTypes = [
    {
        // Straight
        rows: 1,
        startRows: [0],
        endRows: [0],
        draw: function (wire, color) {
            c.strokeStyle = wire.nodes[0] ? color : '#000';
            c.beginPath();
            c.moveTo(-360, wire.top + 20);
            c.lineTo(-40, wire.top + 20);
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
            c.moveTo(-360, wire.top + 20);
            c.lineTo(-200, wire.top + 20);
            c.lineTo(-200, wire.top + 60);
            c.lineTo(-40, wire.top + 60);
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
            c.moveTo(-360, wire.top + 60);
            c.lineTo(-200, wire.top + 60);
            c.lineTo(-200, wire.top + 20);
            c.lineTo(-40, wire.top + 20);
            c.moveTo(-200, wire.top + 60);
            c.lineTo(-200, wire.top + 100);
            c.lineTo(-40, wire.top + 100);
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
            c.moveTo(-360, wire.top + 20);
            c.lineTo(-200, wire.top + 20);
            c.lineTo(-200, wire.top + 60);
            c.stroke();

            c.strokeStyle = wire.nodes[2] ? color : '#000';
            c.beginPath();
            c.moveTo(-360, wire.top + 100);
            c.lineTo(-200, wire.top + 100);
            c.lineTo(-200, wire.top + 60);
            c.stroke();

            c.strokeStyle = wire.nodes[0] && wire.nodes[2] ? color : '#000';
            c.beginPath();
            c.moveTo(-200, wire.top + 60);
            c.lineTo(-40, wire.top + 60);
            c.stroke();
        }
    }
];


// Initialize

var game = new Game();


// Event handlers

function onClick(e) {
    var x = e.offsetX;
    var y = e.offsetY;

    game.onClick(x, y);
}
