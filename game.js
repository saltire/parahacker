var canvas = document.getElementById('game');
canvas.width = 800;
canvas.height = 600;
canvas.addEventListener('click', onClick, false);
document.addEventListener('keydown', onKey, false);

var c = canvas.getContext('2d');

// background
c.fillStyle = '#000';
c.fillRect(0, 0, canvas.width, canvas.height);
c.fillStyle = '#666';
c.fillRect(10, 10, canvas.width - 20, canvas.height - 20);


// set the origin point at centre top
c.translate(canvas.width / 2, 0);

c.lineWidth = 4;
c.lineCap = 'square';
c.strokeStyle = '#000';


// draw top light
c.strokeRect(-40, 20, 80, 80);

// draw centre lights
for (var t = 100; t <= 540; t += 40) {
    c.strokeRect(-40, t, 80, 40);
}

var player1 = {
    side: 0,
    color: '#ffff00',
    nodes: 3,
    wires: [],
    rows: []
};
var player2 = {
    side: 1,
    color: '#ff00ff',
    nodes: 5,
    wires: [],
    rows: []
};

drawSide(player1);
drawSide(player2);

function setDrawSide(player) {
    c.setTransform(player.side ? -1 : 1, 0, 0, 1, canvas.width / 2, 0);
}

function drawSide(player) {
    setDrawSide(player);
    c.fillStyle = player.color;

    // draw side bar
    c.fillRect(-380, 20, 20, 560);
    c.strokeRect(-380, 20, 20, 560);

    // draw nodes
    drawNodeStack(player);

    // draw wires
    player.wires = [];
    var row = 0;
    while (row < 12) {
        var wire = getWire();
        if (row + wire.rows <= 12) {
            player.wires.push(wire);
            for (var i = 0; i < wire.rows; i++) {
                player.rows.push(player.wires.length - 1);
            }
            wire.top = 100 + row * 40;

            drawWire(wire);
            row += wire.rows;
        }
    }
}

function drawNodeStack(player) {
    setDrawSide(player);

    c.fillStyle = '#666';
    c.fillRect(-350, 40, 300, 40);

    c.fillStyle = player.color;
    for (var i = 0; i < player.nodes; i++) {
        drawNode(-345 + i * 30, 60);
    }
}

function drawNode(x, y) {
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x, y - 10);
    c.lineTo(x + 20, y);
    c.lineTo(x, y + 10);
    c.lineTo(x, y);
    c.fill();
    c.stroke();
}

function drawWire(wire, color) {
    c.strokeStyle = wire.hasNode ? color : '#000';
    wire.draw(wire.top);
    c.strokeStyle = '#000';
    if (wire.hasNode) {
        drawNode(-340, wire.top + 20);
    }
}

function getWire() {
    var wires = [
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

    return wires[Math.floor(Math.random() * wires.length)];
}

function onClick(e) {
    var x = e.offsetX;
    var y = e.offsetY;

    if (x < 40 || x >= 360 || y < 100 || y >= 580) {
        return;
    }
    if (!player1.nodes) {
        return;
    }

    var row = Math.floor((y - 100) / 40);
    var wire = player1.wires[player1.rows[row]];

    if (wire.hasNode) {
        return;
    }

    player1.nodes -= 1;
    wire.hasNode = true;

    setDrawSide(player1);
    drawNodeStack(player1);

    c.fillStyle = player1.color;
    drawWire(wire, player1.color);
}

function onKey(e) {
    console.log(e);
}
