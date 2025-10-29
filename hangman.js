// Hangman Game Model (Logic)
class HangmanGame {
    constructor() {
        this.words = [];
        this.currentWord = '';
        this.guessedLetters = [];
        this.wrongGuesses = 0;
        this.maxWrongGuesses = 6;
        this.gameOver = false;
        this.gameWon = false;
    }
    
    async loadWords() {
        try {
            const response = await fetch('hangman_dictionary.json');
            const data = await response.json();
            this.words = data.words;
            return true;
        } catch (error) {
            console.error('Error loading words:', error);
            this.words = [
                'JAVASCRIPT', 'COMPUTER', 'HANGMAN', 'PYTHON', 'KEYBOARD',
                'MONITOR', 'SPEAKER', 'LAPTOP', 'PROGRAMMING', 'ALGORITHM',
                'ELEPHANT', 'GIRAFFE', 'PENGUIN', 'DOLPHIN', 'BUTTERFLY',
                'MOUNTAIN', 'OCEAN', 'FOREST', 'DESERT', 'RAINBOW'
            ];
            return false;
        }
    }
    
    startNewGame() {
        this.currentWord = this.getRandomWord();
        this.guessedLetters = [];
        this.wrongGuesses = 0;
        this.gameOver = false;
        this.gameWon = false;
    }
    
    getRandomWord() {
        const randomIndex = Math.floor(Math.random() * this.words.length);
        return this.words[randomIndex];
    }
    
    guessLetter(letter) {
        if (this.gameOver || this.guessedLetters.includes(letter)) {
            return { valid: false, correct: false };
        }
        
        this.guessedLetters.push(letter);
        const correct = this.currentWord.includes(letter);
        
        if (!correct) {
            this.wrongGuesses++;
            if (this.wrongGuesses >= this.maxWrongGuesses) {
                this.gameOver = true;
            }
        } else {
            if (this.checkWin()) {
                this.gameWon = true;
                this.gameOver = true;
            }
        }
        
        return { valid: true, correct };
    }
    
    checkWin() {
        const wordLetters = [...new Set(this.currentWord.split(''))];
        const correctGuesses = wordLetters.filter(letter => this.guessedLetters.includes(letter));
        return correctGuesses.length === wordLetters.length;
    }
    
    getWordDisplay() {
        let display = '';
        for (const letter of this.currentWord) {
            if (this.guessedLetters.includes(letter)) {
                display += letter + ' ';
            } else {
                display += '_ ';
            }
        }
        return display.trim();
    }
    
    getRemainingGuesses() {
        return this.maxWrongGuesses - this.wrongGuesses;
    }
}

// Hangman Game Renderer (View)
class HangmanRenderer {
    constructor() {
        this.wordDisplay = document.getElementById('wordDisplay');
        this.remainingGuesses = document.getElementById('remainingGuesses');
        this.alphabetContainer = document.getElementById('alphabetContainer');
        this.guessedList = document.getElementById('guessedList');
        this.gameOverOverlay = document.getElementById('gameOverOverlay');
        this.gameOverTitle = document.getElementById('gameOverTitle');
        this.gameOverWord = document.getElementById('gameOverWord');
        this.hangmanParts = ['head', 'body', 'leftArm', 'rightArm', 'leftLeg', 'rightLeg'];
    }
    
    createAlphabet(onLetterClick) {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (!this.alphabetContainer) {
            return;
        }
        this.alphabetContainer.innerHTML = '';
        
        for (const letter of alphabet) {
            const button = document.createElement('button');
            button.className = 'letter-button';
            button.textContent = letter;
            button.id = `letter-${letter}`;
            button.addEventListener('click', () => onLetterClick(letter));
            this.alphabetContainer.appendChild(button);
        }
    }
    
    resetAlphabet() {
        if (!this.alphabetContainer) {
            return;
        }
        const buttons = this.alphabetContainer.querySelectorAll('.letter-button');
        buttons.forEach(button => {
            button.disabled = false;
            button.className = 'letter-button';
        });
    }
    
    updateLetterButton(letter, correct) {
        const button = document.getElementById(`letter-${letter}`);
        if (button) {
            button.disabled = true;
            button.classList.add(correct ? 'correct' : 'incorrect');
        }
    }
    
    updateWordDisplay(display) {
        if (this.wordDisplay) {
            this.wordDisplay.textContent = display;
        }
    }
    
    updateRemainingGuesses(remaining) {
        if (this.remainingGuesses) {
            this.remainingGuesses.textContent = remaining;
        }
    }
    
    updateGuessedLetters(letters) {
        if (!this.guessedList) {
            return;
        }
        if (letters.length === 0) {
            this.guessedList.textContent = 'None';
        } else {
            this.guessedList.textContent = letters.join(', ');
        }
    }
    
    showHangmanPart(wrongGuesses) {
        if (wrongGuesses <= this.hangmanParts.length) {
            const partId = this.hangmanParts[wrongGuesses - 1];
            const part = document.getElementById(partId);
            if (part) {
                part.style.display = 'block';
            }
        }
    }
    
    hideAllHangmanParts() {
        this.hangmanParts.forEach(partId => {
            const part = document.getElementById(partId);
            if (part) {
                part.style.display = 'none';
            }
        });
    }
    
    showGameOverOverlay(won, word) {
        if (this.gameOverTitle) {
            if (won) {
                this.gameOverTitle.textContent = 'Winner';
                this.gameOverTitle.className = 'game-over-title win';
            } else {
                this.gameOverTitle.textContent = 'Game Over';
                this.gameOverTitle.className = 'game-over-title lose';
            }
        }
        if (this.gameOverWord) {
            this.gameOverWord.textContent = `The word was: ${word}`;
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

// Hangman Game Controller
class HangmanController {
    constructor() {
        this.game = new HangmanGame();
        this.renderer = new HangmanRenderer();
        this.newGameButton = document.getElementById('newGameButton');
        this.newGameButton2 = document.getElementById('newGameButton2');
        
        // Store bound event handlers for cleanup
        this.boundKeyHandler = this.handleKeydown.bind(this);
        
        this.initialize();
    }
    
    async initialize() {
        await this.game.loadWords();
        this.renderer.createAlphabet(this.onLetterClick.bind(this));
        this.setupEventListeners();
        this.startNewGame();
    }

    startNewGame() {
        this.game.startNewGame();
        this.renderer.updateWordDisplay(this.game.getWordDisplay());
        this.renderer.updateRemainingGuesses(this.game.getRemainingGuesses());
        this.renderer.updateGuessedLetters(this.game.guessedLetters);
        this.renderer.resetAlphabet();
        this.renderer.hideAllHangmanParts();
        this.renderer.hideGameOverOverlay();
        console.log('New word:', this.game.currentWord);
    }
    
    onLetterClick(letter) {
        const result = this.game.guessLetter(letter);
        
        if (!result.valid) {
            return;
        }
        
        this.renderer.updateLetterButton(letter, result.correct);
        this.renderer.updateWordDisplay(this.game.getWordDisplay());
        this.renderer.updateGuessedLetters(this.game.guessedLetters);
        
        if (!result.correct) {
            this.renderer.showHangmanPart(this.game.wrongGuesses);
            this.renderer.updateRemainingGuesses(this.game.getRemainingGuesses());
        }
        
        if (this.game.gameOver) {
            this.renderer.showGameOverOverlay(this.game.gameWon, this.game.currentWord);
        }
    }

    handleKeydown(event) {
        const letter = event.key.toUpperCase();
        if (letter >= 'A' && letter <= 'Z') {
            this.onLetterClick(letter);
        }
    }
    
    setupEventListeners() {
        if (this.newGameButton) {
            this.newGameButton.addEventListener('click', () => {
                this.startNewGame();
            });
        }

        if (this.newGameButton2) {
            this.newGameButton2.addEventListener('click', () => {
                this.startNewGame();
            });
        }

        document.addEventListener('keydown', this.boundKeyHandler);
        
        if (this.renderer.gameOverOverlay) {
            this.renderer.gameOverOverlay.addEventListener('click', (e) => {
                if (e.target === this.renderer.gameOverOverlay) {
                    this.renderer.hideGameOverOverlay();
                }
            });
        }
    }
    
    cleanup() {
        document.removeEventListener('keydown', this.boundKeyHandler);
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new HangmanController();
});
