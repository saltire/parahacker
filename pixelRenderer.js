var Renderer = function (canvas) {
    this.canvas = canvas;
    this.c = canvas.getContext('2d');

    this.hscale = this.canvas.width / 64;
    this.vscale = this.canvas.height / 64;
    this.c.scale(this.hscale, this.vscale);

    this.c.imageSmoothingEnabled = false;
    this.c.mozImageSmoothingEnabled = false;

    this.images = {};
    this.imagesLoaded = false;
    var imageFiles = ['title', 'titleBack', 'player', 'gameBack'];
    for (var img in imageFiles) {
        var image = new Image();
        image.src = './' + imageFiles[img] + '.png';
        image.onload = function (img, image) {
            this.images[imageFiles[img]] = image;
            if (Object.keys(this.images).length === imageFiles.length) {
                this.imagesLoaded = true;
            }
        }.bind(this, img, image);
    }
};

Renderer.prototype.drawTitleFrame = function (title) {
    if (!this.titleSprite) {
        this.generateTitleSprites();
    }

    // Draw background.
    this.c.drawImage(this.images.titleBack, 0, 0);

    // Draw title.
    this.drawTitle(title.playerColors, title.playerColorIndices);

    // Draw color selection.
    this.drawColorSelection(title.playerColors, title.playerColorIndices);

    // Draw controls.
    this.c.drawImage(this.images.title, 0, 50, 64, 12, 0, 50, 64, 12);
};

Renderer.prototype.generateTitleSprites = function () {
    this.titleOverlay = document.createElement('canvas');
    this.titleOverlay.height = 4 + Math.floor(Math.random() * 6) * 2;
    this.titleOverlay.width = 1;

    this.titleMask = document.createElement('canvas');
    this.titleMask.width = 64;
    this.titleMask.height = 30;
    var titleMaskCtx = this.titleMask.getContext('2d');
    titleMaskCtx.drawImage(this.images.title, 0, 0, 64, 30, 0, 0, 64, 30);
    titleMaskCtx.globalCompositeOperation = 'source-atop';

    this.titleSprite = document.createElement('canvas');
    this.titleSprite.width = 64;
    this.titleSprite.height = 30;
};

Renderer.prototype.drawTitle = function (playerColors, playerColorIndices) {
    // Draw the main title.
    var titleSpriteCtx = this.titleSprite.getContext('2d');
    titleSpriteCtx.globalCompositeOperation = 'source-over';
    titleSpriteCtx.drawImage(this.images.title, 0, 0, 64, 30, 0, 0, 64, 30);

    // Draw title for the overlay mask.
    var overlayCtx = this.titleOverlay.getContext('2d');
    overlayCtx.fillStyle = playerColors[0][playerColorIndices[0]];
    overlayCtx.fillRect(0, 0, 1, this.titleOverlay.height / 2);
    overlayCtx.fillStyle = playerColors[1][playerColorIndices[1]];
    overlayCtx.fillRect(0, this.titleOverlay.height / 2, 1, this.titleOverlay.height / 2);
    var overlayPattern = this.c.createPattern(this.titleOverlay, null);

    // Draw the overlay pattern onto the mask.
    var offset = this.getFrameOffset(100, 10);
    var titleMaskCtx = this.titleMask.getContext('2d');
    titleMaskCtx.fillStyle = overlayPattern;
    titleMaskCtx.translate(0, -offset);
    titleMaskCtx.fillRect(0, 0, 64, 64);
    titleMaskCtx.translate(0, offset);

    // Draw the masked overlay onto the title.
    titleSpriteCtx.globalCompositeOperation = 'overlay';
    titleSpriteCtx.drawImage(this.titleMask, 0, 0);

    // Draw the colored title onto the canvas.
    this.c.drawImage(this.titleSprite, 0, 3);
};

Renderer.prototype.drawColorSelection = function (playerColors, playerColorIndices) {
    playerColors[0].forEach(function (color, i) {
        this.c.fillStyle = color;
        this.c.fillRect(3 + i * 3, 62, 3, 1);
        if (playerColorIndices[0] === i) {
            this.c.fillStyle = '#fff';
            this.c.fillRect(3 + i * 3, 63, 3, 1);
        }
    }, this);
    playerColors[1].forEach(function (color, i) {
        this.c.fillStyle = color;
        this.c.fillRect(46 + i * 3, 62, 3, 1);
        if (playerColorIndices[1] === i) {
            this.c.fillStyle = '#fff';
            this.c.fillRect(46 + i * 3, 63, 3, 1);
        }
    }, this);
};

Renderer.prototype.drawGameFrame = function (game) {
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
};

Renderer.prototype.generatePlayerSprites = function (players) {
    this.playerSprites = players.map(function (player) {
        // Create a canvas with the player color, masked to the sprite.
        var playerMask = document.createElement('canvas');
        playerMask.width = this.images.player.width;
        playerMask.height = this.images.player.height;
        var maskCtx = playerMask.getContext('2d');
        maskCtx.drawImage(this.images.player, 0, 0);
        maskCtx.fillStyle = player.color;
        maskCtx.globalCompositeOperation = 'source-atop';
        maskCtx.fillRect(0, 0, playerMask.width, playerMask.height);

        // Create a sprite canvas for the player and overlay the masked color canvas onto it.
        var playerSprite = document.createElement('canvas');
        playerSprite.width = this.images.player.width;
        playerSprite.height = this.images.player.height;
        var spriteCtx = playerSprite.getContext('2d');
        spriteCtx.drawImage(this.images.player, 0, 0);
        spriteCtx.globalCompositeOperation = 'overlay';
        spriteCtx.drawImage(playerMask, 0, 0);

        return playerSprite;
    }, this);

    this.playerGradients = players.map(function (player, i) {
        // Create a gradient pattern for active wires.
        var gradCanvas = document.createElement('canvas');
        gradCanvas.width = 5;
        gradCanvas.height = 1;
        var gradCtx = gradCanvas.getContext('2d');
        gradCtx.drawImage(this.playerSprites[i], 6, 7, 5, 1, 0, 0, 5, 1);
        return this.c.createPattern(gradCanvas, null);
    }, this);

    this.gameoverSprite = null;
    this.gameoverMask = document.createElement('canvas');
    this.gameoverMask.width = 64;
    this.gameoverMask.height = 64;
    var gameoverMaskCtx = this.gameoverMask.getContext('2d');
    gameoverMaskCtx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    gameoverMaskCtx.fillRect(0, 0, 64, 64);
};

Renderer.prototype.drawTimer = function (game) {
    // Draw timer background.
    this.c.fillStyle = '#000';
    this.c.fillRect(0, 0, 64, 1);
    this.c.fillRect(0, 63, 64, 1);

    if (game.stage === 'warmup' || game.stage === 'game') {
        // Fill a percentage of the timer bar.
        var timerLength = 32 * game.timer;
        var timerLengthInt = Math.ceil(32 * game.timer);
        var frame = Math.floor((timerLengthInt - timerLength) * 5);
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
};

Renderer.prototype.drawTopLight = function (side) {
    if (side === null) {
        this.c.drawImage(this.images.player, 6, 10, 10, 10, 27, 3, 10, 10);
    }
    else {
        this.c.drawImage(this.playerSprites[side], 6, 21, 10, 10, 27, 3, 10, 10);
    }
};

Renderer.prototype.drawRowLight = function (side, row) {
    this.c.drawImage(this.playerSprites[side], 6, 31, 10, 4, 27, 13 + row * 4, 10, 4);
};

Renderer.prototype.drawGameoverScreen = function (side, players) {
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
    var gameoverCtx = this.gameoverSprite.getContext('2d');

    if (side === null) {
        gameoverCtx.drawImage(this.images.title, 5, 35, 54, 15, 0, 0, 54, 15);
    }
    else {
        gameoverCtx.drawImage(this.playerSprites[side], 5, 49, 54, 15, 0, 0, 54, 15);
    }

    if (this.getFrameOffset(100, 2)) {
        gameoverCtx.globalCompositeOperation = 'source-atop';
        gameoverCtx.drawImage(this.gameoverMask, 0, 0);
    }

    this.c.drawImage(this.gameoverSprite, 5, 22, 54, 15);

    players.forEach(function (player) {
        this.drawNumber(player.side ? 49 : 10, 43, player.score, player.side);
    }, this);
};

Renderer.prototype.drawNumber = function (x, y, number, side) {
    var digits = number.toString();

    if (side) {
        // Right align for second player.
        x -= (digits.length - 1) * 6;
    }

    for (var d = 0; d < digits.length; d++) {
        var digit = digits.slice(d, d + 1);
        this.c.drawImage(this.playerSprites[side], 5 + digit * 6, 37, 5, 9, x + d * 6, y, 5, 9);
    }
};

Renderer.prototype.drawPlayerSide = function (player) {
    // Flip the canvas horizontally if we are drawing player 2's side.
    this.c.setTransform((player.side ? -1 : 1) * this.hscale, 0, 0, this.vscale, player.side ? this.canvas.width : 0, 0);

    // Draw side bar.
    this.c.drawImage(this.playerSprites[player.side], 1, 1, 4, 58, 0, 3, 4, 58);

    // Draw node area.
    for (var i = 0; i < player.nodes; i++) {
        this.drawNode(5 + i * 4, 5, player.side);
    }

    // Draw wires.
    player.wires.forEach(this.drawWire.bind(this, player));

    // Draw current node.
    if (player.currentRow > -1) {
        this.drawNode(5, 13 + (player.currentRow) * 4, player.side);
    }

    // Reset transform.
    this.c.setTransform(this.hscale, 0, 0, this.vscale, 0, 0);
};

Renderer.prototype.drawNode = function (x, y, side) {
    this.c.drawImage(this.playerSprites[side], 12, 6, 3, 3, x, y, 3, 3);
};

Renderer.prototype.drawWire = function (player, wire) {
    wire.type.render.call(wire, this);

    // Draw nodes on all the starting rows that have them.
    wire.type.startRows.forEach(function (startRow) {
        if (wire.nodes[startRow]) {
            this.drawNode(8, 13 + (wire.topRow + startRow) * 4, player.side);
        }
    }, this);
};

Renderer.prototype.drawWireSegment = function (wire, col1, col2, wireRow, active) {
    var x1 = 3 + col1 * 6;
    var x2 = 3 + col2 * 6;
    var y = 14 + (wire.topRow + wireRow) * 4;
    var offset = this.getFrameOffset(1000, 5);
    this.c.fillStyle = active ? this.playerGradients[wire.side] : '#000';
    this.c.translate(offset, 0);
    this.c.fillRect(x1 - offset, y, x2 - x1 + 1, 1);
    this.c.translate(-offset, 0);
};

Renderer.prototype.drawSplitter = function (wire, col, wireRow) {
    var x = 3 + col * 6;
    var y = 14 + (wire.topRow + wireRow) * 4;
    this.c.drawImage(this.playerSprites[wire.side], 17, 11, 3, 9, x - 1, y - 4, 3, 9);
};

Renderer.prototype.drawDeadEnd = function (wire, col, wireRow) {
    var x = 3 + col * 6;
    var y = 14 + (wire.topRow + wireRow) * 4;
    this.c.drawImage(this.playerSprites[wire.side], 16, 7, 2, 1, x, y, 2, 1);
};

Renderer.prototype.getFrameOffset = function (period, frameCount) {
    return Math.floor(this.ts % period / period * frameCount);
};
