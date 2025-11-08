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
    
    render(game, startingBoard) {
        // Clear all cells
        this.cells.forEach(cell => {
            cell.innerHTML = '';
            cell.style.backgroundColor = '';
        });
        
        var directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // up, down, left, right
        var lineWidth = 15; // Half of dot diameter
        
        // Render grid
        for (var row = 0; row < game.rows; row++) {
            for (var col = 0; col < game.cols; col++) {
                var color = game.grid[row][col];
                if (color !== null) {
                    var cellIndex = row * this.cols + col;
                    var cell = this.cells[cellIndex];
                    
                    if (!cell) {
                        continue;
                    }
                    
                    // Check if this is an endpoint (from starting board)
                    var isEndpoint = false;
                    if (startingBoard && startingBoard.grid[row][col] === color) {
                        isEndpoint = true;
                    }
                    
                    // Count connections to same-colored neighbors
                    var connections = [];
                    for (var i = 0; i < directions.length; i++) {
                        var dr = directions[i][0];
                        var dc = directions[i][1];
                        var nr = row + dr;
                        var nc = col + dc;
                        
                        if (nr >= 0 && nr < game.rows && nc >= 0 && nc < game.cols) {
                            if (game.grid[nr][nc] === color) {
                                connections.push(i);
                            }
                        }
                    }
                    
                    // Always draw a circle in the center if it's an endpoint
                    if (isEndpoint) {
                        var dotElement = document.createElement('div');
                        dotElement.className = 'dot';
                        dotElement.style.backgroundColor = color;
                        cell.appendChild(dotElement);
                    }
                    
                    // Draw lines/pipes for connections
                    for (var i = 0; i < connections.length; i++) {
                        var dir = connections[i];
                        var line = document.createElement('div');
                        line.className = 'line';
                        line.style.backgroundColor = color;
                        line.style.position = 'absolute';
                        
                        if (dir === 0) { // up
                            line.style.width = lineWidth + 'px';
                            line.style.height = '50%';
                            line.style.left = '50%';
                            line.style.top = '0';
                            line.style.transform = 'translateX(-50%)';
                        } else if (dir === 1) { // down
                            line.style.width = lineWidth + 'px';
                            line.style.height = '50%';
                            line.style.left = '50%';
                            line.style.bottom = '0';
                            line.style.transform = 'translateX(-50%)';
                        } else if (dir === 2) { // left
                            line.style.height = lineWidth + 'px';
                            line.style.width = '50%';
                            line.style.top = '50%';
                            line.style.left = '0';
                            line.style.transform = 'translateY(-50%)';
                        } else if (dir === 3) { // right
                            line.style.height = lineWidth + 'px';
                            line.style.width = '50%';
                            line.style.top = '50%';
                            line.style.right = '0';
                            line.style.transform = 'translateY(-50%)';
                        }
                        
                        cell.appendChild(line);
                    }
                    
                    // Draw center junction if not an endpoint
                    if (!isEndpoint && connections.length > 0) {
                        var junction = document.createElement('div');
                        junction.className = 'junction';
                        junction.style.backgroundColor = color;
                        junction.style.width = lineWidth + 'px';
                        junction.style.height = lineWidth + 'px';
                        junction.style.position = 'absolute';
                        junction.style.left = '50%';
                        junction.style.top = '50%';
                        junction.style.transform = 'translate(-50%, -50%)';
                        cell.appendChild(junction);
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
    var newGameButton2 = document.getElementById('newGameButton2');
    var clearBoardButton = document.getElementById('clearBoardButton');
    var showSolutionButton = document.getElementById('showSolutionButton');
    var gameOverOverlay = document.getElementById('gameOverOverlay');
    var debugInfo = document.getElementById('debugInfo');
    
    if (!gameElement) {
        console.error('Game element not found');
        return;
    }
    
    var gridSize = 7;
    var numColors = 6;
    var game = null;
    var filledBoard = null; // Store the solution
    var renderer = new FreeFlowRenderer(gameElement, gridSize, gridSize);
    
    // Drawing state
    var isDrawing = false;
    var currentColor = null;
    var currentPath = [];
    var playerGrid = null; // Track player's drawn lines
    var lastDrawTime = 0;
    var drawThrottleMs = 16; // ~60fps
    
    var initializeGame = function() {
        filledBoard = FreeFlowGame.getFilledBoard(gridSize, gridSize, numColors);
        if (filledBoard) {
            game = FreeFlowGame.getStartingBoard(filledBoard);
            if (game) {
                // Create a copy for tracking player moves
                playerGrid = game.copy();
                renderer.render(playerGrid, game);
                console.log('Free Flow game initialized');
            } else {
                console.error('Failed to generate starting board');
            }
        } else {
            console.error('Failed to generate filled board');
        }
    };
    
    var clearBoard = function() {
        if (game) {
            playerGrid = game.copy();
            renderer.render(playerGrid, game);
            console.log('Board cleared');
        }
    };
    
    var showSolution = function() {
        if (filledBoard) {
            playerGrid = filledBoard.copy();
            renderer.render(playerGrid, game);
            console.log('Showing solution');
            
            // Check win to show overlay
            if (checkWin()) {
                if (gameOverOverlay) {
                    gameOverOverlay.style.display = 'flex';
                }
            }
        }
    };
    
    // Get cell from coordinates
    var getCellFromEvent = function(event) {
        var clientX, clientY;
        
        // Get coordinates from event
        if (event.type.startsWith('touch')) {
            // Prevent multi-touch
            if (!event.touches || event.touches.length !== 1) {
                return null;
            }
            var touch = event.touches[0];
            clientX = touch.clientX;
            clientY = touch.clientY;
        } else {
            clientX = event.clientX;
            clientY = event.clientY;
        }
        
        if (!gameElement || !renderer.cells || renderer.cells.length === 0) {
            return null;
        }
        
        // Calculate which cell based on grid position (more reliable than elementFromPoint)
        var rect = gameElement.getBoundingClientRect();
        var x = clientX - rect.left;
        var y = clientY - rect.top;
        
        // Account for padding on the game element
        var gridStyle = window.getComputedStyle(gameElement);
        var paddingLeft = parseInt(gridStyle.paddingLeft) || 0;
        var paddingTop = parseInt(gridStyle.paddingTop) || 0;
        x -= paddingLeft;
        y -= paddingTop;
        
        // Dynamically calculate cell size from actual rendered cell
        var firstCell = renderer.cells[0];
        var cellRect = firstCell.getBoundingClientRect();
        var cellWidth = cellRect.width;
        var cellHeight = cellRect.height;
        
        // Get gap size from grid
        var gap = parseInt(gridStyle.gap) || 1;
        
        // The grid has: cell + gap + cell + gap + cell...
        // So each "unit" is cellWidth + gap
        var unitSize = cellWidth + gap;
        var col = Math.floor(x / unitSize);
        var row = Math.floor(y / unitSize);
        
        // For touch events, be more forgiving - allow touches in the gap to select the nearest cell
        var isTouchEvent = event.type.startsWith('touch');
        
        if (!isTouchEvent) {
            // For mouse, validate that we're actually inside a cell (not in the gap)
            var cellX = x - (col * unitSize);
            var cellY = y - (row * unitSize);
            
            // If we're in the gap area, return null
            if (cellX >= cellWidth || cellY >= cellHeight) {
                return null;
            }
        }
        
        // Clamp row/col to valid range for touch events
        if (isTouchEvent) {
            col = Math.max(0, Math.min(gridSize - 1, col));
            row = Math.max(0, Math.min(gridSize - 1, row));
        }
        
        if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
            var cellIndex = row * gridSize + col;
            var cellElement = renderer.cells[cellIndex];
            if (cellElement) {
                return { row: row, col: col, element: cellElement };
            }
        }
        
        return null;
        return null;
    };
    
    // Check if two cells are adjacent
    var areAdjacent = function(cell1, cell2) {
        var rowDiff = Math.abs(cell1.row - cell2.row);
        var colDiff = Math.abs(cell1.col - cell2.col);
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    };
    
    // Get all cells between two points (for interpolation)
    var getCellsBetween = function(start, end) {
        var cells = [];
        var rowDiff = end.row - start.row;
        var colDiff = end.col - start.col;
        var steps = Math.max(Math.abs(rowDiff), Math.abs(colDiff));
        
        if (steps === 0) {
            return cells;
        }
        
        for (var i = 1; i <= steps; i++) {
            var row = start.row + Math.round((rowDiff * i) / steps);
            var col = start.col + Math.round((colDiff * i) / steps);
            
            // Only add orthogonally adjacent cells
            if (cells.length === 0 || areAdjacent(cells[cells.length - 1], { row: row, col: col })) {
                cells.push({ row: row, col: col });
            }
        }
        
        return cells;
    };
    
    // Start drawing handler
    var startDrawing = function(event) {
        event.preventDefault();
        var cell = getCellFromEvent(event);
        if (!cell || !playerGrid) {
            return;
        }
        
        var cellColor = playerGrid.grid[cell.row][cell.col];
        
        // Only start drawing if we click on a colored cell
        if (cellColor !== null) {
            // Clear all previous lines of this color (keep only the endpoints from starting board)
            for (var row = 0; row < playerGrid.rows; row++) {
                for (var col = 0; col < playerGrid.cols; col++) {
                    if (playerGrid.grid[row][col] === cellColor) {
                        // Check if this is an endpoint in the starting board
                        if (!game.grid[row][col]) {
                            // Not an endpoint, clear it
                            playerGrid.grid[row][col] = null;
                        }
                    }
                }
            }
            
            isDrawing = true;
            currentColor = cellColor;
            currentPath = [{ row: cell.row, col: cell.col }];
            
            // Re-render after clearing
            renderer.render(playerGrid, game);
            
            console.log('Started drawing with color:', currentColor);
        }
    };
    
    // Mouse down - start drawing
    gameElement.addEventListener('mousedown', startDrawing);
    
    // Touch start - start drawing
    gameElement.addEventListener('touchstart', startDrawing, { passive: false });
    
    // Continue drawing handler
    var continueDrawing = function(event) {
        event.preventDefault();
        if (!isDrawing || !playerGrid) {
            return;
        }
        
        // Throttle drawing for performance
        var now = Date.now();
        if (now - lastDrawTime < drawThrottleMs) {
            return;
        }
        lastDrawTime = now;
        
        var cell = getCellFromEvent(event);
        if (!cell) {
            return;
        }
        
        var lastCell = currentPath[currentPath.length - 1];
        
        // Check if this is a new cell
        if (cell.row === lastCell.row && cell.col === lastCell.col) {
            return;
        }
        
        // Get all cells between last cell and current cell (interpolation)
        var cellsToFill = [];
        
        if (areAdjacent(cell, lastCell)) {
            // Adjacent - just add the cell
            cellsToFill = [cell];
        } else {
            // Not adjacent - interpolate to fill gaps from fast movement
            cellsToFill = getCellsBetween(lastCell, cell);
        }
        
        // Process each cell in the interpolated path
        var needsRender = false;
        for (var i = 0; i < cellsToFill.length; i++) {
            var cellToFill = cellsToFill[i];
            var cellColor = playerGrid.grid[cellToFill.row][cellToFill.col];
            
            // Can draw on empty cells or cells with the same color
            if (cellColor === null || cellColor === currentColor) {
                // Add to path
                currentPath.push({ row: cellToFill.row, col: cellToFill.col });
                
                // Update player grid
                playerGrid.grid[cellToFill.row][cellToFill.col] = currentColor;
                needsRender = true;
            } else {
                // Hit a different color - stop drawing
                break;
            }
        }
        
        // Re-render only if we made changes
        if (needsRender) {
            renderer.render(playerGrid, game);
        }
    };
    
    // Mouse move - continue drawing
    gameElement.addEventListener('mousemove', continueDrawing);
    
    // Touch move - continue drawing
    gameElement.addEventListener('touchmove', continueDrawing, { passive: false });
    
    // Check if puzzle is solved
    var checkWin = function() {
        // Check 1: All squares must be filled
        for (var row = 0; row < playerGrid.rows; row++) {
            for (var col = 0; col < playerGrid.cols; col++) {
                if (playerGrid.grid[row][col] === null) {
                    return false;
                }
            }
        }
        
        // Check 2: All dots must be connected to their matching color dot
        // Get all endpoint pairs from the starting board
        var colorEndpoints = {};
        
        for (var row = 0; row < game.rows; row++) {
            for (var col = 0; col < game.cols; col++) {
                var color = game.grid[row][col];
                if (color !== null) {
                    if (!colorEndpoints[color]) {
                        colorEndpoints[color] = [];
                    }
                    colorEndpoints[color].push({ row: row, col: col });
                }
            }
        }
        
        // Check each color has exactly 2 endpoints and they are connected
        for (var color in colorEndpoints) {
            var endpoints = colorEndpoints[color];
            
            if (endpoints.length !== 2) {
                return false;
            }
            
            // BFS to check if the two endpoints are connected through same color
            var start = endpoints[0];
            var end = endpoints[1];
            var visited = {};
            var queue = [start];
            visited[start.row + ',' + start.col] = true;
            var found = false;
            
            while (queue.length > 0) {
                var current = queue.shift();
                
                if (current.row === end.row && current.col === end.col) {
                    found = true;
                    break;
                }
                
                // Check adjacent cells
                var directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
                for (var i = 0; i < directions.length; i++) {
                    var dr = directions[i][0];
                    var dc = directions[i][1];
                    var nr = current.row + dr;
                    var nc = current.col + dc;
                    var key = nr + ',' + nc;
                    
                    if (nr >= 0 && nr < playerGrid.rows && nc >= 0 && nc < playerGrid.cols &&
                        !visited[key] && playerGrid.grid[nr][nc] === color) {
                        visited[key] = true;
                        queue.push({ row: nr, col: nc });
                    }
                }
            }
            
            if (!found) {
                return false;
            }
        }
        
        return true;
    };
    
    // Stop drawing handler
    var stopDrawing = function(event) {
        console.log('Stop drawing called, event type:', event ? event.type : 'unknown');
        if (isDrawing) {
            isDrawing = false;
            currentColor = null;
            currentPath = [];
            
            console.log('Checking for win...');
            // Check if puzzle is solved
            if (checkWin()) {
                console.log('Puzzle solved!');
                if (gameOverOverlay) {
                    gameOverOverlay.style.display = 'flex';
                }
            } else {
                console.log('Not solved yet');
            }
        }
    };
    
    // Mouse up - stop drawing (on document to catch releases outside game area)
    document.addEventListener('mouseup', stopDrawing);
    
    // Touch end - stop drawing (on document to catch releases outside game area)
    document.addEventListener('touchend', stopDrawing);
    
    // Touch cancel - stop drawing
    document.addEventListener('touchcancel', stopDrawing);
    
    // Mouse leave - stop drawing if mouse leaves game area
    gameElement.addEventListener('mouseleave', () => {
        if (isDrawing) {
            console.log('Mouse left game area, stopped drawing');
            isDrawing = false;
            currentColor = null;
            currentPath = [];
        }
    });
    
    // Initial render
    initializeGame();
    
    // New Game button handlers
    if (newGameButton) {
        newGameButton.addEventListener('click', () => {
            if (gameOverOverlay) {
                gameOverOverlay.style.display = 'none';
            }
            initializeGame();
        });
    }
    
    if (newGameButton2) {
        newGameButton2.addEventListener('click', () => {
            if (gameOverOverlay) {
                gameOverOverlay.style.display = 'none';
            }
            initializeGame();
        });
    }
    
    if (clearBoardButton) {
        clearBoardButton.addEventListener('click', () => {
            if (gameOverOverlay) {
                gameOverOverlay.style.display = 'none';
            }
            clearBoard();
        });
    }
    
    if (showSolutionButton) {
        showSolutionButton.addEventListener('click', () => {
            showSolution();
        });
    }
    
    // Close overlay when clicking outside the content
    if (gameOverOverlay) {
        gameOverOverlay.addEventListener('click', (event) => {
            if (event.target === gameOverOverlay) {
                gameOverOverlay.style.display = 'none';
            }
        });
    }
});
