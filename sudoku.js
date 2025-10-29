// Sudoku Game Model (Logic)
class SudokuGame {
    constructor() {
        // Initialize empty 9x9 grid
        this.grid = Array(9).fill().map(() => Array(9).fill(0));
        this.solution = Array(9).fill().map(() => Array(9).fill(0));
        this.givens = Array(9).fill().map(() => Array(9).fill(false));
        this.possibleValues = Array(9).fill().map(() => Array(9).fill().map(() => new Set()));
        this.copiedPossibleValues = null;
    }
    
    newGame() {
        // Generate a new random Sudoku puzzle
        this.solution = this.generateCompleteSolution();
        this.grid = this.solution.map(row => [...row]);
        this.createPuzzleFromSolution();
    }
    
    generateCompleteSolution() {
        const grid = Array(9).fill().map(() => Array(9).fill(0));
        this.solveSudoku(grid);
        return grid;
    }
    
    solveSudoku(grid) {
        const emptyCell = this.findEmptyCell(grid);
        if (!emptyCell) {
            return true;
        }
        
        const [row, col] = emptyCell;
        const numbers = this.shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        
        for (const num of numbers) {
            if (this.isValidMove(grid, row, col, num)) {
                grid[row][col] = num;
                
                if (this.solveSudoku(grid)) {
                    return true;
                }
                
                grid[row][col] = 0;
            }
        }
        
        return false;
    }
    
    findEmptyCell(grid) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] === 0) {
                    return [row, col];
                }
            }
        }
        return null;
    }
    
    isValidMove(grid, row, col, num) {
        // Check row
        for (let i = 0; i < 9; i++) {
            if (grid[row][i] === num) {
                return false;
            }
        }
        
        // Check column
        for (let i = 0; i < 9; i++) {
            if (grid[i][col] === num) {
                return false;
            }
        }
        
        // Check 3x3 box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        
        for (let i = boxRow; i < boxRow + 3; i++) {
            for (let j = boxCol; j < boxCol + 3; j++) {
                if (grid[i][j] === num) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    createPuzzleFromSolution() {
        // Reset givens array
        this.givens = Array(9).fill().map(() => Array(9).fill(false));
        // Reset possible values
        this.possibleValues = Array(9).fill().map(() => Array(9).fill().map(() => new Set()));
        
        // Create a list of all cell positions
        const positions = [];
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                positions.push([row, col]);
            }
        }
        
        // Shuffle positions randomly
        const shuffledPositions = this.shuffleArray(positions);
        
        // Remove numbers while ensuring puzzle remains solvable
        const cellsToRemove = 50;
        let removed = 0;
        
        for (const [row, col] of shuffledPositions) {
            if (removed >= cellsToRemove) {
                break;
            }
            
            const backup = this.grid[row][col];
            this.grid[row][col] = 0;
            
            if (this.hasUniqueSolution()) {
                removed++;
            } else {
                this.grid[row][col] = backup;
            }
        }
        
        // Mark remaining numbers as givens
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.grid[row][col] !== 0) {
                    this.givens[row][col] = true;
                }
            }
        }
    }
    
    hasUniqueSolution() {
        const testGrid = this.grid.map(row => [...row]);
        const solutions = this.countSolutions(testGrid, 0);
        return solutions === 1;
    }
    
    countSolutions(grid, count) {
        if (count > 1) {
            return count;
        }
        
        const emptyCell = this.findEmptyCell(grid);
        if (!emptyCell) {
            return count + 1;
        }
        
        const [row, col] = emptyCell;
        
        for (let num = 1; num <= 9; num++) {
            if (this.isValidMove(grid, row, col, num)) {
                grid[row][col] = num;
                count = this.countSolutions(grid, count);
                grid[row][col] = 0;
                
                if (count > 1) {
                    break;
                }
            }
        }
        
        return count;
    }
    
    setCellValue(row, col, value) {
        if (this.givens[row][col]) {
            return false;
        }
        
        this.grid[row][col] = value;
        
        if (value !== 0) {
            // Clear possible values when entering a number
            this.possibleValues[row][col].clear();
        } else {
            // Clear possible values when deleting/clearing
            this.possibleValues[row][col].clear();
        }
        
        return true;
    }
    
    togglePossibleValue(row, col, number) {
        if (this.givens[row][col]) {
            return false;
        }
        
        // Clear the entered number when adding possible values
        if (this.grid[row][col] !== 0) {
            this.grid[row][col] = 0;
        }
        
        const possibleSet = this.possibleValues[row][col];
        if (possibleSet.has(number)) {
            possibleSet.delete(number);
        } else {
            possibleSet.add(number);
        }
        
        return true;
    }
    
    copyPossibleValues(row, col) {
        if (this.givens[row][col]) {
            return;
        }
        this.copiedPossibleValues = new Set(this.possibleValues[row][col]);
    }
    
    pastePossibleValues(row, col) {
        if (this.givens[row][col] || !this.copiedPossibleValues) {
            return false;
        }
        
        if (this.grid[row][col] !== 0) {
            this.grid[row][col] = 0;
        }
        
        this.possibleValues[row][col] = new Set(this.copiedPossibleValues);
        return true;
    }
    
    checkSolution() {
        const results = { hasErrors: false, isComplete: true, errors: [] };
        
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const value = this.grid[row][col];
                
                if (value === 0) {
                    results.isComplete = false;
                } else if (!this.givens[row][col] && value !== this.solution[row][col]) {
                    results.hasErrors = true;
                    results.errors.push({ row, col });
                }
            }
        }
        
        return results;
    }
}

// Sudoku Game Renderer (View)
class SudokuRenderer {
    constructor(gameElement) {
        if (!gameElement) {
            throw new Error('Game element not found');
        }
        this.gameElement = gameElement;
        this.cellElements = [];
    }
    
    initializeGrid(onCellClick) {
        this.gameElement.innerHTML = '';
        this.cellElements = [];
        
        for (let boxIndex = 0; boxIndex < 9; boxIndex++) {
            const box = document.createElement('div');
            box.className = 'sudoku-box';
            box.id = 'box-' + boxIndex;
            
            for (let cellIndex = 0; cellIndex < 9; cellIndex++) {
                const boxRow = Math.floor(boxIndex / 3);
                const boxCol = boxIndex % 3;
                const cellRow = Math.floor(cellIndex / 3);
                const cellCol = cellIndex % 3;
                const actualRow = boxRow * 3 + cellRow;
                const actualCol = boxCol * 3 + cellCol;
                const globalIndex = actualRow * 9 + actualCol;
                
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.id = 'cell-' + globalIndex;
                cell.setAttribute('data-row', actualRow);
                cell.setAttribute('data-col', actualCol);
                cell.setAttribute('tabindex', '0');
                
                const mainNumber = document.createElement('div');
                mainNumber.className = 'main-number';
                mainNumber.id = 'main-' + globalIndex;
                cell.appendChild(mainNumber);
                
                const overlay = document.createElement('div');
                overlay.className = 'possible-values-overlay';
                overlay.id = 'overlay-' + globalIndex;
                cell.appendChild(overlay);
                
                cell.addEventListener('click', () => onCellClick(cell));
                
                box.appendChild(cell);
                this.cellElements.push(cell);
            }
            
            this.gameElement.appendChild(box);
        }
    }
    
    renderGrid(game) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cellIndex = row * 9 + col;
                const cell = document.getElementById('cell-' + cellIndex);
                const mainDiv = document.getElementById('main-' + cellIndex);
                
                if (cell && mainDiv) {
                    const value = game.grid[row][col];
                    mainDiv.textContent = value === 0 ? '' : value;
                    
                    if (game.givens[row][col]) {
                        cell.classList.add('given');
                        cell.classList.remove('user-entered');
                    } else {
                        cell.classList.remove('given');
                    }
                    
                    cell.classList.remove('error', 'selected', 'correct');
                    this.renderPossibleValues(row, col, game.possibleValues[row][col]);
                }
            }
        }
    }
    
    renderPossibleValues(row, col, possibleSet) {
        const cellIndex = row * 9 + col;
        const overlay = document.getElementById('overlay-' + cellIndex);
        
        if (overlay) {
            overlay.innerHTML = '';
            
            for (let num = 1; num <= 9; num++) {
                const possibleDiv = document.createElement('div');
                possibleDiv.className = 'possible-value';
                
                if (possibleSet.has(num)) {
                    possibleDiv.textContent = num;
                }
                
                overlay.appendChild(possibleDiv);
            }
        }
    }
    
    updateCell(row, col, value, isGiven, isUserEntered) {
        const cellIndex = row * 9 + col;
        const cell = document.getElementById('cell-' + cellIndex);
        const mainDiv = document.getElementById('main-' + cellIndex);
        
        if (cell && mainDiv) {
            mainDiv.textContent = value === 0 ? '' : value;
            
            if (isUserEntered) {
                cell.classList.add('user-entered');
            } else {
                cell.classList.remove('user-entered');
            }
        }
    }
    
    highlightErrors(errors) {
        this.clearHighlighting();
        for (const {row, col} of errors) {
            const cellIndex = row * 9 + col;
            const cell = document.getElementById('cell-' + cellIndex);
            if (cell) {
                cell.classList.add('error');
            }
        }
    }
    
    highlightCorrect(correctCells) {
        for (const {row, col} of correctCells) {
            const cellIndex = row * 9 + col;
            const cell = document.getElementById('cell-' + cellIndex);
            if (cell) {
                cell.classList.add('correct');
            }
        }
    }
    
    clearHighlighting() {
        for (let i = 0; i < 81; i++) {
            const cell = document.getElementById('cell-' + i);
            if (cell) {
                cell.classList.remove('error', 'correct');
            }
        }
    }
    
    selectCell(cell, previousCell) {
        if (previousCell) {
            previousCell.classList.remove('selected');
        }
        if (cell) {
            cell.classList.add('selected');
            cell.focus();
        }
    }
}

// Sudoku Game Controller
class SudokuController {
    constructor() {
        const gameElement = document.getElementById('game');
        this.gameOverOverlay = document.getElementById('gameOverOverlay');
        this.newGameButton = document.getElementById('newGameButton');
        this.checkGameButton = document.getElementById('checkGameButton');
        this.showSolutionButton = document.getElementById('showSolutionButton');
        this.newGameButton2 = document.getElementById('newGameButton2');
        this.pencilModeBtn = document.getElementById('pencilModeBtn');
        this.eraseBtn = document.getElementById('eraseBtn');
        
        if (!gameElement) {
            console.error('Game element not found');
            return;
        }
        
        this.game = new SudokuGame();
        this.renderer = new SudokuRenderer(gameElement);
        this.selectedCell = null;
        this.pencilMode = false;
        
        // Store bound event handler
        this.boundKeyHandler = this.handleKeyInput.bind(this);
        
        this.renderer.initializeGrid(this.onCellClick.bind(this));
        this.setupEventListeners();
        this.setupNumberPad();
        
        const firstCell = document.getElementById('cell-0');
        if (firstCell) {
            this.onCellClick(firstCell);
        }
        
        this.newGame();
    }

    onCellClick(cell) {
        const previousCell = this.selectedCell;
        this.selectedCell = cell;
        this.renderer.selectCell(cell, previousCell);
    }

    handleKeyInput(event) {
        if (!this.selectedCell) {
            return;
        }
        
        const key = event.key;
        const code = event.code;
        const row = parseInt(this.selectedCell.getAttribute('data-row'));
        const col = parseInt(this.selectedCell.getAttribute('data-col'));
        
        // Handle CTRL-C (copy)
        if (event.ctrlKey && key === 'c') {
            event.preventDefault();
            this.game.copyPossibleValues(row, col);
            return;
        }
        
        // Handle CTRL-V (paste)
        if (event.ctrlKey && key === 'v') {
            event.preventDefault();
            if (this.game.pastePossibleValues(row, col)) {
                const cellIndex = row * 9 + col;
                const mainDiv = document.getElementById('main-' + cellIndex);
                if (mainDiv) {
                    mainDiv.textContent = '';
                }
                this.renderer.renderPossibleValues(row, col, this.game.possibleValues[row][col]);
            }
            return;
        }
        
        // Handle number input (1-9)
        const digitMatch = code.match(/^Digit([1-9])$/);
        if (digitMatch) {
            event.preventDefault();
            const number = parseInt(digitMatch[1]);
            
            if (event.shiftKey) {
                if (this.game.togglePossibleValue(row, col, number)) {
                    const cellIndex = row * 9 + col;
                    const mainDiv = document.getElementById('main-' + cellIndex);
                    if (mainDiv) {
                        mainDiv.textContent = '';
                    }
                    this.renderer.renderPossibleValues(row, col, this.game.possibleValues[row][col]);
                }
            } else {
                if (this.game.setCellValue(row, col, number)) {
                    this.renderer.updateCell(row, col, number, false, true);
                    this.renderer.renderPossibleValues(row, col, this.game.possibleValues[row][col]);
                }
            }
        }
        // Handle legacy number input
        else if (key >= '1' && key <= '9' && !event.shiftKey) {
            event.preventDefault();
            const number = parseInt(key);
            if (this.game.setCellValue(row, col, number)) {
                this.renderer.updateCell(row, col, number, false, true);
                this.renderer.renderPossibleValues(row, col, this.game.possibleValues[row][col]);
            }
        }
        // Handle clear input
        else if (key === 'Backspace' || key === 'Delete' || key === '0') {
            event.preventDefault();
            if (this.game.setCellValue(row, col, 0)) {
                const cellIndex = row * 9 + col;
                const mainDiv = document.getElementById('main-' + cellIndex);
                if (mainDiv) {
                    mainDiv.textContent = '';
                }
                this.renderer.renderPossibleValues(row, col, this.game.possibleValues[row][col]);
            }
        }
        // Handle arrow key navigation
        else if (key.startsWith('Arrow')) {
            event.preventDefault();
            this.handleArrowNavigation(key, row, col);
        }
    }


    handleArrowNavigation(key, row, col) {
        let newRow = row;
        let newCol = col;

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

        if (newRow !== row || newCol !== col) {
            const newIndex = newRow * 9 + newCol;
            const newCell = document.getElementById('cell-' + newIndex);
            if (newCell) {
                this.onCellClick(newCell);
            }
        }
    }

    setupEventListeners() {
        if (this.newGameButton) {
            this.newGameButton.addEventListener('click', () => {
                this.newGame();
            });
        }
        
        if (this.newGameButton2) {
            this.newGameButton2.addEventListener('click', () => {
                if (this.gameOverOverlay) {
                    this.gameOverOverlay.style.display = 'none';
                }
                this.newGame();
            });
        }
        
        if (this.checkGameButton) {
            this.checkGameButton.addEventListener('click', () => {
                this.checkGame();
            });
        }
        
        if (this.showSolutionButton) {
            this.showSolutionButton.addEventListener('click', () => {
                this.showSolution();
            });
        }

        if (this.renderer.gameElement) {
            this.renderer.gameElement.addEventListener('contextmenu', (event) => {
                event.preventDefault();
            });
        }

        document.addEventListener('keydown', this.boundKeyHandler);
        
        if (this.gameOverOverlay) {
            this.gameOverOverlay.addEventListener('click', (e) => {
                if (e.target === this.gameOverOverlay) {
                    this.gameOverOverlay.style.display = 'none';
                }
            });
        }
    }
    
    setupNumberPad() {
        // Number buttons (1-9)
        const numberButtons = document.querySelectorAll('.number-btn');
        numberButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                if (!this.selectedCell) {
                    return;
                }
                
                const number = parseInt(btn.getAttribute('data-number'));
                const row = parseInt(this.selectedCell.getAttribute('data-row'));
                const col = parseInt(this.selectedCell.getAttribute('data-col'));
                
                if (this.pencilMode) {
                    // Pencil mode - toggle possible value
                    if (this.game.togglePossibleValue(row, col, number)) {
                        const cellIndex = row * 9 + col;
                        const mainDiv = document.getElementById('main-' + cellIndex);
                        if (mainDiv) {
                            mainDiv.textContent = '';
                        }
                        this.renderer.renderPossibleValues(row, col, this.game.possibleValues[row][col]);
                    }
                } else {
                    // Normal mode - set cell value
                    if (this.game.setCellValue(row, col, number)) {
                        this.renderer.updateCell(row, col, number, false, true);
                        this.renderer.renderPossibleValues(row, col, this.game.possibleValues[row][col]);
                    }
                }
            });
        });
        
        // Pencil mode button
        if (this.pencilModeBtn) {
            this.pencilModeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.pencilMode = !this.pencilMode;
                this.pencilModeBtn.classList.toggle('active', this.pencilMode);
            });
        }
        
        // Erase button
        if (this.eraseBtn) {
            this.eraseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (!this.selectedCell) {
                    return;
                }
                
                const row = parseInt(this.selectedCell.getAttribute('data-row'));
                const col = parseInt(this.selectedCell.getAttribute('data-col'));
                
                if (this.game.setCellValue(row, col, 0)) {
                    const cellIndex = row * 9 + col;
                    const mainDiv = document.getElementById('main-' + cellIndex);
                    if (mainDiv) {
                        mainDiv.textContent = '';
                    }
                    this.renderer.renderPossibleValues(row, col, this.game.possibleValues[row][col]);
                }
            });
        }
    }
    
    cleanup() {
        document.removeEventListener('keydown', this.boundKeyHandler);
    }

    newGame() {
        this.game.newGame();
        this.renderer.renderGrid(this.game);
    }
    
    
    checkGame() {
        const results = this.game.checkSolution();
        
        this.renderer.clearHighlighting();
        
        if (results.errors.length > 0) {
            this.renderer.highlightErrors(results.errors);
        }
        
        // Highlight correct cells
        const correctCells = [];
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const value = this.game.grid[row][col];
                if (value !== 0 && !this.game.givens[row][col] && value === this.game.solution[row][col]) {
                    correctCells.push({ row, col });
                }
            }
        }
        this.renderer.highlightCorrect(correctCells);
        
        if (!results.hasErrors && results.isComplete) {
            this.showSuccessOverlay();
        }
    }
    
    showSuccessOverlay() {
        if (this.gameOverOverlay) {
            this.gameOverOverlay.style.display = 'flex';
        }
    }
    
    showSolution() {
        this.renderer.clearHighlighting();
        
        const errors = [];
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cellIndex = row * 9 + col;
                const cell = document.getElementById('cell-' + cellIndex);
                const mainDiv = document.getElementById('main-' + cellIndex);
                
                if (cell && mainDiv) {
                    const playerValue = this.game.grid[row][col];
                    const solutionValue = this.game.solution[row][col];
                    
                    mainDiv.textContent = solutionValue;
                    
                    if (!this.game.givens[row][col] && playerValue !== 0 && playerValue !== solutionValue) {
                        errors.push({ row, col });
                    }
                    
                    if (!this.game.givens[row][col]) {
                        cell.classList.add('user-entered');
                    }
                    
                    this.game.grid[row][col] = solutionValue;
                }
            }
        }
        
        if (errors.length > 0) {
            this.renderer.highlightErrors(errors);
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SudokuController();
});