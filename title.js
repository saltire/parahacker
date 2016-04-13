var Title = function (canvas) {
    this.new = true;

    this.canvas = canvas;
    this.c = canvas.getContext('2d');

    this.hscale = this.canvas.width / 64;
    this.vscale = this.canvas.height / 64;
    this.c.scale(this.hscale, this.vscale);

    this.c.imageSmoothingEnabled = false;
    this.c.mozImageSmoothingEnabled = false;

    this.playerColors = [
        ['#f21400', '#f26500', '#f2a200', '#f28d00', '#ffea00'],
        ['#8df200', '#00e500', '#00d5ff', '#0080ff', '#7700e5']
    ];
    this.playerColorIndices = [Math.floor(Math.random() * 5), Math.floor(Math.random() * 5)];

    var spritepaths = ['./title.png', './title-back.png'];
    this.sprites = spritepaths.map(function (src) {
        var sprite = new Image();
        sprite.src = src;
        sprite.onload = this.onSpriteLoad.bind(this);
        return sprite;
    }, this);
    this.spritesLoaded = 0;
};

Title.prototype.onSpriteLoad = function () {
    this.spritesLoaded++;
    if (this.spritesLoaded < this.sprites.length) {
        return;
    }

    this.overlay = document.createElement('canvas');
    this.overlay.height = 10;
    this.overlay.width = 1;

    this.spriteMask = document.createElement('canvas');
    this.spriteMask.width = 64;
    this.spriteMask.height = 64;
    var spriteMaskCtx = this.spriteMask.getContext('2d');
    spriteMaskCtx.drawImage(this.sprites[0], 0, 0, 64, 36);
    spriteMaskCtx.globalCompositeOperation = 'source-in';

    this.titleSprite = document.createElement('canvas');
    this.titleSprite.width = 64;
    this.titleSprite.height = 64;
    var titleSpriteCtx = this.titleSprite.getContext('2d');
};

Title.prototype.drawFrame = function (ts) {
    if (this.spritesLoaded < this.sprites.length) {
        return;
    }

    if (this.new) {
        this.new = false;
        this.startTs = ts;
    }
    ts -= this.startTs;
    var delta = ts - this.ts;
    this.ts = ts;

    // Draw background.
    this.c.drawImage(this.sprites[1], 0, 0);

    // Draw the main title.
    var titleSpriteCtx = this.titleSprite.getContext('2d');
    titleSpriteCtx.globalCompositeOperation = 'source-over';
    titleSpriteCtx.drawImage(this.sprites[0], 0, 0, 64, 36);

    // Draw title for the overlay mask.
    var overlayCtx = this.overlay.getContext('2d');
    overlayCtx.fillStyle = this.playerColors[0][this.playerColorIndices[0]];
    overlayCtx.fillRect(0, 0, 1, this.overlay.height / 2);
    overlayCtx.fillStyle = this.playerColors[1][this.playerColorIndices[1]];
    overlayCtx.fillRect(0, this.overlay.height / 2, 1, this.overlay.height / 2);
    var overlayPattern = this.c.createPattern(this.overlay, null);

    // Draw the overlay pattern onto the mask.
    var offset = this.getFrameOffset(100, 10);
    var spriteMaskCtx = this.spriteMask.getContext('2d');
    spriteMaskCtx.fillStyle = overlayPattern;
    spriteMaskCtx.translate(0, -offset);
    spriteMaskCtx.fillRect(0, -10, 64, 64);
    spriteMaskCtx.translate(0, offset);

    // Draw the masked overlay onto the title.
    titleSpriteCtx.globalCompositeOperation = 'overlay';
    titleSpriteCtx.drawImage(this.spriteMask, 0, 0);

    // Draw the colored title onto the canvas.
    this.c.drawImage(this.titleSprite, 0, 0);

    // Draw color selection.
    this.playerColors[0].forEach(function (color, i) {
        this.c.fillStyle = color;
        this.c.fillRect(3 + i * 3, 62, 3, 1);
        if (this.playerColorIndices[0] === i) {
            this.c.fillStyle = '#fff';
            this.c.fillRect(3 + i * 3, 63, 3, 1);
        }
    }, this);
    this.playerColors[1].forEach(function (color, i) {
        this.c.fillStyle = color;
        this.c.fillRect(47 + i * 3, 62, 3, 1);
        if (this.playerColorIndices[1] === i) {
            this.c.fillStyle = '#fff';
            this.c.fillRect(47 + i * 3, 63, 3, 1);
        }
    }, this);
};

Title.prototype.getFrameOffset = function (period, frameCount) {
    return Math.floor(this.ts % period / period * frameCount);
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
