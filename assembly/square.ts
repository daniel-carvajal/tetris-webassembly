// assembly/square.ts

// Canvas dimensions
const CANVAS_WIDTH: i32 = 800;
const CANVAS_HEIGHT: i32 = 600;

// Square properties
let squareX: i32 = 375;  // Center X (800/2 - 50/2)
let squareY: i32 = 275;  // Center Y (600/2 - 50/2)
let squareSize: i32 = 50;
let squareColor: i32 = 0xFF0000FF; // Red color in RGBA

// Function to get square properties
export function getSquareX(): i32 {
    return squareX;
}

export function getSquareY(): i32 {
    return squareY;
}

export function getSquareSize(): i32 {
    return squareSize;
}

export function getSquareColor(): i32 {
    return squareColor;
}

// Function to move the square
export function moveSquare(dx: i32, dy: i32): void {
    squareX += dx;
    squareY += dy;

    // Keep square within canvas bounds
    if (squareX < 0) squareX = 0;
    if (squareY < 0) squareY = 0;
    if (squareX + squareSize > CANVAS_WIDTH) squareX = CANVAS_WIDTH - squareSize;
    if (squareY + squareSize > CANVAS_HEIGHT) squareY = CANVAS_HEIGHT - squareSize;
}

// Function to change square color
export function setSquareColor(color: i32): void {
    squareColor = color;
}

// Function to change square size
export function setSquareSize(size: i32): void {
    if (size > 0 && size < CANVAS_WIDTH && size < CANVAS_HEIGHT) {
        squareSize = size;
    }
}