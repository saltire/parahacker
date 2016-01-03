var canvas = document.getElementById('game');
canvas.width = 800;
canvas.height = 600;
canvas.addEventListener('click', onClick, false);
document.addEventListener('keydown', onKey, false);

var c = canvas.getContext('2d');


// Generation data

var wireTypes = [
    {
        rows: 1,
        draw: function (t) {
            c.beginPath();
            c.moveTo(-360, t + 20);
            c.lineTo(-40, t + 20);
            c.stroke();
        }
    },
    {
        rows: 2,
        draw: function (t) {
            c.beginPath();
            c.moveTo(-360, t + 20);
            c.lineTo(-200, t + 20);
            c.lineTo(-200, t + 60);
            c.lineTo(-40, t + 60);
            c.stroke();
        }
    }
];


// Player object

var Player = function (opts) {
    this.side = opts.side;
    this.color = opts.color;
    this.nodes = opts.nodes;
    this.wires = [];
    this.rows = [];

    this.drawSide();
};

Player.prototype.setDrawSide = function () {
    c.setTransform(this.side ? -1 : 1, 0, 0, 1, canvas.width / 2, 0);
};

Player.prototype.drawSide = function () {
    this.setDrawSide();
    c.fillStyle = this.color;

    // draw side bar
    c.fillRect(-380, 20, 20, 560);
    c.strokeRect(-380, 20, 20, 560);

    // draw nodes
    this.drawNodeStack();

    // draw wires
    var row = 0;
    while (row < 12) {
        var wireType = wireTypes[Math.floor(Math.random() * wireTypes.length)];
        if (row + wireType.rows <= 12) {
            this.wires.push({
                top: 100 + row * 40,
                hasNode: false,
                type: wireType
            });

            for (var i = 0; i < wireType.rows; i++) {
                this.rows.push(this.wires.length - 1);
            }

            row += wireType.rows;
        }
    }

    this.wires.forEach(this.drawWire, this);
};

Player.prototype.drawNodeStack = function () {
    this.setDrawSide();

    c.fillStyle = '#666';
    c.fillRect(-350, 40, 300, 40);

    c.fillStyle = this.color;
    for (var i = 0; i < this.nodes; i++) {
        this.drawNode(-345 + i * 30, 60);
    }
};

Player.prototype.drawNode = function (x, y) {
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x, y - 10);
    c.lineTo(x + 20, y);
    c.lineTo(x, y + 10);
    c.lineTo(x, y);
    c.fill();
    c.stroke();
};

Player.prototype.drawWire = function (wire) {
    c.strokeStyle = wire.hasNode ? this.color : '#000';
    wire.type.draw(wire.top);
    c.strokeStyle = '#000';
    if (wire.hasNode) {
        this.drawNode(-340, wire.top + 20);
    }
};

Player.prototype.onRowSelect = function (row) {
    if (!this.nodes) {
        return;
    }

    var wire = this.wires[this.rows[row]];
    if (wire.hasNode) {
        return;
    }
    wire.hasNode = true;
    this.nodes -= 1;

    this.setDrawSide();
    this.drawNodeStack();

    c.fillStyle = this.color;
    this.drawWire(wire);
};


// Initialize

// draw background
c.fillStyle = '#000';
c.fillRect(0, 0, canvas.width, canvas.height);
c.fillStyle = '#666';
c.fillRect(10, 10, canvas.width - 20, canvas.height - 20);

// set default line properties
c.lineWidth = 4;
c.lineCap = 'square';
c.strokeStyle = '#000';

// set origin point at centre top
c.translate(canvas.width / 2, 0);

// draw top light
c.strokeRect(-40, 20, 80, 80);

// draw centre lights
for (var t = 100; t <= 540; t += 40) {
    c.strokeRect(-40, t, 80, 40);
}

// draw player sides
var player1 = new Player({
    side: 0,
    color: '#ffff00',
    nodes: 3
});
var player2 = new Player({
    side: 1,
    color: '#ff00ff',
    nodes: 5
});


// Event handlers

function onClick(e) {
    var x = e.offsetX;
    var y = e.offsetY;

    var row = Math.floor((y - 100) / 40);
    if (row < 0 || row >= 12) {
        return;
    }

    if (x >= 40 && x <= 360) {
        player1.onRowSelect(row);
    }
    else if (x >= 440 && x <= 760) {
        player2.onRowSelect(row);
    }
}

function onKey(e) {
    console.log(e);
}
