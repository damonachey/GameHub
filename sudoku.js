// Sudoku Game Controller
class SudokuController {
    constructor() {
        this.gameElement = document.getElementById('game');
        this.gameOverOverlay = document.getElementById('gameOverOverlay');
        this.restartButton = document.getElementById('restartButton');
        this.selectedCell = null;
        
        // Initialize empty 9x9 grid
        this.grid = Array(9).fill().map(() => Array(9).fill(0));
        
        // Initialize the game
        this.initializeGrid();
        this.setupEventListeners();
    }
    
    initializeGrid() {
        this.gameElement.innerHTML = '';
        
        // Create 9 boxes (3x3 grid of boxes)
        for (var boxIndex = 0; boxIndex < 9; boxIndex++) {
            var box = document.createElement('div');
            box.className = 'sudoku-box';
            box.id = 'box-' + boxIndex;
            
            // Create 9 cells in each box
            for (var cellIndex = 0; cellIndex < 9; cellIndex++) {
                var cell = document.createElement('div');
                cell.className = 'cell';
                
                // Calculate actual row and column in the full 9x9 grid
                var boxRow = Math.floor(boxIndex / 3);
                var boxCol = boxIndex % 3;
                var cellRow = Math.floor(cellIndex / 3);
                var cellCol = cellIndex % 3;
                var actualRow = boxRow * 3 + cellRow;
                var actualCol = boxCol * 3 + cellCol;
                var globalIndex = actualRow * 9 + actualCol;
                
                cell.id = 'cell-' + globalIndex;
                cell.setAttribute('data-row', actualRow);
                cell.setAttribute('data-col', actualCol);
                cell.setAttribute('tabindex', '0');
                
                // Add click event to select cell
                cell.addEventListener('click', () => {
                    this.selectCell(cell);
                });
                
                // Add keyboard event for number input
                cell.addEventListener('keydown', (event) => {
                    this.handleKeyInput(event, cell);
                });
                
                box.appendChild(cell);
            }
            
            this.gameElement.appendChild(box);
        }
    }
    
    selectCell(cell) {
        // Remove selection from previous cell
        if (this.selectedCell) {
            this.selectedCell.classList.remove('selected');
        }
        
        // Select new cell
        this.selectedCell = cell;
        cell.classList.add('selected');
        cell.focus();
    }
    
    handleKeyInput(event, cell) {
        var key = event.key;
        var row = parseInt(cell.getAttribute('data-row'));
        var col = parseInt(cell.getAttribute('data-col'));
        
        // Handle number input (1-9)
        if (key >= '1' && key <= '9') {
            event.preventDefault();
            var number = parseInt(key);
            this.setCellValue(row, col, number);
            cell.textContent = number;
        }
        // Handle clear input (backspace, delete, or 0)
        else if (key === 'Backspace' || key === 'Delete' || key === '0') {
            event.preventDefault();
            this.setCellValue(row, col, 0);
            cell.textContent = '';
        }
        // Handle arrow key navigation
        else if (key.startsWith('Arrow')) {
            event.preventDefault();
            this.handleArrowNavigation(key, row, col);
        }
    }
    
    setCellValue(row, col, value) {
        this.grid[row][col] = value;
        // Here you could add validation logic later
    }
    
    handleArrowNavigation(key, row, col) {
        var newRow = row;
        var newCol = col;
        
        switch(key) {
            case 'ArrowUp':
                newRow = Math.max(0, row - 1);
                break;
            case 'ArrowDown':
                newRow = Math.min(8, row + 1);
                break;
            case 'ArrowLeft':
                newCol = Math.max(0, col - 1);
                break;
            case 'ArrowRight':
                newCol = Math.min(8, col + 1);
                break;
        }
        
        var newIndex = newRow * 9 + newCol;
        var newCell = document.getElementById('cell-' + newIndex);
        if (newCell) {
            this.selectCell(newCell);
        }
    }
    
    setupEventListeners() {
        // Restart button
        this.restartButton.addEventListener('click', () => {
            this.restartGame();
        });
        
        // Prevent context menu on right click
        this.gameElement.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        });
    }
    
    restartGame() {
        // Reset grid
        this.grid = Array(9).fill().map(() => Array(9).fill(0));
        
        // Clear all cells
        var cells = this.gameElement.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('given', 'error', 'selected');
        });
        
        // Hide overlay
        this.gameOverOverlay.style.display = 'none';
        
        // Clear selection
        this.selectedCell = null;
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SudokuController();
});