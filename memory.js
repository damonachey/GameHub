// Memory Game Logic
class MemoryGame {
    constructor() {
        // Game state
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.gameStarted = false;
        this.gameEnded = false;
        this.startTime = null;
        this.timerInterval = null;
        
        // Letters for matching (8 pairs = 16 cards)
        this.letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        
        // DOM elements
        this.memoryGrid = document.getElementById('memoryGrid');
        this.timer = document.getElementById('timer');
        this.movesCount = document.getElementById('movesCount');
        this.matchesCount = document.getElementById('matchesCount');
        this.newGameButton = document.getElementById('newGameButton');
        this.gameOverOverlay = document.getElementById('gameOverOverlay');
        this.gameOverTime = document.getElementById('gameOverTime');
        this.finalMoves = document.getElementById('finalMoves');
        this.newGameButton2 = document.getElementById('newGameButton2');
        
        this.setupEventListeners();
        this.initializeGame();
    }
    
    setupEventListeners() {
        this.newGameButton.addEventListener('click', () => {
            this.initializeGame();
        });
        
        this.newGameButton2.addEventListener('click', () => {
            this.initializeGame();
        });
        
        // Click background to dismiss overlay
        this.gameOverOverlay.addEventListener('click', (e) => {
            if (e.target === this.gameOverOverlay) {
                this.hideGameOverOverlay();
            }
        });
    }
    
    initializeGame() {
        // Reset game state
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.gameStarted = false;
        this.gameEnded = false;
        this.startTime = null;
        
        // Clear timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        // Create card pairs
        this.createCards();
        this.shuffleCards();
        this.renderGrid();
        this.updateUI();
        this.hideGameOverOverlay();
    }
    
    createCards() {
        // Create pairs of letters
        for (let letter of this.letters) {
            this.cards.push({ letter: letter, id: `${letter}_1`, flipped: false, matched: false });
            this.cards.push({ letter: letter, id: `${letter}_2`, flipped: false, matched: false });
        }
    }
    
    shuffleCards() {
        // Fisher-Yates shuffle algorithm
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }
    
    renderGrid() {
        this.memoryGrid.innerHTML = '';
        
        this.cards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'memory-card';
            cardElement.dataset.index = index;
            
            const cardContent = document.createElement('div');
            cardContent.className = 'card-content';
            cardContent.textContent = card.letter;
            
            cardElement.appendChild(cardContent);
            cardElement.addEventListener('click', () => this.flipCard(index));
            
            this.memoryGrid.appendChild(cardElement);
        });
    }
    
    flipCard(index) {
        if (this.gameEnded) return;
        
        const card = this.cards[index];
        const cardElement = this.memoryGrid.children[index];
        
        // Can't flip if already flipped, matched, or if two cards are already flipped
        if (card.flipped || card.matched || this.flippedCards.length >= 2) {
            return;
        }
        
        // Start timer on first move
        if (!this.gameStarted) {
            this.startGame();
        }
        
        // Flip the card
        card.flipped = true;
        cardElement.classList.add('flipped');
        this.flippedCards.push(index);
        
        // Check for match when two cards are flipped
        if (this.flippedCards.length === 2) {
            this.moves++;
            this.updateUI();
            
            setTimeout(() => {
                this.checkMatch();
            }, 1000); // Give time to see both cards
        }
    }
    
    checkMatch() {
        const [firstIndex, secondIndex] = this.flippedCards;
        const firstCard = this.cards[firstIndex];
        const secondCard = this.cards[secondIndex];
        const firstElement = this.memoryGrid.children[firstIndex];
        const secondElement = this.memoryGrid.children[secondIndex];
        
        if (firstCard.letter === secondCard.letter) {
            // Match found
            firstCard.matched = true;
            secondCard.matched = true;
            firstElement.classList.add('matched');
            secondElement.classList.add('matched');
            firstElement.classList.remove('flipped');
            secondElement.classList.remove('flipped');
            
            this.matchedPairs++;
            this.updateUI();
            
            // Check if game is won
            if (this.matchedPairs === this.letters.length) {
                this.endGame();
            }
        } else {
            // No match - flip cards back
            firstCard.flipped = false;
            secondCard.flipped = false;
            firstElement.classList.remove('flipped');
            secondElement.classList.remove('flipped');
        }
        
        // Clear flipped cards array
        this.flippedCards = [];
    }
    
    startGame() {
        this.gameStarted = true;
        this.startTime = Date.now();
        this.startTimer();
    }
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            if (!this.gameEnded) {
                this.updateTimer();
            }
        }, 1000);
    }
    
    updateTimer() {
        if (!this.startTime) return;
        
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        this.timer.textContent = `Time: ${timeString}`;
    }
    
    updateUI() {
        this.movesCount.textContent = this.moves;
        this.matchesCount.textContent = `${this.matchedPairs} / ${this.letters.length}`;
    }
    
    endGame() {
        this.gameEnded = true;
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        // Calculate final time
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Update game over overlay
        this.gameOverTime.textContent = `Time: ${timeString}`;
        this.finalMoves.textContent = this.moves;
        
        // Show overlay after a brief delay
        setTimeout(() => {
            this.showGameOverOverlay();
        }, 500);
    }
    
    showGameOverOverlay() {
        this.gameOverOverlay.style.display = 'flex';
    }
    
    hideGameOverOverlay() {
        this.gameOverOverlay.style.display = 'none';
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MemoryGame();
});
