var Options = function (opts) {
    this.opts = opts;

    this.currentOpt = 0;
};

Options.prototype.drawFrame = function (renderer, ts) {
    renderer.drawOptionsFrame(this);
};

Options.prototype.changeOpt = function (dir) {
    if (dir === 1) {
        this.currentOpt = (this.currentOpt + 2) % 3;
    }
    else if (dir === 3) {
        this.currentOpt = (this.currentOpt + 1) % 3;
    }
};

Options.prototype.changePlayers = function () {
    this.opts.twoPlayer = !this.opts.twoPlayer;
};

Options.prototype.changeNodes = function (dir, side) {
    if (dir === 0) {
        this.opts.nodes[side] = Math.max(1, this.opts.nodes[side] - 1);
    }
    else if (dir === 2) {
        this.opts.nodes[side] = Math.min(10, this.opts.nodes[side] + 1);
    }
};

Options.prototype.changeTimer = function (dir) {
    if (dir === 0) {
        this.opts.timer = Math.max(1, this.opts.timer - 1);
    }
    else if (dir === 2) {
        this.opts.timer = Math.min(10, this.opts.timer + 1);
    }
};

Options.prototype.onKeyDown = function (e) {
    if (e.keyCode === 13 || e.keyCode === 27 || e.keyCode === 32) {
        // Enter/Esc/Space
        this.done = true;
    }
    if (e.keyCode === 87 || e.keyCode === 38) {
        // up
        this.changeOpt(1);
    }
    else if (e.keyCode === 83 || e.keyCode === 40) {
        // down
        this.changeOpt(3);
    }
    else if (e.keyCode === 65 || e.keyCode === 37) {
        // left
        if (this.currentOpt === 0) {
            this.changePlayers();
        }
        else if (this.currentOpt === 1) {
            this.changeNodes(0, e.keyCode === 65 ? 0 : 1);
        }
        else {
            this.changeTimer(0);
        }
    }
    else if (e.keyCode === 68 || e.keyCode === 39) {
        // right
        if (this.currentOpt === 0) {
            this.changePlayers();
        }
        else if (this.currentOpt === 1) {
            this.changeNodes(2, e.keyCode === 68 ? 0 : 1);
        }
        else {
            this.changeTimer(2);
        }
    }
};
