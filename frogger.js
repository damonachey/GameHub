// Frogger Game Logic (Model)
class FroggerGame {
    constructor() {
        this.gridWidth = 13;
        this.gridHeight = 13;
        this.score = 0;
        this.lives = 3;
        this.gameOver = false;
        
        // Lane configuration: 13 rows
        // Row 0: Safe zone (top/goal)
        // Rows 1-5: Water with logs
        // Row 6: Safe zone (middle)
        // Rows 7-11: Road with cars
        // Row 12: Safe zone (bottom/start)
        this.lanes = [
            { type: 'safe-top', row: 0 },
            { type: 'water', row: 1, speed: 0.3, direction: 1 },
            { type: 'water', row: 2, speed: 0.4, direction: -1 },
            { type: 'water', row: 3, speed: 0.3, direction: 1 },
            { type: 'water', row: 4, speed: 0.5, direction: -1 },
            { type: 'water', row: 5, speed: 0.3, direction: 1 },
            { type: 'safe-middle', row: 6 },
            { type: 'road', row: 7, speed: 0.5, direction: 1 },
            { type: 'road', row: 8, speed: 0.4, direction: -1 },
            { type: 'road', row: 9, speed: 0.6, direction: 1 },
            { type: 'road', row: 10, speed: 0.3, direction: -1 },
            { type: 'road', row: 11, speed: 0.5, direction: 1 },
            { type: 'safe-bottom', row: 12 }
        ];
        
        // Frog starting position (bottom middle)
        this.frogX = 6;
        this.frogY = 12;
        
        // Obstacles (cars and logs)
        this.obstacles = [];
        this.initializeObstacles();
    }
    
    initializeObstacles() {
        // Add cars to road lanes
        this.lanes.forEach(lane => {
            if (lane.type === 'road') {
                // Add 1-2 cars per lane with spacing
                const numCars = 1 + Math.floor(Math.random() * 2);
                for (let i = 0; i < numCars; i++) {
                    this.obstacles.push({
                        x: i * (this.gridWidth / numCars) + 2,
                        y: lane.row,
                        type: 'car',
                        width: 2,
                        speed: lane.speed,
                        direction: lane.direction,
                        emoji: '🚗'
                    });
                }
            }
            
            // Add logs to water lanes
            if (lane.type === 'water') {
                const numLogs = 1 + Math.floor(Math.random() * 2);
                for (let i = 0; i < numLogs; i++) {
                    this.obstacles.push({
                        x: i * (this.gridWidth / numLogs) + 1,
                        y: lane.row,
                        type: 'log',
                        width: 3,
                        speed: lane.speed,
                        direction: lane.direction,
                        emoji: '🪵'
                    });
                }
            }
        });
    }
    
    getLaneType(row) {
        const lane = this.lanes.find(l => l.row === row);
        return lane ? lane.type : 'safe';
    }
    
    moveFrog(dx, dy) {
        if (this.gameOver) {
            return false;
        }
        
        const newX = this.frogX + dx;
        const newY = this.frogY + dy;
        
        // Check bounds
        if (newX < 0 || newX >= this.gridWidth || newY < 0 || newY >= this.gridHeight) {
            return false;
        }
        
        this.frogX = newX;
        this.frogY = newY;
        
        // Check if reached goal
        if (newY === 0) {
            this.score += 100;
            return 'success'; // Return success instead of just resetting
        }
        
        // Award points for moving forward
        if (dy < 0) {
            this.score += 10;
        }
        
        return true;
    }
    
    resetFrogPosition() {
        this.frogX = 6;
        this.frogY = 12;
    }
    
    update(deltaTime) {
        if (this.gameOver) {
            return;
        }
        
        // Move obstacles
        this.obstacles.forEach(obstacle => {
            obstacle.x += obstacle.speed * obstacle.direction * deltaTime * 0.002;
            
            // Wrap around
            if (obstacle.direction > 0 && obstacle.x > this.gridWidth) {
                obstacle.x = -obstacle.width;
            } else if (obstacle.direction < 0 && obstacle.x < -obstacle.width) {
                obstacle.x = this.gridWidth;
            }
        });
        
        // Move frog with log if on water
        const laneType = this.getLaneType(this.frogY);
        if (laneType === 'water') {
            const log = this.obstacles.find(obstacle => {
                if (obstacle.y === this.frogY && obstacle.type === 'log') {
                    const logLeft = Math.floor(obstacle.x);
                    const logRight = Math.floor(obstacle.x + obstacle.width);
                    return this.frogX >= logLeft && this.frogX < logRight;
                }
                return false;
            });
            
            if (log) {
                this.frogX += log.speed * log.direction * deltaTime * 0.002;
                
                // Keep frog within bounds
                if (this.frogX < 0 || this.frogX >= this.gridWidth) {
                    this.loseLife();
                }
            }
        }
        
        // Check collisions
        this.checkCollisions();
    }
    
    checkCollisions() {
        const laneType = this.getLaneType(this.frogY);
        
        // Check car collisions on road
        if (laneType === 'road') {
            const hit = this.obstacles.some(obstacle => {
                if (obstacle.y === this.frogY && obstacle.type === 'car') {
                    const obstacleLeft = Math.floor(obstacle.x);
                    const obstacleRight = Math.floor(obstacle.x + obstacle.width);
                    return this.frogX >= obstacleLeft && this.frogX < obstacleRight;
                }
                return false;
            });
            
            if (hit) {
                this.loseLife();
            }
        }
        
        // Check if on log in water
        if (laneType === 'water') {
            const onLog = this.obstacles.some(obstacle => {
                if (obstacle.y === this.frogY && obstacle.type === 'log') {
                    const logLeft = Math.floor(obstacle.x);
                    const logRight = Math.floor(obstacle.x + obstacle.width);
                    return this.frogX >= logLeft && this.frogX < logRight;
                }
                return false;
            });
            
            if (!onLog) {
                this.loseLife();
            }
        }
    }
    
    loseLife() {
        this.lives--;
        this.resetFrogPosition();
        
        if (this.lives <= 0) {
            this.gameOver = true;
        }
    }
    
    getScore() {
        return this.score;
    }
    
    getLives() {
        return this.lives;
    }
    
    isGameOver() {
        return this.gameOver;
    }
    
    getFrogPosition() {
        return { x: this.frogX, y: this.frogY };
    }
    
    getObstacles() {
        return this.obstacles;
    }
}

// Frogger Game Renderer (View)
class FroggerRenderer {
    constructor(gameElement, scoreElement, livesElement) {
        if (!gameElement) {
            throw new Error('Game element not found');
        }
        this.gameElement = gameElement;
        this.scoreElement = scoreElement;
        this.livesElement = livesElement;
        this.cells = [];
    }
    
    initializeGrid(game) {
        this.gameElement.innerHTML = '';
        this.cells = [];
        
        // Create grid cells
        for (let row = 0; row < game.gridHeight; row++) {
            for (let col = 0; col < game.gridWidth; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                // Add lane type class
                const laneType = game.getLaneType(row);
                cell.classList.add(laneType);
                
                this.gameElement.appendChild(cell);
                this.cells.push(cell);
            }
        }
    }
    
    render(game) {
        // Clear all cells
        this.cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('log');
        });
        
        // Render obstacles first
        game.getObstacles().forEach(obstacle => {
            const startCol = Math.floor(obstacle.x);
            for (let i = 0; i < obstacle.width; i++) {
                const col = startCol + i;
                if (col >= 0 && col < game.gridWidth) {
                    const cellIndex = obstacle.y * game.gridWidth + col;
                    if (this.cells[cellIndex]) {
                        if (obstacle.type === 'log') {
                            this.cells[cellIndex].classList.add('log');
                        } else {
                            this.cells[cellIndex].textContent = obstacle.emoji;
                        }
                    }
                }
            }
        });

        // Render frog on top
        const frogPos = game.getFrogPosition();
        const frogIndex = Math.round(frogPos.y) * game.gridWidth + Math.round(frogPos.x);
        if (this.cells[frogIndex]) {
            const frogElement = document.createElement('div');
            frogElement.className = 'frog';
            frogElement.textContent = '🐸';
            this.cells[frogIndex].appendChild(frogElement);
        }
        
        // Update score and lives
        if (this.scoreElement) {
            this.scoreElement.textContent = game.getScore();
        }
        if (this.livesElement) {
            this.livesElement.textContent = game.getLives();
        }
    }
}

// Frogger Game Controller
class FroggerController {
    constructor() {
        const gameElement = document.getElementById('game');
        const scoreElement = document.getElementById('score');
        const livesElement = document.getElementById('lives');
        this.gameOverOverlay = document.getElementById('gameOverOverlay');
        this.successOverlay = document.getElementById('successOverlay');
        this.finalScoreElement = document.getElementById('finalScore');
        this.newGameButton = document.getElementById('newGameButton');
        this.newGameButton2 = document.getElementById('newGameButton2');
        this.continueButton = document.getElementById('continueButton');
        
        if (!gameElement) {
            console.error('Game element not found');
            return;
        }
        
        this.game = new FroggerGame();
        this.renderer = new FroggerRenderer(gameElement, scoreElement, livesElement);
        
        // Bound event handlers
        this.boundKeyHandler = this.handleKeydown.bind(this);
        
        // Initialize
        this.renderer.initializeGrid(this.game);
        this.renderer.render(this.game);
        
        // Setup
        this.setupEventListeners();
        this.setupButtons();
        
        // Start game loop
        this.lastTime = performance.now();
        this.gameLoop();
    }
    
    handleKeydown(event) {
        let moved = false;
        
        switch(event.key) {
            case 'ArrowUp':
                event.preventDefault();
                moved = this.game.moveFrog(0, -1);
                break;
            case 'ArrowDown':
                event.preventDefault();
                moved = this.game.moveFrog(0, 1);
                break;
            case 'ArrowLeft':
                event.preventDefault();
                moved = this.game.moveFrog(-1, 0);
                break;
            case 'ArrowRight':
                event.preventDefault();
                moved = this.game.moveFrog(1, 0);
                break;
        }
        
        if (moved === 'success') {
            this.renderer.render(this.game);
            this.showSuccessOverlay();
        } else if (moved) {
            this.renderer.render(this.game);
        }
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', this.boundKeyHandler);
    }
    
    setupButtons() {
        if (this.newGameButton) {
            this.newGameButton.addEventListener('click', () => {
                this.restartGame();
            });
        }
        if (this.newGameButton2) {
            this.newGameButton2.addEventListener('click', () => {
                this.restartGame();
            });
        }
        if (this.continueButton) {
            this.continueButton.addEventListener('click', () => {
                this.restartGame();
            });
        }
        if (this.gameOverOverlay) {
            this.gameOverOverlay.addEventListener('click', (e) => {
                if (e.target === this.gameOverOverlay) {
                    this.hideGameOverOverlay();
                }
            });
        }
        if (this.successOverlay) {
            this.successOverlay.addEventListener('click', (e) => {
                if (e.target === this.successOverlay) {
                    this.restartGame();
                }
            });
        }
    }
    
    gameLoop() {
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Update game state
        this.game.update(deltaTime);
        
        // Render
        this.renderer.render(this.game);
        
        // Check game over
        if (this.game.isGameOver()) {
            this.showGameOverOverlay();
        } else {
            requestAnimationFrame(() => this.gameLoop());
        }
    }
    
    showSuccessOverlay() {
        if (this.successOverlay) {
            this.successOverlay.style.display = 'flex';
        }
    }
    
    hideSuccessOverlay() {
        if (this.successOverlay) {
            this.successOverlay.style.display = 'none';
        }
    }
    
    showGameOverOverlay() {
        if (this.finalScoreElement) {
            this.finalScoreElement.textContent = `Score: ${this.game.getScore()}`;
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
    
    restartGame() {
        this.game = new FroggerGame();
        this.renderer.initializeGrid(this.game);
        this.renderer.render(this.game);
        this.hideGameOverOverlay();
        this.hideSuccessOverlay();
        
        // Restart game loop
        this.lastTime = performance.now();
        this.gameLoop();
    }
    
    cleanup() {
        document.removeEventListener('keydown', this.boundKeyHandler);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Frogger game loaded - Step 3: Full game with controls!');
    new FroggerController();
    console.log('Use arrow keys to move the frog. Avoid cars, stay on logs!');
});
