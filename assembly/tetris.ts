// assembly/tetris.ts

// Game constants
const BOARD_WIDTH: i32 = 10;
const BOARD_HEIGHT: i32 = 20;
const BLOCK_SIZE: i32 = 30;

// Tetris pieces (tetrominos)
const PIECES: i32[][][] = [
    // I piece
    [[1, 1, 1, 1]],

    // O piece
    [[1, 1],
    [1, 1]],

    // T piece
    [[0, 1, 0],
    [1, 1, 1]],

    // S piece
    [[0, 1, 1],
    [1, 1, 0]],

    // Z piece
    [[1, 1, 0],
    [0, 1, 1]],

    // J piece
    [[1, 0, 0],
    [1, 1, 1]],

    // L piece
    [[0, 0, 1],
    [1, 1, 1]]
];

// Piece colors
const COLORS: string[] = [
    "#00f0f0", // I - Cyan
    "#f0f000", // O - Yellow
    "#a000f0", // T - Purple
    "#00f000", // S - Green
    "#f00000", // Z - Red
    "#0000f0", // J - Blue
    "#f0a000"  // L - Orange
];

class Piece {
    shape: i32[][];
    x: i32;
    y: i32;
    color: string;
    type: i32;

    constructor(type: i32 = -1) {
        if (type === -1) {
            type = i32(Math.floor(Math.random() * PIECES.length));
        }
        this.type = type;
        this.shape = PIECES[type];
        this.color = COLORS[type];
        this.x = Math.floor((BOARD_WIDTH - this.shape[0].length) / 2) as i32;
        this.y = 0;
    }

    rotate(): i32[][] {
        const newShape: i32[][] = [];
        const rows = this.shape.length;
        const cols = this.shape[0].length;

        for (let i = 0; i < cols; i++) {
            const newRow: i32[] = [];
            for (let j = rows - 1; j >= 0; j--) {
                newRow.push(this.shape[j][i]);
            }
            newShape.push(newRow);
        }

        return newShape;
    }
}

class TetrisGame {
    board: i32[][];
    currentPiece: Piece | null;
    score: i32;
    level: i32;
    lines: i32;
    gameOver: boolean;
    dropCounter: i32;
    lastDrop: f64;

    constructor() {
        this.board = [];
        for (let y = 0; y < BOARD_HEIGHT; y++) {
            const row: i32[] = [];
            for (let x = 0; x < BOARD_WIDTH; x++) {
                row.push(0);
            }
            this.board.push(row);
        }

        this.currentPiece = null;
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameOver = false;
        this.dropCounter = 0;
        this.lastDrop = 0;

        this.spawnPiece();
    }

    spawnPiece(): void {
        this.currentPiece = new Piece();
        if (this.currentPiece !== null) {
            if (this.checkCollision(this.currentPiece.x, this.currentPiece.y, this.currentPiece.shape)) {
                this.gameOver = true;
            }
        }
    }

    checkCollision(pieceX: i32, pieceY: i32, shape: i32[][]): boolean {
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const boardX = pieceX + x;
                    const boardY = pieceY + y;

                    if (boardX < 0 || boardX >= BOARD_WIDTH ||
                        boardY >= BOARD_HEIGHT ||
                        (boardY >= 0 && this.board[boardY][boardX])) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    movePiece(dx: i32, dy: i32): boolean {
        if (this.currentPiece === null) return false;

        const newX = this.currentPiece.x + dx;
        const newY = this.currentPiece.y + dy;

        if (!this.checkCollision(newX, newY, this.currentPiece.shape)) {
            this.currentPiece.x = newX;
            this.currentPiece.y = newY;
            return true;
        }

        return false;
    }

    rotatePiece(): boolean {
        if (this.currentPiece === null) return false;

        const rotatedShape = this.currentPiece.rotate();

        if (!this.checkCollision(this.currentPiece.x, this.currentPiece.y, rotatedShape)) {
            this.currentPiece.shape = rotatedShape;
            return true;
        }

        return false;
    }

    lockPiece(): void {
        if (this.currentPiece === null) return;

        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    const boardY = this.currentPiece.y + y;
                    const boardX = this.currentPiece.x + x;
                    if (boardY >= 0) {
                        this.board[boardY][boardX] = this.currentPiece.type + 1;
                    }
                }
            }
        }

        this.clearLines();
        this.spawnPiece();
    }

    clearLines(): void {
        let linesCleared = 0;

        for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
            let isComplete = true;

            for (let x = 0; x < BOARD_WIDTH; x++) {
                if (!this.board[y][x]) {
                    isComplete = false;
                    break;
                }
            }

            if (isComplete) {
                this.board.splice(y, 1);
                const newRow: i32[] = [];
                for (let x = 0; x < BOARD_WIDTH; x++) {
                    newRow.push(0);
                }
                this.board.unshift(newRow);
                linesCleared++;
                y++; // Check the same row again
            }
        }

        if (linesCleared > 0) {
            this.lines += linesCleared;
            this.score += linesCleared * 100 * this.level;
            this.level = (Math.floor(this.lines / 10) + 1) as i32;
        }
    }

    update(currentTime: f64): void {
        if (this.gameOver) return;

        const dropInterval = (1000 - (this.level - 1) * 50) as f64;

        if (currentTime - this.lastDrop > dropInterval) {
            if (!this.movePiece(0, 1)) {
                this.lockPiece();
            }
            this.lastDrop = currentTime;
        }
    }

    // Hard drop - drop piece to bottom instantly
    hardDrop(): void {
        if (this.currentPiece === null) return;

        while (this.movePiece(0, 1)) {
            this.score += 2; // Score bonus for hard drop
        }
        this.lockPiece();
    }
}

// Global game instance
let gameInstance: TetrisGame | null = null;

// Export functions for JavaScript
export function createGame(): void {
    gameInstance = new TetrisGame();
}

export function updateGame(currentTime: f64): void {
    if (gameInstance === null) return;
    gameInstance.update(currentTime);
}

export function moveLeft(): void {
    if (gameInstance === null) return;
    gameInstance.movePiece(-1, 0);
}

export function moveRight(): void {
    if (gameInstance === null) return;
    gameInstance.movePiece(1, 0);
}

export function moveDown(): void {
    if (gameInstance === null) return;
    gameInstance.movePiece(0, 1);
}

export function rotate(): void {
    if (gameInstance === null) return;
    gameInstance.rotatePiece();
}

export function hardDrop(): void {
    if (gameInstance === null) return;
    gameInstance.hardDrop();
}

export function getBoard(): Int32Array {
    if (gameInstance === null) return new Int32Array(0);

    const board = new Int32Array(BOARD_WIDTH * BOARD_HEIGHT);
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            board[y * BOARD_WIDTH + x] = gameInstance.board[y][x];
        }
    }
    return board;
}

export function getCurrentPiece(): Int32Array {
    if (gameInstance === null || gameInstance.currentPiece === null) {
        return new Int32Array(0);
    }

    const piece = gameInstance.currentPiece;
    const shape = piece.shape;
    const result = new Int32Array(5 + shape.length * shape[0].length);

    result[0] = piece.x;
    result[1] = piece.y;
    result[2] = piece.type;
    result[3] = shape.length;
    result[4] = shape[0].length;

    let index = 5;
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            result[index++] = shape[y][x];
        }
    }

    return result;
}

export function getGameState(): Int32Array {
    if (gameInstance === null) return new Int32Array(0);

    const state = new Int32Array(4);
    state[0] = gameInstance.score;
    state[1] = gameInstance.level;
    state[2] = gameInstance.lines;
    state[3] = gameInstance.gameOver ? 1 : 0;
    return state;
}