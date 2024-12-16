class Grid {
  constructor(size, gridElement, scoreDisplay, bestScoreDisplay, squares) {
    this.size = size;
    this.gridElement = gridElement;
    this.squares = squares;
    this.score = 0; // Initialize the current score
    this.bestScore = this.getBestScore(); // Retrieve the best score from local storage
    this.scoreDisplay = scoreDisplay; // Reference to the current score display element
    this.bestScoreDisplay = bestScoreDisplay; // Reference to the best score display element

    // Initialize the score displays
    this.scoreDisplay.textContent = this.score;
    this.bestScoreDisplay.textContent = this.bestScore;

    this.createGrid();
  }

  clearGrid() {
    this.gridElement.innerHTML = ''; // Clear all child elements
    this.squares = []; // Reset the squares array
  }

  getState() {
    return {
        squares: this.squares.map(square => ({
            x: square.x,
            y: square.y,
            value: square.value
        })),
        score: this.score
    };
  }

  saveState(state) {
    if (!this.history) this.history = [];
    this.history.push(state);
    console.log(state.squares);
    console.log(state.score);
  }

  exportState() {
    return {
        size: this.size,
        squares: this.squares.map(square => ({
            x: square.x,
            y: square.y,
            value: square.value
        })),
        score: this.score,
        bestScore: this.bestScore
    };
}

  importState(state) {
    // Validate state before loading
    if (!state || state.size !== this.size || !Array.isArray(state.squares)) {
        alert('Invalid game state!');
        return;
    }

    // Clear the current grid
    this.clearGrid();

    // Load squares
    state.squares.forEach(squareData => {
        const square = this.getSquare(squareData.x, squareData.y);
        if (square) {
            square.value = squareData.value;
            square.element.innerHTML = squareData.value;
            this.addTileStyles(square);
        }
    });

    // Load scores
    this.score = state.score || 0;
    this.bestScore = state.bestScore || 0;
    this.scoreDisplay.textContent = this.score;
    this.bestScoreDisplay.textContent = this.bestScore;
  }

  restoreState() {
    if (!this.history || this.history.length === 0) {
        alert('No moves to undo!');
        return false;
    }
    const previousState = this.history.pop();

    // Restore squares
    this.squares.forEach(square => {
        const savedSquare = previousState.squares.find(s => s.x === square.x && s.y === square.y);
        square.value = savedSquare.value;
        square.element.innerHTML = savedSquare.value;
        this.addTileStyles(square);
    });

    // Restore score
    this.score = previousState.score;
    this.scoreDisplay.textContent = this.score;
    return true;
  }

  

  // Random tile removal (bomb)
  useBomb() {
    const nonEmptyTiles = this.squares.filter(tile => tile.value !== '');
    if (nonEmptyTiles.length > 0) {
      const randomTile = nonEmptyTiles[Math.floor(Math.random() * nonEmptyTiles.length)];
      randomTile.value = '';
      randomTile.element.innerHTML = '';
      this.addTileStyles(randomTile);
    } else {
      alert('No tiles to delete!');
    }
  }

  // Specific tile removal (delete tile)
  useDeleteTile() {
    const x = prompt('Enter the X coordinate (0-based):');
    const y = prompt('Enter the Y coordinate (0-based):');
    const tile = this.squares.find(tile => tile.x == x && tile.y == y);

    if (tile && tile.value !== '') {
      tile.value = '';
      tile.element.innerHTML = '';
      this.addTileStyles(tile);
    } else {
      alert('Invalid tile or empty tile!');
    }
  }

  teleport() {
    let selectedSource = null;

    // Highlight the grid for interactivity
    this.squares.forEach(tile => {
        // Add a hover effect for tiles
        tile.element.style.cursor = 'pointer';
        tile.element.addEventListener('mouseover', () => {
            if (!selectedSource) {
                // Highlight non-empty tiles for source selection
                if (tile.value !== '') {
                    tile.element.classList.add('hover-source');
                }
            } else {
                // Highlight empty tiles for destination selection
                if (tile.value === '') {
                    tile.element.classList.add('hover-destination');
                }
            }
        });

        tile.element.addEventListener('mouseout', () => {
            tile.element.classList.remove('hover-source', 'hover-destination');
        });

        tile.element.addEventListener('click', () => {
            // First selection: source tile
            if (!selectedSource) {
                if (tile.value === '') {
                    alert('Please select a tile with a number first!');
                } else {
                    selectedSource = tile;
                    tile.element.classList.add('selected-source');
                }
            } 
            // Second selection: destination tile
            else {
                if (tile.value !== '') {
                    alert('Please select an empty tile to teleport!');
                } else {
                    // Perform the swap
                    tile.value = selectedSource.value;
                    tile.element.innerHTML = selectedSource.value;
                    selectedSource.value = '';
                    selectedSource.element.innerHTML = '';

                    // Update styles
                    this.addTileStyles(tile);
                    this.addTileStyles(selectedSource);

                    // Clean up selection state
                    selectedSource.element.classList.remove('selected-source');
                    selectedSource = null;

                    // Reset tile cursor
                    this.squares.forEach(square => (square.element.style.cursor = 'default'));
                }
            }
        });
    });
  }

  shuffle() {
    let selectedFirst = null; // Track the first selected tile

    this.squares.forEach(tile => {
        // Add hover effects for tiles
        tile.element.style.cursor = gameGrid.swapMode ? 'pointer' : 'default';

        tile.element.addEventListener('mouseover', () => {
            if (gameGrid.swapMode) {
                if (!selectedFirst && tile.value !== '') {
                    tile.element.classList.add('hover-source');
                } else if (selectedFirst && tile.value !== '') {
                    tile.element.classList.add('hover-destination');
                }
            }
        });

        tile.element.addEventListener('mouseout', () => {
            tile.element.classList.remove('hover-source', 'hover-destination');
        });

        tile.element.addEventListener('click', () => {
            if (!gameGrid.swapMode) return; // Ignore clicks if swap mode is inactive

            // First selection: Choose source tile
            if (!selectedFirst) {
                if (tile.value === '') {
                    alert('Please select a tile with a number first!');
                } else {
                    selectedFirst = tile;
                    tile.element.classList.add('selected-source');
                }
            } 
            // Second selection: Choose destination tile
            else {
                if (tile.value === '') {
                    alert('Please select another tile with a number to swap!');
                } else {
                    // Perform the swap
                    const tempValue = tile.value;
                    tile.value = selectedFirst.value;
                    tile.element.innerHTML = selectedFirst.value;
                    selectedFirst.value = tempValue;
                    selectedFirst.element.innerHTML = tempValue;

                    // Update styles
                    this.addTileStyles(tile);
                    this.addTileStyles(selectedFirst);

                    // Reset selection and deactivate swap mode
                    selectedFirst.element.classList.remove('selected-source');
                    selectedFirst = null;
                    gameGrid.swapMode = false;

                    // Reset tile cursor
                    this.squares.forEach(square => (square.element.style.cursor = 'default'));
                    alert('Swap completed!');
                }
            }
        });
    });
  }






  // Method to create the grid
  createGrid() {
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        const square = document.createElement('div');
        square.classList.add('tile');
        square.innerHTML = '';
        square.dataset.x = x;
        square.dataset.y = y;
        this.gridElement.appendChild(square);
        this.squares.push({
          x: x,
          y: y,
          element: square,
          value: ''
        });
      }
    }
    this.generateNewNumber();
    this.generateNewNumber();
  }

  // Method to add appropriate styles to tiles
  addTileStyles(square) {
    square.element.className = 'tile';
    if (square.value !== '') {
      square.element.classList.add(`tile-${square.value}`);
    }
  }

  // Method to generate a new number (2 or 4) at a random empty tile
  generateNewNumber() {
    let emptySquares = this.squares.filter(square => square.value === '');
    if (emptySquares.length === 0) return;

    let randomSquare = emptySquares[Math.floor(Math.random() * emptySquares.length)];
    randomSquare.value = Math.random() > 0.5 ? '4' : '2';
    randomSquare.element.innerHTML = randomSquare.value;
    this.addTileStyles(randomSquare);
  }

  // Helper method to get square by coordinates
  getSquare(x, y) {
    return this.squares.find(square => square.x === x && square.y === y);
  }

  // Movement method (same as your current implementation)
  move(direction) {
    console.log(direction);
    let moved = false;
    let state = this.getState();
    if (direction === 'left') {
      for (let y = 0; y < this.size; y++) {
        let row = this.squares.filter(square => square.y === y);
        row.sort((a, b) => a.x - b.x);

        let values = row.map(square => square.value);
        let newValues = this.slideAndCombine(values);

        row.forEach((square, index) => {
          if (square.value !== newValues[index]) {
            square.value = newValues[index];
            square.element.innerHTML = square.value;
            this.addTileStyles(square);
            moved = true;
          }
        });
      }
    } else if (direction === 'right') {
      for (let y = 0; y < this.size; y++) {
        let row = this.squares.filter(square => square.y === y);
        row.sort((a, b) => b.x - a.x);

        let values = row.map(square => square.value);
        let newValues = this.slideAndCombine(values);

        row.forEach((square, index) => {
          if (square.value !== newValues[index]) {
            square.value = newValues[index];
            square.element.innerHTML = square.value;
            this.addTileStyles(square);
            moved = true;
          }
        });
      }
    } else if (direction === 'up') {
      for (let x = 0; x < this.size; x++) {
        let column = this.squares.filter(square => square.x === x);
        column.sort((a, b) => a.y - b.y);

        let values = column.map(square => square.value);
        let newValues = this.slideAndCombine(values);

        column.forEach((square, index) => {
          if (square.value !== newValues[index]) {
            square.value = newValues[index];
            square.element.innerHTML = square.value;
            this.addTileStyles(square);
            moved = true;
          }
        });
      }
    } else if (direction === 'down') {
      for (let x = 0; x < this.size; x++) {
        let column = this.squares.filter(square => square.x === x);
        column.sort((a, b) => b.y - a.y);

        let values = column.map(square => square.value);
        let newValues = this.slideAndCombine(values);

        column.forEach((square, index) => {
          if (square.value !== newValues[index]) {
            square.value = newValues[index];
            square.element.innerHTML = square.value;
            this.addTileStyles(square);
            moved = true;
          }
        });
      }
    }

    if (moved) {
      this.saveState(state); // Save the current state before generating a new tile
      this.generateNewNumber();
      this.checkForGameOver();
    }
  }

  // Slide and combine tiles with merge animations
  slideAndCombine(values) {
    let filteredValues = values.filter(value => value !== '');
    let combinedValues = [];
    let skipIndexes = [];

    for (let i = 0; i < filteredValues.length; i++) {
      if (skipIndexes.includes(i)) continue;

      if (i + 1 < filteredValues.length && filteredValues[i] === filteredValues[i + 1]) {
        const combinedValue = String(Number(filteredValues[i]) * 2);
        combinedValues.push(combinedValue);

        // Animate merge
        const square = this.squares.find(s => s.value === filteredValues[i]);
        if (square) square.element.classList.add('merge-animation');

        // Update the score
        this.updateScore(Number(combinedValue));

        skipIndexes.push(i + 1);
      } else {
        combinedValues.push(filteredValues[i]);
      }
    }

    while (combinedValues.length < values.length) {
      combinedValues.push('');
    }

    // Clean up animations after 300ms
    setTimeout(() => {
      this.squares.forEach(square => square.element.classList.remove('merge-animation'));
    }, 300);

    return combinedValues;
  }

  updateTilePositions() {
    this.squares.forEach(square => {
      if (square.value !== '') {
        square.element.style.transform = `translate(${square.x * 100}%, ${square.y * 100}%)`;
      } else {
        square.element.style.transform = 'translate(-100%, -100%)'; // Move off-grid if empty
      }
    });
  }
  

  checkForGameOver() {
    if (this.squares.some(square => square.value === '')) return;
  
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        const current = this.getSquare(x, y);
        const right = this.getSquare(x + 1, y);
        const down = this.getSquare(x, y + 1);
  
        if ((right && current.value === right.value) || (down && current.value === down.value)) {
          return;
        }
      }
    }
  
    // No moves left; show game over screen
    const gameOverOverlay = document.getElementById('game-over');
    gameOverOverlay.classList.remove('hidden');
  }

  // Method to update the score and best score
  updateScore(points) {
    this.score += points;
    this.scoreDisplay.textContent = this.score;

    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      this.bestScoreDisplay.textContent = this.bestScore;

      // Save the best score to local storage
      localStorage.setItem('bestScore', this.bestScore);
    }
  }

  // Method to retrieve the best score from local storage
  getBestScore() {
    return localStorage.getItem('bestScore') ? Number(localStorage.getItem('bestScore')) : 0;
  }

  // Reset method (resets both current score and grid)
  reset() {
    this.score = 0;
    this.scoreDisplay.textContent = this.score;
    this.squares.forEach(square => {
      square.value = '';
      square.element.innerHTML = '';
      square.element.className = 'tile';
    });
    this.generateNewNumber();
    this.generateNewNumber();
  }
}
