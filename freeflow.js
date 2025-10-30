// Free Flow Game - Empty 6x6 Grid

class FreeFlowRenderer {
    constructor(gameElement) {
        if (!gameElement) {
            throw new Error('Game element not found');
        }
        this.gameElement = gameElement;
        this.cells = [];
        this.initializeGrid();
    }
    
    initializeGrid() {
        this.gameElement.innerHTML = '';
        this.cells = [];
        
        // Create 6x6 grid
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 6; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                this.gameElement.appendChild(cell);
                this.cells.push(cell);
            }
        }
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    const gameElement = document.getElementById('game');
    
    if (!gameElement) {
        console.error('Game element not found');
        return;
    }
    
    const renderer = new FreeFlowRenderer(gameElement);
    console.log('Free Flow grid initialized: 6x6 empty grid');
});
