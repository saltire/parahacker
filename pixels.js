var canvas = document.getElementById('game');
canvas.width = 64;
canvas.height = 64;
// canvas.addEventListener('click', onClick, false);

var c = canvas.getContext('2d');


var Game = function () {
    this.background = '#666';

    // fill canvas with background
    c.fillStyle = this.background;
    c.fillRect(0, 0, canvas.width, canvas.height);

    // draw foreground frame
    var frame = new Image();
    frame.src = './frame.png';
    frame.onload = this.drawGame.bind(this, frame);
};

Game.prototype.drawGame = function (frame) {
    c.drawImage(frame, 0, 0);

    // draw player sides
    this.players = [
        new Player(this, {
            side: 0,
            color: '#fbfb00',
            nodes: 3
        }),
        new Player(this, {
            side: 1,
            color: '#e600e6',
            nodes: 5
        })
    ];

    // draw row lights
    this.rowLights = [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1];
    for (var i = 0; i < 12; i++) {
        this.drawRowLight(i);
    }
};

Game.prototype.setDrawSide = function (side) {
    c.setTransform(side ? -1 : 1, 0, 0, 1, side ? canvas.width : 0, 0);
};

Game.prototype.drawRowLight = function (row) {
    var t = 13 + row * 4;
    c.fillStyle = this.rowLights[row] !== null ? this.players[this.rowLights[row]].color : this.background;
    c.fillRect(28, t, 8, 3);
};


var Player = function (game, opts) {
    this.game = game;
    this.color = opts.color;
    this.side = opts.side;

    this.drawSide();
};

Player.prototype.drawSide = function () {
    this.game.setDrawSide(this.side);

    c.fillStyle = this.color;
    c.fillRect(3, 4, 2, 56);
};


var game = new Game();
