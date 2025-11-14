// Solitaire Game Model (Logic)
class SolitaireGame {
    constructor() {
        this.stock = [];
        this.waste = [];
        this.foundations = [[], [], [], []];
        this.tableau = [[], [], [], [], [], [], []];
        this.suits = ['♠', '♥', '♦', '♣'];
        this.ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    }
    
    newGame() {
        var deck = this.createDeck();
        this.shuffleDeck(deck);
        
        this.stock = [];
        this.waste = [];
        this.foundations = [[], [], [], []];
        this.tableau = [[], [], [], [], [], [], []];
        
        for (var i = 0; i < 7; i++) {
            for (var j = i; j < 7; j++) {
                var card = deck.pop();
                card.faceUp = (j === i);
                this.tableau[j].push(card);
            }
        }
        
        while (deck.length > 0) {
            var card = deck.pop();
            card.faceUp = false;
            this.stock.push(card);
        }
    }
    
    createDeck() {
        var deck = [];
        for (var suitIndex = 0; suitIndex < 4; suitIndex++) {
            for (var rankIndex = 0; rankIndex < 13; rankIndex++) {
                deck.push({
                    suit: suitIndex,
                    rank: rankIndex,
                    faceUp: false,
                    color: (suitIndex === 1 || suitIndex === 2) ? 'red' : 'black'
                });
            }
        }
        return deck;
    }
    
    shuffleDeck(deck) {
        for (var i = deck.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = deck[i];
            deck[i] = deck[j];
            deck[j] = temp;
        }
    }
    
    drawFromStock() {
        if (this.stock.length > 0) {
            var card = this.stock.pop();
            card.faceUp = true;
            this.waste.push(card);
            return true;
        } else if (this.waste.length > 0) {
            while (this.waste.length > 0) {
                var card = this.waste.pop();
                card.faceUp = false;
                this.stock.push(card);
            }
            return true;
        }
        return false;
    }
    
    canMoveToFoundation(card, foundationIndex) {
        var foundation = this.foundations[foundationIndex];
        
        if (foundation.length === 0) {
            return card.rank === 0;
        }
        
        var topCard = foundation[foundation.length - 1];
        return card.suit === topCard.suit && card.rank === topCard.rank + 1;
    }
    
    canMoveToTableau(card, tableauIndex) {
        var column = this.tableau[tableauIndex];
        
        if (column.length === 0) {
            return card.rank === 12;
        }
        
        var topCard = column[column.length - 1];
        if (!topCard.faceUp) {
            return false;
        }
        
        return card.color !== topCard.color && card.rank === topCard.rank - 1;
    }
    
    moveToFoundation(sourceType, sourceIndex, cardIndex) {
        var card = null;
        var sourceArray = null;
        
        if (sourceType === 'waste') {
            if (this.waste.length === 0) {
                return false;
            }
            sourceArray = this.waste;
            card = sourceArray[sourceArray.length - 1];
        } else if (sourceType === 'tableau') {
            sourceArray = this.tableau[sourceIndex];
            if (cardIndex !== sourceArray.length - 1) {
                return false;
            }
            card = sourceArray[cardIndex];
        }
        
        if (!card || !card.faceUp) {
            return false;
        }
        
        var foundationIndex = card.suit;
        if (this.canMoveToFoundation(card, foundationIndex)) {
            this.foundations[foundationIndex].push(card);
            sourceArray.pop();
            
            if (sourceType === 'tableau' && sourceArray.length > 0) {
                sourceArray[sourceArray.length - 1].faceUp = true;
            }
            
            return true;
        }
        
        return false;
    }
    
    moveCards(sourceType, sourceIndex, cardIndex, destType, destIndex) {
        var cards = [];
        var sourceArray = null;
        
        if (sourceType === 'waste') {
            if (this.waste.length === 0 || cardIndex !== this.waste.length - 1) {
                return false;
            }
            sourceArray = this.waste;
            cards = [sourceArray[cardIndex]];
        } else if (sourceType === 'tableau') {
            sourceArray = this.tableau[sourceIndex];
            if (cardIndex >= sourceArray.length || !sourceArray[cardIndex].faceUp) {
                return false;
            }
            cards = sourceArray.slice(cardIndex);
        } else if (sourceType === 'foundation') {
            sourceArray = this.foundations[sourceIndex];
            if (sourceArray.length === 0 || cardIndex !== sourceArray.length - 1) {
                return false;
            }
            cards = [sourceArray[cardIndex]];
        } else {
            return false;
        }
        
        if (cards.length === 0) {
            return false;
        }
        
        var firstCard = cards[0];
        
        if (destType === 'foundation') {
            if (cards.length !== 1) {
                return false;
            }
            if (this.canMoveToFoundation(firstCard, destIndex)) {
                this.foundations[destIndex].push(firstCard);
                sourceArray.splice(cardIndex, 1);
                
                if (sourceType === 'tableau' && sourceArray.length > 0) {
                    sourceArray[sourceArray.length - 1].faceUp = true;
                }
                return true;
            }
        } else if (destType === 'tableau') {
            if (this.canMoveToTableau(firstCard, destIndex)) {
                for (var i = 0; i < cards.length; i++) {
                    this.tableau[destIndex].push(cards[i]);
                }
                sourceArray.splice(cardIndex, cards.length);
                
                if (sourceType === 'tableau' && sourceArray.length > 0) {
                    sourceArray[sourceArray.length - 1].faceUp = true;
                }
                return true;
            }
        }
        
        return false;
    }
    
    isWinnable() {
        var totalCards = 0;
        for (var i = 0; i < 4; i++) {
            totalCards += this.foundations[i].length;
        }
        return totalCards === 52;
    }
    
    autoComplete() {
        var moved = true;
        var maxIterations = 1000;
        var iterations = 0;
        
        while (moved && iterations < maxIterations) {
            moved = false;
            iterations++;
            
            if (this.waste.length > 0) {
                var wasteCard = this.waste[this.waste.length - 1];
                if (this.canMoveToFoundation(wasteCard, wasteCard.suit)) {
                    this.moveToFoundation('waste', 0, 0);
                    moved = true;
                    continue;
                }
            }
            
            for (var i = 0; i < 7; i++) {
                if (this.tableau[i].length > 0) {
                    var card = this.tableau[i][this.tableau[i].length - 1];
                    if (card.faceUp && this.canMoveToFoundation(card, card.suit)) {
                        this.moveToFoundation('tableau', i, this.tableau[i].length - 1);
                        moved = true;
                        break;
                    }
                }
            }
        }
        
        return this.isWinnable();
    }
}

// Solitaire Game Renderer (View)
class SolitaireRenderer {
    constructor() {
        this.stockElement = document.getElementById('stock');
        this.wasteElement = document.getElementById('waste');
        this.foundationElements = [];
        this.tableauElements = [];
        
        for (var i = 0; i < 4; i++) {
            this.foundationElements.push(document.getElementById('foundation-' + i));
        }
        
        for (var i = 0; i < 7; i++) {
            this.tableauElements.push(document.getElementById('tableau-' + i));
        }
    }
    
    render(game) {
        this.renderStock(game.stock);
        this.renderWaste(game.waste);
        this.renderFoundations(game.foundations);
        this.renderTableau(game.tableau);
    }
    
    renderStock(stock) {
        this.stockElement.innerHTML = '';
        if (stock.length > 0) {
            var cardElement = this.createCardElement(stock[stock.length - 1], 'stock', 0, stock.length - 1);
            this.stockElement.appendChild(cardElement);
        }
    }
    
    renderWaste(waste) {
        this.wasteElement.innerHTML = '';
        if (waste.length > 0) {
            var cardElement = this.createCardElement(waste[waste.length - 1], 'waste', 0, waste.length - 1);
            this.wasteElement.appendChild(cardElement);
        }
    }
    
    renderFoundations(foundations) {
        for (var i = 0; i < 4; i++) {
            this.foundationElements[i].innerHTML = '';
            if (foundations[i].length > 0) {
                var card = foundations[i][foundations[i].length - 1];
                var cardElement = this.createCardElement(card, 'foundation', i, foundations[i].length - 1);
                this.foundationElements[i].appendChild(cardElement);
            }
        }
    }
    
    renderTableau(tableau) {
        for (var i = 0; i < 7; i++) {
            this.tableauElements[i].innerHTML = '';
            for (var j = 0; j < tableau[i].length; j++) {
                var card = tableau[i][j];
                var cardElement = this.createCardElement(card, 'tableau', i, j);
                cardElement.style.top = (j * 25) + 'px';
                this.tableauElements[i].appendChild(cardElement);
            }
        }
    }
    
    createCardElement(card, pileType, pileIndex, cardIndex) {
        var cardDiv = document.createElement('div');
        cardDiv.className = 'card ' + card.color;
        cardDiv.setAttribute('data-pile-type', pileType);
        cardDiv.setAttribute('data-pile-index', pileIndex);
        cardDiv.setAttribute('data-card-index', cardIndex);
        
        if (!card.faceUp) {
            cardDiv.classList.add('face-down');
            return cardDiv;
        }
        
        var suits = ['♠', '♥', '♦', '♣'];
        var ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        
        var topDiv = document.createElement('div');
        topDiv.className = 'card-top';
        
        var rankSpan = document.createElement('span');
        rankSpan.className = 'card-rank';
        rankSpan.textContent = ranks[card.rank];
        topDiv.appendChild(rankSpan);
        
        var suitSpan = document.createElement('span');
        suitSpan.className = 'card-suit';
        suitSpan.textContent = suits[card.suit];
        topDiv.appendChild(suitSpan);
        
        cardDiv.appendChild(topDiv);
        
        var centerDiv = document.createElement('div');
        centerDiv.className = 'card-center';
        centerDiv.textContent = suits[card.suit];
        cardDiv.appendChild(centerDiv);
        
        var bottomDiv = document.createElement('div');
        bottomDiv.className = 'card-bottom';
        
        var rankSpan2 = document.createElement('span');
        rankSpan2.className = 'card-rank';
        rankSpan2.textContent = ranks[card.rank];
        bottomDiv.appendChild(rankSpan2);
        
        var suitSpan2 = document.createElement('span');
        suitSpan2.className = 'card-suit';
        suitSpan2.textContent = suits[card.suit];
        bottomDiv.appendChild(suitSpan2);
        
        cardDiv.appendChild(bottomDiv);
        
        return cardDiv;
    }
}

// Solitaire Game Controller
class SolitaireController {
    constructor() {
        this.game = new SolitaireGame();
        this.renderer = new SolitaireRenderer();
        this.selectedCard = null;
        this.draggedCard = null;
        this.draggedCardClone = null;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.isDragging = false;
        this.gameOverOverlay = document.getElementById('gameOverOverlay');
        this.newGameButton = document.getElementById('newGameButton');
        this.newGameButton2 = document.getElementById('newGameButton2');
        
        this.setupEventListeners();
        this.newGame();
    }
    
    setupEventListeners() {
        var self = this;
        
        if (this.newGameButton) {
            this.newGameButton.addEventListener('click', function() {
                self.newGame();
            });
        }
        
        if (this.newGameButton2) {
            this.newGameButton2.addEventListener('click', function() {
                if (self.gameOverOverlay) {
                    self.gameOverOverlay.style.display = 'none';
                }
                self.newGame();
            });
        }
        
        if (this.gameOverOverlay) {
            this.gameOverOverlay.addEventListener('click', function(e) {
                if (e.target === self.gameOverOverlay) {
                    self.gameOverOverlay.style.display = 'none';
                }
            });
        }
        
        document.addEventListener('click', function(e) {
            self.handleClick(e);
        });
        
        document.addEventListener('mousedown', function(e) {
            self.handleMouseDown(e);
        });
        
        document.addEventListener('mousemove', function(e) {
            self.handleMouseMove(e);
        });
        
        document.addEventListener('mouseup', function(e) {
            self.handleMouseUp(e);
        });
        
        document.addEventListener('dblclick', function(e) {
            self.handleDoubleClick(e);
        });
    }
    
    handleClick(e) {
        if (this.isDragging) {
            this.isDragging = false;
            return;
        }
        
        var target = e.target.closest('.card, .pile');
        
        if (!target) {
            this.clearSelection();
            return;
        }
        
        if (target.closest('#stock')) {
            this.game.drawFromStock();
            this.renderer.render(this.game);
            return;
        }
        
        if (target.classList.contains('card')) {
            if (this.selectedCard) {
                this.tryMoveSelectedCard(target);
            } else {
                this.selectCard(target);
            }
        } else if (target.classList.contains('pile') && this.selectedCard) {
            this.tryMoveSelectedCard(target);
        }
    }
    
    selectCard(cardElement) {
        if (cardElement.classList.contains('face-down')) {
            return;
        }
        
        this.clearSelection();
        this.selectedCard = cardElement;
        cardElement.classList.add('selected');
    }
    
    clearSelection() {
        if (this.selectedCard) {
            this.selectedCard.classList.remove('selected');
            this.selectedCard = null;
        }
    }
    
    tryMoveSelectedCard(target) {
        if (!this.selectedCard) {
            return;
        }
        
        var sourceType = this.selectedCard.getAttribute('data-pile-type');
        var sourceIndex = parseInt(this.selectedCard.getAttribute('data-pile-index'));
        var cardIndex = parseInt(this.selectedCard.getAttribute('data-card-index'));
        
        var destType = null;
        var destIndex = null;
        
        if (target.classList.contains('pile')) {
            if (target.classList.contains('foundation')) {
                destType = 'foundation';
                destIndex = parseInt(target.getAttribute('data-suit'));
            } else if (target.classList.contains('tableau')) {
                destType = 'tableau';
                destIndex = parseInt(target.getAttribute('data-column'));
            }
        } else if (target.classList.contains('card')) {
            var targetPileType = target.getAttribute('data-pile-type');
            if (targetPileType === 'foundation') {
                destType = 'foundation';
                destIndex = parseInt(target.getAttribute('data-pile-index'));
            } else if (targetPileType === 'tableau') {
                destType = 'tableau';
                destIndex = parseInt(target.getAttribute('data-pile-index'));
            }
        }
        
        if (destType) {
            var moved = this.game.moveCards(sourceType, sourceIndex, cardIndex, destType, destIndex);
            if (moved) {
                this.clearSelection();
                this.renderer.render(this.game);
                this.checkAutoComplete();
                this.checkWin();
            }
        }
        
        this.clearSelection();
    }
    
    handleMouseDown(e) {
        var card = e.target.closest('.card');
        if (!card || card.classList.contains('face-down') || card.closest('#stock')) {
            return;
        }
        
        this.draggedCard = card;
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;
        this.isDragging = false;
    }
    
    handleMouseMove(e) {
        if (!this.draggedCard) {
            return;
        }
        
        var deltaX = e.clientX - this.dragStartX;
        var deltaY = e.clientY - this.dragStartY;
        var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        if (!this.isDragging && distance > 5) {
            this.isDragging = true;
            
            var clone = this.draggedCard.cloneNode(true);
            clone.style.position = 'fixed';
            clone.style.left = this.draggedCard.getBoundingClientRect().left + 'px';
            clone.style.top = this.draggedCard.getBoundingClientRect().top + 'px';
            clone.style.width = this.draggedCard.offsetWidth + 'px';
            clone.style.height = this.draggedCard.offsetHeight + 'px';
            clone.style.zIndex = '1000';
            clone.style.pointerEvents = 'none';
            clone.style.opacity = '0.8';
            clone.style.transition = 'none';
            clone.classList.add('dragging');
            document.body.appendChild(clone);
            
            this.draggedCardClone = clone;
            this.draggedCard.style.opacity = '0.3';
        }
        
        if (this.draggedCardClone) {
            var rect = this.draggedCard.getBoundingClientRect();
            this.draggedCardClone.style.left = (rect.left + deltaX) + 'px';
            this.draggedCardClone.style.top = (rect.top + deltaY) + 'px';
        }
    }
    
    handleMouseUp(e) {
        if (!this.draggedCard) {
            return;
        }
        
        if (this.draggedCardClone) {
            document.body.removeChild(this.draggedCardClone);
            this.draggedCardClone = null;
        }
        
        this.draggedCard.style.opacity = '';
        
        if (this.isDragging) {
            var target = document.elementFromPoint(e.clientX, e.clientY);
            if (target) {
                var pile = target.closest('.pile');
                if (pile) {
                    this.selectedCard = this.draggedCard;
                    this.tryMoveSelectedCard(pile);
                }
            }
        }
        
        this.draggedCard = null;
    }
    
    handleDoubleClick(e) {
        var cardEl = e.target.closest('.card');
        if (!cardEl || cardEl.classList.contains('face-down') || cardEl.closest('#stock')) {
            return;
        }
        
        var sourceType = cardEl.getAttribute('data-pile-type');
        var sourceIndex = parseInt(cardEl.getAttribute('data-pile-index'));
        var cardIndex = parseInt(cardEl.getAttribute('data-card-index'));
        var moved = false;
        
        // Try to move to its foundation first
        var foundationIndex = null;
        if (sourceType === 'waste') {
            if (this.game.waste[cardIndex]) {
                foundationIndex = this.game.waste[cardIndex].suit;
            }
        } else if (sourceType === 'tableau') {
            if (this.game.tableau[sourceIndex] && this.game.tableau[sourceIndex][cardIndex]) {
                foundationIndex = this.game.tableau[sourceIndex][cardIndex].suit;
            }
        }
        
        if (foundationIndex !== null) {
            moved = this.game.moveCards(sourceType, sourceIndex, cardIndex, 'foundation', foundationIndex);
        }
        
        // If not moved to foundation, try any tableau column
        if (!moved) {
            for (var i = 0; i < 7 && !moved; i++) {
                if (sourceType === 'tableau' && i === sourceIndex) {
                    continue;
                }
                moved = this.game.moveCards(sourceType, sourceIndex, cardIndex, 'tableau', i);
            }
        }
        
        if (moved) {
            this.renderer.render(this.game);
            this.checkAutoComplete();
            this.checkWin();
        }
    }
    
    checkAutoComplete() {
        if (this.game.stock.length === 0 && this.game.waste.length === 0) {
            var hasFaceDown = false;
            for (var i = 0; i < 7; i++) {
                for (var j = 0; j < this.game.tableau[i].length; j++) {
                    if (!this.game.tableau[i][j].faceUp) {
                        hasFaceDown = true;
                        break;
                    }
                }
                if (hasFaceDown) {
                    break;
                }
            }
            
            if (!hasFaceDown) {
                this.animatedAutoComplete();
            }
        }
    }
    
    newGame() {
        this.game.newGame();
        this.renderer.render(this.game);
        this.clearSelection();
    }
    
    autoComplete() {
        var won = this.game.autoComplete();
        this.renderer.render(this.game);
        if (won) {
            this.showSuccessOverlay();
        }
    }
    
    animatedAutoComplete() {
        var self = this;
        var delay = 150;
        
        var tryMoveNext = function() {
            var moved = false;
            
            for (var i = 0; i < 7; i++) {
                if (self.game.tableau[i].length > 0) {
                    var card = self.game.tableau[i][self.game.tableau[i].length - 1];
                    if (card.faceUp && self.game.canMoveToFoundation(card, card.suit)) {
                        self.game.moveToFoundation('tableau', i, self.game.tableau[i].length - 1);
                        self.renderer.render(self.game);
                        moved = true;
                        break;
                    }
                }
            }
            
            if (moved) {
                setTimeout(tryMoveNext, delay);
            } else {
                self.checkWin();
            }
        };
        
        tryMoveNext();
    }
    
    checkWin() {
        if (this.game.isWinnable()) {
            this.showSuccessOverlay();
        }
    }
    
    showSuccessOverlay() {
        if (this.gameOverOverlay) {
            this.gameOverOverlay.style.display = 'flex';
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', function() {
    new SolitaireController();
});
