// Sudoku Game Controller
class SudokuController {
    constructor() {
        this.gameElement = document.getElementById('game');
        this.gameOverOverlay = document.getElementById('gameOverOverlay');
        this.restartButton = document.getElementById('restartButton');
        this.newGameButton = document.getElementById('newGameButton');
        this.checkGameButton = document.getElementById('checkGameButton');
        this.showSolutionButton = document.getElementById('showSolutionButton');
        this.newGameButton2 = document.getElementById('newGameButton2');

        // Initialize empty 9x9 grid
        this.grid = Array(9).fill().map(() => Array(9).fill(0));
        this.solution = Array(9).fill().map(() => Array(9).fill(0));
        this.givens = Array(9).fill().map(() => Array(9).fill(false));
        this.possibleValues = Array(9).fill().map(() => Array(9).fill().map(() => new Set()));
        this.copiedPossibleValues = null;

        // Initialize the game
        this.initializeGrid();
        this.setupEventListeners();

        // Select the first cell by default
        var firstCell = document.getElementById('cell-0');
        if (firstCell) {
            this.selectCell(firstCell);
        }
        
        // Start a new game
        this.newGame();
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

                // Create main number display
                var mainNumber = document.createElement('div');
                mainNumber.className = 'main-number';
                mainNumber.id = 'main-' + globalIndex;
                cell.appendChild(mainNumber);
                
                // Create overlay for possible values
                var overlay = document.createElement('div');
                overlay.className = 'possible-values-overlay';
                overlay.id = 'overlay-' + globalIndex;
                cell.appendChild(overlay);

                // Add click event to select cell (using closure to capture correct cell)
                cell.addEventListener('click', ((currentCell) => {
                    return () => {
                        this.selectCell(currentCell);
                    };
                })(cell));

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
        var code = event.code;
        var row = parseInt(cell.getAttribute('data-row'));
        var col = parseInt(cell.getAttribute('data-col'));
        
        // Handle CTRL-C (copy)
        if (event.ctrlKey && key === 'c') {
            event.preventDefault();
            this.copyPossibleValues(row, col);
            return;
        }
        
        // Handle CTRL-V (paste)
        if (event.ctrlKey && key === 'v') {
            event.preventDefault();
            this.pastePossibleValues(row, col);
            return;
        }
        
        // Handle number input (1-9) - use code to detect physical key
        var digitMatch = code.match(/^Digit([1-9])$/);
        if (digitMatch) {
            event.preventDefault();
            var number = parseInt(digitMatch[1]);
            
            if (event.shiftKey) {
                // Toggle possible value
                this.togglePossibleValue(row, col, number);
            } else {
                // Set main cell value
                if (this.setCellValue(row, col, number)) {
                    var cellIndex = row * 9 + col;
                    var mainDiv = document.getElementById('main-' + cellIndex);
                    if (mainDiv) {
                        mainDiv.textContent = number;
                    }
                }
            }
        }
        // Handle legacy number input for non-shift cases
        else if (key >= '1' && key <= '9' && !event.shiftKey) {
            event.preventDefault();
            var number = parseInt(key);
            // Set main cell value
            if (this.setCellValue(row, col, number)) {
                var cellIndex = row * 9 + col;
                var mainDiv = document.getElementById('main-' + cellIndex);
                if (mainDiv) {
                    mainDiv.textContent = number;
                }
            }
        }
        // Handle clear input (backspace, delete, or 0)
        else if (key === 'Backspace' || key === 'Delete' || key === '0') {
            event.preventDefault();
            if (this.setCellValue(row, col, 0)) {
                var cellIndex = row * 9 + col;
                var mainDiv = document.getElementById('main-' + cellIndex);
                if (mainDiv) {
                    mainDiv.textContent = '';
                }
                // Clear possible values overlay
                this.possibleValues[row][col].clear();
                this.renderPossibleValues(row, col);
            }
        }
        // Handle arrow key navigation
        else if (key.startsWith('Arrow')) {
            event.preventDefault();
            this.handleArrowNavigation(key, row, col);
        }
    }

    setCellValue(row, col, value) {
        // Don't allow changes to given numbers
        if (this.givens[row][col]) {
            return false;
        }
        
        this.grid[row][col] = value;
        
        // Apply styling for user-entered numbers
        var cellIndex = row * 9 + col;
        var cell = document.getElementById('cell-' + cellIndex);
        if (cell) {
            if (value !== 0) {
                cell.classList.add('user-entered');
                // Clear possible values when a main number is entered
                this.possibleValues[row][col].clear();
                this.renderPossibleValues(row, col);
            } else {
                cell.classList.remove('user-entered');
            }
        }
        
        return true;
    }
    
    togglePossibleValue(row, col, number) {
        // Don't allow changes to given numbers
        if (this.givens[row][col]) {
            return false;
        }
        
        var possibleSet = this.possibleValues[row][col];
        if (possibleSet.has(number)) {
            possibleSet.delete(number);
        } else {
            // Clear main cell value when adding possible values
            if (this.grid[row][col] !== 0) {
                this.grid[row][col] = 0;
                var cellIndex = row * 9 + col;
                var mainDiv = document.getElementById('main-' + cellIndex);
                if (mainDiv) {
                    mainDiv.textContent = '';
                }
            }
            possibleSet.add(number);
        }
        
        // Re-render the possible values for this cell
        this.renderPossibleValues(row, col);
        
        return true;
    }
    
    renderPossibleValues(row, col) {
        var cellIndex = row * 9 + col;
        var overlay = document.getElementById('overlay-' + cellIndex);
        
        if (overlay) {
            overlay.innerHTML = '';
            var possibleSet = this.possibleValues[row][col];
            
            // Create divs for each position in 3x3 grid (positions 1-9)
            for (var num = 1; num <= 9; num++) {
                var possibleDiv = document.createElement('div');
                possibleDiv.className = 'possible-value';
                
                if (possibleSet.has(num)) {
                    possibleDiv.textContent = num;
                }
                
                overlay.appendChild(possibleDiv);
            }
        }
    }
    
    copyPossibleValues(row, col) {
        // Don't copy from given numbers
        if (this.givens[row][col]) {
            return;
        }
        
        // Copy the possible values set
        this.copiedPossibleValues = new Set(this.possibleValues[row][col]);
    }
    
    pastePossibleValues(row, col) {
        // Don't paste to given numbers
        if (this.givens[row][col]) {
            return;
        }
        
        // Check if there are copied values
        if (!this.copiedPossibleValues) {
            return;
        }
        
        // Clear the main cell value if present
        if (this.grid[row][col] !== 0) {
            this.grid[row][col] = 0;
            var cellIndex = row * 9 + col;
            var mainDiv = document.getElementById('main-' + cellIndex);
            if (mainDiv) {
                mainDiv.textContent = '';
            }
        }
        
        // Replace the possible values with the copied values
        this.possibleValues[row][col] = new Set(this.copiedPossibleValues);
        
        // Re-render the possible values for this cell
        this.renderPossibleValues(row, col);
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

        // Only move if the position actually changed
        if (newRow !== row || newCol !== col) {
            var newIndex = newRow * 9 + newCol;
            var newCell = document.getElementById('cell-' + newIndex);
            if (newCell) {
                this.selectCell(newCell);
            }
        }
    }

    setupEventListeners() {
        // Restart button
        this.restartButton.addEventListener('click', () => {
            this.restartGame();
        });
        
        // New Game button
        this.newGameButton2.addEventListener('click', () => {
            this.newGame();
        });
        
        // Check Game button
        this.checkGameButton.addEventListener('click', () => {
            this.checkGame();
        });
        
        // Show Solution button
        this.showSolutionButton.addEventListener('click', () => {
            this.showSolution();
        });

        // Prevent context menu on right click
        this.gameElement.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        });

        // Global keyboard event listener for arrow keys and number input
        document.addEventListener('keydown', (event) => {
            if (this.selectedCell) {
                this.handleKeyInput(event, this.selectedCell);
            }
        });
    }

    restartGame() {
        // Hide overlay
        this.gameOverOverlay.style.display = 'none';
        
        // Generate a new game
        this.newGame();
        
        // Select the first cell
        var firstCell = document.getElementById('cell-0');
        if (firstCell) {
            this.selectCell(firstCell);
        }
    }
    
    newGame() {
        // Generate a new random Sudoku puzzle
        this.generatePuzzle();
        this.renderGrid();
    }
    
    generatePuzzle() {
        // Step 1: Generate a complete valid Sudoku solution
        this.solution = this.generateCompleteSolution();
        
        // Step 2: Create the puzzle by removing numbers
        this.grid = this.solution.map(row => [...row]);
        this.createPuzzleFromSolution();
    }
    
    generateCompleteSolution() {
        var grid = Array(9).fill().map(() => Array(9).fill(0));
        this.solveSudoku(grid);
        return grid;
    }
    
    solveSudoku(grid) {
        var emptyCell = this.findEmptyCell(grid);
        if (!emptyCell) {
            return true; // Puzzle is solved
        }
        
        var [row, col] = emptyCell;
        var numbers = this.shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        
        for (var num of numbers) {
            if (this.isValidMove(grid, row, col, num)) {
                grid[row][col] = num;
                
                if (this.solveSudoku(grid)) {
                    return true;
                }
                
                grid[row][col] = 0; // Backtrack
            }
        }
        
        return false;
    }
    
    findEmptyCell(grid) {
        for (var row = 0; row < 9; row++) {
            for (var col = 0; col < 9; col++) {
                if (grid[row][col] === 0) {
                    return [row, col];
                }
            }
        }
        return null;
    }
    
    isValidMove(grid, row, col, num) {
        // Check row
        for (var i = 0; i < 9; i++) {
            if (grid[row][i] === num) {
                return false;
            }
        }
        
        // Check column
        for (var i = 0; i < 9; i++) {
            if (grid[i][col] === num) {
                return false;
            }
        }
        
        // Check 3x3 box
        var boxRow = Math.floor(row / 3) * 3;
        var boxCol = Math.floor(col / 3) * 3;
        
        for (var i = boxRow; i < boxRow + 3; i++) {
            for (var j = boxCol; j < boxCol + 3; j++) {
                if (grid[i][j] === num) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    shuffleArray(array) {
        var shuffled = [...array];
        for (var i = shuffled.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
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
        var positions = [];
        for (var row = 0; row < 9; row++) {
            for (var col = 0; col < 9; col++) {
                positions.push([row, col]);
            }
        }
        
        // Shuffle positions randomly
        positions = this.shuffleArray(positions);
        
        // Remove numbers while ensuring puzzle remains solvable
        var cellsToRemove = 50; // Adjust for difficulty (40-60 is good range)
        var removed = 0;
        
        for (var [row, col] of positions) {
            if (removed >= cellsToRemove) break;
            
            var backup = this.grid[row][col];
            this.grid[row][col] = 0;
            
            // Check if puzzle still has unique solution
            if (this.hasUniqueSolution()) {
                removed++;
            } else {
                // Restore the number if removing it makes puzzle unsolvable
                this.grid[row][col] = backup;
            }
        }
        
        // Mark remaining numbers as givens and clear user-entered styling
        for (var row = 0; row < 9; row++) {
            for (var col = 0; col < 9; col++) {
                var cellIndex = row * 9 + col;
                var cell = document.getElementById('cell-' + cellIndex);
                
                if (this.grid[row][col] !== 0) {
                    this.givens[row][col] = true;
                }
                
                // Clear user-entered class for new game
                if (cell) {
                    cell.classList.remove('user-entered');
                }
            }
        }
    }
    
    hasUniqueSolution() {
        var testGrid = this.grid.map(row => [...row]);
        var solutions = this.countSolutions(testGrid, 0);
        return solutions === 1;
    }
    
    countSolutions(grid, count) {
        if (count > 1) return count; // Early termination
        
        var emptyCell = this.findEmptyCell(grid);
        if (!emptyCell) {
            return count + 1; // Found a solution
        }
        
        var [row, col] = emptyCell;
        
        for (var num = 1; num <= 9; num++) {
            if (this.isValidMove(grid, row, col, num)) {
                grid[row][col] = num;
                count = this.countSolutions(grid, count);
                grid[row][col] = 0;
                
                if (count > 1) break; // Early termination
            }
        }
        
        return count;
    }
    
    renderGrid() {
        for (var row = 0; row < 9; row++) {
            for (var col = 0; col < 9; col++) {
                var cellIndex = row * 9 + col;
                var cell = document.getElementById('cell-' + cellIndex);
                var mainDiv = document.getElementById('main-' + cellIndex);
                
                if (cell && mainDiv) {
                    var value = this.grid[row][col];
                    mainDiv.textContent = value === 0 ? '' : value;
                    
                    // Style given numbers differently
                    if (this.givens[row][col]) {
                        cell.classList.add('given');
                        cell.classList.remove('user-entered');
                    } else {
                        cell.classList.remove('given');
                        // Don't remove user-entered class here since it's handled in setCellValue
                    }
                    
                    cell.classList.remove('error', 'selected', 'correct');
                    
                    // Clear and render possible values (empty for new game)
                    this.renderPossibleValues(row, col);
                }
            }
        }
    }
    
    checkGame() {
        // Clear previous highlighting
        this.clearHighlighting();
        
        var hasErrors = false;
        var isComplete = true;
        
        // Check each cell for errors and completeness
        for (var row = 0; row < 9; row++) {
            for (var col = 0; col < 9; col++) {
                var value = this.grid[row][col];
                
                // Check if board is complete
                if (value === 0) {
                    isComplete = false;
                }
                
                // Skip empty cells and given numbers for highlighting
                if (value === 0 || this.givens[row][col]) {
                    continue;
                }
                
                // Check if this value matches the solution
                if (value === this.solution[row][col]) {
                    this.highlightCorrect(row, col);
                } else {
                    this.highlightError(row, col);
                    hasErrors = true;
                }
            }
        }
        
        // Show success overlay if puzzle is complete and correct
        if (!hasErrors && isComplete) {
            this.showSuccessOverlay();
        }
    }
    
    clearHighlighting() {
        for (var i = 0; i < 81; i++) {
            var cell = document.getElementById('cell-' + i);
            if (cell) {
                cell.classList.remove('error', 'correct');
            }
        }
    }
    
    highlightError(row, col) {
        var cellIndex = row * 9 + col;
        var cell = document.getElementById('cell-' + cellIndex);
        if (cell) {
            cell.classList.add('error');
        }
    }
    
    highlightCorrect(row, col) {
        var cellIndex = row * 9 + col;
        var cell = document.getElementById('cell-' + cellIndex);
        if (cell) {
            cell.classList.add('correct');
        }
    }
    
    showSuccessOverlay() {
        // Update overlay content for success
        var titleElement = document.querySelector('.game-over-title');
        var scoreElement = document.getElementById('finalScore');
        
        if (titleElement) {
            titleElement.textContent = 'Success!';
        }
        
        if (scoreElement) {
            scoreElement.textContent = 'Puzzle Completed! 🎉';
        }
        
        // Show the overlay
        this.gameOverOverlay.style.display = 'flex';
    }
    
    showSolution() {
        // Clear previous highlighting
        this.clearHighlighting();
        
        // Display the complete solution
        for (var row = 0; row < 9; row++) {
            for (var col = 0; col < 9; col++) {
                var cellIndex = row * 9 + col;
                var cell = document.getElementById('cell-' + cellIndex);
                var mainDiv = document.getElementById('main-' + cellIndex);
                
                if (cell && mainDiv) {
                    var playerValue = this.grid[row][col];
                    var solutionValue = this.solution[row][col];
                    
                    // Show the correct solution value
                    mainDiv.textContent = solutionValue;
                    
                    // Highlight wrong guesses in red (skip givens and empty cells)
                    if (!this.givens[row][col] && playerValue !== 0 && playerValue !== solutionValue) {
                        cell.classList.add('error');
                    }
                    
                    // Update the grid to match the solution
                    this.grid[row][col] = solutionValue;
                }
            }
        }
        
        console.log('Solution displayed - wrong guesses highlighted in red');
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SudokuController();
});