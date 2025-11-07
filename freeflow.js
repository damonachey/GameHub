// Free Flow Game - 6x6 Grid with colored dot pairs

class FreeFlowGame {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.grid = [];

        for (var row = 0; row < rows; row++) {
            this.grid.push(new Array(cols).fill(null));
        }
    }

    getEmptyCells() {
        var emptyCells = [];

        for (var row = 0; row < this.rows; row++) {
            for (var col = 0; col < this.cols; col++) {
                if (this.grid[row][col] === null) {
                    emptyCells.push({ row: row, col: col });
                }
            }
        }

        return emptyCells;
    }

    getHash() {
        return this.grid.map(row => row.map(cell => cell || '-').join('')).join('');
    }

    getColorCounts() {
        var counts = {};
        for (var row = 0; row < this.rows; row++) {
            for (var col = 0; col < this.cols; col++) {
                var color = this.grid[row][col];
                if (color !== null) {
                    counts[color] = (counts[color] || 0) + 1;
                }
            }
        }
        return counts;
    }

    getCellValidMoves(row, col) {
        var moves = [];
        var directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

        if (this.grid[row][col]) {
            var sourceColor = this.grid[row][col];

            // Count same-color neighbors of source cell
            var sourceNeighborCount = 0;
            for (var i = 0; i < directions.length; i++) {
                var dr = directions[i][0];
                var dc = directions[i][1];
                var nr = row + dr;
                var nc = col + dc;
                if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
                    if (this.grid[nr][nc] === sourceColor) {
                        sourceNeighborCount++;
                    }
                }
            }

            // Skip if source already has 2 or more same-color neighbors
            if (sourceNeighborCount >= 2) {
                return moves;
            }

            for (var i = 0; i < directions.length; i++) {
                var dr = directions[i][0];
                var dc = directions[i][1];
                var nr = row + dr;
                var nc = col + dc;

                if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols && this.grid[nr][nc] === null) {
                    // Check if target position is adjacent to any other cell with same color
                    var adjacentToSameColor = false;

                    for (var j = 0; j < directions.length; j++) {
                        var dr2 = directions[j][0];
                        var dc2 = directions[j][1];
                        var checkRow = nr + dr2;
                        var checkCol = nc + dc2;

                        // Skip the source cell
                        if (checkRow === row && checkCol === col) {
                            continue;
                        }

                        if (checkRow >= 0 && checkRow < this.rows && checkCol >= 0 && checkCol < this.cols) {
                            if (this.grid[checkRow][checkCol] === sourceColor) {
                                adjacentToSameColor = true;
                                break;
                            }
                        }
                    }

                    if (!adjacentToSameColor) {
                        moves.push({ row: nr, col: nc, color: sourceColor });
                    }
                }
            }
        }

        return moves;
    }

    getAllValidMoves() {
        var moves = [];

        for (var row = 0; row < this.rows; row++) {
            for (var col = 0; col < this.cols; col++) {
                if (this.grid[row][col]) {
                    moves.push(...this.getCellValidMoves(row, col));
                }
            }
        }

        return moves;
    }

    copy() {
        var newBoard = new FreeFlowGame(this.rows, this.cols);
        newBoard.grid = this.grid.map(row => [...row]);
        return newBoard;
    }

    placeRandom(colors) {
        var emptyCells = this.getEmptyCells();

        for (var i = 0; i < colors.length; i++) {
            var color = colors[i];
            var randomIndex = Math.floor(Math.random() * emptyCells.length);
            var cell = emptyCells.splice(randomIndex, 1)[0];
            this.grid[cell.row][cell.col] = color;
        }

        return this;
    }

    applyMove(row, col, color) {
        this.grid[row][col] = color;
        return this;
    }

    static getFilledBoard(rows, cols, numColors) {
        var colors = ['red', 'green', 'blue', 'orange', 'cyan', 'purple', 'yellow'];
        var startTime = performance.now();
        var timeoutMs = 10000;
        var attempts = 0;
        var currentBoard = null;

        while (true) {
            var elapsed = performance.now() - startTime;
            if (elapsed > timeoutMs) {
                console.log(`Timeout after ${attempts} attempt(s) and ${elapsed.toFixed(2)}ms`);
                return null;
            }

            attempts++;
            var board = new FreeFlowGame(rows, cols);
            var game = board.copy().placeRandom(colors.slice(0, numColors));

            currentBoard = game.copy();
            var moveCount = 0;
            while (true) {
                var validMoves = currentBoard.getAllValidMoves();
                if (validMoves.length === 0) {
                    break;
                }

                var randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
                currentBoard.applyMove(randomMove.row, randomMove.col, randomMove.color);
                moveCount++;
            }

            var emptyCells = currentBoard.getEmptyCells();
            if (emptyCells.length === 0) {
                // Check that each color appears at least 3 times
                var colorCounts = currentBoard.getColorCounts();
                var allColorsValid = true;
                
                for (var color in colorCounts) {
                    if (colorCounts[color] < 3) {
                        allColorsValid = false;
                        break;
                    }
                }
                
                if (allColorsValid) {
                    var endTime = performance.now();
                    var elapsedMs = (endTime - startTime).toFixed(2);
                    console.log(`Board is full after ${attempts} attempt(s)! Time: ${elapsedMs}ms`);
                    return currentBoard;
                }
            }
        }
    }

    static getStartingBoard(filledBoard) {
        if (!filledBoard) {
            return null;
        }

        var startingBoard = filledBoard.copy();
        var directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

        for (var row = 0; row < startingBoard.rows; row++) {
            for (var col = 0; col < startingBoard.cols; col++) {
                var color = startingBoard.grid[row][col];
                if (color !== null) {
                    var sameColorNeighborCount = 0;

                    for (var i = 0; i < directions.length; i++) {
                        var dr = directions[i][0];
                        var dc = directions[i][1];
                        var nr = row + dr;
                        var nc = col + dc;
                        if (nr >= 0 && nr < startingBoard.rows && nc >= 0 && nc < startingBoard.cols) {
                            if (filledBoard.grid[nr][nc] === color) {
                                sameColorNeighborCount++;
                            }
                        }
                    }

                    if (sameColorNeighborCount !== 1) {
                        startingBoard.grid[row][col] = null;
                    }
                }
            }
        }

        return startingBoard;
    }
}

class FreeFlowRenderer {
    constructor(gameElement, rows, cols) {
        if (!gameElement) {
            throw new Error('Game element not found');
        }
        this.gameElement = gameElement;
        this.rows = rows;
        this.cols = cols;
        this.cells = [];
        this.initializeGrid();
    }
    
    initializeGrid() {
        this.gameElement.innerHTML = '';
        this.cells = [];
        
        for (var row = 0; row < this.rows; row++) {
            for (var col = 0; col < this.cols; col++) {
                var cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                this.gameElement.appendChild(cell);
                this.cells.push(cell);
            }
        }
    }
    
    render(game) {
        // Clear all cells
        this.cells.forEach(cell => {
            cell.innerHTML = '';
            cell.style.backgroundColor = '';
        });
        
        // Render grid
        for (var row = 0; row < game.rows; row++) {
            for (var col = 0; col < game.cols; col++) {
                var color = game.grid[row][col];
                if (color !== null) {
                    var cellIndex = row * this.cols + col;
                    var cell = this.cells[cellIndex];
                    
                    if (cell) {
                        var dotElement = document.createElement('div');
                        dotElement.className = 'dot';
                        dotElement.style.backgroundColor = color;
                        cell.appendChild(dotElement);
                    }
                }
            }
        }
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    var gameElement = document.getElementById('game');
    var newGameButton = document.getElementById('newGameButton');
    var debugInfo = document.getElementById('debugInfo');
    
    if (!gameElement) {
        console.error('Game element not found');
        return;
    }
    
    var gridSize = 7;
    var numColors = 6;
    var game = null;
    var renderer = new FreeFlowRenderer(gameElement, gridSize, gridSize);
    
    var initializeGame = function() {
        var filledBoard = FreeFlowGame.getFilledBoard(gridSize, gridSize, numColors);
        if (filledBoard) {
            game = FreeFlowGame.getStartingBoard(filledBoard);
            if (game) {
                renderer.render(game);
                console.log('Free Flow game initialized');
            } else {
                console.error('Failed to generate starting board');
            }
        } else {
            console.error('Failed to generate filled board');
        }
    };
    
    // Initial render
    initializeGame();
    
    // New Game button handler
    if (newGameButton) {
        newGameButton.addEventListener('click', () => {
            initializeGame();
        });
    }
});
