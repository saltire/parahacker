// Game object

var Game = function (players) {
    this.new = true;
    this.warmupLength = 1500;
    this.gameLength = 10000;
    this.cooldownLength = 1500;

    this.nodeLifetime = 4000;

    this.players = players.map(function (player) {
        return new Player(this, player);
    }, this);

    this.rowLights = [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1];
    this.topLight = null;
};

Game.prototype.drawFrame = function (renderer, ts) {
    if (this.new) {
        renderer.generatePlayerSprites(this.players);

        this.new = false;
        this.startTs = ts;
    }
    var delta = ts - this.startTs - this.ts;
    this.ts = ts - this.startTs;

    // Set game stage and calculate timer.
    if (this.ts < this.warmupLength) {
        this.stage = 'warmup';
        this.timer = this.ts / this.warmupLength;
    }
    else if (this.ts < this.warmupLength + this.gameLength) {
        this.stage = 'game';
        this.timer = Math.max(this.warmupLength + this.gameLength - this.ts, 0) / this.gameLength;
    }
    else if (this.ts < this.warmupLength + this.gameLength + this.cooldownLength) {
        this.stage = 'cooldown';
        this.timer = 0;
        this.players.forEach(function (player) {
            player.currentRow = -1;
        });
    }
    else {
        this.stage = 'gameover';
    }

    // Check for expired nodes.
    this.players.forEach(function (player) {
        player.checkNodes(delta);
    }, this);

    // Set row light colors.
    for (var row = 0; row < this.rowLights.length; row++) {
        this.updateRowLight(row);
    }
    this.updateTopLight();

    // If there is a winner, increment their score.
    if (this.stage === 'cooldown' && !this.addedScore) {
        this.addedScore = true;
        if (this.topLight !== null) {
            this.players[this.topLight].score++;
        }
    }

    renderer.drawGameFrame(this);
};

Game.prototype.updateRowLight = function (row) {
    // Find out we have input from the wires on each side of this light.
    var input = this.players.map(function (player) {
        var wire = player.wireAtRow[row];
        var wireRow = row - wire.topRow;

        return wireRow in wire.type.endRows && wire.type.endRows[wireRow].every(function (startRow) {
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

Game.prototype.updateTopLight = function () {
    var counts = [0, 0];
    this.rowLights.forEach(function (side) {
        if (side !== null) {
            counts[side] += 1;
        }
    });

    if (counts[0] > counts[1]) {
        this.topLight = 0;
    }
    else if (counts[0] < counts[1]) {
        this.topLight = 1;
    }
    else {
        this.topLight = null;
    }
};

Game.prototype.onKeyDown = function (e) {
    if (this.stage === 'gameover') {
        // On any key, signal to the title that the game is done.
        this.done = true;
        return;
    }

    // Abort if we are not in the game stage.
    if (this.stage !== 'game') {
        return;
    }

    if (e.keyCode === 65) {
        // 1 left
    }
    else if (e.keyCode === 87) {
        // 1 up
        this.players[0].move(1);
    }
    else if (e.keyCode === 68) {
        // 1 right
        this.players[0].selectRow();
    }
    else if (e.keyCode === 83) {
        // 1 down
        this.players[0].move(3);
    }
    else if (e.keyCode === 37) {
        // 2 left
        this.players[1].selectRow();
    }
    else if (e.keyCode === 38) {
        // 2 up
        this.players[1].move(1);
    }
    else if (e.keyCode === 39) {
        // 2 right
    }
    else if (e.keyCode === 40) {
        // 2 down
        this.players[1].move(3);
    }
};


// Player object

var Player = function (game, opts) {
    this.game = game;
    this.color = opts.color;
    this.nodes = opts.nodes;
    this.score = opts.score;
    this.side = opts.side;
    this.wires = [];
    this.wireAtRow = [];
    this.currentRow = -1;

    var wirePool = [];
    wireTypes.forEach(function (wireType) {
        for (var c = 0; c < (wireType.weight || 1); c++) {
            wirePool.push(wireType);
        }
    });

    var row = 0;
    while (row < 12) {
        var wireType = wirePool[Math.floor(Math.random() * wirePool.length)];
        if (row + wireType.rows <= 12) {
            var wire = {
                side: this.side,
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

Player.prototype.move = function (dir) {
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

Player.prototype.selectRow = function () {
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
    wire.nodes[wireRow] = this.game.nodeLifetime;
    this.currentRow = -1;
};
