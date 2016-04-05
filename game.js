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
        var wireType = Player.wireTypes[Math.floor(Math.random() * Player.wireTypes.length)];
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

Player.wireTypes = [
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
