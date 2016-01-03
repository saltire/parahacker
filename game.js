var canvas = document.getElementById('game');
canvas.width = 800;
canvas.height = 600;
var c = canvas.getContext('2d');

c.fillStyle = '#000';
c.fillRect(0, 0, canvas.width, canvas.height);
c.fillStyle = '#666';
c.fillRect(10, 10, canvas.width - 20, canvas.height - 20);


c.translate(canvas.width / 2, 0);

c.lineWidth = 4;
c.strokeStyle = '#000';

c.strokeRect(-40, 20, 80, 80);

drawSide(0);
drawSide(1);

function drawSide(flip) {
    c.scale(flip ? -1 : 1, 1);

    c.fillStyle = flip ? '#ff00ff' : '#ffff00';

    c.fillRect(-380, 20, 20, 560);
    c.strokeRect(-380, 20, 20, 560);

    for (var t = 100; t <= 540; t += 40) {
        c.strokeRect(-40, t, 80, 40);

        c.beginPath();
        c.moveTo(-360, t + 20);
        c.lineTo(-40, t + 20);
        c.stroke();
    }

    for (var i = 0; i < 5; i++) {
        drawTri(-340 + i * 30, 60);
    }
}

function drawTri(x, y) {
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x, y - 10);
    c.lineTo(x + 20, y);
    c.lineTo(x, y + 10);
    c.lineTo(x, y);
    c.fill();
    c.stroke();
}
