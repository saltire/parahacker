var canvas = document.getElementById('game');
var paraHacker = new ParaHacker(Renderer, canvas);

function drawFrame(ts) {
    paraHacker.drawFrame(ts);
    window.requestAnimationFrame(drawFrame);
}
window.requestAnimationFrame(drawFrame);

canvas.focus();
