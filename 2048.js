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
        var emptyCells = [];
        
        // Find all empty cells
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({row: i, col: j});
                }
            }
        }
        
        if (emptyCells.length > 0) {
            var randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            // 90% chance of 2, 10% chance of 4
            var value = Math.random() < 0.9 ? 2 : 4;
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
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {
                if (this.grid[i][j] === 0) {
                    return false; // Game not over, empty cell found
                }
            }
        }
        
        // Check if any moves are possible (adjacent tiles can merge)
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {
                var current = this.grid[i][j];
                
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
        var moved = false;
        var newGrid = this.grid.map(row => [...row]);
        
        for (var row = 0; row < 4; row++) {
            var tiles = newGrid[row].filter(val => val !== 0);
            
            // Merge adjacent identical tiles
            for (var i = 0; i < tiles.length - 1; i++) {
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
            for (var col = 0; col < 4; col++) {
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
        var moved = false;
        var newGrid = this.grid.map(row => [...row]);
        
        for (var row = 0; row < 4; row++) {
            var tiles = newGrid[row].filter(val => val !== 0);
            
            // Merge adjacent identical tiles (from right)
            for (var i = tiles.length - 1; i > 0; i--) {
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
            for (var col = 0; col < 4; col++) {
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
        var moved = false;
        var newGrid = this.grid.map(row => [...row]);
        
        for (var col = 0; col < 4; col++) {
            var tiles = [];
            
            // Extract column
            for (var row = 0; row < 4; row++) {
                if (newGrid[row][col] !== 0) {
                    tiles.push(newGrid[row][col]);
                }
            }
            
            // Merge adjacent identical tiles
            for (var i = 0; i < tiles.length - 1; i++) {
                if (tiles[i] === tiles[i + 1]) {
                    tiles[i] += tiles[i + 1];
                    this.score += tiles[i];
                    tiles.splice(i + 1, 1);
                }
            }
            
            // Check if column changed and update
            var originalColumn = [];
            for (var row = 0; row < 4; row++) {
                originalColumn.push(this.grid[row][col]);
            }
            
            // Pad with zeros
            while (tiles.length < 4) {
                tiles.push(0);
            }
            
            for (var row = 0; row < 4; row++) {
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
        var moved = false;
        var newGrid = this.grid.map(row => [...row]);
        
        for (var col = 0; col < 4; col++) {
            var tiles = [];
            
            // Extract column
            for (var row = 0; row < 4; row++) {
                if (newGrid[row][col] !== 0) {
                    tiles.push(newGrid[row][col]);
                }
            }
            
            // Merge adjacent identical tiles (from bottom)
            for (var i = tiles.length - 1; i > 0; i--) {
                if (tiles[i] === tiles[i - 1]) {
                    tiles[i] += tiles[i - 1];
                    this.score += tiles[i];
                    tiles.splice(i - 1, 1);
                    i--; // Adjust index after splice
                }
            }
            
            // Check if column changed and update
            var originalColumn = [];
            for (var row = 0; row < 4; row++) {
                originalColumn.push(this.grid[row][col]);
            }
            
            // Pad with zeros at the beginning
            while (tiles.length < 4) {
                tiles.unshift(0);
            }
            
            for (var row = 0; row < 4; row++) {
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
        this.gameElement = gameElement;
        this.initializeGrid();
    }
    
    initializeGrid() {
        this.gameElement.innerHTML = '';
        
        // Create 16 tiles (4x4 grid)
        for (var i = 0; i < 16; i++) {
            var tile = document.createElement('div');
            tile.className = 'tile';
            tile.id = 'tile-' + i;
            this.gameElement.appendChild(tile);
        }
    }
    
    render(grid) {
        for (var row = 0; row < 4; row++) {
            for (var col = 0; col < 4; col++) {
                var tileIndex = row * 4 + col;
                var tile = document.getElementById('tile-' + tileIndex);
                var value = grid[row][col];
                
                if (value === 0) {
                    tile.textContent = '';
                    tile.style.backgroundColor = '#b0c4de';
                } else {
                    tile.textContent = value;
                    tile.style.backgroundColor = this.getTileColor(value);
                }
            }
        }
    }
    
    getTileColor(value) {
        var colors = {
            2: '#eee4da',
            4: '#ede0c8',
            8: '#f2b179',
            16: '#f59563',
            32: '#f67c5f',
            64: '#f65e3b',
            128: '#edcf72',
            256: '#edcc61',
            512: '#edc850',
            1024: '#edc53f',
            2048: '#edc22e'
        };
        
        return colors[value] || '#3c3a32';
    }
}

// Game Controller
class Game2048Controller {
    constructor() {
        this.game = new Game2048();
        this.renderer = new Game2048Renderer(document.getElementById('game'));
        this.gameOverOverlay = document.getElementById('gameOverOverlay');
        this.finalScoreElement = document.getElementById('finalScore');
        this.restartButton = document.getElementById('restartButton');
        this.newGameButton = document.getElementById('newGameButton');
        
        // Initial render
        this.renderer.render(this.game.getGrid());
        
        // Set up event listeners
        this.setupEventListeners();
        this.setupRestartButton();
        this.setupNewGameButton();
    }
    
    setupEventListeners() {
        // Keyboard events for desktop
        document.addEventListener('keydown', (event) => {
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
        });
        
        // Touch events for mobile (restricted to game container)
        var startX, startY;
        var gameContainer = document.querySelector('.game-container');
        
        gameContainer.addEventListener('touchstart', (event) => {
            event.preventDefault(); // Prevent page scrolling
            
            startX = event.touches[0].clientX;
            startY = event.touches[0].clientY;
        }, { passive: false });
        
        gameContainer.addEventListener('touchmove', (event) => {
            event.preventDefault(); // Prevent scrolling during swipe
        }, { passive: false });
        
        gameContainer.addEventListener('touchend', (event) => {
            event.preventDefault(); // Prevent page scrolling
            if (!startX || !startY) return;
            
            var endX = event.changedTouches[0].clientX;
            var endY = event.changedTouches[0].clientY;
            
            var diffX = startX - endX;
            var diffY = startY - endY;
            
            // Minimum swipe distance to trigger movement (prevents accidental triggers)
            var minSwipeDistance = 30;
            
            if (Math.abs(diffX) < minSwipeDistance && Math.abs(diffY) < minSwipeDistance) {
                return; // Swipe distance too small, ignore
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
            
            startX = null;
            startY = null;
        }, { passive: false });
    }
    
    checkGameOver() {
        if (this.game.checkGameOver()) {
            this.showGameOverOverlay();
        }
    }
    
    showGameOverOverlay() {
        this.finalScoreElement.textContent = `Final Score: ${this.game.getScore()}`;
        this.gameOverOverlay.style.display = 'flex';
    }
    
    hideGameOverOverlay() {
        this.gameOverOverlay.style.display = 'none';
    }
    
    setupRestartButton() {
        this.restartButton.addEventListener('click', () => {
            this.restartGame();
        });
    }
    
    setupNewGameButton() {
        this.newGameButton.addEventListener('click', () => {
            this.restartGame();
        });
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
