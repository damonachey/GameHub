class Minesweeper {
    constructor() {
        this.GRID_SIZE = 16;
        this.MINE_COUNT = 40;
        this.grid = [];
        this.gameBoard = document.getElementById('game-board');
        this.mineCountDisplay = document.getElementById('mine-count');
        this.gameOverlay = document.getElementById('game-over-overlay');
        this.overlayTitle = document.getElementById('overlay-title');
        this.overlayMessage = document.getElementById('overlay-message');
        this.newGameButton = document.getElementById('newGameButton');
        this.newGameButton2 = document.getElementById('newGameButton2');
        
        this.gameState = 'playing'; // 'playing', 'won', 'lost'
        this.flaggedMines = 0;
        this.revealedCells = 0;
        
        this.initializeGame();
        this.setupEventListeners();
    }
    
    initializeGame() {
        this.gameState = 'playing';
        this.flaggedMines = 0;
        this.revealedCells = 0;
        this.updateMineCounter();
        this.hideOverlay();
        this.createGrid();
        this.placeMines();
        this.calculateNumbers();
        this.renderBoard();
    }
    
    createGrid() {
        this.grid = [];
        for (var i = 0; i < this.GRID_SIZE; i++) {
            this.grid[i] = [];
            for (var j = 0; j < this.GRID_SIZE; j++) {
                this.grid[i][j] = {
                    isMine: false,
                    isRevealed: false,
                    isFlagged: false,
                    adjacentMines: 0,
                    row: i,
                    col: j
                };
            }
        }
    }
    
    placeMines() {
        var minesPlaced = 0;
        while (minesPlaced < this.MINE_COUNT) {
            var row = Math.floor(Math.random() * this.GRID_SIZE);
            var col = Math.floor(Math.random() * this.GRID_SIZE);
            
            if (!this.grid[row][col].isMine) {
                this.grid[row][col].isMine = true;
                minesPlaced++;
            }
        }
    }
    
    calculateNumbers() {
        for (var i = 0; i < this.GRID_SIZE; i++) {
            for (var j = 0; j < this.GRID_SIZE; j++) {
                if (!this.grid[i][j].isMine) {
                    this.grid[i][j].adjacentMines = this.countAdjacentMines(i, j);
                }
            }
        }
    }
    
    countAdjacentMines(row, col) {
        var count = 0;
        for (var i = -1; i <= 1; i++) {
            for (var j = -1; j <= 1; j++) {
                var newRow = row + i;
                var newCol = col + j;
                
                if (newRow >= 0 && newRow < this.GRID_SIZE && 
                    newCol >= 0 && newCol < this.GRID_SIZE && 
                    this.grid[newRow][newCol].isMine) {
                    count++;
                }
            }
        }
        return count;
    }
    
    renderBoard() {
        this.gameBoard.innerHTML = '';
        
        for (var i = 0; i < this.GRID_SIZE; i++) {
            for (var j = 0; j < this.GRID_SIZE; j++) {
                var cell = this.createCellElement(i, j);
                this.gameBoard.appendChild(cell);
            }
        }
    }
    
    createCellElement(row, col) {
        var cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.row = row;
        cell.dataset.col = col;
        
        var cellData = this.grid[row][col];
        
        if (cellData.isRevealed) {
            cell.classList.add('revealed');
            
            if (cellData.isMine) {
                cell.classList.add('mine');
                if (cellData.exploded) {
                    cell.classList.add('exploded');
                }
                cell.textContent = '💣';
            } else if (cellData.adjacentMines > 0) {
                cell.textContent = cellData.adjacentMines;
                cell.classList.add(`num-${cellData.adjacentMines}`);
            }
        } else if (cellData.isFlagged) {
            cell.classList.add('flagged');
            cell.textContent = '🚩';
        }
        
        return cell;
    }
    
    setupEventListeners() {
        this.gameBoard.addEventListener('click', (e) => this.handleCellClick(e));
        this.gameBoard.addEventListener('contextmenu', (e) => this.handleRightClick(e));
        this.newGameButton.addEventListener('click', () => this.initializeGame());
        this.newGameButton2.addEventListener('click', () => this.initializeGame());
        this.gameOverlay.addEventListener('click', (e) => {
            if (e.target === this.gameOverlay) {
                this.hideOverlay();
            }
        });
    }
    
    updateMineCounter() {
        this.mineCountDisplay.textContent = this.MINE_COUNT - this.flaggedMines;
    }
    
    showOverlay(title, message, isWin = false) {
        this.overlayTitle.textContent = title;
        this.overlayMessage.textContent = message;
        this.overlayTitle.className = isWin ? 'game-over-title win' : 'game-over-title lose';
        this.gameOverlay.style.display = 'flex';
    }
    
    hideOverlay() {
        this.gameOverlay.style.display = 'none';
    }
    
    handleCellClick(e) {
        if (this.gameState !== 'playing') return;
        
        var target = e.target;
        if (!target.classList.contains('cell')) return;
        
        var row = parseInt(target.dataset.row);
        var col = parseInt(target.dataset.col);
        var cell = this.grid[row][col];
        
        if (cell.isFlagged || cell.isRevealed) return;
        
        this.revealCell(row, col);
    }
    
    handleRightClick(e) {
        e.preventDefault();
        
        if (this.gameState !== 'playing') return;
        
        var target = e.target;
        if (!target.classList.contains('cell')) return;
        
        var row = parseInt(target.dataset.row);
        var col = parseInt(target.dataset.col);
        var cell = this.grid[row][col];
        
        if (cell.isRevealed) return;
        
        this.toggleFlag(row, col);
    }
    
    toggleFlag(row, col) {
        var cell = this.grid[row][col];
        
        if (cell.isFlagged) {
            cell.isFlagged = false;
            this.flaggedMines--;
        } else {
            cell.isFlagged = true;
            this.flaggedMines++;
        }
        
        this.updateMineCounter();
        this.renderBoard();
    }
    
    revealCell(row, col) {
        var cell = this.grid[row][col];
        
        if (cell.isRevealed || cell.isFlagged) return;
        
        cell.isRevealed = true;
        this.revealedCells++;
        
        if (cell.isMine) {
            cell.exploded = true;
            this.gameOver(false, row, col);
            return;
        }
        
        // If no adjacent mines, reveal surrounding cells
        if (cell.adjacentMines === 0) {
            this.revealAdjacentCells(row, col);
        }
        
        this.renderBoard();
        this.checkWinCondition();
    }
    
    gameOver(isWin, explodedRow = null, explodedCol = null) {
        this.gameState = isWin ? 'won' : 'lost';
        
        if (!isWin) {
            // Show explosion animation first, then reveal all mines
            this.renderBoard();
            setTimeout(() => {
                this.revealAllMines();
            }, 300);
        }
        
        var title = isWin ? 'Winner' : 'Game Over';
        var message = isWin ? 'You found all the mines!' : 'You hit a mine!';
        
        setTimeout(() => {
            this.showOverlay(title, message, isWin);
        }, isWin ? 100 : 800);
    }
    
    revealAllMines() {
        for (var i = 0; i < this.GRID_SIZE; i++) {
            for (var j = 0; j < this.GRID_SIZE; j++) {
                if (this.grid[i][j].isMine) {
                    this.grid[i][j].isRevealed = true;
                }
            }
        }
        this.renderBoard();
    }
    
    checkWinCondition() {
        var totalCells = this.GRID_SIZE * this.GRID_SIZE;
        var cellsToReveal = totalCells - this.MINE_COUNT;
        
        if (this.revealedCells === cellsToReveal) {
            this.gameOver(true);
        }
    }
    
    revealAdjacentCells(row, col) {
        for (var i = -1; i <= 1; i++) {
            for (var j = -1; j <= 1; j++) {
                var newRow = row + i;
                var newCol = col + j;
                
                if (newRow >= 0 && newRow < this.GRID_SIZE && 
                    newCol >= 0 && newCol < this.GRID_SIZE && 
                    !this.grid[newRow][newCol].isRevealed && 
                    !this.grid[newRow][newCol].isFlagged) {
                    
                    this.grid[newRow][newCol].isRevealed = true;
                    this.revealedCells++;
                    
                    // If this adjacent cell also has no adjacent mines, continue revealing
                    if (this.grid[newRow][newCol].adjacentMines === 0) {
                        this.revealAdjacentCells(newRow, newCol);
                    }
                }
            }
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Minesweeper();
});
