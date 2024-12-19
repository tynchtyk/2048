document.addEventListener('DOMContentLoaded', () => {
    /**
     * DOM ELEMENTS
     */
    const splashScreen         = document.getElementById('splash-screen');
    const levelSelectionScreen = document.getElementById('level-selection-screen');
    const gameScreen           = document.getElementById('game-screen');
    const gridDisplay          = document.querySelector('.grid');
    const scoreDisplay         = document.getElementById('score');
    const bestScoreDisplay     = document.getElementById('best-score');
    const newGameButton        = document.getElementById('new-game-btn');
    const gameOverOverlay      = document.getElementById('game-over');
    const startGameButton      = document.getElementById('start-game-btn');
    const levelButtons         = document.querySelectorAll('.level-btn');
    const backHomeButton       = document.getElementById('back-home-btn');
    const downloadStateButton  = document.getElementById('download-state-btn');
    const loadStateButton      = document.getElementById('load-state-btn');
    const loadStateInput       = document.getElementById('load-state-input');
    const endScreenOverlay = document.getElementById('end-screen');

    // Power-Up Buttons
    const undoButton        = document.querySelector('.power-up-button.undo');
    const shuffleButton     = document.querySelector('.power-up-button.shuffle');
    const teleportButton    = document.querySelector('.power-up-button.teleport');
    const bombButton        = document.querySelector('.power-up-button.bomb');
    const deleteTileButton  = document.querySelector('.power-up-button.delete-tile');
  
    /**
     * GAME VARIABLES
     */
    let gameGrid;
    let powerUpUses = {};
  
    // Level configurations
    const levels = [
      { level: 0, size: 2, target: 4, powerUpUses: { undo: 0, shuffle: 0, teleport: 0, bomb: 0, deleteTile: 0 }, isTutorial: true },
      { level: 1, size: 3,  target: 32,  powerUpUses: { undo: 1, shuffle: 1, teleport: 1, bomb: 1, deleteTile: 1 } },
      { level: 2, size: 4,  target: 512,  powerUpUses: { undo: 2, shuffle: 2, teleport: 1, bomb: 2, deleteTile: 1 } },
      { level: 3, size: 5,  target: 2048, powerUpUses: { undo: 3, shuffle: 3, teleport: 2, bomb: 2, deleteTile: 1 } },
      { level: 4, size: 6,  target: 4096, powerUpUses: { undo: 3, shuffle: 3, teleport: 2, bomb: 3, deleteTile: 2 } },
      { level: 5, size: 7,  target: 8192, powerUpUses: { undo: 4, shuffle: 4, teleport: 3, bomb: 3, deleteTile: 2 } },
    ];
  
    /**
     * EVENT LISTENERS
     */
  
    // Move from splash screen to level selection
    startGameButton.addEventListener('click', () => {
      splashScreen.classList.add('hidden');
      levelSelectionScreen.classList.remove('hidden');
    });
  
    // Initialize and start game when a level is selected
    levelButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const level = parseInt(e.target.dataset.level);
        const levelConfig = levels.find(l => l.level === level);
  
        if (!levelConfig) {
          console.error(`Level ${level} configuration not found!`);
          return;
        }
  
        
  
        // Adjust power-up buttons visibility based on selected level
        configurePowerUpButtonsForLevel(level);
  
        // Start the game
        startGame(levelConfig.size, levelConfig.target, levelConfig);
      });
    });
  
    // Keyboard Controls
    document.addEventListener('keydown', (e) => {
      const validKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
      if (validKeys.includes(e.key)) {
        e.preventDefault();
        const direction = e.key.replace('Arrow', '').toLowerCase();
        gameGrid.move(direction, () => startGame(gameGrid.size, gameGrid.target, {}), goToNextLevel, showTutorialCompletion);
    }
    });

    function showTutorialCompletion() {
      const instructions = document.getElementById('tutorial-instructions');
      const closeBtn = document.getElementById('tutorial-close-btn');
      instructions.textContent = "Great job! You've learned the basics. Click Continue to return to level selection.";
      closeBtn.classList.remove('hidden');
      const tutorialOverlay = document.getElementById('tutorial-overlay');
      tutorialOverlay.classList.remove('hidden');
    
      closeBtn.addEventListener('click', () => {
        hideTutorialOverlay();
        // Return to level selection
        gameGrid.clearGrid();
        gameScreen.classList.add('hidden');
        levelSelectionScreen.classList.remove('hidden');
      }, { once: true });
    }
    
  
    // Back to Home Screen Button
    backHomeButton.addEventListener('click', () => {
      const confirmExit = confirm('Are you sure you want to return to the home screen? Your current progress will be lost.');
      if (confirmExit) {
        gameGrid.clearGrid();
        gameScreen.classList.add('hidden');
        levelSelectionScreen.classList.remove('hidden');
      }
    });
  
    // Download Current Game State
    downloadStateButton.addEventListener('click', () => {
      const gameState = {
        squares: gameGrid.squares.map(square => ({
          x: square.x,
          y: square.y,
          value: square.value
        })),
        score: gameGrid.score,
        bestScore: gameGrid.bestScore,
        size: gameGrid.size,
        target: gameGrid.target,
        powerUpUses: { ...powerUpUses }
      };
  
      const jsonBlob = new Blob([JSON.stringify(gameState, null, 2)], { type: 'application/json' });
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(jsonBlob);
      downloadLink.download = '2048_game_state.json';
      downloadLink.click();
    });
  
    // Load Saved Game State
    loadStateButton.addEventListener('click', () => {
      loadStateInput.click();
    });
  
    loadStateInput.addEventListener('change', event => {
      const file = event.target.files[0];
      if (!file) return;
  
      const reader = new FileReader();
      reader.onload = () => {
        const gameState = JSON.parse(reader.result);
        loadAndStartGame(gameState);
      };
      reader.readAsText(file);
    });
  
    // New Game Button
    newGameButton.addEventListener('click', () => {
      gameGrid.reset();
      gameOverOverlay.classList.add('hidden');
    });

  
    // Power-Up Buttons
    undoButton.addEventListener('click', () => {
      if (powerUpUses.undo > 0) {
        if (gameGrid.restoreState()) {
          powerUpUses.undo--;
          updatePowerUpTooltips();
        }
      } else {
        alert('No undo uses left!');
      }
    });
  
    shuffleButton.addEventListener('click', () => {
      if (powerUpUses.shuffle > 0) {
        alert('Swap mode activated! Select two tiles to swap.');
        if (enableShuffle()) {
          powerUpUses.shuffle--;
        }
        updatePowerUpTooltips();
      } else {
        alert('No shuffle uses left!');
      }
    });
  
    teleportButton.addEventListener('click', () => {
      if (powerUpUses.teleport > 0) {
        powerUpUses.teleport--;
        updatePowerUpTooltips();
        enableTeleport();
      } else {
        alert('No teleport uses left!');
      }
    });
  
    bombButton.addEventListener('click', () => {
      if (powerUpUses.bomb > 0) {
        powerUpUses.bomb--;
        updatePowerUpTooltips();
        enableBomb();
      } else {
        alert('No bomb uses left!');
      }
    });
  
    deleteTileButton.addEventListener('click', () => {
      if (powerUpUses.deleteTile > 0) {
        powerUpUses.deleteTile--;
        updatePowerUpTooltips();
        enableDeleteTile();
      } else {
        alert('No delete tile uses left!');
      }
    });
  
    /**
     * FUNCTIONS
     */
  
    // Configure which power-up buttons are visible for the selected level
    function configurePowerUpButtonsForLevel(level) {
      undoButton.classList.remove('hidden');
  
      // Hide all except undo by default
      shuffleButton.classList.add('hidden');
      teleportButton.classList.add('hidden');
      bombButton.classList.add('hidden');
      deleteTileButton.classList.add('hidden');
  
      if (level >= 2) shuffleButton.classList.remove('hidden');
      if (level >= 3) teleportButton.classList.remove('hidden');
      if (level >= 4) bombButton.classList.remove('hidden');
      if (level >= 5) deleteTileButton.classList.remove('hidden');
    }
    
    function goToNextLevel() {
        const currentLevelIndex = levels.findIndex(l => l.size === gameGrid.size && l.target === gameGrid.targetScore);
        if (currentLevelIndex < levels.length - 1) {
            const nextLevel = levels[currentLevelIndex + 1];
            startGame(nextLevel.size, nextLevel.target, nextLevel);
        } else {
            alert('You have completed all levels! Great job!');
            startGame(levels[0].size, levels[0].target, levels[0]); // Restart from the first level
        }
    }

    // Start a new game with given size, target, and level configuration
    function startGame(size, target, levelConfig) {
      configurePowerUpButtonsForLevel(size - 2);
      levelSelectionScreen.classList.add('hidden');
      gameScreen.classList.remove('hidden');
      console.log('Starting new game with size:', size, 'target:', target, 'level:', levelConfig);
      document.documentElement.style.setProperty('--grid-size', size);
  
      if (gameGrid) {
        gameGrid.clearGrid();
      }
  
      gameGrid = new Grid(size, gridDisplay, scoreDisplay, bestScoreDisplay, [], target);
      gameGrid.target = target;
  
      powerUpUses = { ...levelConfig.powerUpUses };
  
      updatePowerUpTooltips();
      updateLevelInstructions(levelConfig);
  
      const goalScoreElement = document.getElementById('goal-score');
      goalScoreElement.textContent = target;
      
      if (levelConfig.isTutorial) {
        setupTutorial();
      }
    
      console.log(`Game started with size: ${size}, target: ${target}`, powerUpUses);
    }

    function setupTutorial() {
      // Clear the grid first (if needed)
      //gameGrid.clearGrid();
    
      // Manually place two tiles with value "2"
      // For example, place them at (0,0) and (1,0) so a swipe up merges them
      const tile1 = gameGrid.getSquare(1,1);
      console.log("Tile value", tile1);
      tile1.value = '2';
      tile1.element.innerHTML = '2';
      gameGrid.addTileStyles(tile1);
    
      const tile2 = gameGrid.getSquare(1,0);
      tile2.value = '2';
      tile2.element.innerHTML = '2';
      gameGrid.addTileStyles(tile2);
    
      // Show an instruction overlay or hint
      showTutorialOverlay("Swipe Up to merge the two tiles!");
    }

    function showTutorialOverlay(message) {
      const tutorialOverlay = document.getElementById('tutorial-overlay');
      const instructions = document.getElementById('tutorial-instructions');
      const closeBtn = document.getElementById('tutorial-close-btn');
      instructions.textContent = message;
      tutorialOverlay.classList.remove('hidden');
      closeBtn.classList.add('hidden');
    }
    
    function hideTutorialOverlay() {
      const tutorialOverlay = document.getElementById('tutorial-overlay');
      tutorialOverlay.classList.add('hidden');
    }
    
    
  
    // Update instructions on the screen with data from the level configuration
    function updateLevelInstructions(levelConfig) {
      const { size, target, powerUpUses } = levelConfig;
  
      document.getElementById('goal-number').textContent = target;
      //document.getElementById('grid-size').textContent = `${size}x${size}`;
      document.getElementById('goal-score').textContent = target;
      //document.getElementById('power-up-undo').textContent = powerUpUses.undo;
      //document.getElementById('power-up-shuffle').textContent = powerUpUses.shuffle;
      //document.getElementById('power-up-teleport').textContent = powerUpUses.teleport;
      //document.getElementById('power-up-bomb').textContent = powerUpUses.bomb;
      //document.getElementById('power-up-delete-tile').textContent = powerUpUses.deleteTile;
    }
  
    // Load a previously saved game state
    function loadAndStartGame(gameState) {
      if (!validateGameState(gameState)) {
        alert('Invalid file format. Please upload a valid game state JSON.');
        return;
      }
  
      if (gameGrid) {
        gameGrid.clearGrid();
      }
  
      const size = Math.sqrt(gameState.squares.length);
      document.documentElement.style.setProperty('--grid-size', size);
  
      gameGrid = new Grid(size, gridDisplay, scoreDisplay, bestScoreDisplay, [], gameState.target);
      gameGrid.target = gameState.target;
      gameGrid.scoreDisplay.textContent = gameState.score;
      gameGrid.bestScoreDisplay.textContent = gameState.bestScore;
  
      gameState.squares.forEach(squareData => {
        const square = gameGrid.getSquare(squareData.x, squareData.y);
        if (square) {
          square.value = squareData.value;
          square.element.innerHTML = square.value || '';
          gameGrid.addTileStyles(square);
        }
      });
  
      powerUpUses = gameState.powerUpUses || {};
  
      updatePowerUpTooltips();
      document.getElementById('goal-score').textContent = gameGrid.target;
  
      console.log('Game state loaded successfully:', gameState);
      alert('Game state loaded successfully!');
  
      splashScreen.classList.add('hidden');
      gameScreen.classList.remove('hidden');

      const goalScoreElement = document.getElementById('goal-score');
      goalScoreElement.textContent = gameState.target;
  
      // Infer the level from the grid size (assuming size = level + 2)
      const level = size - 2;
      configurePowerUpButtonsForLevel(level);
    }
  
    // Validate the structure of the loaded game state
    function validateGameState(gameState) {
      // Basic validation of structure
      if (!gameState || !Array.isArray(gameState.squares)) {
        console.log('Invalid game state structure:', gameState);
        return false;
      }
  
      // Validate squares
      for (const square of gameState.squares) {
        if (typeof square.x !== 'number' || 
            typeof square.y !== 'number' ||
            (typeof square.value !== 'string' && square.value !== '')) {
          console.log('Invalid square data:', square);
          return false;
        }
      }
  
      return true;
    }
  
    // Update tooltips for power-ups showing remaining uses
    function updatePowerUpTooltips() {
      const powerUpButtons = document.querySelectorAll('.power-up-button');
      powerUpButtons.forEach(button => {
        const tooltip = button.querySelector('.tooltip');
        const type = Array.from(button.classList).find(cls => cls !== 'power-up-button');
  
        // Update the tooltip text
        if (powerUpUses.hasOwnProperty(type)) {
          tooltip.textContent = `${capitalize(type)} (${powerUpUses[type]} uses left)`;
        } else {
          tooltip.textContent = `${capitalize(type)} (0 uses left)`;
        }
      });
    }
  
    // Helper to capitalize first letter of a string
    function capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
  
    /**
     * POWER-UP ENABLE FUNCTIONS
     */
  
    // Teleport: Select a tile with a number, then select an empty tile to move it there.
    let teleportMode = false;
    function enableTeleport() {
      if (teleportMode) {
        alert('Teleport is already active!');
        return;
      }
  
      teleportMode = true;
      let selectedSource = null;
  
      gameGrid.squares.forEach(tile => {
        tile.element.style.cursor = 'pointer';
  
        tile.element.addEventListener('mouseover', () => {
          if (!teleportMode) return;
          if (!selectedSource && tile.value !== '') {
            tile.element.classList.add('hover-source');
          } else if (teleportMode && selectedSource && tile.value === '') {
            tile.element.classList.add('hover-destination');
          }
        });
  
        tile.element.addEventListener('mouseout', () => {
          tile.element.classList.remove('hover-source', 'hover-destination');
        });
  
        tile.element.addEventListener('click', () => {
          if (!teleportMode) return;
  
          // First selection: Source tile
          if (!selectedSource) {
            if (tile.value === '') {
              alert('Please select a tile with a number first!');
            } else {
              selectedSource = tile;
              tile.element.classList.add('selected-source');
            }
          } 
          // Second selection: Destination tile
          else {
            if (tile.value !== '') {
              alert('Please select an empty tile to teleport!');
            } else {
              // Perform the teleport
              tile.value = selectedSource.value;
              tile.element.innerHTML = selectedSource.value;
              selectedSource.value = '';
              selectedSource.element.innerHTML = '';
  
              gameGrid.addTileStyles(tile);
              gameGrid.addTileStyles(selectedSource);
  
              selectedSource.element.classList.remove('selected-source');
              selectedSource = null;
  
              // Exit teleport mode
              teleportMode = false;
              gameGrid.squares.forEach(square => (square.element.style.cursor = 'default'));
            }
          }
        });
      });
    }
  
    // Shuffle (Swap Mode): Select two tiles with numbers to swap them.
    function enableShuffle() {
      let swapActive = true;
      let selectedFirst = null;
  
      gameGrid.squares.forEach(tile => {
        tile.element.style.cursor = 'pointer';
  
        tile.element.addEventListener('mouseover', () => {
          if (!swapActive) return;
          if (!selectedFirst && tile.value !== '') {
            tile.element.classList.add('hover-source');
          } else if (selectedFirst && tile.value !== '') {
            tile.element.classList.add('hover-destination');
          }
        });
  
        tile.element.addEventListener('mouseout', () => {
          tile.element.classList.remove('hover-source', 'hover-destination');
        });
  
        tile.element.addEventListener('click', () => {
          if (!swapActive) return;
  
          // First selection
          if (!selectedFirst) {
            if (tile.value === '') {
              alert('Please select a tile with a number first!');
            } else {
              selectedFirst = tile;
              tile.element.classList.add('selected-source');
            }
          } 
          // Second selection
          else {
            if (tile.value === '') {
              alert('Please select another tile with a number to swap!');
            } else {
              // Swap values
              const tempValue = tile.value;
              tile.value = selectedFirst.value;
              tile.element.innerHTML = selectedFirst.value;
              selectedFirst.value = tempValue;
              selectedFirst.element.innerHTML = tempValue;
  
              gameGrid.addTileStyles(tile);
              gameGrid.addTileStyles(selectedFirst);
  
              selectedFirst.element.classList.remove('selected-source');
              selectedFirst = null;
              swapActive = false;
  
              // Restore cursors
              gameGrid.squares.forEach(square => (square.element.style.cursor = 'default'));
            }
          }
        });
      });
  
      return true;
    }
  
    // Delete Tile: Select one tile with a number to delete it.
    function enableDeleteTile() {
      let deleteActive = true;
  
      gameGrid.squares.forEach(tile => {
        tile.element.style.cursor = 'pointer';
  
        tile.element.addEventListener('mouseover', () => {
          if (deleteActive && tile.value !== '') {
            tile.element.classList.add('hover-source');
          }
        });
  
        tile.element.addEventListener('mouseout', () => {
          tile.element.classList.remove('hover-source');
        });
  
        tile.element.addEventListener('click', () => {
          if (!deleteActive) return;
  
          if (tile.value === '') {
            alert('Please select a tile with a number!');
          } else {
            tile.value = '';
            tile.element.innerHTML = '';
            gameGrid.addTileStyles(tile);
  
            deleteActive = false;
            gameGrid.squares.forEach(square => (square.element.style.cursor = 'default'));
          }
        });
      });
    }

    function enableBomb() {
        let bombMode = true; // Enable bomb mode
    
        gameGrid.squares.forEach(tile => {
            tile.element.style.cursor = 'pointer'; // Highlight tiles for selection
    
            // Add mouseover listener
            tile.element.addEventListener('mouseover', () => {
                if (bombMode) {
                    // Highlight the tile and its neighbors
                    const neighbors = gameGrid.getNeighbors(tile.x, tile.y);
                    neighbors.forEach(neighbor => {
                        neighbor.element.classList.add('hover-source');
                    });
                }
            });
    
            // Add mouseout listener
            tile.element.addEventListener('mouseout', () => {
                if (bombMode) {
                    // Remove highlight from the tile and its neighbors
                    const neighbors = gameGrid.getNeighbors(tile.x, tile.y);
                    neighbors.forEach(neighbor => {
                        neighbor.element.classList.remove('hover-source');
                    });
                }
            });
    
            // Add click listener
            tile.element.addEventListener('click', () => {
                if (!bombMode) return;
    
                // Get the tile and its neighbors
                const neighbors = gameGrid.getNeighbors(tile.x, tile.y);
    
                // Clear values and update styles
                neighbors.forEach(neighbor => {
                    neighbor.value = '';
                    neighbor.element.innerHTML = '';
                    gameGrid.addTileStyles(neighbor);
                });
    
                // Disable bomb mode
                bombMode = false;
    
                // Reset tile cursors
                gameGrid.squares.forEach(square => (square.element.style.cursor = 'default'));
            });
        });
    }
    

    const gameContainer = document.querySelector('.game-container'); // or the relevant container
    let startX, startY, endX, endY;

    // Add event listeners for touch events
    gameContainer.addEventListener('touchstart', handleTouchStart, false);
    gameContainer.addEventListener('touchmove', handleTouchMove, false);
    gameContainer.addEventListener('touchend', handleTouchEnd, false);

    function handleTouchStart(e) {
      // Take the first touch as the starting point
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
    }

    function handleTouchMove(e) {
      // As the user swipes, store the current position
      // This is optional if you only need end position,
      // but it can help if you want continuous feedback.
      const touch = e.touches[0];
      endX = touch.clientX;
      endY = touch.clientY;
    }

    function handleTouchEnd() {
      // Calculate the distance swiped
      const deltaX = endX - startX;
      const deltaY = endY - startY;

      // Determine whether the swipe was more horizontal or vertical
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 0) {
          // Swipe right
          gameGrid.move('right');
        } else {
          // Swipe left
          gameGrid.move('left');
        }
      } else {
        // Vertical swipe
        if (deltaY > 0) {
          // Swipe down
          gameGrid.move('down');
        } else {
          // Swipe up
          gameGrid.move('up');
        }
      }

      // Reset the coordinates
      startX = null;
      startY = null;
      endX = null;
      endY = null;
    }

  
  });
  