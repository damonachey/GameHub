// Memory Game Model (Logic)
class MemoryGame {
    constructor() {
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.gameStarted = false;
        this.gameEnded = false;
        this.startTime = null;
        this.letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    }
    
    initializeGame() {
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.gameStarted = false;
        this.gameEnded = false;
        this.startTime = null;
        
        this.createCards();
        this.shuffleCards();
    }
    
    createCards() {
        for (const letter of this.letters) {
            this.cards.push({ letter: letter, id: `${letter}_1`, flipped: false, matched: false });
            this.cards.push({ letter: letter, id: `${letter}_2`, flipped: false, matched: false });
        }
    }
    
    shuffleCards() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }
    
    canFlipCard(index) {
        const card = this.cards[index];
        return !this.gameEnded && !card.flipped && !card.matched && this.flippedCards.length < 2;
    }
    
    flipCard(index) {
        if (!this.canFlipCard(index)) {
            return false;
        }
        
        if (!this.gameStarted) {
            this.startGame();
        }
        
        const card = this.cards[index];
        card.flipped = true;
        this.flippedCards.push(index);
        
        if (this.flippedCards.length === 2) {
            this.moves++;
            return { needsCheck: true };
        }
        
        return { needsCheck: false };
    }
    
    checkMatch() {
        const [firstIndex, secondIndex] = this.flippedCards;
        const firstCard = this.cards[firstIndex];
        const secondCard = this.cards[secondIndex];
        
        const isMatch = firstCard.letter === secondCard.letter;
        
        if (isMatch) {
            firstCard.matched = true;
            secondCard.matched = true;
            this.matchedPairs++;
            
            if (this.matchedPairs === this.letters.length) {
                this.endGame();
            }
        } else {
            firstCard.flipped = false;
            secondCard.flipped = false;
        }
        
        this.flippedCards = [];
        
        return { isMatch, indices: [firstIndex, secondIndex] };
    }
    
    startGame() {
        this.gameStarted = true;
        this.startTime = Date.now();
    }
    
    endGame() {
        this.gameEnded = true;
    }
    
    getElapsedTime() {
        if (!this.startTime) {
            return 0;
        }
        return Math.floor((Date.now() - this.startTime) / 1000);
    }
    
    getTimeString() {
        const elapsed = this.getElapsedTime();
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Memory Game Renderer (View)
class MemoryRenderer {
    constructor() {
        this.memoryGrid = document.getElementById('memoryGrid');
        this.timer = document.getElementById('timer');
        this.movesCount = document.getElementById('movesCount');
        this.matchesCount = document.getElementById('matchesCount');
        this.gameOverOverlay = document.getElementById('gameOverOverlay');
        this.gameOverTime = document.getElementById('gameOverTime');
        this.finalMoves = document.getElementById('finalMoves');
    }
    
    renderGrid(cards, onCardClick) {
        if (!this.memoryGrid) {
            return;
        }
        this.memoryGrid.innerHTML = '';
        
        cards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'memory-card';
            cardElement.dataset.index = index;
            
            if (card.flipped) {
                cardElement.classList.add('flipped');
            }
            if (card.matched) {
                cardElement.classList.add('matched');
            }
            
            const cardContent = document.createElement('div');
            cardContent.className = 'card-content';
            cardContent.textContent = card.letter;
            
            cardElement.appendChild(cardContent);
            cardElement.addEventListener('click', () => onCardClick(index));
            
            this.memoryGrid.appendChild(cardElement);
        });
    }
    
    updateCard(index, card) {
        if (!this.memoryGrid) {
            return;
        }
        const cardElement = this.memoryGrid.children[index];
        if (!cardElement) {
            return;
        }
        
        cardElement.className = 'memory-card';
        if (card.flipped) {
            cardElement.classList.add('flipped');
        }
        if (card.matched) {
            cardElement.classList.add('matched');
        }
    }
    
    updateTimer(timeString) {
        if (this.timer) {
            this.timer.textContent = `Time: ${timeString}`;
        }
    }
    
    updateMoves(moves) {
        if (this.movesCount) {
            this.movesCount.textContent = moves;
        }
    }
    
    updateMatches(matchedPairs, totalPairs) {
        if (this.matchesCount) {
            this.matchesCount.textContent = `${matchedPairs} / ${totalPairs}`;
        }
    }
    
    showGameOverOverlay(timeString, moves) {
        if (this.gameOverTime) {
            this.gameOverTime.textContent = `Time: ${timeString}`;
        }
        if (this.finalMoves) {
            this.finalMoves.textContent = moves;
        }
        if (this.gameOverOverlay) {
            this.gameOverOverlay.style.display = 'flex';
        }
    }
    
    hideGameOverOverlay() {
        if (this.gameOverOverlay) {
            this.gameOverOverlay.style.display = 'none';
        }
    }
}

// Memory Game Controller
class MemoryController {
    constructor() {
        this.game = new MemoryGame();
        this.renderer = new MemoryRenderer();
        this.newGameButton = document.getElementById('newGameButton');
        this.newGameButton2 = document.getElementById('newGameButton2');
        this.timerInterval = null;
        
        this.setupEventListeners();
        this.initializeGame();
    }
    
    initializeGame() {
        this.game.initializeGame();
        this.renderer.renderGrid(this.game.cards, this.onCardClick.bind(this));
        this.updateUI();
        this.renderer.hideGameOverOverlay();
        this.stopTimer();
    }
    
    onCardClick(index) {
        const result = this.game.flipCard(index);
        
        if (result === false) {
            return;
        }
        
        if (this.game.gameStarted && !this.timerInterval) {
            this.startTimer();
        }
        
        this.renderer.updateCard(index, this.game.cards[index]);
        
        if (result.needsCheck) {
            this.updateUI();
            setTimeout(() => {
                this.checkMatch();
            }, 1000);
        }
    }
    
    checkMatch() {
        const matchResult = this.game.checkMatch();
        
        for (const index of matchResult.indices) {
            this.renderer.updateCard(index, this.game.cards[index]);
        }
        
        this.updateUI();
        
        if (this.game.gameEnded) {
            this.stopTimer();
            setTimeout(() => {
                this.renderer.showGameOverOverlay(this.game.getTimeString(), this.game.moves);
            }, 500);
        }
    }
    
    updateUI() {
        this.renderer.updateMoves(this.game.moves);
        this.renderer.updateMatches(this.game.matchedPairs, this.game.letters.length);
    }
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            if (!this.game.gameEnded) {
                this.renderer.updateTimer(this.game.getTimeString());
            }
        }, 1000);
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
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
        
        if (this.renderer.gameOverOverlay) {
            this.renderer.gameOverOverlay.addEventListener('click', (e) => {
                if (e.target === this.renderer.gameOverOverlay) {
                    this.renderer.hideGameOverOverlay();
                }
            });
        }
    }
    
    cleanup() {
        this.stopTimer();
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MemoryController();
});
