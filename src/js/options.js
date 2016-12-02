class Options {
    constructor(opts) {
        this.opts = opts;

        this.currentOpt = 0;
    }

    drawFrame(renderer, ts) {
        renderer.drawOptionsFrame(this);
    }

    changeOpt(dir) {
        if (dir === 1) {
            this.currentOpt = (this.currentOpt + 2) % 3;
        }
        else if (dir === 3) {
            this.currentOpt = (this.currentOpt + 1) % 3;
        }

        // Play a sound.
        var selectSound = new Audio('./sounds/select.wav');
        selectSound.play();
    }

    changePlayers() {
        this.opts.twoPlayer = !this.opts.twoPlayer;

        // Play a sound.
        var selectSound = new Audio('./sounds/select2.wav');
        selectSound.play();
    }

    changeNodes(dir, side) {
        if (dir === 0) {
            this.opts.nodes[side] = Math.max(1, this.opts.nodes[side] - 1);
        }
        else if (dir === 2) {
            this.opts.nodes[side] = Math.min(10, this.opts.nodes[side] + 1);
        }

        // Play a sound.
        var selectSound = new Audio('./sounds/select2.wav');
        selectSound.play();
    }

    changeTimer(dir) {
        if (dir === 0) {
            this.opts.timer = Math.max(1, this.opts.timer - 1);
        }
        else if (dir === 2) {
            this.opts.timer = Math.min(10, this.opts.timer + 1);
        }

        // Play a sound.
        var selectSound = new Audio('./sounds/select2.wav');
        selectSound.play();
    }

    onKeyDown(e) {
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
    }
}
