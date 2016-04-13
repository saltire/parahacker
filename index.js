var canvas = document.getElementById('game');
// var scene = new Game(Renderer, canvas);
var scene = new Title(canvas);

function drawFrame(ts) {
    // scene.drawFrame(ts);
    scene.drawFrame(ts);
    window.requestAnimationFrame(drawFrame);
}
window.requestAnimationFrame(drawFrame);


// Event handlers

canvas.focus();

canvas.addEventListener('keydown', function (e) {
    if (scene.stage === 'done' || e.keyCode === 27) {
        // Reset game
        scene = new Game(Renderer, canvas);
    }
    else if (e.keyCode === 65) {
        // 1 left
        scene.onMove(0, 0);
    }
    else if (e.keyCode === 87) {
        // 1 up
        scene.onMove(0, 1);
    }
    else if (e.keyCode === 68) {
        // 1 right
        scene.onMove(0, 2);
    }
    else if (e.keyCode === 83) {
        // 1 down
        scene.onMove(0, 3);
    }
    else if (e.keyCode === 37) {
        // 2 left
        scene.onMove(1, 0);
    }
    else if (e.keyCode === 38) {
        // 2 up
        scene.onMove(1, 1);
    }
    else if (e.keyCode === 39) {
        // 2 right
        scene.onMove(1, 2);
    }
    else if (e.keyCode === 40) {
        // 2 down
        scene.onMove(1, 3);
    }
});
