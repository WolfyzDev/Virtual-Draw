// Processus de rendu (renderer.js)
const { ipcRenderer } = require('electron');

let isDragging = false;
let initialX = 0;
let initialY = 0;

function startDrag(e) {
  isDragging = true;
  initialX = e.screenX;
  initialY = e.screenY;
}

function doDrag(e) {
  if (isDragging) {
    const deltaX = e.screenX - initialX;
    const deltaY = e.screenY - initialY;
    ipcRenderer.send('move-window', { deltaX, deltaY });
  }
}

function stopDrag() {
  isDragging = false;
}

document.addEventListener('DOMContentLoaded', () => {
  // Récupère les boutons de la barre personnalisée
  const minimizeButton = document.getElementById('minimize-btn');
  const maximizeButton = document.getElementById('maximize-btn');
  const closeButton = document.getElementById('close-btn');

  // Associer des événements de clic aux conteneurs des icônes
  minimizeButton.addEventListener('click', () => {
    ipcRenderer.send('minimize-window');
  });

  maximizeButton.addEventListener('click', () => {
    ipcRenderer.send('maximize-window');
  });

  closeButton.addEventListener('click', () => {
    ipcRenderer.send('close-window');
  });

  // Gestion du déplacement de fenêtre
  document.getElementById('custom-titlebar').addEventListener('mousedown', startDrag);
  document.addEventListener('mousemove', doDrag); // Use "document" for better dragging experience even if the cursor is outside the titlebar.
  document.addEventListener('mouseup', stopDrag);
});
