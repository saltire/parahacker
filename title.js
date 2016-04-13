var Title = function (canvas) {
    this.playerColors = [
        ['#f200b6', '#f21400', '#f26500', '#f2a200', '#ffea00'],
        ['#8df200', '#00e500', '#00d5ff', '#0080ff', '#7700e5']
    ];
    this.playerColorIndices = [Math.floor(Math.random() * 5), Math.floor(Math.random() * 5)];
};

Title.prototype.drawFrame = function (renderer, ts) {
    if (this.game) {
        if (!this.game.done) {
            return this.game.drawFrame(renderer, ts);
        }
        this.game = null;
    }

    renderer.drawTitleFrame(this);
};

Title.prototype.startGame = function () {
    var colors = this.playerColorIndices.map(function (index, i) {
        return this.playerColors[i][index];
    }, this);
    this.game = new Game(colors);
};

Title.prototype.onMove = function (player, dir) {
    if (dir === 0) {
        this.playerColorIndices[player] += 4;
    }
    else if (dir === 2) {
        this.playerColorIndices[player] += 1;
    }
    this.playerColorIndices[player] %= 5;
};

Title.prototype.onKeyDown = function (e) {
    if (this.game) {
        return this.game.onKeyDown(e);
    }

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
