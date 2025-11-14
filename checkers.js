// Checkers Game Model (Logic)
class CheckersGame {
    constructor() {
        this.board = [];
        this.currentPlayer = 'red'; // 'red' or 'black'
        this.selectedPiece = null;
        this.validMoves = [];
        this.moveHistory = [];
        this.mustCapture = false;
        this.mustContinueJump = false;
        this.jumpingPiece = null;
        this.initializeBoard();
    }
    
    initializeBoard() {
        // Create 8x8 board
        // 0 = empty, 1 = red piece, 2 = red king, 3 = black piece, 4 = black king
        this.board = Array(8).fill().map(() => Array(8).fill(0));
        
        // Place red pieces (bottom)
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 8; col++) {
                if ((row + col) % 2 === 1) {
                    this.board[row][col] = 1;
                }
            }
        }
        
        // Place black pieces (top)
        for (let row = 5; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if ((row + col) % 2 === 1) {
                    this.board[row][col] = 3;
                }
            }
        }
        
        this.currentPlayer = 'red';
        this.moveHistory = [];
        this.mustContinueJump = false;
        this.jumpingPiece = null;
    }
    
    getPieceAt(row, col) {
        if (row < 0 || row >= 8 || col < 0 || col >= 8) {
            return null;
        }
        return this.board[row][col];
    }
    
    isPieceOwnedByPlayer(piece, player) {
        if (player === 'red') {
            return piece === 1 || piece === 2;
        }
        else {
            return piece === 3 || piece === 4;
        }
    }
    
    isKing(piece) {
        return piece === 2 || piece === 4;
    }
    
    getValidMoves(row, col) {
        var piece = this.board[row][col];
        if (piece === 0) {
            return [];
        }
        
        var moves = [];
        var captures = this.getValidCaptures(row, col);
        
        // If there are any captures available for any piece, player must capture
        if (this.mustCapture && captures.length > 0) {
            return captures;
        }
        
        // If player must capture but this piece has no captures, return empty
        if (this.mustCapture && captures.length === 0) {
            return [];
        }
        
        // Regular moves (if no captures required)
        var directions = this.getMoveDirections(piece);
        
        for (var dir of directions) {
            var newRow = row + dir.row;
            var newCol = col + dir.col;
            
            if (this.isValidPosition(newRow, newCol) && this.board[newRow][newCol] === 0) {
                moves.push({ row: newRow, col: newCol, captures: [] });
            }
        }
        
        // Add captures if available
        moves = moves.concat(captures);
        
        return moves;
    }
    
    getValidCaptures(row, col) {
        var piece = this.board[row][col];
        var captures = [];
        var directions = this.getMoveDirections(piece);
        
        for (var dir of directions) {
            var jumpRow = row + dir.row * 2;
            var jumpCol = col + dir.col * 2;
            var midRow = row + dir.row;
            var midCol = col + dir.col;
            
            if (this.isValidPosition(jumpRow, jumpCol) && 
                this.isValidPosition(midRow, midCol)) {
                var middlePiece = this.board[midRow][midCol];
                var targetSquare = this.board[jumpRow][jumpCol];
                
                // Can jump if middle has opponent piece and target is empty
                if (targetSquare === 0 && middlePiece !== 0 && 
                    !this.isPieceOwnedByPlayer(middlePiece, this.currentPlayer)) {
                    captures.push({
                        row: jumpRow,
                        col: jumpCol,
                        captures: [{ row: midRow, col: midCol }]
                    });
                }
            }
        }
        
        return captures;
    }
    
    getMoveDirections(piece) {
        var directions = [];
        
        if (piece === 1) {
            // Red piece moves down
            directions.push({ row: 1, col: -1 }, { row: 1, col: 1 });
        }
        else if (piece === 3) {
            // Black piece moves up
            directions.push({ row: -1, col: -1 }, { row: -1, col: 1 });
        }
        else if (this.isKing(piece)) {
            // Kings can move in all diagonal directions
            directions.push(
                { row: 1, col: -1 }, { row: 1, col: 1 },
                { row: -1, col: -1 }, { row: -1, col: 1 }
            );
        }
        
        return directions;
    }
    
    isValidPosition(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }
    
    checkMustCapture() {
        // Check if any piece of current player can capture
        for (var row = 0; row < 8; row++) {
            for (var col = 0; col < 8; col++) {
                var piece = this.board[row][col];
                if (this.isPieceOwnedByPlayer(piece, this.currentPlayer)) {
                    var captures = this.getValidCaptures(row, col);
                    if (captures.length > 0) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    makeMove(fromRow, fromCol, toRow, toCol) {
        var piece = this.board[fromRow][fromCol];
        var move = this.getValidMoves(fromRow, fromCol).find(
            m => m.row === toRow && m.col === toCol
        );
        
        if (!move) {
            return false;
        }
        
        var wasCapture = move.captures.length > 0;
        
        // Save move for undo
        var moveRecord = {
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            piece: piece,
            captured: [],
            wasKing: this.isKing(piece),
            continuesJump: false
        };
        
        // Remove captured pieces
        for (var capture of move.captures) {
            moveRecord.captured.push({
                row: capture.row,
                col: capture.col,
                piece: this.board[capture.row][capture.col]
            });
            this.board[capture.row][capture.col] = 0;
        }
        
        // Move piece
        this.board[fromRow][fromCol] = 0;
        this.board[toRow][toCol] = piece;
        
        // Check for king promotion
        var becameKing = false;
        if (!this.isKing(piece)) {
            if (piece === 1 && toRow === 7) {
                this.board[toRow][toCol] = 2;
                moveRecord.becameKing = true;
                becameKing = true;
            }
            else if (piece === 3 && toRow === 0) {
                this.board[toRow][toCol] = 4;
                moveRecord.becameKing = true;
                becameKing = true;
            }
        }
        
        // Check if more jumps are available from landing position
        if (wasCapture && !becameKing) {
            var additionalCaptures = this.getValidCaptures(toRow, toCol);
            if (additionalCaptures.length > 0) {
                // Must continue jumping
                this.mustContinueJump = true;
                this.jumpingPiece = { row: toRow, col: toCol };
                moveRecord.continuesJump = true;
                this.moveHistory.push(moveRecord);
                return true;
            }
        }
        
        this.moveHistory.push(moveRecord);
        
        // End turn - switch player
        this.mustContinueJump = false;
        this.jumpingPiece = null;
        this.currentPlayer = this.currentPlayer === 'red' ? 'black' : 'red';
        this.mustCapture = this.checkMustCapture();
        
        return true;
    }
    
    undoMove() {
        if (this.moveHistory.length === 0) {
            return false;
        }
        
        // Undo all moves in the current jump sequence
        var movesToUndo = [];
        while (this.moveHistory.length > 0) {
            var lastMove = this.moveHistory[this.moveHistory.length - 1];
            movesToUndo.push(this.moveHistory.pop());
            if (!lastMove.continuesJump) {
                break;
            }
        }
        
        // Restore in reverse order
        for (var i = movesToUndo.length - 1; i >= 0; i--) {
            var move = movesToUndo[i];
            
            // Restore piece to original position
            this.board[move.from.row][move.from.col] = move.piece;
            this.board[move.to.row][move.to.col] = 0;
            
            // Restore captured pieces
            for (var captured of move.captured) {
                this.board[captured.row][captured.col] = captured.piece;
            }
        }
        
        // Clear jump state
        this.mustContinueJump = false;
        this.jumpingPiece = null;
        
        // Switch player back if we undid a complete turn
        this.currentPlayer = this.currentPlayer === 'red' ? 'black' : 'red';
        this.mustCapture = this.checkMustCapture();
        
        return true;
    }
    
    checkGameOver() {
        var redPieces = 0;
        var blackPieces = 0;
        var redCanMove = false;
        var blackCanMove = false;
        
        for (var row = 0; row < 8; row++) {
            for (var col = 0; col < 8; col++) {
                var piece = this.board[row][col];
                
                if (this.isPieceOwnedByPlayer(piece, 'red')) {
                    redPieces++;
                    if (!redCanMove && this.getValidMoves(row, col).length > 0) {
                        redCanMove = true;
                    }
                }
                else if (this.isPieceOwnedByPlayer(piece, 'black')) {
                    blackPieces++;
                    if (!blackCanMove && this.getValidMoves(row, col).length > 0) {
                        blackCanMove = true;
                    }
                }
            }
        }
        
        if (redPieces === 0 || !redCanMove) {
            return 'black';
        }
        if (blackPieces === 0 || !blackCanMove) {
            return 'red';
        }
        
        return null;
    }
}

// Checkers Game Renderer (View)
class CheckersRenderer {
    constructor(gameElement) {
        if (!gameElement) {
            throw new Error('Game element not found');
        }
        this.gameElement = gameElement;
        this.squareElements = [];
    }
    
    initializeBoard(onSquareClick) {
        this.gameElement.innerHTML = '';
        this.squareElements = [];
        
        for (var row = 0; row < 8; row++) {
            for (var col = 0; col < 8; col++) {
                var square = document.createElement('div');
                square.className = 'square';
                square.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
                square.setAttribute('data-row', row);
                square.setAttribute('data-col', col);
                
                square.addEventListener('click', function(e) {
                    onSquareClick(e.currentTarget);
                });
                
                this.gameElement.appendChild(square);
                this.squareElements.push(square);
            }
        }
    }
    
    renderBoard(game) {
        for (var row = 0; row < 8; row++) {
            for (var col = 0; col < 8; col++) {
                var squareIndex = row * 8 + col;
                var square = this.squareElements[squareIndex];
                var piece = game.board[row][col];
                
                // Clear existing piece
                square.innerHTML = '';
                square.classList.remove('selected', 'valid-move');
                
                if (piece !== 0) {
                    var pieceElement = document.createElement('div');
                    pieceElement.className = 'piece';
                    
                    if (piece === 1 || piece === 2) {
                        pieceElement.classList.add('red');
                    }
                    else {
                        pieceElement.classList.add('black');
                    }
                    
                    if (game.isKing(piece)) {
                        pieceElement.classList.add('king');
                    }
                    
                    // Disable pieces that aren't the current player's
                    if (!game.isPieceOwnedByPlayer(piece, game.currentPlayer)) {
                        pieceElement.classList.add('disabled');
                    }
                    
                    square.appendChild(pieceElement);
                }
            }
        }
    }
    
    highlightSquare(row, col) {
        var squareIndex = row * 8 + col;
        var square = this.squareElements[squareIndex];
        if (square) {
            square.classList.add('selected');
        }
    }
    
    highlightValidMoves(moves) {
        for (var move of moves) {
            var squareIndex = move.row * 8 + move.col;
            var square = this.squareElements[squareIndex];
            if (square) {
                square.classList.add('valid-move');
            }
        }
    }
    
    clearHighlights() {
        for (var square of this.squareElements) {
            square.classList.remove('selected', 'valid-move');
        }
    }
    
    updateTurnIndicator(player) {
        var indicator = document.getElementById('currentPlayer');
        if (indicator) {
            indicator.textContent = player === 'red' ? "Red's Turn" : "Black's Turn";
            indicator.style.color = player === 'red' ? '#cc0000' : '#000';
        }
    }
}

// Checkers Game Controller
class CheckersController {
    constructor() {
        var gameElement = document.getElementById('game');
        this.gameOverOverlay = document.getElementById('gameOverOverlay');
        this.newGameButton = document.getElementById('newGameButton');
        this.newGameButton2 = document.getElementById('newGameButton2');
        
        if (!gameElement) {
            console.error('Game element not found');
            return;
        }
        
        this.game = new CheckersGame();
        this.renderer = new CheckersRenderer(gameElement);
        this.selectedSquare = null;
        
        this.renderer.initializeBoard(this.onSquareClick.bind(this));
        this.setupEventListeners();
        this.renderer.renderBoard(this.game);
        this.renderer.updateTurnIndicator(this.game.currentPlayer);
    }
    
    onSquareClick(square) {
        var row = parseInt(square.getAttribute('data-row'));
        var col = parseInt(square.getAttribute('data-col'));
        var piece = this.game.getPieceAt(row, col);
        
        // If a square with valid move is clicked, move there
        if (this.selectedSquare && square.classList.contains('valid-move')) {
            var fromRow = parseInt(this.selectedSquare.getAttribute('data-row'));
            var fromCol = parseInt(this.selectedSquare.getAttribute('data-col'));
            
            if (this.game.makeMove(fromRow, fromCol, row, col)) {
                this.renderer.renderBoard(this.game);
                
                // If must continue jump, auto-select the piece at new position
                if (this.game.mustContinueJump && this.game.jumpingPiece) {
                    var jumpRow = this.game.jumpingPiece.row;
                    var jumpCol = this.game.jumpingPiece.col;
                    var newSquareIndex = jumpRow * 8 + jumpCol;
                    this.selectedSquare = this.renderer.squareElements[newSquareIndex];
                    
                    this.renderer.clearHighlights();
                    this.renderer.highlightSquare(jumpRow, jumpCol);
                    var validMoves = this.game.getValidMoves(jumpRow, jumpCol);
                    this.renderer.highlightValidMoves(validMoves);
                }
                else {
                    // Turn complete
                    this.selectedSquare = null;
                    this.renderer.clearHighlights();
                    this.renderer.updateTurnIndicator(this.game.currentPlayer);
                    
                    // Check for game over
                    var winner = this.game.checkGameOver();
                    if (winner) {
                        this.showGameOver(winner);
                    }
                }
            }
        }
        // If must continue jump, only allow selecting the jumping piece
        else if (this.game.mustContinueJump) {
            if (this.game.jumpingPiece && 
                row === this.game.jumpingPiece.row && 
                col === this.game.jumpingPiece.col) {
                this.renderer.clearHighlights();
                this.selectedSquare = square;
                this.renderer.highlightSquare(row, col);
                
                var validMoves = this.game.getValidMoves(row, col);
                this.renderer.highlightValidMoves(validMoves);
            }
            // Ignore other clicks during multi-jump
        }
        // If clicking on own piece, select it
        else if (piece !== 0 && this.game.isPieceOwnedByPlayer(piece, this.game.currentPlayer)) {
            this.renderer.clearHighlights();
            this.selectedSquare = square;
            this.renderer.highlightSquare(row, col);
            
            var validMoves = this.game.getValidMoves(row, col);
            this.renderer.highlightValidMoves(validMoves);
        }
        // If clicking empty square or opponent piece, deselect
        else {
            this.selectedSquare = null;
            this.renderer.clearHighlights();
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
        
        if (this.gameOverOverlay) {
            this.gameOverOverlay.addEventListener('click', (e) => {
                if (e.target === this.gameOverOverlay) {
                    this.gameOverOverlay.style.display = 'none';
                }
            });
        }
    }
    
    newGame() {
        this.game.initializeBoard();
        this.selectedSquare = null;
        this.renderer.clearHighlights();
        this.renderer.renderBoard(this.game);
        this.renderer.updateTurnIndicator(this.game.currentPlayer);
        this.game.mustCapture = this.game.checkMustCapture();
    }
    
    showGameOver(winner) {
        var title = document.getElementById('gameOverTitle');
        var score = document.getElementById('finalScore');
        
        if (title) {
            title.textContent = winner === 'red' ? 'Red Wins!' : 'Black Wins!';
            title.style.color = winner === 'red' ? '#cc0000' : '#000';
        }
        
        if (score) {
            score.textContent = 'Congratulations!';
        }
        
        if (this.gameOverOverlay) {
            this.gameOverOverlay.style.display = 'flex';
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new CheckersController();
});
