var canvas = document.getElementById('game');
canvas.width = 800;
canvas.height = 600;
var c = canvas.getContext('2d');

// background
c.fillStyle = '#000';
c.fillRect(0, 0, canvas.width, canvas.height);
c.fillStyle = '#666';
c.fillRect(10, 10, canvas.width - 20, canvas.height - 20);


// set the origin point at centre top
c.translate(canvas.width / 2, 0);

c.lineWidth = 4;
c.strokeStyle = '#000';


// draw top light
c.strokeRect(-40, 20, 80, 80);

// draw centre lights
for (var t = 100; t <= 540; t += 40) {
    c.strokeRect(-40, t, 80, 40);
}

drawSide(0, 3);
drawSide(1, 5);

function drawSide(flip, level) {
    c.scale(flip ? -1 : 1, 1);

    c.fillStyle = flip ? '#ff00ff' : '#ffff00';

    // draw side bar
    c.fillRect(-380, 20, 20, 560);
    c.strokeRect(-380, 20, 20, 560);

    // draw nodes
    for (var i = 0; i < level; i++) {
        drawNode(-340 + i * 30, 60);
    }

    // draw wires
    var wires = [];
    var row = 0;
    while (row < 12) {
        var wire = getWire();
        if (row + wire.rows <= 12) {
            wires.push(wire);
            wire.draw(100 + row * 40);
            row += wire.rows;
        }
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
