var canvas = document.getElementById('game');
var game = new Game(Renderer, canvas);

function drawFrame(ts) {
    game.drawFrame(ts);
    window.requestAnimationFrame(drawFrame);
}
window.requestAnimationFrame(drawFrame);


// Event handlers

canvas.focus();

canvas.addEventListener('keypress', function (e) {
    if (e.charCode === 97) {
        // 1 left
    }
    else if (e.charCode === 119) {
        // 1 up
        game.players[0].onMove(1);
    }
    else if (e.charCode === 100) {
        // 1 right
        game.players[0].onRowSelect();
    }
    else if (e.charCode === 115) {
        // 1 down
        game.players[0].onMove(3);
    }
    else if (e.keyCode === 37) {
        // 2 left
        game.players[1].onRowSelect();
    }
    else if (e.keyCode === 38) {
        // 2 up
        game.players[1].onMove(1);
    }
    else if (e.keyCode === 39) {
        // 2 right
    }
    else if (e.keyCode === 40) {
        // 2 down
        game.players[1].onMove(3);
    }
});
