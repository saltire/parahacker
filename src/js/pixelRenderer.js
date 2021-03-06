class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.c = canvas.getContext('2d');

        this.hscale = this.canvas.width / 64;
        this.vscale = this.canvas.height / 64;
        this.c.scale(this.hscale, this.vscale);

        this.c.imageSmoothingEnabled = false;
        this.c.mozImageSmoothingEnabled = false;

        this.images = {};
        this.imagesLoaded = false;
        const imageFiles = ['title', 'titleBack', 'player', 'gameBack', 'options', 'optionsBack'];
        for (let img in imageFiles) {
            const image = new Image();
            image.src = './img/' + imageFiles[img] + '.png';
            image.onload = () => {
                this.images[imageFiles[img]] = image;
                if (Object.keys(this.images).length === imageFiles.length) {
                    this.imagesLoaded = true;
                }
            };
        }
    }

    // Title screen

    drawTitleFrame(title) {
        if (!this.titleSprite) {
            this.generateTitleSprites();
        }

        // Draw background.
        this.c.drawImage(this.images.titleBack, 0, 0);

        // Draw title.
        this.drawTitle(title.playerColors, title.playerColorIndices);

        // Draw options.
        this.c.drawImage(this.images.title,
            title.currentOpt === 0 ? 32 : 0, 31, 14, 5, 25, 38, 14, 5);
        this.c.drawImage(this.images.title,
            title.currentOpt === 1 ? 47 : 15, 31, 16, 6, 24, 45, 16, 6);

        // Draw controls.
        this.c.drawImage(this.images.title, 4, 50, 13, 12, 4, 50, 13, 12);
        this.c.drawImage(this.images.title,
            title.opts.twoPlayer ? 47 : 26, 50, 13, 12, 47, 50, 13, 12);

        // Draw color selection.
        this.drawColorSelection(title.playerColors, title.playerColorIndices);
    }

    generateTitleSprites() {
        this.titleOverlay = document.createElement('canvas');
        this.titleOverlay.height = 4 + Math.floor(Math.random() * 6) * 2;
        this.titleOverlay.width = 1;

        this.titleMask = document.createElement('canvas');
        this.titleMask.width = 64;
        this.titleMask.height = 30;
        const titleMaskCtx = this.titleMask.getContext('2d');
        titleMaskCtx.drawImage(this.images.title, 0, 0, 64, 30, 0, 0, 64, 30);
        titleMaskCtx.globalCompositeOperation = 'source-atop';

        this.titleSprite = document.createElement('canvas');
        this.titleSprite.width = 64;
        this.titleSprite.height = 30;
    }

    drawTitle(playerColors, playerColorIndices) {
        // Draw the main title.
        const titleSpriteCtx = this.titleSprite.getContext('2d');
        titleSpriteCtx.globalCompositeOperation = 'source-over';
        titleSpriteCtx.drawImage(this.images.title, 0, 0, 64, 30, 0, 0, 64, 30);

        // Draw title for the overlay mask.
        const overlayCtx = this.titleOverlay.getContext('2d');
        overlayCtx.fillStyle = playerColors[0][playerColorIndices[0]];
        overlayCtx.fillRect(0, 0, 1, this.titleOverlay.height / 2);
        overlayCtx.fillStyle = playerColors[1][playerColorIndices[1]];
        overlayCtx.fillRect(0, this.titleOverlay.height / 2, 1, this.titleOverlay.height / 2);
        const overlayPattern = this.c.createPattern(this.titleOverlay, null);

        // Draw the overlay pattern onto the mask.
        const offset = this.getFrameOffset(100, 10);
        const titleMaskCtx = this.titleMask.getContext('2d');
        titleMaskCtx.fillStyle = overlayPattern;
        titleMaskCtx.translate(0, -offset);
        titleMaskCtx.fillRect(0, 0, 64, 64);
        titleMaskCtx.translate(0, offset);

        // Draw the masked overlay onto the title.
        titleSpriteCtx.globalCompositeOperation = 'overlay';
        titleSpriteCtx.drawImage(this.titleMask, 0, 0);

        // Draw the colored title onto the canvas.
        this.c.drawImage(this.titleSprite, 0, 3);
    }

    drawColorSelection(playerColors, playerColorIndices) {
        playerColors[0].forEach((color, i) => {
            this.c.fillStyle = color;
            this.c.fillRect(3 + i * 3, 62, 3, 1);
            if (playerColorIndices[0] === i) {
                this.c.fillStyle = '#fff';
                this.c.fillRect(3 + i * 3, 63, 3, 1);
            }
        });
        playerColors[1].forEach((color, i) => {
            this.c.fillStyle = color;
            this.c.fillRect(46 + i * 3, 62, 3, 1);
            if (playerColorIndices[1] === i) {
                this.c.fillStyle = '#fff';
                this.c.fillRect(46 + i * 3, 63, 3, 1);
            }
        });
    }

    // Options screen

    drawOptionsFrame(options) {
        // Fill canvas with background.
        this.c.drawImage(this.images.optionsBack, 0, 0);

        // Create canvas for selected elements.
        if (!this.selectedOptions) {
            this.generateSelectedOptionsSprite();
        }

        // Draw players option.
        this.c.drawImage(options.currentOpt === 0 ? this.selectedOptions : this.images.options,
            8, 8, 34, 7, 8, 8, 34, 7);
        this.c.drawImage(options.currentOpt === 0 ? this.selectedOptions : this.images.options,
            options.opts.twoPlayer ? 52 : 47, 8, 4, 7, 52, 8, 4, 7);

        // Draw nodes option.
        this.c.drawImage(options.currentOpt === 1 ? this.selectedOptions : this.images.options,
            8, 22, 24, 7, 8, 22, 24, 7);
        options.opts.nodes.forEach((nodes, side) => {
            for (let i = 0; i < nodes; i++) {
                this.drawNode(8 + i * 4, 31 + side * 5, side);
            }
        });

        // Draw timer option.
        this.c.drawImage(options.currentOpt === 2 ? this.selectedOptions : this.images.options,
            8, 44, 23, 7, 8, 44, 23, 7);
        const timerWidth = options.opts.timer * 5 - 2;
        this.c.drawImage(options.currentOpt === 2 ? this.selectedOptions : this.images.options,
            8, 53, timerWidth, 3, 8, 53, timerWidth, 3);
    }

    generateSelectedOptionsSprite() {
        // Create mask and fill with color.
        const selectedMask = document.createElement('canvas');
        selectedMask.width = 64;
        selectedMask.height = 64;
        const selectedMaskCtx = selectedMask.getContext('2d');
        selectedMaskCtx.drawImage(this.images.options, 0, 0);
        selectedMaskCtx.globalCompositeOperation = 'source-atop';
        selectedMaskCtx.fillStyle = '#d5ff00';
        selectedMaskCtx.fillRect(0, 0, 64, 64);

        // Create sprite and apply masked color.
        this.selectedOptions = document.createElement('canvas');
        this.selectedOptions.width = 64;
        this.selectedOptions.height = 64;
        const selectedCtx = this.selectedOptions.getContext('2d');
        selectedCtx.drawImage(this.images.options, 0, 0);
        selectedCtx.globalCompositeOperation = 'color';
        selectedCtx.drawImage(selectedMask, 0, 0);
    }

    // Game screen

    drawGameFrame(game) {
        // Fill canvas with background.
        this.c.drawImage(this.images.gameBack, 0, 0);

        // Draw timer.
        this.drawTimer(game);

        // Draw lights.
        this.drawTopLight(game.topLight);
        game.rowLights.forEach(this.drawRowLight.bind(this));

        // Draw player sides.
        game.players.forEach(this.drawPlayerSide.bind(this));

        // Draw game over screen.
        if (game.stage === 'gameover') {
            this.drawGameoverScreen(game.topLight, game.players);
        }
    }

    generatePlayerSprites(players) {
        this.playerSprites = players.map((player) => {
            // Create a canvas with the player color, masked to the sprite.
            const playerMask = document.createElement('canvas');
            playerMask.width = this.images.player.width;
            playerMask.height = this.images.player.height;
            const maskCtx = playerMask.getContext('2d');
            maskCtx.drawImage(this.images.player, 0, 0);
            maskCtx.fillStyle = player.color;
            maskCtx.globalCompositeOperation = 'source-atop';
            maskCtx.fillRect(0, 0, playerMask.width, playerMask.height);

            // Create a sprite canvas for the player and overlay the masked color canvas onto it.
            const playerSprite = document.createElement('canvas');
            playerSprite.width = this.images.player.width;
            playerSprite.height = this.images.player.height;
            const spriteCtx = playerSprite.getContext('2d');
            spriteCtx.drawImage(this.images.player, 0, 0);
            spriteCtx.globalCompositeOperation = 'overlay';
            spriteCtx.drawImage(playerMask, 0, 0);

            return playerSprite;
        });

        this.playerGradients = players.map((player, i) => {
            // Create a gradient pattern for active wires.
            const gradCanvas = document.createElement('canvas');
            gradCanvas.width = 5;
            gradCanvas.height = 1;
            const gradCtx = gradCanvas.getContext('2d');
            gradCtx.drawImage(this.playerSprites[i], 6, 7, 5, 1, 0, 0, 5, 1);
            return this.c.createPattern(gradCanvas, null);
        });

        this.gameoverSprite = null;
        this.gameoverMask = document.createElement('canvas');
        this.gameoverMask.width = 64;
        this.gameoverMask.height = 64;
        const gameoverMaskCtx = this.gameoverMask.getContext('2d');
        gameoverMaskCtx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        gameoverMaskCtx.fillRect(0, 0, 64, 64);
    }

    drawTimer(game) {
        // Draw timer background.
        this.c.fillStyle = '#000';
        this.c.fillRect(0, 0, 64, 1);
        this.c.fillRect(0, 63, 64, 1);

        if (game.stage === 'warmup' || game.stage === 'game') {
            // Fill a percentage of the timer bar.
            const timerLength = 32 * game.timer;
            let timerLengthInt = Math.ceil(32 * game.timer);
            const frame = Math.floor((timerLengthInt - timerLength) * 5);
            this.c.fillStyle = '#fff';
            this.c.globalAlpha = 1 - frame / 5;
            this.c.fillRect(32 - timerLengthInt, 0, timerLengthInt * 2, 1);
            this.c.fillRect(32 - timerLengthInt, 63, timerLengthInt * 2, 1);
            timerLengthInt -= 1;
            this.c.globalAlpha = 1;
            this.c.fillRect(32 - timerLengthInt, 0, timerLengthInt * 2, 1);
            this.c.fillRect(32 - timerLengthInt, 63, timerLengthInt * 2, 1);
        }
        else if (game.topLight !== null) {
            // Fill the timer bar with the color of the winning player.
            this.c.fillStyle = game.players[game.topLight].color;
            this.c.fillRect(0, 0, 64, 1);
            this.c.fillRect(0, 63, 64, 1);
        }
    }

    drawTopLight(side) {
        if (side === null) {
            this.c.drawImage(this.images.player, 6, 10, 10, 10, 27, 3, 10, 10);
        }
        else {
            this.c.drawImage(this.playerSprites[side], 6, 21, 10, 10, 27, 3, 10, 10);
        }
    }

    drawRowLight(side, row) {
        this.c.drawImage(this.playerSprites[side], 6, 31, 10, 4, 27, 13 + row * 4, 10, 4);
    }

    drawGameoverScreen(side, players) {
        this.c.fillStyle = '#000';
        this.c.fillRect(3, 14, 58, 1);
        this.c.fillRect(3, 58, 58, 1);
        this.c.fillStyle = '#080808';
        this.c.fillRect(3, 15, 58, 1);
        this.c.fillRect(3, 57, 58, 1);
        this.c.globalAlpha = 0.95;
        this.c.fillStyle = '#0f0f0f';
        this.c.fillRect(3, 16, 58, 41)
        this.c.globalAlpha = 1;

        if (!this.gameoverSprite) {
            this.gameoverSprite = document.createElement('canvas');
            this.gameoverSprite.width = 54;
            this.gameoverSprite.height = 15;
        }
        const gameoverCtx = this.gameoverSprite.getContext('2d');

        if (side === null) {
            // Draw deadlock message.
            gameoverCtx.drawImage(this.images.title, 5, 37, 54, 12, 0, 2, 54, 12);
        }
        else {
            // Draw winner message.
            gameoverCtx.drawImage(this.playerSprites[side], 5, 49, 54, 15, 0, 0, 54, 15);
        }

        // Flicker message.
        if (this.getFrameOffset(100, 2)) {
            gameoverCtx.globalCompositeOperation = 'source-atop';
            gameoverCtx.drawImage(this.gameoverMask, 0, 0);
        }

        this.c.drawImage(this.gameoverSprite, 5, 22, 54, 15);

        // Draw scores.
        players.forEach((player) => {
            this.drawNumber(player.side ? 49 : 10, 43, player.score, player.side);
        });
    }

    drawNumber(x, y, number, side) {
        const digits = number.toString();

        if (side) {
            // Right align for second player.
            x -= (digits.length - 1) * 6;
        }

        for (let d = 0; d < digits.length; d++) {
            const digit = digits.slice(d, d + 1);
            this.c.drawImage(this.playerSprites[side], 5 + digit * 6, 37, 5, 9, x + d * 6, y, 5, 9);
        }
    }

    drawPlayerSide(player) {
        // Flip the canvas horizontally if we are drawing player 2's side.
        this.c.setTransform((player.side ? -1 : 1) * this.hscale, 0, 0, this.vscale,
            player.side ? this.canvas.width : 0, 0);

        // Draw side bar.
        this.c.drawImage(this.playerSprites[player.side], 1, 1, 4, 58, 0, 3, 4, 58);

        // Draw node area.
        for (let i = 0; i < player.nodes; i++) {
            this.drawNode(5 + (i % 5) * 4, 5 + Math.floor(i / 5) * 4, player.side);
        }

        // Draw wires.
        player.wires.forEach(this.drawWire.bind(this, player));

        // Draw current node.
        if (player.currentRow > -1) {
            this.drawNode(5, 13 + (player.currentRow) * 4, player.side);
        }

        // Reset transform.
        this.c.setTransform(this.hscale, 0, 0, this.vscale, 0, 0);
    }

    drawNode(x, y, side) {
        this.c.drawImage(this.playerSprites[side], 12, 6, 3, 3, x, y, 3, 3);
    };

    drawWire(player, wire) {
        wire.type.render(wire, this);

        // Draw nodes on all the starting rows that have them.
        wire.type.startRows.forEach((startRow) => {
            if (wire.nodes[startRow]) {
                this.drawNode(8, 13 + (wire.topRow + startRow) * 4, player.side);
            }
        });
    }

    drawWireSegment(wire, col1, col2, wireRow, active) {
        const x1 = 3 + col1 * 6;
        const x2 = 3 + col2 * 6;
        const y = 14 + (wire.topRow + wireRow) * 4;
        const offset = this.getFrameOffset(1000, 5);
        this.c.fillStyle = active ? this.playerGradients[wire.side] : '#000';
        this.c.translate(offset, 0);
        this.c.fillRect(x1 - offset, y, x2 - x1 + 1, 1);
        this.c.translate(-offset, 0);
    }

    drawSplitter(wire, col, wireRow) {
        const x = 3 + col * 6;
        const y = 14 + (wire.topRow + wireRow) * 4;
        this.c.drawImage(this.playerSprites[wire.side], 17, 11, 3, 9, x - 1, y - 4, 3, 9);
    }

    drawDeadEnd(wire, col, wireRow) {
        const x = 3 + col * 6;
        const y = 14 + (wire.topRow + wireRow) * 4;
        this.c.drawImage(this.playerSprites[wire.side], 16, 7, 2, 1, x, y, 2, 1);
    }

    getFrameOffset(period, frameCount) {
        return Math.floor(this.ts % period / period * frameCount);
    }
}
