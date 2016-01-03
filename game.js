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
    this.rows = [];

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
                hasNode: false,
                type: wireType
            });

            for (var i = 0; i < wireType.rows; i++) {
                this.rows.push(this.wires.length - 1);
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

    c.fillStyle = this.color;
    for (var i = 0; i < this.nodes; i++) {
        this.drawNode(-345 + i * 30, 60);
    }
};

Player.prototype.drawNode = function (x, y) {
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
    var t = 100 + wire.row * 40;
    c.strokeStyle = wire.hasNode ? this.color : '#000';

    wire.type.draw(t);
    c.strokeStyle = '#000';
    if (wire.hasNode) {
        this.drawNode(-340, t + wire.type.startRow * 40 + 20);
    }
};

Player.prototype.onRowSelect = function (row) {
    if (!this.nodes) {
        return;
    }

    var wire = this.wires[this.rows[row]];
    if (wire.hasNode) {
        return;
    }
    wire.hasNode = true;
    this.nodes -= 1;

    this.setDrawSide();
    this.drawNodeStack();

    c.fillStyle = this.color;
    this.drawWire(wire);

    var endRow = wire.row + wire.type.endRow;
    this.game.setRowLight(endRow, this);
};


// Generation data

var wireTypes = [
    {
        rows: 1,
        startRow: 0,
        endRow: 0,
        draw: function (t) {
            c.beginPath();
            c.moveTo(-360, t + 20);
            c.lineTo(-40, t + 20);
            c.stroke();
        }
    },
    {
        rows: 2,
        startRow: 0,
        endRow: 1,
        draw: function (t) {
            c.beginPath();
            c.moveTo(-360, t + 20);
            c.lineTo(-200, t + 20);
            c.lineTo(-200, t + 60);
            c.lineTo(-40, t + 60);
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
