var Title = function (rendererCls, canvas) {
    this.playerColors = [
        ['#f200b6', '#f21400', '#f26500', '#f2a200', '#ffea00'],
        ['#8df200', '#00e500', '#00d5ff', '#0080ff', '#7700e5']
    ];
    this.playerColorIndices = [Math.floor(Math.random() * 5), Math.floor(Math.random() * 5)];
    this.players = [
        {
            color: this.playerColors[0][this.playerColorIndices[0]],
            nodes: 5,
            score: 0,
            side: 0
        },
        {
            ai: true,
            color: this.playerColors[1][this.playerColorIndices[1]],
            nodes: 5,
            score: 0,
            side: 1
        }
    ];

    // Create renderer.
    this.renderer = new rendererCls(canvas);

    // Add event listeners.
    canvas.addEventListener('keydown', this.onKeyDown.bind(this));
};

Title.prototype.drawFrame = function (ts) {
    this.renderer.ts = ts;

    // Abort if images haven't loaded yet.
    if (!this.renderer.imagesLoaded) {
        return;
    }

    if (this.game) {
        if (this.game.done) {
            // If there is a winner, increment their score.
            if (this.game.topLight !== null) {
                this.players[this.game.topLight].score++;
            }
            this.startGame();
        }
        return this.game.drawFrame(this.renderer, ts);
    }

    this.renderer.drawTitleFrame(this);
};

Title.prototype.startGame = function () {
    this.game = new Game(this.players);
};

Title.prototype.onMove = function (player, dir) {
    if (dir === 0) {
        this.playerColorIndices[player] += 4;
    }
    else if (dir === 2) {
        this.playerColorIndices[player] += 1;
    }
    this.playerColorIndices[player] %= 5;
    this.players[player].color = this.playerColors[player][this.playerColorIndices[player]];
};

Title.prototype.onKeyDown = function (e) {
    // Escape key overrides game key events.
    if (e.keyCode === 27) {
        // End game.
        this.game = null;

        // Reset player scores.
        this.players.forEach(function (player) {
            player.score = 0;
        });
    }

    // Game key events.
    if (this.game) {
        return this.game.onKeyDown(e);
    }

    // Title key events.
    if (e.keyCode === 13) {
        // Enter
        this.startGame();
    }
    else if (e.keyCode === 65) {
        // 1 left
        this.onMove(0, 0);
    }
    else if (e.keyCode === 87) {
        // 1 up
        this.onMove(0, 1);
    }
    else if (e.keyCode === 68) {
        // 1 right
        this.onMove(0, 2);
    }
    else if (e.keyCode === 83) {
        // 1 down
        this.onMove(0, 3);
    }
    else if (e.keyCode === 37) {
        // 2 left
        this.onMove(1, 0);
    }
    else if (e.keyCode === 38) {
        // 2 up
        this.onMove(1, 1);
    }
    else if (e.keyCode === 39) {
        // 2 right
        this.onMove(1, 2);
    }
    else if (e.keyCode === 40) {
        // 2 down
        this.onMove(1, 3);
    }
};
