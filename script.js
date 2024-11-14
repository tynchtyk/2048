// script.js

document.addEventListener('DOMContentLoaded', () => {
   const gridDisplay = document.querySelector('.grid');
  const N = 4; // Grid size
  const scoreDisplay = document.getElementById('score');

  // Set CSS variables for dynamic sizing
  document.documentElement.style.setProperty('--grid-size', N);

  // Instantiate the grid and pass the score display element
  const gameGrid = new Grid(N, gridDisplay, scoreDisplay);

  // Event listener for key presses
  document.addEventListener('keydown', (e) => {
    // Prevent default action only for arrow keys
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
      e.preventDefault();
      switch (e.key) {
        case 'ArrowLeft':
          gameGrid.move('left');
          break;
        case 'ArrowRight':
          gameGrid.move('right');
          break;
        case 'ArrowUp':
          gameGrid.move('up');
          break;
        case 'ArrowDown':
          gameGrid.move('down');
          break;
      }
    }
  });

  // Optional: Handle the New Game button
  const newGameButton = document.getElementById('new-game-btn');
  if (newGameButton) {
    newGameButton.addEventListener('click', () => {
      gameGrid.reset();
    });
  }
});
