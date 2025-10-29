// Tetris Game Model (Logic)
class TetrisGame {
    constructor() {
        this.COLS = 10;
        this.ROWS = 20;
        this.grid = [];
        this.currentPiece = null;
        this.nextPiece = null;
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameOver = false;
        this.isPaused = false;
        
        this.pieces = {
            I: { shape: [[1,1,1,1]], color: '#00f0f0' },
            O: { shape: [[1,1],[1,1]], color: '#f0f000' },
            T: { shape: [[0,1,0],[1,1,1]], color: '#a000f0' },
            S: { shape: [[0,1,1],[1,1,0]], color: '#00f000' },
            Z: { shape: [[1,1,0],[0,1,1]], color: '#f00000' },
            J: { shape: [[1,0,0],[1,1,1]], color: '#0000f0' },
            L: { shape: [[0,0,1],[1,1,1]], color: '#f0a000' }
        };
    }
    
    initializeGame() {
        this.grid = Array(this.ROWS).fill().map(() => Array(this.COLS).fill(null));
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameOver = false;
        this.isPaused = false;
        this.currentPiece = this.createPiece();
        this.nextPiece = this.createPiece();
    }
    
    createPiece() {
        const types = Object.keys(this.pieces);
        const type = types[Math.floor(Math.random() * types.length)];
        const pieceData = this.pieces[type];
        
        return {
            type,
            shape: JSON.parse(JSON.stringify(pieceData.shape)),
            color: pieceData.color,
            x: Math.floor(this.COLS / 2) - Math.floor(pieceData.shape[0].length / 2),
            y: 0
        };
    }
    
    spawnNewPiece() {
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.createPiece();
        
        if (!this.canMovePiece(this.currentPiece.x, this.currentPiece.y, this.currentPiece.shape)) {
            this.gameOver = true;
            return false;
        }
        return true;
    }
    
    canMovePiece(newX, newY, shape) {
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const gridX = newX + col;
                    const gridY = newY + row;
                    
                    if (gridX < 0 || gridX >= this.COLS || gridY >= this.ROWS) {
                        return false;
                    }
                    
                    if (gridY >= 0 && this.grid[gridY][gridX] !== null) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    
    movePiece(direction) {
        if (this.gameOver || this.isPaused || !this.currentPiece) {
            return false;
        }
        
        let newX = this.currentPiece.x;
        let newY = this.currentPiece.y;
        
        if (direction === 'left') {
            newX--;
        } else if (direction === 'right') {
            newX++;
        } else if (direction === 'down') {
            newY++;
        }
        
        if (this.canMovePiece(newX, newY, this.currentPiece.shape)) {
            this.currentPiece.x = newX;
            this.currentPiece.y = newY;
            return true;
        }
        
        return false;
    }
    
    hardDrop() {
        if (this.gameOver || this.isPaused || !this.currentPiece) {
            return 0;
        }
        
        let dropDistance = 0;
        while (this.movePiece('down')) {
            dropDistance++;
        }
        
        this.lockPiece();
        return dropDistance;
    }
    
    rotatePiece() {
        if (this.gameOver || this.isPaused || !this.currentPiece) {
            return false;
        }
        
        const rotated = this.currentPiece.shape[0].map((_, i) =>
            this.currentPiece.shape.map(row => row[i]).reverse()
        );
        
        if (this.canMovePiece(this.currentPiece.x, this.currentPiece.y, rotated)) {
            this.currentPiece.shape = rotated;
            return true;
        }
        
        return false;
    }
    
    lockPiece() {
        if (!this.currentPiece) {
            return;
        }
        
        for (let row = 0; row < this.currentPiece.shape.length; row++) {
            for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
                if (this.currentPiece.shape[row][col]) {
                    const gridY = this.currentPiece.y + row;
                    const gridX = this.currentPiece.x + col;
                    
                    if (gridY >= 0) {
                        this.grid[gridY][gridX] = this.currentPiece.color;
                    }
                }
            }
        }
        
        const linesCleared = this.clearLines();
        this.updateScore(linesCleared);
        this.spawnNewPiece();
    }
    
    clearLines() {
        let linesCleared = 0;
        
        for (let row = this.ROWS - 1; row >= 0; row--) {
            if (this.grid[row].every(cell => cell !== null)) {
                this.grid.splice(row, 1);
                this.grid.unshift(Array(this.COLS).fill(null));
                linesCleared++;
                row++;
            }
        }
        
        return linesCleared;
    }
    
    updateScore(linesCleared) {
        if (linesCleared > 0) {
            const points = [0, 100, 300, 500, 800];
            this.score += points[linesCleared] * this.level;
            this.lines += linesCleared;
            this.level = Math.floor(this.lines / 10) + 1;
        }
    }
    
    tick() {
        if (this.gameOver || this.isPaused) {
            return { moved: false };
        }
        
        if (!this.movePiece('down')) {
            this.lockPiece();
            return { moved: false, locked: true };
        }
        
        return { moved: true };
    }
    
    togglePause() {
        if (!this.gameOver) {
            this.isPaused = !this.isPaused;
        }
        return this.isPaused;
    }
    
    getDropSpeed() {
        return Math.max(100, 1000 - (this.level - 1) * 100);
    }
}

// Tetris Game Renderer (View)
class TetrisRenderer {
    constructor() {
        this.gameCanvas = document.getElementById('game-canvas');
        this.nextCanvas = document.getElementById('next-canvas');
        this.gameCtx = this.gameCanvas?.getContext('2d');
        this.nextCtx = this.nextCanvas?.getContext('2d');
        this.scoreDisplay = document.getElementById('score');
        this.levelDisplay = document.getElementById('level');
        this.linesDisplay = document.getElementById('lines');
        this.gameOverOverlay = document.getElementById('gameOverOverlay');
        this.finalScoreElement = document.getElementById('finalScore');
        this.pauseOverlay = document.getElementById('pauseOverlay');
        
        this.CELL_SIZE = 30;
        this.BORDER_WIDTH = 1;
    }
    
    renderGame(game) {
        if (!this.gameCtx) {
            return;
        }
        
        const ctx = this.gameCtx;
        ctx.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
        
        // Draw grid
        for (let row = 0; row < game.ROWS; row++) {
            for (let col = 0; col < game.COLS; col++) {
                if (game.grid[row][col]) {
                    this.drawCell(ctx, col, row, game.grid[row][col]);
                } else {
                    this.drawEmptyCell(ctx, col, row);
                }
            }
        }
        
        // Draw current piece
        if (game.currentPiece) {
            for (let row = 0; row < game.currentPiece.shape.length; row++) {
                for (let col = 0; col < game.currentPiece.shape[row].length; col++) {
                    if (game.currentPiece.shape[row][col]) {
                        const gridX = game.currentPiece.x + col;
                        const gridY = game.currentPiece.y + row;
                        if (gridY >= 0) {
                            this.drawCell(ctx, gridX, gridY, game.currentPiece.color);
                        }
                    }
                }
            }
        }
    }
    
    drawCell(ctx, x, y, color) {
        const px = x * this.CELL_SIZE;
        const py = y * this.CELL_SIZE;
        
        // Draw colored cell with white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(px, py, this.CELL_SIZE, this.CELL_SIZE);
        
        // Draw colored piece on top
        ctx.fillStyle = color;
        ctx.fillRect(px + 2, py + 2, this.CELL_SIZE - 4, this.CELL_SIZE - 4);
        
        // Draw dark border (Sudoku style)
        ctx.strokeStyle = '#2f4f4f';
        ctx.lineWidth = 1;
        ctx.strokeRect(px, py, this.CELL_SIZE, this.CELL_SIZE);
    }
    
    drawEmptyCell(ctx, x, y) {
        const px = x * this.CELL_SIZE;
        const py = y * this.CELL_SIZE;
        
        // White background like Sudoku
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(px, py, this.CELL_SIZE, this.CELL_SIZE);
        
        // Dark border (Sudoku style)
        ctx.strokeStyle = '#2f4f4f';
        ctx.lineWidth = 1;
        ctx.strokeRect(px, py, this.CELL_SIZE, this.CELL_SIZE);
    }
    
    renderNext(game) {
        if (!this.nextCtx || !game.nextPiece) {
            return;
        }
        
        const ctx = this.nextCtx;
        ctx.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        // Draw empty grid background (4x4)
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                this.drawEmptyCell(ctx, col, row);
            }
        }
        
        const shape = game.nextPiece.shape;
        const offsetX = (4 - shape[0].length) / 2;
        const offsetY = (4 - shape.length) / 2;
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    this.drawCell(ctx, offsetX + col, offsetY + row, game.nextPiece.color);
                }
            }
        }
    }
    
    updateStats(game) {
        if (this.scoreDisplay) {
            this.scoreDisplay.textContent = game.score;
        }
        if (this.levelDisplay) {
            this.levelDisplay.textContent = game.level;
        }
        if (this.linesDisplay) {
            this.linesDisplay.textContent = game.lines;
        }
    }
    
    showGameOverOverlay(score) {
        if (this.finalScoreElement) {
            this.finalScoreElement.textContent = `Final Score: ${score}`;
        }
        if (this.gameOverOverlay) {
            this.gameOverOverlay.style.display = 'flex';
        }
    }
    
    hideGameOverOverlay() {
        if (this.gameOverOverlay) {
            this.gameOverOverlay.style.display = 'none';
        }
    }
    
    showPauseOverlay() {
        if (this.pauseOverlay) {
            this.pauseOverlay.style.display = 'flex';
        }
    }
    
    hidePauseOverlay() {
        if (this.pauseOverlay) {
            this.pauseOverlay.style.display = 'none';
        }
    }
}

// Tetris Game Controller
class TetrisController {
    constructor() {
        this.game = new TetrisGame();
        this.renderer = new TetrisRenderer();
        this.newGameButton = document.getElementById('newGameButton');
        this.newGameButton2 = document.getElementById('newGameButton2');
        this.dropInterval = null;
        
        this.boundKeyHandler = this.handleKeydown.bind(this);
        
        this.setupEventListeners();
        this.initializeGame();
    }
    
    initializeGame() {
        this.game.initializeGame();
        this.stopGameLoop();
        this.renderer.hideGameOverOverlay();
        this.renderer.hidePauseOverlay();
        this.renderer.renderGame(this.game);
        this.renderer.renderNext(this.game);
        this.renderer.updateStats(this.game);
        this.startGameLoop();
    }
    
    startGameLoop() {
        this.stopGameLoop();
        this.scheduleNextDrop();
    }
    
    stopGameLoop() {
        if (this.dropInterval) {
            clearTimeout(this.dropInterval);
            this.dropInterval = null;
        }
    }
    
    scheduleNextDrop() {
        if (this.game.gameOver) {
            return;
        }
        
        this.dropInterval = setTimeout(() => {
            this.gameTick();
            this.scheduleNextDrop();
        }, this.game.getDropSpeed());
    }
    
    gameTick() {
        const result = this.game.tick();
        
        if (result.locked) {
            this.renderer.renderNext(this.game);
            this.renderer.updateStats(this.game);
        }
        
        this.renderer.renderGame(this.game);
        
        if (this.game.gameOver) {
            this.stopGameLoop();
            this.renderer.showGameOverOverlay(this.game.score);
        }
    }
    
    handleKeydown(event) {
        if (this.game.gameOver) {
            return;
        }
        
        switch(event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                this.game.movePiece('left');
                this.renderer.renderGame(this.game);
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.game.movePiece('right');
                this.renderer.renderGame(this.game);
                break;
            case 'ArrowDown':
                event.preventDefault();
                this.game.movePiece('down');
                this.renderer.renderGame(this.game);
                break;
            case 'ArrowUp':
            case ' ':
                event.preventDefault();
                this.game.rotatePiece();
                this.renderer.renderGame(this.game);
                break;
            case 'Enter':
                event.preventDefault();
                this.game.hardDrop();
                this.renderer.renderGame(this.game);
                this.renderer.renderNext(this.game);
                this.renderer.updateStats(this.game);
                break;
            case 'p':
            case 'P':
            case 'Escape':
                event.preventDefault();
                this.togglePause();
                break;
        }
    }
    
    togglePause() {
        const paused = this.game.togglePause();
        
        if (paused) {
            this.stopGameLoop();
            this.renderer.showPauseOverlay();
        } else {
            this.renderer.hidePauseOverlay();
            this.startGameLoop();
        }
    }
    
    setupEventListeners() {
        if (this.newGameButton) {
            this.newGameButton.addEventListener('click', () => {
                this.initializeGame();
            });
        }
        
        if (this.newGameButton2) {
            this.newGameButton2.addEventListener('click', () => {
                this.initializeGame();
            });
        }
        
        document.addEventListener('keydown', this.boundKeyHandler);
        
        if (this.renderer.gameOverOverlay) {
            this.renderer.gameOverOverlay.addEventListener('click', (e) => {
                if (e.target === this.renderer.gameOverOverlay) {
                    this.renderer.hideGameOverOverlay();
                }
            });
        }
        
        if (this.renderer.pauseOverlay) {
            this.renderer.pauseOverlay.addEventListener('click', (e) => {
                if (e.target === this.renderer.pauseOverlay) {
                    this.togglePause();
                }
            });
        }
    }
    
    cleanup() {
        this.stopGameLoop();
        document.removeEventListener('keydown', this.boundKeyHandler);
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TetrisController();
});
