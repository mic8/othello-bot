class Game {
    constructor($, canvas) {
        this.$ = $;
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
        this.SIZE = 8;
        this.EMPTY = 0;
        this.BLACK = 1;
        this.WHITE = 2;
        this.list = [];
        this.items = [];
        this.moves = [];
        this.end = false;
        this.score = {
            white: 0,
            black: 0
        };
    }

    drawChips(x, y, color) {
        if (color === this.EMPTY) return;

        this.ctx.beginPath();
        if (color === this.BLACK) this.ctx.fillStyle = 'black';
        else if (color === this.WHITE) this.ctx.fillStyle = 'white';
        this.ctx.arc(x * this.canvas.width / this.SIZE + this.canvas.width / this.SIZE / 2, y * this.canvas.height / this.SIZE + this.canvas.height / this.SIZE / 2, this.canvas.width / this.SIZE / 2 - 4, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.closePath();
    }

    drawBoards() {
        for (let i = 0; i < this.SIZE; i++) {
            for (let j = 0; j < this.SIZE; j++) {
                this.ctx.beginPath();
                this.ctx.strokeStyle = 'black';
                this.ctx.rect(j * this.canvas.width / this.SIZE, i * this.canvas.height / this.SIZE, this.canvas.width / this.SIZE, this.canvas.height / this.SIZE);
                this.ctx.stroke();
                this.ctx.closePath();
                this.drawChips(j, i, this.boards[i][j]);
            }
        }
    }

    resetMoves() {
        for (let i = 0; i < this.SIZE; i++) {
            for (let j = 0; j < this.SIZE; j++) {
                this.moves[i][j] = this.boards[i][j];
            }
        }
    }

    move(x, y) {
        if (this.moves[y][x] !== this.EMPTY || this.chipState !== this.BLACK) return;

        this.moves[y][x] = this.chipState;

        if (this.algorithm(x, y, this.chipState)) {
            this.items.unshift({x: x, y: y, color: this.chipState});
            this.chipState = this.chipState % 2 + 1;
            this.list.push(this.items);
            this.update();
            this.checkGameState();
            setTimeout(() => {
                this.aiMove();
            }, 2000);
        } else {
            this.moves[y][x] = this.EMPTY;
        }
    }

    aiMove() {
        if (this.chipState !== this.WHITE) return;

        for (let i = 0; i < this.SIZE; i++) {
            for (let j = 0; j < this.SIZE; j++) {
                if (this.moves[i][j] === this.EMPTY) {
                    this.moves[i][j] = this.chipState;

                    if (this.algorithm(j, i, this.chipState)) {
                        this.items.unshift({x: j, y: i, color: this.chipState});
                        this.list.push(this.items);
                        this.items = [];
                        this.resetMoves();
                    } else {
                        this.moves[i][j] = this.EMPTY;
                    }
                }
            }
        }

        let sorted = this.list.sort((a, b) => {
            return a.length < b.length;
        });

        if (sorted.length >= 0) {
            this.update(sorted[0]);
            this.chipState = this.chipState % 2 + 1;
            this.checkGameState();
        }
    }

    update(sorted) {
        if (this.list.length <= 0) return;

        if (!sorted) {
            let sort = this.list.sort((a, b) => {
                return a.length < b.length;
            });

            sort[0].forEach((item) => {
                this.boards[item.y][item.x] = item.color;
            });
        } else {
            sorted.forEach((item) => {
                this.boards[item.y][item.x] = item.color;
            })
        }

        this.resetMoves();

        this.list = [];
        this.items = [];
    }

    isPlayable() {
        let list = [];

        for (let i = 0; i < this.SIZE; i++) {
            for (let j = 0; j < this.SIZE; j++) {
                if (this.moves[i][j] === this.EMPTY) {
                    this.moves[i][j] = this.chipState;
                    if (this.algorithm(j, i, this.chipState, true)) {
                        list.push(true);
                        for (let i = 0; i < this.SIZE; i++) {
                            for (let j = 0; j < this.SIZE; j++) {
                                this.moves[i][j] = this.boards[i][j];
                            }
                        }
                    } else {
                        this.moves[i][j] = this.EMPTY;
                    }
                }
            }
        }

        if (list.length > 0) {
            return true;
        }

        return false;
    }

    checkGameState() {
        let black = 0, white = 0;

        for (let i = 0; i < this.SIZE; i++) {
            for (let j = 0; j < this.SIZE; j++) {
                if (this.boards[i][j] === this.BLACK) black++;
                else if (this.boards[i][j] === this.WHITE) white++;
            }
        }

        this.score.white = white;
        this.score.black = black;

        if (black === 0 || white === 0 || black + white === this.SIZE * this.SIZE || this.end) {
            if (black > white) alert('Black Win');
            else alert('White Win');

            this.init();
        }
    }

    algorithm(x, y, color, onlyCheck) {
        let explored = false;

        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if ((i === 0 && j === 0) || x + j < 0 || x + j >= this.SIZE || y + i < 0 || y + i >= this.SIZE || this.moves[y + i][x + j] === color) continue;
                if (this.explore(x, y, i, j, color, onlyCheck)) explored = true;
            }
        }

        return explored;
    }

    explore(x, y, i, j, color, onlyCheck) {
        let sx = x,
            sy = y;

        while (this.moves[y][x] !== this.EMPTY) {
            if (x + j < 0 || x + j >= this.SIZE || y + i < 0 || y + i >= this.SIZE) break;
            x += j;
            y += i;
            if (this.moves[y][x] === color) {
                while (true) {
                    x -= j;
                    y -= i;
                    if (x === sx && y === sy) break;
                    this.moves[y][x] = color;
                    if (!onlyCheck) this.items.unshift({x: x, y: y, color: color});
                }
                return true;
            }
        }

        return false;
    }

    handle(e) {
        let x = Math.floor(e.offsetX / (this.canvas.width / this.SIZE)),
            y = Math.floor(e.offsetY / (this.canvas.height / this.SIZE));

        this.move(x, y);
    }

    init() {
        this.end = false;
        this.boards = [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, this.WHITE, this.BLACK, 0, 0, 0],
            [0, 0, 0, this.BLACK, this.WHITE, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ];
        this.moves = [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, this.WHITE, this.BLACK, 0, 0, 0],
            [0, 0, 0, this.BLACK, this.WHITE, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ];
        this.chipState = this.BLACK;
    }

    endGame() {
        alert('No moves available');
        this.checkGameState();
        this.end = true;
    }

    drawState() {
        let $ = this.$;

        $('#turn').innerHTML = this.chipState == this.BLACK ? 'Black' : 'White';
        $('#white').innerHTML = this.score.white;
        $('#black').innerHTML = this.score.black;
    }

    draw() {
        if (this.end) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (!this.isPlayable()) this.endGame();
        this.drawBoards();

        this.drawState();

        requestAnimationFrame(this.draw.bind(this));
    }
}