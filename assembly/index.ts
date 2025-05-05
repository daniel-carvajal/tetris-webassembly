// assembly/index.ts

// Board dimensions
const BOARD_WIDTH: i32 = 10;
const BOARD_HEIGHT: i32 = 20;
const BOARD_SIZE: i32 = BOARD_WIDTH * BOARD_HEIGHT;

// Tetromino types
const EMPTY: i32 = 0;
const I_PIECE: i32 = 1;
const J_PIECE: i32 = 2;
const L_PIECE: i32 = 3;
const O_PIECE: i32 = 4;
const S_PIECE: i32 = 5;
const T_PIECE: i32 = 6;
const Z_PIECE: i32 = 7;

// Game state - Initialize with static arrays to avoid runtime allocation issues
let board = new StaticArray<i32>(BOARD_SIZE);
let currentPiece: i32 = 0;
let currentPieceX: i32 = 0;
let currentPieceY: i32 = 0;
let currentPieceRotation: i32 = 0;
let nextPiece: i32 = 0;
let score: i32 = 0;
let level: i32 = 1;
let linesCleared: i32 = 0;
let gameOver: bool = false;
let randomSeed: i32 = 12345;

// Tetromino shapes (4 rotations for each piece)
// Using static arrays to avoid runtime allocation issues
const PIECE_I_R0: StaticArray<i32> = [0,0,0,0, 1,1,1,1, 0,0,0,0, 0,0,0,0];
const PIECE_I_R1: StaticArray<i32> = [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0];
const PIECE_I_R2: StaticArray<i32> = [0,0,0,0, 0,0,0,0, 1,1,1,1, 0,0,0,0];
const PIECE_I_R3: StaticArray<i32> = [0,1,0,0, 0,1,0,0, 0,1,0,0, 0,1,0,0];

const PIECE_J_R0: StaticArray<i32> = [1,0,0,0, 1,1,1,0, 0,0,0,0, 0,0,0,0];
const PIECE_J_R1: StaticArray<i32> = [0,1,1,0, 0,1,0,0, 0,1,0,0, 0,0,0,0];
const PIECE_J_R2: StaticArray<i32> = [0,0,0,0, 1,1,1,0, 0,0,1,0, 0,0,0,0];
const PIECE_J_R3: StaticArray<i32> = [0,1,0,0, 0,1,0,0, 1,1,0,0, 0,0,0,0];

const PIECE_L_R0: StaticArray<i32> = [0,0,1,0, 1,1,1,0, 0,0,0,0, 0,0,0,0];
const PIECE_L_R1: StaticArray<i32> = [0,1,0,0, 0,1,0,0, 0,1,1,0, 0,0,0,0];
const PIECE_L_R2: StaticArray<i32> = [0,0,0,0, 1,1,1,0, 1,0,0,0, 0,0,0,0];
const PIECE_L_R3: StaticArray<i32> = [1,1,0,0, 0,1,0,0, 0,1,0,0, 0,0,0,0];

const PIECE_O_R0: StaticArray<i32> = [0,1,1,0, 0,1,1,0, 0,0,0,0, 0,0,0,0];
const PIECE_O_R1: StaticArray<i32> = [0,1,1,0, 0,1,1,0, 0,0,0,0, 0,0,0,0];
const PIECE_O_R2: StaticArray<i32> = [0,1,1,0, 0,1,1,0, 0,0,0,0, 0,0,0,0];
const PIECE_O_R3: StaticArray<i32> = [0,1,1,0, 0,1,1,0, 0,0,0,0, 0,0,0,0];

const PIECE_S_R0: StaticArray<i32> = [0,1,1,0, 1,1,0,0, 0,0,0,0, 0,0,0,0];
const PIECE_S_R1: StaticArray<i32> = [0,1,0,0, 0,1,1,0, 0,0,1,0, 0,0,0,0];
const PIECE_S_R2: StaticArray<i32> = [0,0,0,0, 0,1,1,0, 1,1,0,0, 0,0,0,0];
const PIECE_S_R3: StaticArray<i32> = [1,0,0,0, 1,1,0,0, 0,1,0,0, 0,0,0,0];

const PIECE_T_R0: StaticArray<i32> = [0,1,0,0, 1,1,1,0, 0,0,0,0, 0,0,0,0];
const PIECE_T_R1: StaticArray<i32> = [0,1,0,0, 0,1,1,0, 0,1,0,0, 0,0,0,0];
const PIECE_T_R2: StaticArray<i32> = [0,0,0,0, 1,1,1,0, 0,1,0,0, 0,0,0,0];
const PIECE_T_R3: StaticArray<i32> = [0,1,0,0, 1,1,0,0, 0,1,0,0, 0,0,0,0];

const PIECE_Z_R0: StaticArray<i32> = [1,1,0,0, 0,1,1,0, 0,0,0,0, 0,0,0,0];
const PIECE_Z_R1: StaticArray<i32> = [0,0,1,0, 0,1,1,0, 0,1,0,0, 0,0,0,0];
const PIECE_Z_R2: StaticArray<i32> = [0,0,0,0, 1,1,0,0, 0,1,1,0, 0,0,0,0];
const PIECE_Z_R3: StaticArray<i32> = [0,1,0,0, 1,1,0,0, 1,0,0,0, 0,0,0,0];

// Helper function to get piece shape
function getPieceShape(pieceType: i32, rotation: i32): StaticArray<i32> {
    if (pieceType == I_PIECE) {
        if (rotation == 0) return PIECE_I_R0;
        if (rotation == 1) return PIECE_I_R1;
        if (rotation == 2) return PIECE_I_R2;
        return PIECE_I_R3;
    } else if (pieceType == J_PIECE) {
        if (rotation == 0) return PIECE_J_R0;
        if (rotation == 1) return PIECE_J_R1;
        if (rotation == 2) return PIECE_J_R2;
        return PIECE_J_R3;
    } else if (pieceType == L_PIECE) {
        if (rotation == 0) return PIECE_L_R0;
        if (rotation == 1) return PIECE_L_R1;
        if (rotation == 2) return PIECE_L_R2;
        return PIECE_L_R3;
    } else if (pieceType == O_PIECE) {
        if (rotation == 0) return PIECE_O_R0;
        if (rotation == 1) return PIECE_O_R1;
        if (rotation == 2) return PIECE_O_R2;
        return PIECE_O_R3;
    } else if (pieceType == S_PIECE) {
        if (rotation == 0) return PIECE_S_R0;
        if (rotation == 1) return PIECE_S_R1;
        if (rotation == 2) return PIECE_S_R2;
        return PIECE_S_R3;
    } else if (pieceType == T_PIECE) {
        if (rotation == 0) return PIECE_T_R0;
        if (rotation == 1) return PIECE_T_R1;
        if (rotation == 2) return PIECE_T_R2;
        return PIECE_T_R3;
    } else if (pieceType == Z_PIECE) {
        if (rotation == 0) return PIECE_Z_R0;
        if (rotation == 1) return PIECE_Z_R1;
        if (rotation == 2) return PIECE_Z_R2;
        return PIECE_Z_R3;
    }
    return PIECE_O_R0; // Default fallback
}

// Simple random number generator
function random(): i32 {
    randomSeed = (randomSeed * 1103515245 + 12345) % 2147483648;
    return randomSeed;
}

// Initialize game
export function initGame(): void {
    // Clear board
    for (let i = 0; i < BOARD_SIZE; i++) {
        unchecked(board[i] = EMPTY);
    }
    
    // Reset game state
    score = 0;
    level = 1;
    linesCleared = 0;
    gameOver = false;
    
    // Spawn first pieces
    nextPiece = (abs(random()) % 7) + 1;
    spawnPiece();
}

// Spawn a new piece
function spawnPiece(): void {
    currentPiece = nextPiece;
    nextPiece = (abs(random()) % 7) + 1;
    currentPieceRotation = 0;
    
    // Adjust spawn position based on piece type
    if (currentPiece == I_PIECE) {
        currentPieceX = 3;
        currentPieceY = -1;  // Start one row higher for I piece
    } else if (currentPiece == O_PIECE) {
        currentPieceX = 4;   // O piece spawns slightly to the right
        currentPieceY = 0;
    } else {
        currentPieceX = 3;   // Default spawn position
        currentPieceY = 0;
    }
    
    // Check if the spawn position is blocked
    if (checkCollision(currentPieceX, currentPieceY, currentPieceRotation)) {
        gameOver = true;
    }
}

// Check if a piece position is valid
function checkCollision(x: i32, y: i32, rotation: i32): bool {
    if (currentPiece <= 0 || currentPiece > 7) return true;
    
    const shape = getPieceShape(currentPiece, rotation);
    
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            const index = row * 4 + col;
            if (unchecked(shape[index]) != 0) {
                const boardX = x + col;
                const boardY = y + row;
                
                // Check boundaries
                if (boardX < 0 || boardX >= BOARD_WIDTH || boardY >= BOARD_HEIGHT) {
                    return true;
                }
                
                // Check collision with placed pieces (only if Y is >= 0)
                if (boardY >= 0) {
                    const boardIndex = boardY * BOARD_WIDTH + boardX;
                    if (boardIndex >= 0 && boardIndex < BOARD_SIZE && unchecked(board[boardIndex]) != EMPTY) {
                        return true;
                    }
                }
            }
        }
    }
    
    return false;
}

// Place the current piece on the board
function placePiece(): void {
    if (currentPiece <= 0 || currentPiece > 7) return;
    
    const shape = getPieceShape(currentPiece, currentPieceRotation);
    
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            const index = row * 4 + col;
            if (unchecked(shape[index]) != 0) {
                const boardX = currentPieceX + col;
                const boardY = currentPieceY + row;
                
                if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
                    const boardIndex = boardY * BOARD_WIDTH + boardX;
                    if (boardIndex >= 0 && boardIndex < BOARD_SIZE) {
                        unchecked(board[boardIndex] = currentPiece);
                    }
                }
            }
        }
    }
    
    checkLines();
    spawnPiece();
}

// Check and clear completed lines
function checkLines(): void {
    let clearedLines = 0;
    
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
        let isLineFull = true;
        
        for (let x = 0; x < BOARD_WIDTH; x++) {
            const index = y * BOARD_WIDTH + x;
            if (index >= 0 && index < BOARD_SIZE) {
                if (unchecked(board[index]) == EMPTY) {
                    isLineFull = false;
                    break;
                }
            }
        }
        
        if (isLineFull) {
            clearedLines++;
            
            // Move all lines above down
            for (let row = y; row > 0; row--) {
                for (let x = 0; x < BOARD_WIDTH; x++) {
                    const destIndex = row * BOARD_WIDTH + x;
                    const srcIndex = (row - 1) * BOARD_WIDTH + x;
                    if (destIndex >= 0 && destIndex < BOARD_SIZE && srcIndex >= 0 && srcIndex < BOARD_SIZE) {
                        unchecked(board[destIndex] = board[srcIndex]);
                    }
                }
            }
            
            // Clear top line
            for (let x = 0; x < BOARD_WIDTH; x++) {
                if (x >= 0 && x < BOARD_SIZE) {
                    unchecked(board[x] = EMPTY);
                }
            }
            
            y++; // Check the same line again
        }
    }
    
    if (clearedLines > 0) {
        linesCleared += clearedLines;
        
        // Update score based on lines cleared
        if (clearedLines == 1) score += 100 * level;
        else if (clearedLines == 2) score += 300 * level;
        else if (clearedLines == 3) score += 500 * level;
        else if (clearedLines == 4) score += 800 * level; // Tetris!
        
        // Update level
        level = 1 + (linesCleared / 10);
    }
}

// Move piece left
export function moveLeft(): void {
    if (!gameOver && !checkCollision(currentPieceX - 1, currentPieceY, currentPieceRotation)) {
        currentPieceX--;
    }
}

// Move piece right
export function moveRight(): void {
    if (!gameOver && !checkCollision(currentPieceX + 1, currentPieceY, currentPieceRotation)) {
        currentPieceX++;
    }
}

// Move piece down
export function moveDown(): bool {
    if (gameOver) return false;
    
    if (!checkCollision(currentPieceX, currentPieceY + 1, currentPieceRotation)) {
        currentPieceY++;
        return true;
    } else {
        placePiece();
        return false;
    }
}

// Rotate piece
export function rotate(): void {
    if (gameOver) return;
    
    const newRotation = (currentPieceRotation + 1) % 4;
    
    // Try basic rotation
    if (!checkCollision(currentPieceX, currentPieceY, newRotation)) {
        currentPieceRotation = newRotation;
        return;
    }
    
    // Try wall kicks (simplified version)
    // Using static arrays for kicks to avoid runtime allocation
    const kicks: StaticArray<i32> = [-1, 0, 1, 0, 0, -1, -1, -1, 1, -1];
    
    for (let i = 0; i < 5; i++) {
        const kickX = unchecked(kicks[i * 2]);
        const kickY = unchecked(kicks[i * 2 + 1]);
        
        if (!checkCollision(currentPieceX + kickX, currentPieceY + kickY, newRotation)) {
            currentPieceX += kickX;
            currentPieceY += kickY;
            currentPieceRotation = newRotation;
            return;
        }
    }
}

// Hard drop
export function hardDrop(): void {
    if (gameOver) return;
    
    while (moveDown()) {
        score += 2;
    }
}

// Get the Y position for ghost piece
export function getGhostPieceY(): i32 {
    let ghostY = currentPieceY;
    
    while (!checkCollision(currentPieceX, ghostY + 1, currentPieceRotation)) {
        ghostY++;
    }
    
    return ghostY;
}

// Get drop delay based on level
export function getDropDelay(): i32 {
    return max(100, 1000 - (level - 1) * 50);
}

// Getter functions for game state
export function getBoardWidth(): i32 { return BOARD_WIDTH; }
export function getBoardHeight(): i32 { return BOARD_HEIGHT; }
export function getBoardCell(x: i32, y: i32): i32 { 
    if (x >= 0 && x < BOARD_WIDTH && y >= 0 && y < BOARD_HEIGHT) {
        const index = y * BOARD_WIDTH + x;
        if (index >= 0 && index < BOARD_SIZE) {
            return unchecked(board[index]);
        }
    }
    return EMPTY;
}
export function getCurrentPieceType(): i32 { return currentPiece; }
export function getCurrentPieceX(): i32 { return currentPieceX; }
export function getCurrentPieceY(): i32 { return currentPieceY; }
export function getCurrentPieceRotation(): i32 { return currentPieceRotation; }
export function getNextPieceType(): i32 { return nextPiece; }
export function getScore(): i32 { return score; }
export function getLevel(): i32 { return level; }
export function isGameOver(): bool { return gameOver; }

// Get piece cell for rendering
export function getPieceCell(pieceType: i32, rotation: i32, x: i32, y: i32): i32 {
    if (pieceType <= 0 || pieceType > 7 || x < 0 || x >= 4 || y < 0 || y >= 4) {
        return 0;
    }
    
    const shape = getPieceShape(pieceType, rotation);
    const index = y * 4 + x;
    
    if (index >= 0 && index < 16) {
        return unchecked(shape[index]);
    }
    
    return 0;
}