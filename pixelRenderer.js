var Renderer = function (game, canvas) {
    this.game = game;
    this.canvas = canvas;
    this.c = canvas.getContext('2d');

    this.hscale = this.canvas.width / 64;
    this.vscale = this.canvas.height / 64;
    this.c.scale(this.hscale, this.vscale);

    this.c.imageSmoothingEnabled = false;
    this.c.mozImageSmoothingEnabled = false;

    this.sprite = new Image();
    this.sprite.src = './sprite.png';
    this.sprite.onload = this.spriteLoaded.bind(this);
};

Renderer.prototype.spriteLoaded = function () {
    this.playerSprites = this.game.players.map(function (player) {
        // Create a canvas with the player color, masked to the sprite.
        var playerMask = document.createElement('canvas');
        playerMask.width = this.sprite.width;
        playerMask.height = this.sprite.height;
        var maskCtx = playerMask.getContext('2d');
        maskCtx.drawImage(this.sprite, 0, 0);
        maskCtx.fillStyle = player.color;
        maskCtx.globalCompositeOperation = 'source-in';
        maskCtx.fillRect(0, 0, playerMask.width, playerMask.height);

        // Create a sprite canvas for the player and overlay the masked color canvas onto it.
        var playerSprite = document.createElement('canvas');
        playerSprite.width = this.sprite.width;
        playerSprite.height = this.sprite.height;
        var spriteCtx = playerSprite.getContext('2d');
        spriteCtx.drawImage(this.sprite, 0, 0);
        spriteCtx.globalCompositeOperation = 'overlay';
        spriteCtx.drawImage(playerMask, 0, 0);

        return playerSprite;
    }, this);

    this.playerGradients = this.game.players.map(function (player, i) {
        // Create a gradient pattern for active wires.
        var gradCanvas = document.createElement('canvas');
        gradCanvas.width = 5;
        gradCanvas.height = 1;
        var gradCtx = gradCanvas.getContext('2d');
        gradCtx.drawImage(this.playerSprites[i], 6, 7, 5, 1, 0, 0, 5, 1);
        return this.c.createPattern(gradCanvas, null);
    }, this);
};

Renderer.prototype.drawFrame = function () {
    if (!this.playerSprites) {
        return;
    }

    // Fill canvas with background.
    this.c.fillStyle = '#666';
    this.c.fillRect(0, 0, 64, 64);

    // Draw timer.
    this.drawTimer();

    // Draw lights.
    this.drawTopLight();
    game.rowLights.forEach(this.drawRowLight.bind(this));

    // Draw player sides.
    this.game.players.forEach(this.drawPlayerSide.bind(this));
};

Renderer.prototype.drawTimer = function () {
    // Draw timer background.
    this.c.fillStyle = '#000';
    this.c.fillRect(0, 0, 64, 1);
    this.c.fillRect(0, 63, 64, 1);

    var timerLength;
    if (this.game.stage === 'warmup' || this.game.stage === 'game') {
        // Fill a percentage of the timer bar.
        timerLength = Math.round(32 * this.game.timer);
        this.c.fillStyle = '#fff';
        this.c.fillRect(32 - timerLength, 0, timerLength * 2, 1);
        this.c.fillRect(32 - timerLength, 63, timerLength * 2, 1);
    }
    else if (this.game.stage === 'gameover' && this.game.topLight !== null) {
        // Fill the timer bar with the color of the winning player.
        this.c.fillStyle = this.game.players[this.game.topLight].color;
        this.c.fillRect(0, 0, 64, 1);
        this.c.fillRect(0, 63, 64, 1);
    }
};

Renderer.prototype.drawTopLight = function () {
    if (this.game.topLight === null) {
        this.c.drawImage(this.sprite, 6, 10, 10, 10, 27, 3, 10, 10);
    }
    else {
        this.c.drawImage(this.playerSprites[this.game.topLight], 6, 21, 10, 10, 27, 3, 10, 10);
    }
};

Renderer.prototype.drawRowLight = function (side, row) {
    this.c.drawImage(this.playerSprites[side], 6, 31, 10, 4, 27, 13 + row * 4, 10, 4);
};

Renderer.prototype.drawPlayerSide = function (player) {
    this.c.setTransform((player.side ? -1 : 1) * this.hscale, 0, 0, this.vscale, player.side ? this.canvas.width : 0, 0);

    // Draw side bar.
    this.c.drawImage(this.playerSprites[player.side], 1, 1, 4, 58, 0, 3, 4, 58);

    // Draw node area.
    this.c.fillStyle = '#666';
    this.c.fillRect(6, 5, 21, 3);
    for (var i = 0; i < player.nodes; i++) {
        this.drawNode(5 + i * 4, 5, player.side);
    }

    // Draw wires.
    player.wires.forEach(this.drawWire.bind(this, player));

    // Draw current node.
    if (player.currentRow > -1) {
        this.drawNode(5, 13 + (player.currentRow) * 4, player.side);
    }
};

Renderer.prototype.drawNode = function (x, y, side) {
    this.c.drawImage(this.playerSprites[side], 6, 36, 3, 3, x, y, 3, 3);
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
    this.c.drawImage(this.playerSprites[wire.side], 6, 40, 3, 9, x - 1, y - 4, 3, 9);
};

Renderer.prototype.drawDeadEnd = function (wire, col, wireRow) {
    var x = 3 + col * 6;
    var y = 14 + (wire.topRow + wireRow) * 4;
    this.c.drawImage(this.playerSprites[wire.side], 10, 37, 2, 1, x, y, 2, 1);
};

Renderer.prototype.getFrameOffset = function (period, frameCount) {
    return Math.floor(this.game.ts % period / period * frameCount);
};

Renderer.prototype.onClick = function (x, y) {
    var row = Math.floor((y - 13) / 4);
    if (row < 0 || row >= 12) {
        return;
    }

    if (x >= 6 && x <= 26) {
        this.game.players[0].onRowSelect(row);
    }
    else if (x >= 37 && x <= 57) {
        this.game.players[1].onRowSelect(row);
    }
};
