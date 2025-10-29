class Minesweeper {
    constructor() {
        this.GRID_SIZE = 16;
        this.MINE_COUNT = 40;
        this.grid = [];
        this.cellElements = []; // Cache DOM elements
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
        
        // Store bound event handlers
        this.boundCellClick = this.handleCellClick.bind(this);
        this.boundRightClick = this.handleRightClick.bind(this);
        
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
        for (let i = 0; i < this.GRID_SIZE; i++) {
            this.grid[i] = [];
            for (let j = 0; j < this.GRID_SIZE; j++) {
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
        let minesPlaced = 0;
        while (minesPlaced < this.MINE_COUNT) {
            const row = Math.floor(Math.random() * this.GRID_SIZE);
            const col = Math.floor(Math.random() * this.GRID_SIZE);
            
            if (!this.grid[row][col].isMine) {
                this.grid[row][col].isMine = true;
                minesPlaced++;
            }
        }
    }
    
    calculateNumbers() {
        for (let i = 0; i < this.GRID_SIZE; i++) {
            for (let j = 0; j < this.GRID_SIZE; j++) {
                if (!this.grid[i][j].isMine) {
                    this.grid[i][j].adjacentMines = this.countAdjacentMines(i, j);
                }
            }
        }
    }
    
    countAdjacentMines(row, col) {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const newRow = row + i;
                const newCol = col + j;
                
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
        if (!this.gameBoard) {
            return;
        }
        this.gameBoard.innerHTML = '';
        this.cellElements = [];
        
        for (let i = 0; i < this.GRID_SIZE; i++) {
            for (let j = 0; j < this.GRID_SIZE; j++) {
                const cell = this.createCellElement(i, j);
                this.gameBoard.appendChild(cell);
                this.cellElements.push(cell);
            }
        }
    }
    
    createCellElement(row, col) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.row = row;
        cell.dataset.col = col;
        
        this.updateCellElement(cell, row, col);
        return cell;
    }
    
    updateCellElement(cell, row, col) {
        const cellData = this.grid[row][col];
        
        // Reset classes
        cell.className = 'cell';
        cell.textContent = '';
        
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
    }
    
    setupEventListeners() {
        if (this.gameBoard) {
            this.gameBoard.addEventListener('click', this.boundCellClick);
            this.gameBoard.addEventListener('contextmenu', this.boundRightClick);
        }
        if (this.newGameButton) {
            this.newGameButton.addEventListener('click', () => this.initializeGame());
        }
        if (this.newGameButton2) {
            this.newGameButton2.addEventListener('click', () => this.initializeGame());
        }
        if (this.gameOverlay) {
            this.gameOverlay.addEventListener('click', (e) => {
                if (e.target === this.gameOverlay) {
                    this.hideOverlay();
                }
            });
        }
    }
    
    cleanup() {
        // Remove event listeners
        if (this.gameBoard) {
            this.gameBoard.removeEventListener('click', this.boundCellClick);
            this.gameBoard.removeEventListener('contextmenu', this.boundRightClick);
        }
    }
    
    updateMineCounter() {
        if (this.mineCountDisplay) {
            this.mineCountDisplay.textContent = this.MINE_COUNT - this.flaggedMines;
        }
    }
    
    showOverlay(title, message, isWin = false) {
        if (this.overlayTitle) {
            this.overlayTitle.textContent = title;
            this.overlayTitle.className = isWin ? 'game-over-title win' : 'game-over-title lose';
        }
        if (this.overlayMessage) {
            this.overlayMessage.textContent = message;
        }
        if (this.gameOverlay) {
            this.gameOverlay.style.display = 'flex';
        }
    }
    
    hideOverlay() {
        if (this.gameOverlay) {
            this.gameOverlay.style.display = 'none';
        }
    }
    
    handleCellClick(e) {
        if (this.gameState !== 'playing') {
            return;
        }
        
        const target = e.target;
        if (!target.classList.contains('cell')) {
            return;
        }
        
        const row = parseInt(target.dataset.row);
        const col = parseInt(target.dataset.col);
        const cell = this.grid[row][col];
        
        if (cell.isFlagged || cell.isRevealed) {
            return;
        }
        
        this.revealCell(row, col);
    }
    
    handleRightClick(e) {
        e.preventDefault();
        
        if (this.gameState !== 'playing') {
            return;
        }
        
        const target = e.target;
        if (!target.classList.contains('cell')) {
            return;
        }
        
        const row = parseInt(target.dataset.row);
        const col = parseInt(target.dataset.col);
        const cell = this.grid[row][col];
        
        if (cell.isRevealed) {
            return;
        }
        
        this.toggleFlag(row, col);
    }
    
    toggleFlag(row, col) {
        const cell = this.grid[row][col];
        
        if (cell.isFlagged) {
            cell.isFlagged = false;
            this.flaggedMines--;
        } else {
            cell.isFlagged = true;
            this.flaggedMines++;
        }
        
        this.updateMineCounter();
        // Update only this cell instead of re-rendering entire board
        const cellIndex = row * this.GRID_SIZE + col;
        if (this.cellElements[cellIndex]) {
            this.updateCellElement(this.cellElements[cellIndex], row, col);
        }
    }
    
    revealCell(row, col) {
        const cell = this.grid[row][col];
        
        if (cell.isRevealed || cell.isFlagged) {
            return;
        }
        
        cell.isRevealed = true;
        this.revealedCells++;
        
        // Update only this cell
        const cellIndex = row * this.GRID_SIZE + col;
        if (this.cellElements[cellIndex]) {
            this.updateCellElement(this.cellElements[cellIndex], row, col);
        }
        
        if (cell.isMine) {
            cell.exploded = true;
            this.gameOver(false, row, col);
            return;
        }
        
        // If no adjacent mines, reveal surrounding cells
        if (cell.adjacentMines === 0) {
            this.revealAdjacentCells(row, col);
        }
        
        this.checkWinCondition();
    }
    
    gameOver(isWin, explodedRow = null, explodedCol = null) {
        this.gameState = isWin ? 'won' : 'lost';
        
        if (!isWin) {
            setTimeout(() => {
                this.revealAllMines();
            }, 300);
        }
        
        const title = isWin ? 'Winner' : 'Game Over';
        const message = isWin ? 'You found all the mines!' : 'You hit a mine!';
        
        setTimeout(() => {
            this.showOverlay(title, message, isWin);
        }, isWin ? 100 : 800);
    }
    
    revealAllMines() {
        for (let i = 0; i < this.GRID_SIZE; i++) {
            for (let j = 0; j < this.GRID_SIZE; j++) {
                if (this.grid[i][j].isMine) {
                    this.grid[i][j].isRevealed = true;
                    const cellIndex = i * this.GRID_SIZE + j;
                    if (this.cellElements[cellIndex]) {
                        this.updateCellElement(this.cellElements[cellIndex], i, j);
                    }
                }
            }
        }
    }
    
    checkWinCondition() {
        const totalCells = this.GRID_SIZE * this.GRID_SIZE;
        const cellsToReveal = totalCells - this.MINE_COUNT;
        
        if (this.revealedCells === cellsToReveal) {
            this.gameOver(true);
        }
    }
    
    revealAdjacentCells(row, col) {
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const newRow = row + i;
                const newCol = col + j;
                
                if (newRow >= 0 && newRow < this.GRID_SIZE && 
                    newCol >= 0 && newCol < this.GRID_SIZE && 
                    !this.grid[newRow][newCol].isRevealed && 
                    !this.grid[newRow][newCol].isFlagged) {
                    
                    this.grid[newRow][newCol].isRevealed = true;
                    this.revealedCells++;
                    
                    // Update the cell element
                    const cellIndex = newRow * this.GRID_SIZE + newCol;
                    if (this.cellElements[cellIndex]) {
                        this.updateCellElement(this.cellElements[cellIndex], newRow, newCol);
                    }
                    
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
