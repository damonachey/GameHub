// Minesweeper Game Model (Logic)
class MinesweeperGame {
    constructor(gridSize = 16, mineCount = 40) {
        this.GRID_SIZE = gridSize;
        this.MINE_COUNT = mineCount;
        this.grid = [];
        this.gameState = 'playing';
        this.flaggedMines = 0;
        this.revealedCells = 0;
    }
    
    initializeGame() {
        this.gameState = 'playing';
        this.flaggedMines = 0;
        this.revealedCells = 0;
        this.createGrid();
        this.placeMines();
        this.calculateNumbers();
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
    
    toggleFlag(row, col) {
        const cell = this.grid[row][col];
        
        if (cell.isRevealed) {
            return false;
        }
        
        if (cell.isFlagged) {
            cell.isFlagged = false;
            this.flaggedMines--;
        } else {
            cell.isFlagged = true;
            this.flaggedMines++;
        }
        
        return true;
    }
    
    revealCell(row, col) {
        const cell = this.grid[row][col];
        
        if (cell.isRevealed || cell.isFlagged) {
            return { revealed: false };
        }
        
        cell.isRevealed = true;
        this.revealedCells++;
        
        if (cell.isMine) {
            cell.exploded = true;
            this.gameState = 'lost';
            return { revealed: true, hitMine: true };
        }
        
        const cellsToReveal = [];
        if (cell.adjacentMines === 0) {
            cellsToReveal.push(...this.getAdjacentCellsToReveal(row, col));
        }
        
        if (this.checkWinCondition()) {
            this.gameState = 'won';
        }
        
        return { revealed: true, hitMine: false, cellsToReveal };
    }
    
    getAdjacentCellsToReveal(row, col) {
        const cellsToReveal = [];
        
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
                    cellsToReveal.push({ row: newRow, col: newCol });
                    
                    if (this.grid[newRow][newCol].adjacentMines === 0) {
                        cellsToReveal.push(...this.getAdjacentCellsToReveal(newRow, newCol));
                    }
                }
            }
        }
        
        return cellsToReveal;
    }
    
    checkWinCondition() {
        const totalCells = this.GRID_SIZE * this.GRID_SIZE;
        const cellsToReveal = totalCells - this.MINE_COUNT;
        return this.revealedCells === cellsToReveal;
    }
    
    revealAllMines() {
        const mines = [];
        for (let i = 0; i < this.GRID_SIZE; i++) {
            for (let j = 0; j < this.GRID_SIZE; j++) {
                if (this.grid[i][j].isMine) {
                    this.grid[i][j].isRevealed = true;
                    mines.push({ row: i, col: j });
                }
            }
        }
        return mines;
    }
    
    getRemainingMines() {
        return this.MINE_COUNT - this.flaggedMines;
    }
}

// Minesweeper Game Renderer (View)
class MinesweeperRenderer {
    constructor() {
        this.gameBoard = document.getElementById('game-board');
        this.mineCountDisplay = document.getElementById('mine-count');
        this.gameOverlay = document.getElementById('game-over-overlay');
        this.overlayTitle = document.getElementById('overlay-title');
        this.overlayMessage = document.getElementById('overlay-message');
        this.cellElements = [];
    }
    
    renderBoard(game, onCellClick, onCellRightClick) {
        if (!this.gameBoard) {
            return;
        }
        this.gameBoard.innerHTML = '';
        this.cellElements = [];
        
        for (let i = 0; i < game.GRID_SIZE; i++) {
            for (let j = 0; j < game.GRID_SIZE; j++) {
                const cell = this.createCellElement(game.grid[i][j]);
                cell.addEventListener('click', () => onCellClick(i, j));
                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    onCellRightClick(i, j);
                });
                this.gameBoard.appendChild(cell);
                this.cellElements.push(cell);
            }
        }
    }
    
    createCellElement(cellData) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.row = cellData.row;
        cell.dataset.col = cellData.col;
        this.updateCellElement(cell, cellData);
        return cell;
    }
    
    updateCellElement(cell, cellData) {
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
    
    updateCell(row, col, game) {
        const cellIndex = row * game.GRID_SIZE + col;
        if (this.cellElements[cellIndex]) {
            this.updateCellElement(this.cellElements[cellIndex], game.grid[row][col]);
        }
    }
    
    updateCells(cells, game) {
        for (const {row, col} of cells) {
            this.updateCell(row, col, game);
        }
    }
    
    updateMineCounter(remaining) {
        if (this.mineCountDisplay) {
            this.mineCountDisplay.textContent = remaining;
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
}

// Minesweeper Game Controller
class MinesweeperController {
    constructor() {
        this.game = new MinesweeperGame();
        this.renderer = new MinesweeperRenderer();
        this.newGameButton = document.getElementById('newGameButton');
        this.newGameButton2 = document.getElementById('newGameButton2');
        
        this.setupEventListeners();
        this.initializeGame();
    }
    
    initializeGame() {
        this.game.initializeGame();
        this.renderer.renderBoard(
            this.game,
            this.onCellClick.bind(this),
            this.onCellRightClick.bind(this)
        );
        this.renderer.updateMineCounter(this.game.getRemainingMines());
        this.renderer.hideOverlay();
    }
    
    onCellClick(row, col) {
        if (this.game.gameState !== 'playing') {
            return;
        }
        
        const result = this.game.revealCell(row, col);
        
        if (!result.revealed) {
            return;
        }
        
        this.renderer.updateCell(row, col, this.game);
        
        if (result.cellsToReveal && result.cellsToReveal.length > 0) {
            this.renderer.updateCells(result.cellsToReveal, this.game);
        }
        
        if (result.hitMine) {
            setTimeout(() => {
                const mines = this.game.revealAllMines();
                this.renderer.updateCells(mines, this.game);
            }, 300);
            
            setTimeout(() => {
                this.renderer.showOverlay('Game Over', 'You hit a mine!', false);
            }, 800);
        } else if (this.game.gameState === 'won') {
            setTimeout(() => {
                this.renderer.showOverlay('Winner', 'You found all the mines!', true);
            }, 100);
        }
    }
    
    onCellRightClick(row, col) {
        if (this.game.gameState !== 'playing') {
            return;
        }
        
        if (this.game.toggleFlag(row, col)) {
            this.renderer.updateCell(row, col, this.game);
            this.renderer.updateMineCounter(this.game.getRemainingMines());
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
        
        if (this.renderer.gameOverlay) {
            this.renderer.gameOverlay.addEventListener('click', (e) => {
                if (e.target === this.renderer.gameOverlay) {
                    this.renderer.hideOverlay();
                }
            });
        }
    }
    
    cleanup() {
        // No timers or intervals to clean up in this game
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MinesweeperController();
});
