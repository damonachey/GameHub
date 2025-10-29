// 2048 Game Logic (Model)
class Game2048 {
    constructor() {
        this.grid = this.createEmptyGrid();
        this.score = 0;
        this.gameOver = false;
        
        // Add two initial tiles
        this.addRandomTile();
        this.addRandomTile();
    }
    
    createEmptyGrid() {
        return Array(4).fill().map(() => Array(4).fill(0));
    }
    
    addRandomTile() {
        const emptyCells = [];
        
        // Find all empty cells
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({row: i, col: j});
                }
            }
        }
        
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            // 90% chance of 2, 10% chance of 4
            const value = Math.random() < 0.9 ? 2 : 4;
            this.grid[randomCell.row][randomCell.col] = value;
            return true;
        }
        
        return false;
    }
    
    getGrid() {
        return this.grid;
    }
    
    getScore() {
        return this.score;
    }
    
    isGameOver() {
        return this.gameOver;
    }
    
    checkGameOver() {
        // Check if there are any empty cells
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j] === 0) {
                    return false; // Game not over, empty cell found
                }
            }
        }
        
        // Check if any moves are possible (adjacent tiles can merge)
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const current = this.grid[i][j];
                
                // Check right neighbor
                if (j < 3 && current === this.grid[i][j + 1]) {
                    return false; // Can merge with right neighbor
                }
                
                // Check bottom neighbor
                if (i < 3 && current === this.grid[i + 1][j]) {
                    return false; // Can merge with bottom neighbor
                }
            }
        }
        
        // No empty cells and no possible merges
        this.gameOver = true;
        return true;
    }
    
    // Movement methods
    moveLeft() {
        let moved = false;
        const newGrid = this.grid.map(row => [...row]);
        
        for (let row = 0; row < 4; row++) {
            const tiles = newGrid[row].filter(val => val !== 0);
            
            // Merge adjacent identical tiles
            for (let i = 0; i < tiles.length - 1; i++) {
                if (tiles[i] === tiles[i + 1]) {
                    tiles[i] += tiles[i + 1];
                    this.score += tiles[i];
                    tiles.splice(i + 1, 1);
                }
            }
            
            // Pad with zeros
            while (tiles.length < 4) {
                tiles.push(0);
            }
            
            // Check if row changed
            for (let col = 0; col < 4; col++) {
                if (this.grid[row][col] !== tiles[col]) {
                    moved = true;
                }
            }
            
            newGrid[row] = tiles;
        }
        
        if (moved) {
            this.grid = newGrid;
            this.addRandomTile();
        }
        
        return moved;
    }
    
    moveRight() {
        let moved = false;
        const newGrid = this.grid.map(row => [...row]);
        
        for (let row = 0; row < 4; row++) {
            const tiles = newGrid[row].filter(val => val !== 0);
            
            // Merge adjacent identical tiles (from right)
            for (let i = tiles.length - 1; i > 0; i--) {
                if (tiles[i] === tiles[i - 1]) {
                    tiles[i] += tiles[i - 1];
                    this.score += tiles[i];
                    tiles.splice(i - 1, 1);
                    i--; // Adjust index after splice
                }
            }
            
            // Pad with zeros at the beginning
            while (tiles.length < 4) {
                tiles.unshift(0);
            }
            
            // Check if row changed
            for (let col = 0; col < 4; col++) {
                if (this.grid[row][col] !== tiles[col]) {
                    moved = true;
                }
            }
            
            newGrid[row] = tiles;
        }
        
        if (moved) {
            this.grid = newGrid;
            this.addRandomTile();
        }
        
        return moved;
    }
    
    moveUp() {
        let moved = false;
        const newGrid = this.grid.map(row => [...row]);
        
        for (let col = 0; col < 4; col++) {
            const tiles = [];
            
            // Extract column
            for (let row = 0; row < 4; row++) {
                if (newGrid[row][col] !== 0) {
                    tiles.push(newGrid[row][col]);
                }
            }
            
            // Merge adjacent identical tiles
            for (let i = 0; i < tiles.length - 1; i++) {
                if (tiles[i] === tiles[i + 1]) {
                    tiles[i] += tiles[i + 1];
                    this.score += tiles[i];
                    tiles.splice(i + 1, 1);
                }
            }
            
            // Check if column changed and update
            const originalColumn = [];
            for (let row = 0; row < 4; row++) {
                originalColumn.push(this.grid[row][col]);
            }
            
            // Pad with zeros
            while (tiles.length < 4) {
                tiles.push(0);
            }
            
            for (let row = 0; row < 4; row++) {
                if (originalColumn[row] !== tiles[row]) {
                    moved = true;
                }
                newGrid[row][col] = tiles[row];
            }
        }
        
        if (moved) {
            this.grid = newGrid;
            this.addRandomTile();
        }
        
        return moved;
    }
    
    moveDown() {
        let moved = false;
        const newGrid = this.grid.map(row => [...row]);
        
        for (let col = 0; col < 4; col++) {
            const tiles = [];
            
            // Extract column
            for (let row = 0; row < 4; row++) {
                if (newGrid[row][col] !== 0) {
                    tiles.push(newGrid[row][col]);
                }
            }
            
            // Merge adjacent identical tiles (from bottom)
            for (let i = tiles.length - 1; i > 0; i--) {
                if (tiles[i] === tiles[i - 1]) {
                    tiles[i] += tiles[i - 1];
                    this.score += tiles[i];
                    tiles.splice(i - 1, 1);
                    i--; // Adjust index after splice
                }
            }
            
            // Check if column changed and update
            const originalColumn = [];
            for (let row = 0; row < 4; row++) {
                originalColumn.push(this.grid[row][col]);
            }
            
            // Pad with zeros at the beginning
            while (tiles.length < 4) {
                tiles.unshift(0);
            }
            
            for (let row = 0; row < 4; row++) {
                if (originalColumn[row] !== tiles[row]) {
                    moved = true;
                }
                newGrid[row][col] = tiles[row];
            }
        }
        
        if (moved) {
            this.grid = newGrid;
            this.addRandomTile();
        }
        
        return moved;
    }
}

// 2048 Game Renderer (View)
class Game2048Renderer {
    constructor(gameElement) {
        if (!gameElement) {
            throw new Error('Game element not found');
        }
        this.gameElement = gameElement;
        this.tiles = [];
        this.initializeGrid();
    }
    
    initializeGrid() {
        this.gameElement.innerHTML = '';
        this.tiles = [];
        
        // Create 16 tiles (4x4 grid)
        for (let i = 0; i < 16; i++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            tile.id = 'tile-' + i;
            this.gameElement.appendChild(tile);
            this.tiles.push(tile);
        }
    }
    
    render(grid) {
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const tileIndex = row * 4 + col;
                const tile = this.tiles[tileIndex];
                const value = grid[row][col];
                
                if (!tile) {
                    continue;
                }
                
                // Remove all tile value classes
                tile.className = 'tile';
                
                if (value === 0) {
                    tile.textContent = '';
                } else {
                    tile.textContent = value;
                    // Add appropriate tile class
                    const tileClass = value > 2048 ? 'tile-higher' : `tile-${value}`;
                    tile.classList.add(tileClass);
                }
            }
        }
    }
}

// Game Controller
class Game2048Controller {
    constructor() {
        // Check for required DOM elements
        const gameElement = document.getElementById('game');
        this.gameOverOverlay = document.getElementById('gameOverOverlay');
        this.finalScoreElement = document.getElementById('finalScore');
        this.newGameButton = document.getElementById('newGameButton');
        this.newGameButton2 = document.getElementById('newGameButton2');
        
        if (!gameElement) {
            console.error('Game element not found');
            return;
        }
        
        this.game = new Game2048();
        this.renderer = new Game2048Renderer(gameElement);
        
        // Store bound event handlers for cleanup
        this.boundKeyHandler = this.handleKeydown.bind(this);
        this.boundTouchStart = this.handleTouchStart.bind(this);
        this.boundTouchMove = this.handleTouchMove.bind(this);
        this.boundTouchEnd = this.handleTouchEnd.bind(this);
        
        // Initial render
        this.renderer.render(this.game.getGrid());
        
        // Set up event listeners
        this.setupEventListeners();
        this.setupRestartButton();
        this.setupNewGameButton();
        this.setupOverlayDismiss();
    }
    
    handleKeydown(event) {
        switch(event.key) {
            case 'ArrowUp':
                event.preventDefault();
                if (this.game.moveUp()) {
                    this.renderer.render(this.game.getGrid());
                    this.checkGameOver();
                }
                break;
            case 'ArrowDown':
                event.preventDefault();
                if (this.game.moveDown()) {
                    this.renderer.render(this.game.getGrid());
                    this.checkGameOver();
                }
                break;
            case 'ArrowLeft':
                event.preventDefault();
                if (this.game.moveLeft()) {
                    this.renderer.render(this.game.getGrid());
                    this.checkGameOver();
                }
                break;
            case 'ArrowRight':
                event.preventDefault();
                if (this.game.moveRight()) {
                    this.renderer.render(this.game.getGrid());
                    this.checkGameOver();
                }
                break;
        }
    }
    
    handleTouchStart(event) {
        event.preventDefault();
        this.startX = event.touches[0].clientX;
        this.startY = event.touches[0].clientY;
    }
    
    handleTouchMove(event) {
        event.preventDefault();
    }
    
    handleTouchEnd(event) {
        event.preventDefault();
        if (!this.startX || !this.startY) {
            return;
        }
        
        const endX = event.changedTouches[0].clientX;
        const endY = event.changedTouches[0].clientY;
        
        const diffX = this.startX - endX;
        const diffY = this.startY - endY;
        
        // Minimum swipe distance to trigger movement
        const minSwipeDistance = 30;
        
        if (Math.abs(diffX) < minSwipeDistance && Math.abs(diffY) < minSwipeDistance) {
            return;
        }
        
        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX > 0) {
                if (this.game.moveLeft()) {
                    this.renderer.render(this.game.getGrid());
                    this.checkGameOver();
                }
            } else {
                if (this.game.moveRight()) {
                    this.renderer.render(this.game.getGrid());
                    this.checkGameOver();
                }
            }
        } else {
            if (diffY > 0) {
                if (this.game.moveUp()) {
                    this.renderer.render(this.game.getGrid());
                    this.checkGameOver();
                }
            } else {
                if (this.game.moveDown()) {
                    this.renderer.render(this.game.getGrid());
                    this.checkGameOver();
                }
            }
        }
        
        this.startX = null;
        this.startY = null;
    }
    
    setupEventListeners() {
        // Keyboard events for desktop
        document.addEventListener('keydown', this.boundKeyHandler);
        
        // Touch events for mobile (restricted to game container)
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            gameContainer.addEventListener('touchstart', this.boundTouchStart, { passive: false });
            gameContainer.addEventListener('touchmove', this.boundTouchMove, { passive: false });
            gameContainer.addEventListener('touchend', this.boundTouchEnd, { passive: false });
        }
    }
    
    cleanup() {
        // Remove event listeners to prevent memory leaks
        document.removeEventListener('keydown', this.boundKeyHandler);
        
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            gameContainer.removeEventListener('touchstart', this.boundTouchStart);
            gameContainer.removeEventListener('touchmove', this.boundTouchMove);
            gameContainer.removeEventListener('touchend', this.boundTouchEnd);
        }
    }
    
    checkGameOver() {
        if (this.game.checkGameOver()) {
            this.showGameOverOverlay();
        }
    }
    
    showGameOverOverlay() {
        if (this.finalScoreElement) {
            this.finalScoreElement.textContent = `Final Score: ${this.game.getScore()}`;
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
    
    setupRestartButton() {
        if (this.newGameButton2) {
            this.newGameButton2.addEventListener('click', () => {
                this.restartGame();
            });
        }
    }
    
    setupNewGameButton() {
        if (this.newGameButton) {
            this.newGameButton.addEventListener('click', () => {
                this.restartGame();
            });
        }
    }
    
    setupOverlayDismiss() {
        if (this.gameOverOverlay) {
            this.gameOverOverlay.addEventListener('click', (e) => {
                if (e.target === this.gameOverOverlay) {
                    this.hideGameOverOverlay();
                }
            });
        }
    }
    
    restartGame() {
        // Create a new game instance
        this.game = new Game2048();
        
        // Re-render the grid
        this.renderer.render(this.game.getGrid());
        
        // Hide the overlay
        this.hideGameOverOverlay();
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Game2048Controller();
});
