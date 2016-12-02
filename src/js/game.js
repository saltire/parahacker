class Game {
    constructor(players, timer) {
        this.new = true;
        this.warmupLength = 1500;
        this.gameLength = timer * 2000;
        this.cooldownLength = 1500;

        this.nodeLifetime = 4000;
        this.aiActionCooldown = 100;

        this.players = players.map(player => new Player(this, player));

        this.rowLights = [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1];
        this.topLight = null;
    }

    drawFrame(renderer, ts) {
        if (this.new) {
            this.new = false;
            this.startTs = ts;
        }
        const delta = ts - this.startTs - this.ts;
        this.ts = ts - this.startTs;

        // Set game stage and calculate timer.
        if (this.ts < this.warmupLength) {
            if (!this.stage) {
                this.stage = 'warmup';

                // Play a sound.
                const warmupSound = new Audio('./sounds/warmup.wav');
                warmupSound.play();
            }

            this.timer = this.ts / this.warmupLength;
        }
        else if (this.ts < this.warmupLength + this.gameLength) {
            this.stage = 'game';
            this.timer = (Math.max(this.warmupLength + this.gameLength - this.ts, 0)
                / this.gameLength);

            // Move AI players, if any.
            this.players.forEach((player) => {
                if (player.ai) {
                    player.actionCooldown -= delta;
                    if (player.actionCooldown <= 0) {
                        player.pickAiAction();
                    }
                }
            });
        }
        else if (this.ts < this.warmupLength + this.gameLength + this.cooldownLength) {
            if (this.stage === 'game') {
                this.stage = 'cooldown';
                this.timer = 0;

                // Remove unused nodes from rows.
                this.players.forEach((player) => {
                    player.currentRow = -1;
                });

                // If there is a winner, increment their score.
                if (this.topLight !== null) {
                    this.players[this.topLight].score++;
                }

                // Play a sound.
                const cooldownSound = new Audio('./sounds/cooldown.wav');
                cooldownSound.play();
            }
        }
        else {
            if (this.stage === 'cooldown') {
                this.stage = 'gameover';

                // Remove any remaining active nodes.
                this.players.forEach((player) => {
                    player.removeNodes();
                });

                // Play a sound.
                const deadlockSound = new Audio('./sounds/deadlock.wav');
                deadlockSound.play();
            }
        }

        // Check for expired nodes.
        this.players.forEach((player) => {
            player.checkNodes(delta);
        });

        // Set row light colors.
        for (let row = 0; row < this.rowLights.length; row++) {
            this.updateRowLight(row);
        }
        this.updateTopLight();

        renderer.drawGameFrame(this);
    }

    updateRowLight(row) {
        // Find out we have input from the wires on each side of this light.
        const input = this.players.map((player) => {
            const wire = player.wireAtRow[row];
            const wireRow = row - wire.topRow;

            return wireRow in wire.type.endRows && wire.type.endRows[wireRow]
                .every(startRow => wire.nodes[startRow]);
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
    }

    updateTopLight() {
        const counts = [0, 0];
        this.rowLights.forEach((side) => {
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
    }

    onKeyDown(e) {
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
        else if (e.keyCode === 37 && !this.players[1].ai) {
            // 2 left
            this.players[1].selectRow();
        }
        else if (e.keyCode === 38 && !this.players[1].ai) {
            // 2 up
            this.players[1].move(1);
        }
        else if (e.keyCode === 39) {
            // 2 right
        }
        else if (e.keyCode === 40 && !this.players[1].ai) {
            // 2 down
            this.players[1].move(3);
        }
    }
}


// Player object

class Player {
    constructor(game, opts) {
        this.game = game;
        this.ai = opts.ai;
        this.color = opts.color;
        this.initialNodes = opts.nodes;
        this.nodes = opts.nodes;
        this.score = opts.score;
        this.side = opts.side;
        this.currentRow = -1;
        this.actionCooldown = 0;

        const wirePool = [];
        wireTypes.forEach((wireType) => {
            for (let c = 0; c < (wireType.weight || 1); c++) {
                wirePool.push(wireType);
            }
        });

        this.wires = this.generateWires(wirePool);
        this.wireAtRow = [];
        this.wires.forEach((wire) => {
            for (let i = 0; i < wire.type.rows; i++) {
                this.wireAtRow.push(wire);
            }
        });
    }

    generateWires(wirePool) {
        const wires = [];
        let row = 0;
        let endRows = 0;
        while (row < 12) {
            const wireType = wirePool[Math.floor(Math.random() * wirePool.length)];
            if (row + wireType.rows <= 12) {
                const wire = {
                    side: this.side,
                    topRow: row,
                    type: wireType,
                    nodes: Array(wireType.rows)
                };

                wires.push(wire);
                row += wireType.rows;
                endRows += Object.keys(wireType.endRows).length;
            }
        }

        return endRows < 7 ? this.generateWires(wirePool) : wires;
    }

    checkNodes(delta) {
        this.wires.forEach((wire) => {
            wire.nodes.forEach((node, i) => {
                if (node) {
                    // Subtract elapsed time from the node lifetime, and remove the node if expired.
                    wire.nodes[i] -= delta;
                    if (node <= 0) {
                        wire.nodes[i] = null;
                    }
                }
            });
        });
    }

    removeNodes() {
        this.wires.forEach((wire) => {
            wire.nodes.forEach((node, i) => {
                wire.nodes[i] = null;
            });
        });
    }

    pickAiAction() {
        // Find the number of lights connected to this row, and how many are other player's color.
        let endRows = 0;
        let enemyEndRows = 0;
        let wire;
        let wireRow;
        if (this.currentRow > -1) {
            wire = this.wireAtRow[this.currentRow];
            wireRow = this.currentRow - wire.topRow;
            for (let endRow in wire.type.endRows) {
                if (wire.type.endRows[endRow].indexOf(wireRow) > -1) {
                    endRows++;
                    if (this.game.rowLights[wire.topRow + Number(endRow)] !== this.side) {
                        enemyEndRows++;
                    }
                }
            }
        }

        const actions = [
            {
                // Move up
                action: this.move.bind(this, 1),
                weight: 1
            },
            {
                // Move down
                action: this.move.bind(this, 3),
                weight: 15
            },
            {
                // Use node
                action: this.selectRow.bind(this),
                weight: (!wire || wire.nodes[wireRow]) ? 0 : (1 + endRows + enemyEndRows * 20)
            },
            {
                // Do nothing
                action: () => {},
                weight: 15 - this.initialNodes
            }
        ];

        const actionPool = [];
        actions.forEach((action, j) => {
            for (let i = 0; i < action.weight; i++) {
                actionPool.push(action);
            }
        });
        actionPool[Math.floor(Math.random() * actionPool.length)].action();
        this.actionCooldown = this.game.aiActionCooldown;
    }

    move(dir) {
        // Subtract a node, or abort if the player has none left.
        if (this.currentRow === -1) {
            if (!this.nodes) {
                return;
            }
            this.nodes -= 1;
        }

        let wire;
        let wireRow;
        do {
            // Move the current row up or down.
            if (dir === 3) {
                this.currentRow = (this.currentRow + 1) % 12;
            }
            else if (dir === 1) {
                this.currentRow = (Math.max(this.currentRow, 0) + 11) % 12;
            }

            // Check if there is a wire starting at this row; if not, keep moving.
            wire = this.wireAtRow[this.currentRow];
            wireRow = this.currentRow - wire.topRow;
        }
        while (wire.type.startRows.indexOf(wireRow) === -1);
    }

    selectRow() {
        // Abort if player does not have a row selected.
        if (this.currentRow === -1) {
            return;
        }

        const wire = this.wireAtRow[this.currentRow];
        const wireRow = this.currentRow - wire.topRow;

        // Place a node on the row, or abort if there's already a node on the row.
        if (wire.nodes[wireRow]) {
            return;
        }
        wire.nodes[wireRow] = this.game.nodeLifetime;
        this.currentRow = -1;

        // Play a sound.
        const audio = new Audio('./sounds/blip' + this.side + '.wav');
        audio.play();
    }
}
