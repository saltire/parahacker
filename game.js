// Game object

var Game = function (renderer, canvas) {
    this.renderer = new renderer(this, canvas);
    this.ts = 0;

    this.players = [
        new Player({
            side: 0,
            color: '#fbfb00',
            nodes: 3
        }),
        new Player({
            side: 1,
            color: '#e600e6',
            nodes: 5
        })
    ];

    this.rowLights = [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1];
};

Game.prototype.drawFrame = function (ts) {
    var delta = ts - this.ts;
    this.ts = ts;

    // Check for expired nodes.
    this.players.forEach(function (player) {
        player.checkNodes(delta);
    }, this);

    // Set row light colors.
    for (var row = 0; row < this.rowLights.length; row++) {
        this.updateRowLight(row);
    }

    this.renderer.drawFrame(ts);
};

Game.prototype.updateRowLight = function (row) {
    // Find out we have input from the wires on each side of this light.
    var input = this.players.map(function (player) {
        var wire = player.wireAtRow[row];
        var wireRow = row - wire.topRow;

        return wire.type.endRows.indexOf(wireRow) > -1 && wire.type.startRows.every(function (startRow) {
            return wire.nodes[startRow];
        });
    });

    // If there are inputs on both sides, flip the color to create a flicker.
    // Otherwise, set the light's color to the input side.
    if (input[0] && input[1]) {
        this.rowLights[row] = 1 - this.rowLights[row];
    }
    else if (input[0]) {
        this.rowLights[row] = 0;
    }
    else if (input[1]) {
        this.rowLights[row] = 1;
    }
};


// Player object

var Player = function (opts) {
    this.color = opts.color;
    this.nodes = opts.nodes;
    this.side = opts.side;
    this.wires = [];
    this.wireAtRow = [];
    this.currentRow = -1;

    this.nodeLifetime = 4000;

    var row = 0;
    while (row < 12) {
        var wireType = Player.wireTypes[Math.floor(Math.random() * Player.wireTypes.length)];
        if (row + wireType.rows <= 12) {
            var wire = {
                topRow: row,
                type: wireType,
                nodes: Array(wireType.rows)
            };

            this.wires.push(wire);

            for (var i = 0; i < wireType.rows; i++) {
                this.wireAtRow.push(wire);
            }
            row += wireType.rows;
        }
    }
};

Player.prototype.checkNodes = function (delta) {
    this.wires.forEach(function (wire) {
        wire.nodes.forEach(function (node, i) {
            if (node) {
                // Subtract elapsed time from the node lifetime, and remove the node if expired.
                wire.nodes[i] -= delta;
                if (node <= 0) {
                    wire.nodes[i] = null;
                }
            }
        }, this);
    }, this);
};

Player.prototype.onMove = function (dir) {
    // Subtract a node, or abort if the player has none left.
    if (this.currentRow === -1) {
        if (!this.nodes) {
            return;
        }
        this.nodes -= 1;
    }

    do {
        // Move the current row up or down.
        if (dir === 3) {
            this.currentRow = (this.currentRow + 1) % 12;
        }
        else if (dir === 1) {
            this.currentRow = (Math.max(this.currentRow, 0) + 11) % 12;
        }

        // Check if there is a wire starting at this row; if not, keep moving.
        var wire = this.wireAtRow[this.currentRow];
        var wireRow = this.currentRow - wire.topRow;
    }
    while (wire.type.startRows.indexOf(wireRow) === -1);
};

Player.prototype.onRowSelect = function () {
    // Abort if player does not have a row selected.
    if (this.currentRow === -1) {
        return;
    }

    var wire = this.wireAtRow[this.currentRow];
    var wireRow = this.currentRow - wire.topRow;

    // Place a node on the row, or abort if there's already a node on the row.
    if (wire.nodes[wireRow]) {
        return;
    }
    wire.nodes[wireRow] = this.nodeLifetime;
    this.currentRow = -1;
};


// Wire types

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
