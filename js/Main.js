let $ = document.querySelector.bind(document),
    canvas = $('canvas'),
    game = null;

window.onload = () => {
    game = new Game($, canvas);
    game.init();
    game.draw();
};

canvas.addEventListener('click', (e) => {
    game.handle(e);
});