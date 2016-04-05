var canvas = document.getElementById('game');
var scale = 10;


// Start game loop

var game = new Game();
var renderer = new PixelRenderer(game, canvas, scale);

function drawFrame(ts) {
    renderer.drawFrame(ts);
    window.requestAnimationFrame(drawFrame);
}
window.requestAnimationFrame(drawFrame);


// Event handlers

canvas.addEventListener('click', function (e) {
    renderer.onClick(Math.floor(e.offsetX / scale), Math.floor(e.offsetY / scale));
}, false);
