document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const splashScreen = document.getElementById('splash-screen');
  const levelSelectionScreen = document.getElementById('level-selection-screen');
  const gameScreen = document.getElementById('game-screen');
  const gridDisplay = document.querySelector('.grid');
  const scoreDisplay = document.getElementById('score');
  const bestScoreDisplay = document.getElementById('best-score');
  const newGameButton = document.getElementById('new-game-btn');
  const restartButton = document.getElementById('restart-btn');
  const gameOverOverlay = document.getElementById('game-over');
  const startGameButton = document.getElementById('start-game-btn');
  const levelButtons = document.querySelectorAll('.level-btn');

  // Power-Up Buttons
  const undoButton = document.querySelector('.power-up-button.undo');
  const shuffleButton = document.querySelector('.power-up-button.shuffle');
  const teleportButton = document.querySelector('.power-up-button.teleport');
  const bombButton = document.querySelector('.power-up-button.bomb');
  const deleteTileButton = document.querySelector('.power-up-button.delete-tile');

  // Game Variables
  let gameGrid;
  let powerUpUses = {}; // Will be populated dynamically for each level

  const levels = [
      { level: 1, size: 3, target: 128, powerUpUses: { undo: 1, shuffle: 1, teleport: 1, bomb: 1, deleteTile: 1 } },
      { level: 2, size: 4, target: 256, powerUpUses: { undo: 2, shuffle: 2, teleport: 1, bomb: 2, deleteTile: 1 } },
      { level: 3, size: 5, target: 512, powerUpUses: { undo: 3, shuffle: 3, teleport: 2, bomb: 2, deleteTile: 1 } },
      { level: 4, size: 6, target: 1024, powerUpUses: { undo: 3, shuffle: 3, teleport: 2, bomb: 3, deleteTile: 2 } },
      { level: 5, size: 7, target: 2048, powerUpUses: { undo: 4, shuffle: 4, teleport: 3, bomb: 3, deleteTile: 2 } },
  ];

  // Show Level Selection Screen
  startGameButton.addEventListener('click', () => {
      splashScreen.classList.add('hidden');
      levelSelectionScreen.classList.remove('hidden');
  });

  // Initialize Game with Selected Level
  levelButtons.forEach(button => {
      button.addEventListener('click', (e) => {
          const level = parseInt(e.target.dataset.level);
          const levelConfig = levels.find(l => l.level === level);

          if (!levelConfig) {
              console.error(`Level ${level} configuration not found!`);
              return;
          }

          levelSelectionScreen.classList.add('hidden');
          gameScreen.classList.remove('hidden');

          startGame(levelConfig.size, levelConfig.target, levelConfig);
      });
  });


  function startGame(size, target, levelConfig) {
    document.documentElement.style.setProperty('--grid-size', size);
  
    // Initialize the game grid
    gameGrid = new Grid(size, gridDisplay, scoreDisplay, bestScoreDisplay);
    gameGrid.target = target;
  
    // Set power-up uses based on the level configuration
    powerUpUses = { ...levelConfig.powerUpUses };
  
    // Update tooltips to show available power-up uses
    updatePowerUpTooltips();
  
    // Set the goal score dynamically
    const goalScoreElement = document.getElementById('goal-score');
    goalScoreElement.textContent = target;
  
    // Update instructions dynamically based on the level
    updateInstructions(levelConfig);
  
    console.log(`Game started with size: ${size}, target: ${target}`, powerUpUses);
  }
  
  function updateInstructions(levelConfig) {
    const { size, target, powerUpUses } = levelConfig;
  
    // Update dynamic numbers in the instructions
    document.getElementById('goal-number').textContent = target;
    document.getElementById('grid-size').textContent = `${size}x${size}`;
    document.getElementById('goal-score').textContent = target;
    document.getElementById('power-up-undo').textContent = powerUpUses.undo;
    document.getElementById('power-up-shuffle').textContent = powerUpUses.shuffle;
    document.getElementById('power-up-teleport').textContent = powerUpUses.teleport;
    document.getElementById('power-up-bomb').textContent = powerUpUses.bomb;
    document.getElementById('power-up-delete-tile').textContent = powerUpUses.deleteTile;
  }
  
  
  


  // Key Controls
  document.addEventListener('keydown', (e) => {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
      e.preventDefault();
      const direction = e.key.replace('Arrow', '').toLowerCase();
      gameGrid.move(direction);
    }
  });

  // New Game Button
  newGameButton.addEventListener('click', () => {
    gameGrid.reset();
    gameOverOverlay.classList.add('hidden');
  });

  // Restart Button in Game Over Overlay
  restartButton.addEventListener('click', () => {
    gameGrid.reset();
    gameOverOverlay.classList.add('hidden');
  });

  let teleportMode = false; // Tracks if teleport mode is active
  function enableTeleport() {
    if (teleportMode) {
        alert('Teleport is already active!');
        return;
    }

    teleportMode = true;
    let selectedSource = null;

    gameGrid.squares.forEach(tile => {
        // Add hover effect when teleport mode is active
        tile.element.style.cursor = 'pointer';
        tile.element.addEventListener('mouseover', () => {
            if (teleportMode && !selectedSource && tile.value !== '') {
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
                    // Perform the swap
                    tile.value = selectedSource.value;
                    tile.element.innerHTML = selectedSource.value;
                    selectedSource.value = '';
                    selectedSource.element.innerHTML = '';

                    // Update styles
                    gameGrid.addTileStyles(tile);
                    gameGrid.addTileStyles(selectedSource);

                    // Clean up selection state
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

  function enableShuffle() {
    let selectedFirst = null; // Track the first selected tile
    let swapActive = true; // Local flag to track if swap mode is active

    // Highlight tiles for interactivity
    gameGrid.squares.forEach(tile => {
        tile.element.style.cursor = 'pointer'; // Indicate clickable tiles

        tile.element.addEventListener('mouseover', () => {
            if (swapActive) {
                if (!selectedFirst && tile.value !== '') {
                    tile.element.classList.add('hover-source'); // Highlight source
                } else if (selectedFirst && tile.value !== '') {
                    tile.element.classList.add('hover-destination'); // Highlight destination
                }
            }
        });

        tile.element.addEventListener('mouseout', () => {
            tile.element.classList.remove('hover-source', 'hover-destination');
        });

        tile.element.addEventListener('click', () => {
            if (!swapActive) return; // Do nothing if swap mode is inactive

            // First selection: Choose the source tile
            if (!selectedFirst) {
                if (tile.value === '') {
                    alert('Please select a tile with a number first!');
                } else {
                    selectedFirst = tile;
                    tile.element.classList.add('selected-source'); // Mark as selected
                }
            } 
            // Second selection: Choose the destination tile
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

                    // Update tile styles
                    gameGrid.addTileStyles(tile);
                    gameGrid.addTileStyles(selectedFirst);

                    // Reset selection and deactivate swap mode
                    selectedFirst.element.classList.remove('selected-source');
                    selectedFirst = null;
                    swapActive = false; // Deactivate swap mode

                    // Restore default cursor for all tiles
                    gameGrid.squares.forEach(square => (square.element.style.cursor = 'default'));
                }
            }
        });
    });
  }

  function enableDeleteTile() {
    let deleteActive = true; // Local flag to track if delete mode is active

    // Highlight tiles for interactivity
    gameGrid.squares.forEach(tile => {
        tile.element.style.cursor = 'pointer'; // Indicate clickable tiles

        tile.element.addEventListener('mouseover', () => {
            if (deleteActive && tile.value !== '') {
                tile.element.classList.add('hover-source'); // Highlight potential tile to delete
            }
        });

        tile.element.addEventListener('mouseout', () => {
            tile.element.classList.remove('hover-source');
        });

        tile.element.addEventListener('click', () => {
            if (!deleteActive) return; // Do nothing if delete mode is inactive

            if (tile.value === '') {
                alert('Please select a tile with a number!');
            } else {
                // Delete the value of the selected tile
                tile.value = '';
                tile.element.innerHTML = '';
                gameGrid.addTileStyles(tile); // Update tile styles to reflect empty state

                // Deactivate delete mode
                deleteActive = false;

                // Restore default cursor for all tiles
                gameGrid.squares.forEach(square => (square.element.style.cursor = 'default'));
            }
        });
    });
}





  // Power-Up Button Logic
  undoButton.addEventListener('click', () => {
    usePowerUp('undo');
    updatePowerUpTooltips();
  });

  shuffleButton.addEventListener('click', () => {
    if (powerUpUses.shuffle > 0) {
        powerUpUses.shuffle--;
        updatePowerUpTooltips(); // Refresh tooltips after use
        enableShuffle(); // Activate shuffle mode
        alert('Swap mode activated! Select two tiles to swap.');
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
        powerUpUses.bomb--; // Deduct a bomb use
        updatePowerUpTooltips(); // Refresh tooltips
        gameGrid.useBomb(); // Activate Bomb functionality
    } else {
        alert('No bomb uses left!');
    }
  });

  
  deleteTileButton.addEventListener('click', () => {
    if (powerUpUses.deleteTile > 0) {
        powerUpUses.deleteTile--; // Deduct a use
        updatePowerUpTooltips(); // Refresh tooltips
        enableDeleteTile(); // Activate the delete functionality
    } else {
        alert('No delete tile uses left!');
    }
});

  function usePowerUp(type) {
    if (powerUpUses[type] > 0) {
        powerUpUses[type]--;
        updatePowerUpTooltips();

        switch (type) {
            case 'undo':
                gameGrid.undo(); // Implement an undo stack in Grid to reverse moves
                break;
            case 'shuffle':
                gameGrid.shuffle(); // Randomize tiles on the grid
                break;
            case 'teleport':
                gameGrid.teleport(); // Move a tile to a specific empty position
                break;
            case 'bomb':
                gameGrid.useBomb(); // Already implemented in grid.js
                break;
            case 'deleteTile':
                gameGrid.useDeleteTile(); // Already implemented in grid.js
                break;
        }
    } else {
        alert(`${type.toUpperCase()} has no uses left!`);
    }
  }
  


  window.addEventListener('resize', () => this.updateTilePositions());


  function updatePowerUpTooltips() {
    const powerUpButtons = document.querySelectorAll('.power-up-button');
    powerUpButtons.forEach(button => {
        const tooltip = button.querySelector('.tooltip');
        const type = Array.from(button.classList).find(cls => cls !== "power-up-button");

        // Log for debugging
        console.log('Updating tooltip for:', type, 'Remaining uses:', powerUpUses[type]);

        // Update the tooltip with remaining uses or show "0 uses left" if undefined
        if (powerUpUses.hasOwnProperty(type)) {
            tooltip.textContent = `${type.charAt(0).toUpperCase() + type.slice(1)} (${powerUpUses[type]} uses left)`;
        } else {
            tooltip.textContent = `${type.charAt(0).toUpperCase() + type.slice(1)} (0 uses left)`;
        }
    });
}




});