// Hangman Game Logic
class HangmanGame {
    constructor() {
        this.words = [];
        this.currentWord = '';
        this.guessedLetters = [];
        this.wrongGuesses = 0;
        this.maxWrongGuesses = 6;
        this.gameOver = false;
        this.gameWon = false;

        // DOM elements
        this.wordDisplay = document.getElementById('wordDisplay');
        this.remainingGuesses = document.getElementById('remainingGuesses');
        this.alphabetContainer = document.getElementById('alphabetContainer');
        this.guessedList = document.getElementById('guessedList');
        this.newGameButton = document.getElementById('newGameButton');
        this.gameOverOverlay = document.getElementById('gameOverOverlay');
        this.gameOverTitle = document.getElementById('gameOverTitle');
        this.gameOverWord = document.getElementById('gameOverWord');
        this.restartButton = document.getElementById('restartButton');

        // Hangman parts
        this.hangmanParts = ['head', 'body', 'leftArm', 'rightArm', 'leftLeg', 'rightLeg'];

        this.loadWords();
        this.setupEventListeners();
        this.createAlphabet();
    }

    async loadWords() {
        try {
            const response = await fetch('hangman_dictionary.json');
            const data = await response.json();
            this.words = data.words;
            this.startNewGame();
        } catch (error) {
            console.error('Error loading words:', error);
            // Fallback words if JSON fails to load
            this.words = [
                'JAVASCRIPT', 'COMPUTER', 'HANGMAN', 'PYTHON', 'KEYBOARD',
                'MONITOR', 'SPEAKER', 'LAPTOP', 'PROGRAMMING', 'ALGORITHM',
                'ELEPHANT', 'GIRAFFE', 'PENGUIN', 'DOLPHIN', 'BUTTERFLY',
                'MOUNTAIN', 'OCEAN', 'FOREST', 'DESERT', 'RAINBOW'
            ];
            this.startNewGame();
        }
    }

    startNewGame() {
        // Reset game state
        this.currentWord = this.getRandomWord();
        this.guessedLetters = [];
        this.wrongGuesses = 0;
        this.gameOver = false;
        this.gameWon = false;

        // Reset UI
        this.updateWordDisplay();
        this.updateRemainingGuesses();
        this.updateGuessedLetters();
        this.resetAlphabet();
        this.hideAllHangmanParts();
        this.hideGameOverOverlay();

        console.log('New word:', this.currentWord); // For debugging
    }

    getRandomWord() {
        const randomIndex = Math.floor(Math.random() * this.words.length);
        return this.words[randomIndex];
    }

    createAlphabet() {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        this.alphabetContainer.innerHTML = '';

        for (let letter of alphabet) {
            const button = document.createElement('button');
            button.className = 'letter-button';
            button.textContent = letter;
            button.id = `letter-${letter}`;
            button.addEventListener('click', () => this.guessLetter(letter));
            this.alphabetContainer.appendChild(button);
        }
    }

    resetAlphabet() {
        const buttons = this.alphabetContainer.querySelectorAll('.letter-button');
        buttons.forEach(button => {
            button.disabled = false;
            button.className = 'letter-button';
        });
    }

    guessLetter(letter) {
        if (this.gameOver || this.guessedLetters.includes(letter)) {
            return;
        }

        this.guessedLetters.push(letter);
        const button = document.getElementById(`letter-${letter}`);
        button.disabled = true;

        if (this.currentWord.includes(letter)) {
            // Correct guess
            button.classList.add('correct');
            this.updateWordDisplay();
            this.checkWin();
        } else {
            // Wrong guess
            button.classList.add('incorrect');
            this.wrongGuesses++;
            this.showHangmanPart();
            this.updateRemainingGuesses();
            this.checkLose();
        }

        this.updateGuessedLetters();
    }

    updateWordDisplay() {
        let display = '';
        for (let letter of this.currentWord) {
            if (this.guessedLetters.includes(letter)) {
                display += letter + ' ';
            } else {
                display += '_ ';
            }
        }
        this.wordDisplay.textContent = display.trim();
    }

    updateRemainingGuesses() {
        this.remainingGuesses.textContent = this.maxWrongGuesses - this.wrongGuesses;
    }

    updateGuessedLetters() {
        if (this.guessedLetters.length === 0) {
            this.guessedList.textContent = 'None';
        } else {
            this.guessedList.textContent = this.guessedLetters.join(', ');
        }
    }

    showHangmanPart() {
        if (this.wrongGuesses <= this.hangmanParts.length) {
            const partId = this.hangmanParts[this.wrongGuesses - 1];
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

    checkWin() {
        const wordLetters = [...new Set(this.currentWord.split(''))];
        const correctGuesses = wordLetters.filter(letter => this.guessedLetters.includes(letter));

        if (correctGuesses.length === wordLetters.length) {
            this.gameWon = true;
            this.gameOver = true;
            this.showGameOverOverlay(true);
        }
    }

    checkLose() {
        if (this.wrongGuesses >= this.maxWrongGuesses) {
            this.gameOver = true;
            this.showGameOverOverlay(false);
        }
    }

    showGameOverOverlay(won) {
        if (won) {
            this.gameOverTitle.textContent = 'Winner';
            this.gameOverTitle.className = 'game-over-title win';
            this.gameOverWord.textContent = `The word was: ${this.currentWord}`;
        } else {
            this.gameOverTitle.textContent = 'Game Over';
            this.gameOverTitle.className = 'game-over-title lose';
            this.gameOverWord.textContent = `The word was: ${this.currentWord}`;
        }
        this.gameOverOverlay.style.display = 'flex';
    }

    hideGameOverOverlay() {
        this.gameOverOverlay.style.display = 'none';
    }

    setupEventListeners() {
        this.newGameButton.addEventListener('click', () => {
            this.startNewGame();
        });

        this.restartButton.addEventListener('click', () => {
            this.startNewGame();
        });

        // Keyboard support
        document.addEventListener('keydown', (event) => {
            const letter = event.key.toUpperCase();
            if (letter >= 'A' && letter <= 'Z') {
                this.guessLetter(letter);
            }
        });
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new HangmanGame();
});
