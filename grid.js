// grid.js

class Grid {
  constructor(size, gridElement, scoreDisplay) {
    this.size = size;
    this.gridElement = gridElement;
    this.squares = [];
    this.score = 0; // Initialize the score
    this.scoreDisplay = scoreDisplay; // Reference to the score display element
    this.createGrid();
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

  // Movement method
  move(direction) {
    console.log(direction);
    let moved = false;

    if (direction === 'left') {
      for (let y = 0; y < this.size; y++) {
        let row = this.squares.filter(square => square.y === y);
        row.sort((a, b) => a.x - b.x); // Left to right

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
        row.sort((a, b) => b.x - a.x); // Right to left

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
        column.sort((a, b) => a.y - b.y); // Top to bottom

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
        column.sort((a, b) => b.y - a.y); // Bottom to top

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
      this.generateNewNumber();
      // Uncomment the line below if you implement game over logic
       this.checkForGameOver();
    }
  }

  // Method to slide and combine tiles
  slideAndCombine(values) {
    // Remove empty tiles
    let filteredValues = values.filter(value => value !== '');
    let combinedValues = [];
    let skipIndexes = [];
  
    for (let i = 0; i < filteredValues.length; i++) {
      if (skipIndexes.includes(i)) continue;
  
      if (i + 1 < filteredValues.length && filteredValues[i] === filteredValues[i + 1]) {
        const combinedValue = String(Number(filteredValues[i]) * 2);
        combinedValues.push(combinedValue);
  
        // Update the score
        this.score += Number(combinedValue);
        this.scoreDisplay.textContent = this.score;
  
        skipIndexes.push(i + 1); // Skip the next tile since it has been combined
      } else {
        combinedValues.push(filteredValues[i]);
      }
    }
  
    // Fill the rest with empty strings
    while (combinedValues.length < values.length) {
      combinedValues.push('');
    }
    return combinedValues;
  }
  
  checkForGameOver() {
    // Check if there are any empty squares
    if (this.squares.some(square => square.value === '')) {
      return;
    }
  
    // Check for possible merges horizontally and vertically
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        const currentSquare = this.getSquare(x, y);
        const rightSquare = this.getSquare(x + 1, y);
        const downSquare = this.getSquare(x, y + 1);
  
        if (
          (rightSquare && currentSquare.value === rightSquare.value) ||
          (downSquare && currentSquare.value === downSquare.value)
        ) {
          return; // A move is still possible
        }
      }
    }
  
    // No moves left; the game is over
    alert('Game Over!');
  }

  // Method to reset the game
  reset() {
    // Reset the score
    this.score = 0;
    this.scoreDisplay.textContent = this.score;

    // Clear the grid
    this.squares.forEach(square => {
      square.value = '';
      square.element.innerHTML = '';
      square.element.className = 'tile';
    });

    // Generate two new numbers
    this.generateNewNumber();
    this.generateNewNumber();
  }
  
}
