var ParaHacker = function (rendererCls, canvas) {
    this.renderer = new rendererCls(canvas);
    this.title = new Title(canvas);

    // Add event listeners.
    canvas.addEventListener('keydown', this.onKeyDown.bind(this));
};

ParaHacker.prototype.drawFrame = function (ts) {
    this.renderer.ts = ts;

    // Abort if images haven't loaded yet.
    if (!this.renderer.imagesLoaded) {
        return;
    }

    this.title.drawFrame(this.renderer, ts);
};

ParaHacker.prototype.onKeyDown = function (e) {
    if (e.keyCode === 27) {
        this.title = new Title(canvas);
    }
    else {
        this.title.onKeyDown(e);
    }
};
