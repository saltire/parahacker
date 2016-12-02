const canvas = document.getElementById('game');
const title = new Title(Renderer, canvas);

function drawFrame(ts) {
    title.drawFrame(ts);
    window.requestAnimationFrame(drawFrame);
}
window.requestAnimationFrame(drawFrame);

canvas.focus();
