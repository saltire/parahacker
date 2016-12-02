class Title {
    constructor(rendererCls, canvas) {
        this.currentOpt = 0;

        this.opts = {
            twoPlayer: false,
            nodes: [5, 5],
            timer: 5
        };

        this.playerColors = [
            ['#f200b6', '#f21400', '#f26500', '#f2a200', '#ffea00'],
            ['#8df200', '#00e500', '#00d5ff', '#0080ff', '#7700e5']
        ];
        this.playerColorIndices = [Math.floor(Math.random() * 5), Math.floor(Math.random() * 5)];
        this.players = [
            {
                color: this.playerColors[0][this.playerColorIndices[0]],
                nodes: this.opts.nodes[0],
                score: 0,
                side: 0
            },
            {
                ai: !this.opts.twoPlayer,
                color: this.playerColors[1][this.playerColorIndices[1]],
                nodes: this.opts.nodes[1],
                score: 0,
                side: 1
            }
        ];

        // Create renderer.
        this.renderer = new rendererCls(canvas);

        // Add event listeners.
        canvas.addEventListener('keydown', this.onKeyDown.bind(this));
    }

    drawFrame(ts) {
        this.renderer.ts = ts;

        // Abort if images haven't loaded yet.
        if (!this.renderer.imagesLoaded) {
            return;
        }

        if (this.options) {
            if (this.options.done) {
                this.options = null;
                this.currentOpt = 0;

                // Set player options.
                this.players[1].ai = !this.opts.twoPlayers;
                this.players.forEach((player, side) => {
                    player.nodes = this.opts.nodes[side];
                });
            }
            else {
                return this.options.drawFrame(this.renderer, ts);
            }
        }

        if (this.game) {
            if (this.game.done) {
                // Sync player scores with the game.
                this.players.forEach((player, i) => {
                    player.score = this.game.players[i].score;
                });
                this.startGame();
            }
            return this.game.drawFrame(this.renderer, ts);
        }

        // Play sound.
        if (!this.titleSound) {
            this.titleSound = new Audio('./sounds/drone.wav');
            this.titleSound.loop = true;
            this.titleSound.play();
        }

        this.renderer.drawTitleFrame(this);
    }

    startOptions() {
        this.renderer.generatePlayerSprites(this.players);
        this.options = new Options(this.opts);
    }

    startGame() {
        // Stop sound.
        if (this.titleSound) {
            this.titleSound.pause();
            this.titleSound = null;
        }

        this.renderer.generatePlayerSprites(this.players);
        this.game = new Game(this.players, this.opts.timer);
    }

    changeOpt() {
        this.currentOpt = 1 - this.currentOpt;

        // Play a sound.
        const selectSound = new Audio('./sounds/select.wav');
        selectSound.play();
    }

    changeColor(side, dir) {
        if (dir === 0) {
            this.playerColorIndices[side] += 4;
        }
        else if (dir === 2) {
            this.playerColorIndices[side] += 1;
        }
        this.playerColorIndices[side] %= 5;
        this.players[side].color = this.playerColors[side][this.playerColorIndices[side]];
    }

    onKeyDown(e) {
        // Disable default function on arrow keys.
        if ([37, 38, 39, 40].indexOf(e.keyCode) > -1) {
            e.preventDefault();
        }

        // Escape (Overrides subscreen key events)
        if (e.keyCode === 27) {
            if (this.game) {
                // End any subscreens.
                this.game = null;

                // Reset player scores.
                this.players.forEach((player) => {
                    player.score = 0;
                });
            }
        }

        // Subscreen key events.
        if (this.options) {
            return this.options.onKeyDown(e);
        }
        if (this.game) {
            return this.game.onKeyDown(e);
        }

        // Title key events.
        if (e.keyCode === 13 || e.keyCode === 32) {
            // Enter/Space
            if (this.currentOpt === 0) {
                this.startGame();
            }
            else if (this.currentOpt === 1) {
                this.startOptions();
            }
        }
        else if (e.keyCode === 87 || e.keyCode === 38 || e.keyCode === 83 || e.keyCode === 40) {
            // up/down
            this.changeOpt();
        }
        else if (e.keyCode === 65) {
            // 1 left
            this.changeColor(0, 0);
        }
        else if (e.keyCode === 68) {
            // 1 right
            this.changeColor(0, 2);
        }
        else if (e.keyCode === 37) {
            // 2 left
            this.changeColor(1, 0);
        }
        else if (e.keyCode === 39) {
            // 2 right
            this.changeColor(1, 2);
        }
    }
}
