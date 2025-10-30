// Sliding Numbers Game Logic (Model)
class SlidingNumbersGame {
    constructor() {
        this.grid = [];
        this.emptyPos = { row: 3, col: 3 };
        this.moves = 0;
        this.initializeGrid();
        this.shuffle();
    }
    
    initializeGrid() {
        // Create solved grid: 1-15 with empty space at bottom right
        let num = 1;
        for (let i = 0; i < 4; i++) {
            this.grid[i] = [];
            for (let j = 0; j < 4; j++) {
                if (i === 3 && j === 3) {
                    this.grid[i][j] = 0; // Empty space
                } else {
                    this.grid[i][j] = num++;
                }
            }
        }
    }
    
    shuffle() {
        // Shuffle by making random valid moves
        const directions = ['up', 'down', 'left', 'right'];
        let lastMove = null;
        
        for (let i = 0; i < 200; i++) {
            const validMoves = [];
            
            // Only add moves that are actually possible and not opposite of last move
            if (this.canMoveUp() && lastMove !== 'down') {
                validMoves.push('up');
            }
            if (this.canMoveDown() && lastMove !== 'up') {
                validMoves.push('down');
            }
            if (this.canMoveLeft() && lastMove !== 'right') {
                validMoves.push('left');
            }
            if (this.canMoveRight() && lastMove !== 'left') {
                validMoves.push('right');
            }
            
            if (validMoves.length > 0) {
                const move = validMoves[Math.floor(Math.random() * validMoves.length)];
                this.makeMove(move, false); // false = don't count as player move
                lastMove = move;
            }
        }
        
        // Reset move counter after shuffling
        this.moves = 0;
    }
    
    canMoveUp() {
        return this.emptyPos.row < 3;
    }
    
    canMoveDown() {
        return this.emptyPos.row > 0;
    }
    
    canMoveLeft() {
        return this.emptyPos.col < 3;
    }
    
    canMoveRight() {
        return this.emptyPos.col > 0;
    }
    
    makeMove(direction, countMove = true) {
        let newRow = this.emptyPos.row;
        let newCol = this.emptyPos.col;
        
        switch(direction) {
            case 'up':
                if (!this.canMoveUp()) {
                    return false;
                }
                newRow++;
                break;
            case 'down':
                if (!this.canMoveDown()) {
                    return false;
                }
                newRow--;
                break;
            case 'left':
                if (!this.canMoveLeft()) {
                    return false;
                }
                newCol++;
                break;
            case 'right':
                if (!this.canMoveRight()) {
                    return false;
                }
                newCol--;
                break;
        }
        
        // Swap the tile with empty space
        this.grid[this.emptyPos.row][this.emptyPos.col] = this.grid[newRow][newCol];
        this.grid[newRow][newCol] = 0;
        this.emptyPos = { row: newRow, col: newCol };
        
        if (countMove) {
            this.moves++;
        }
        
        return true;
    }
    
    // Check if tile at position can move
    canTileMove(row, col) {
        // Check if adjacent to empty space
        if (row === this.emptyPos.row) {
            return Math.abs(col - this.emptyPos.col) === 1;
        }
        if (col === this.emptyPos.col) {
            return Math.abs(row - this.emptyPos.row) === 1;
        }
        return false;
    }
    
    // Move tile at position (if possible)
    moveTile(row, col) {
        if (!this.canTileMove(row, col)) {
            return false;
        }
        
        // Determine direction
        if (row === this.emptyPos.row) {
            if (col < this.emptyPos.col) {
                return this.makeMove('right');
            } else {
                return this.makeMove('left');
            }
        } else {
            if (row < this.emptyPos.row) {
                return this.makeMove('down');
            } else {
                return this.makeMove('up');
            }
        }
    }
    
    checkWin() {
        let num = 1;
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (i === 3 && j === 3) {
                    if (this.grid[i][j] !== 0) {
                        return false;
                    }
                } else {
                    if (this.grid[i][j] !== num) {
                        return false;
                    }
                    num++;
                }
            }
        }
        return true;
    }
    
    getGrid() {
        return this.grid;
    }
    
    getMoves() {
        return this.moves;
    }
    
    getEmptyPos() {
        return this.emptyPos;
    }
}

// Sliding Numbers Renderer (View)
class SlidingNumbersRenderer {
    constructor(gameElement, movesElement) {
        if (!gameElement) {
            throw new Error('Game element not found');
        }
        this.gameElement = gameElement;
        this.movesElement = movesElement;
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
            tile.dataset.index = i;
            this.gameElement.appendChild(tile);
            this.tiles.push(tile);
        }
    }
    
    render(grid, moves) {
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const tileIndex = row * 4 + col;
                const tile = this.tiles[tileIndex];
                const value = grid[row][col];
                
                if (!tile) {
                    continue;
                }
                
                tile.dataset.row = row;
                tile.dataset.col = col;
                
                if (value === 0) {
                    tile.textContent = '';
                    tile.className = 'tile empty';
                } else {
                    tile.textContent = value;
                    tile.className = 'tile';
                }
            }
        }
        
        if (this.movesElement) {
            this.movesElement.textContent = moves;
        }
    }
}

// Sliding Numbers Controller
class SlidingNumbersController {
    constructor() {
        const gameElement = document.getElementById('game');
        const movesElement = document.getElementById('moves');
        this.winOverlay = document.getElementById('winOverlay');
        this.finalMovesElement = document.getElementById('finalMoves');
        this.newGameButton = document.getElementById('newGameButton');
        this.newGameButton2 = document.getElementById('newGameButton2');
        
        if (!gameElement) {
            console.error('Game element not found');
            return;
        }
        
        this.game = new SlidingNumbersGame();
        this.renderer = new SlidingNumbersRenderer(gameElement, movesElement);
        
        // Store bound event handlers for cleanup
        this.boundKeyHandler = this.handleKeydown.bind(this);
        this.boundTileClick = this.handleTileClick.bind(this);
        this.boundTouchStart = this.handleTouchStart.bind(this);
        this.boundTouchMove = this.handleTouchMove.bind(this);
        this.boundTouchEnd = this.handleTouchEnd.bind(this);
        
        // Initial render
        this.renderer.render(this.game.getGrid(), this.game.getMoves());
        
        // Set up event listeners
        this.setupEventListeners();
        this.setupNewGameButton();
        this.setupRestartButton();
        this.setupOverlayDismiss();
    }
    
    handleKeydown(event) {
        let moved = false;
        
        switch(event.key) {
            case 'ArrowUp':
                event.preventDefault();
                moved = this.game.makeMove('up');
                break;
            case 'ArrowDown':
                event.preventDefault();
                moved = this.game.makeMove('down');
                break;
            case 'ArrowLeft':
                event.preventDefault();
                moved = this.game.makeMove('left');
                break;
            case 'ArrowRight':
                event.preventDefault();
                moved = this.game.makeMove('right');
                break;
        }
        
        if (moved) {
            this.renderer.render(this.game.getGrid(), this.game.getMoves());
            this.checkWin();
        }
    }
    
    handleTileClick(event) {
        const tile = event.target.closest('.tile');
        if (!tile) {
            return;
        }
        
        const row = parseInt(tile.dataset.row);
        const col = parseInt(tile.dataset.col);
        
        if (this.game.moveTile(row, col)) {
            this.renderer.render(this.game.getGrid(), this.game.getMoves());
            this.checkWin();
        }
    }
    
    handleTouchStart(event) {
        const tile = event.target.closest('.tile');
        if (!tile || tile.classList.contains('empty')) {
            return;
        }
        
        event.preventDefault();
        this.touchStartTile = tile;
        this.startX = event.touches[0].clientX;
        this.startY = event.touches[0].clientY;
    }
    
    handleTouchMove(event) {
        if (!this.touchStartTile) {
            return;
        }
        event.preventDefault();
    }
    
    handleTouchEnd(event) {
        if (!this.touchStartTile) {
            return;
        }
        
        event.preventDefault();
        
        const endX = event.changedTouches[0].clientX;
        const endY = event.changedTouches[0].clientY;
        
        const diffX = this.startX - endX;
        const diffY = this.startY - endY;
        
        // If swipe distance is small, treat as tap
        const minSwipeDistance = 20;
        
        if (Math.abs(diffX) < minSwipeDistance && Math.abs(diffY) < minSwipeDistance) {
            // Tap - move tile
            const row = parseInt(this.touchStartTile.dataset.row);
            const col = parseInt(this.touchStartTile.dataset.col);
            
            if (this.game.moveTile(row, col)) {
                this.renderer.render(this.game.getGrid(), this.game.getMoves());
                this.checkWin();
            }
        } else {
            // Swipe - move in swipe direction
            let moved = false;
            
            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (diffX > 0) {
                    moved = this.game.makeMove('left');
                } else {
                    moved = this.game.makeMove('right');
                }
            } else {
                if (diffY > 0) {
                    moved = this.game.makeMove('up');
                } else {
                    moved = this.game.makeMove('down');
                }
            }
            
            if (moved) {
                this.renderer.render(this.game.getGrid(), this.game.getMoves());
                this.checkWin();
            }
        }
        
        this.touchStartTile = null;
        this.startX = null;
        this.startY = null;
    }
    
    setupEventListeners() {
        // Keyboard events for desktop
        document.addEventListener('keydown', this.boundKeyHandler);
        
        // Click events for tiles
        const gameElement = document.getElementById('game');
        if (gameElement) {
            gameElement.addEventListener('click', this.boundTileClick);
        }
        
        // Touch events for mobile
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            gameContainer.addEventListener('touchstart', this.boundTouchStart, { passive: false });
            gameContainer.addEventListener('touchmove', this.boundTouchMove, { passive: false });
            gameContainer.addEventListener('touchend', this.boundTouchEnd, { passive: false });
        }
    }
    
    cleanup() {
        document.removeEventListener('keydown', this.boundKeyHandler);
        
        const gameElement = document.getElementById('game');
        if (gameElement) {
            gameElement.removeEventListener('click', this.boundTileClick);
        }
        
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            gameContainer.removeEventListener('touchstart', this.boundTouchStart);
            gameContainer.removeEventListener('touchmove', this.boundTouchMove);
            gameContainer.removeEventListener('touchend', this.boundTouchEnd);
        }
    }
    
    checkWin() {
        if (this.game.checkWin()) {
            this.showWinOverlay();
        }
    }
    
    showWinOverlay() {
        if (this.finalMovesElement) {
            this.finalMovesElement.textContent = `Moves: ${this.game.getMoves()}`;
        }
        if (this.winOverlay) {
            this.winOverlay.style.display = 'flex';
        }
    }
    
    hideWinOverlay() {
        if (this.winOverlay) {
            this.winOverlay.style.display = 'none';
        }
    }
    
    setupNewGameButton() {
        if (this.newGameButton) {
            this.newGameButton.addEventListener('click', () => {
                this.restartGame();
            });
        }
    }
    
    setupRestartButton() {
        if (this.newGameButton2) {
            this.newGameButton2.addEventListener('click', () => {
                this.restartGame();
            });
        }
    }
    
    setupOverlayDismiss() {
        if (this.winOverlay) {
            this.winOverlay.addEventListener('click', (e) => {
                if (e.target === this.winOverlay) {
                    this.hideWinOverlay();
                }
            });
        }
    }
    
    restartGame() {
        this.game = new SlidingNumbersGame();
        this.renderer.render(this.game.getGrid(), this.game.getMoves());
        this.hideWinOverlay();
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SlidingNumbersController();
});
