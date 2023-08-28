// Importation des modules / fichiers nécessaires
const { ipcRenderer } = require('electron');
const DragTitleBar = require('./js/Drag.js');
const shapeDrawer = require('./js/Draw/shapeDraw.js');
const svgButtons = document.querySelectorAll('.sidebar svg');
const divElement = document.querySelector('.centrer_background_fff_dessin');
const resizeHandle = document.querySelector('.resize-handle');
const selectionBox = document.querySelector('.selection-box');
const Borderradiuscentral = document.getElementById('border-radius-central');
const BackgroundColorCentral = document.getElementById('background-color');
const ovalShapeButton = document.getElementById('oval-shape-btn');
const centrer_background_fff_dessin = document.getElementById('centrer_background_fff_dessin');

// Déclaration des variables
let isResizing = false;
let initialWidth = 0;
let initialHeight = 0;
let initialX = 0;
let initialY = 0;
let divSize = 200;
let isSelecting = false;
let initialXSelection, initialYSelection, finalX, finalY;

document.addEventListener('DOMContentLoaded', () => {
  const minimizeButton = document.getElementById('minimize-btn');
  const maximizeButton = document.getElementById('maximize-btn');
  const closeButton = document.getElementById('close-btn');

  minimizeButton.addEventListener('click', () => ipcRenderer.send('minimize-window'));
  maximizeButton.addEventListener('click', () => ipcRenderer.send('maximize-window'));
  closeButton.addEventListener('click', () => ipcRenderer.send('close-window'));
  CustomTitleBar = document.getElementById('custom-titlebar');

  CustomTitleBar.addEventListener('mousedown', DragTitleBar.startDrag);
  document.addEventListener('mousemove', DragTitleBar.doDrag);
  document.addEventListener('mouseup', DragTitleBar.stopDrag);

  resizeHandle.addEventListener('mousedown', (e) => {
    isResizing = true;
    initialX = e.clientX;
    initialY = e.clientY;
    initialWidth = divElement.offsetWidth;
    initialHeight = divElement.offsetHeight;

  });

  document.addEventListener('mousemove', (e) => {
    if (isResizing) {
      const deltaX = e.clientX - initialX;
      const deltaY = e.clientY - initialY;

      const newWidth = initialWidth + deltaX;
      const newHeight = initialHeight + deltaY;

      if (newWidth >= 100 && newHeight >= 100) {
        divSize = newWidth;

        divElement.style.width = divSize + 'px';
        divElement.style.height = divSize + 'px';

        const widthInput = document.getElementById('width');
        widthInput.value = divSize;
      }

      e.preventDefault();
    }
  });

  document.addEventListener('mouseup', () => {
    isResizing = false;
    divElement.classList.remove('resizable-hover');
  });

  const widthInput = document.getElementById('width');
  const heightInput = document.getElementById('height');

  widthInput.addEventListener('input', (e) => {
    const newWidth = parseInt(e.target.value);
    if (!isNaN(newWidth)) {
      divSize = newWidth;
      divElement.style.width = divSize + 'px';
    }
  });

  heightInput.addEventListener('input', (e) => {
    const newHeight = parseInt(e.target.value);
    if (!isNaN(newHeight)) {
      divSize = newHeight;
      divElement.style.height = divSize + 'px';
    }
  });

  ipcRenderer.send('maximize-window');
});

document.addEventListener('wheel', (event) => {
  if (event.ctrlKey) {
    if (event.deltaY > 0) {
      divSize -= 10;
    } else {
      divSize += 10;
    }

    divElement.style.width = divSize + 'px';
    divElement.style.height = divSize + 'px';

    const widthInput = document.getElementById('width');
    widthInput.value = divSize;
  }

});

resizeHandle.addEventListener('mousedown', (e) => {
  isResizing = true;
  initialX = e.clientX;
  initialY = e.clientY;
  initialWidth = divElement.offsetWidth;
  initialHeight = divElement.offsetHeight;

  divElement.classList.add('resizable-hover');
});

document.body.addEventListener('mousedown', (e) => {
  const target = e.target;
  const isClickableElement = target.classList.contains('header') ||
    target.classList.contains('sidebar') ||
    target.classList.contains('resize-handle') ||
    target.classList.contains('centrer_background_fff_dessin') ||
    target.classList.contains('right') ||
    target.classList.contains('drag-region') ||
    target.classList.contains('content-box');
  if (!isClickableElement) {
    isSelecting = true;
    initialXSelection = e.clientX;
    initialYSelection = e.clientY;

    selectionBox.style.left = initialXSelection + 'px';
    selectionBox.style.top = initialYSelection + 'px';
    selectionBox.style.width = '0px';
    selectionBox.style.height = '0px';

    selectionBox.style.display = 'block'; 
  }
});

document.body.addEventListener('mousemove', (e) => {
  if (isSelecting) {
    finalX = e.clientX;
    finalY = e.clientY;

    const newX = Math.min(initialXSelection, finalX);
    const newY = Math.min(initialYSelection, finalY);
    const newWidth = Math.abs(finalX - initialXSelection);
    const newHeight = Math.abs(finalY - initialYSelection);

    selectionBox.style.left = newX + 'px';
    selectionBox.style.top = newY + 'px';
    selectionBox.style.width = newWidth + 'px';
    selectionBox.style.height = newHeight + 'px';

    const headerRect = document.querySelector('.header').getBoundingClientRect();
    const sidebarRect = document.querySelector('.sidebar').getBoundingClientRect();
    const resizeHandleRect = document.querySelector('.resize-handle').getBoundingClientRect();

    if (
      newX < headerRect.right &&
      newY < headerRect.bottom &&
      selectionBox.right > headerRect.left &&
      selectionBox.bottom > headerRect.top
    ) {
      selectionBox.style.display = 'none';
      isSelecting = false;
      return;
    }

    if (
      newX < sidebarRect.right &&
      newY < sidebarRect.bottom &&
      selectionBox.right > sidebarRect.left &&
      selectionBox.bottom > sidebarRect.top
    ) {
      selectionBox.style.display = 'none';
      isSelecting = false;
      return;
    }

    if (
      newX < resizeHandleRect.right &&
      newY < resizeHandleRect.bottom &&
      selectionBox.right > resizeHandleRect.left &&
      selectionBox.bottom > resizeHandleRect.top
    ) {
      // Par exemple, réinitialiser les coordonnées de la sélection
      selectionBox.style.display = 'none';
      isSelecting = false;
      return;
    }
  }
});

document.body.addEventListener('mouseup', () => {
  isSelecting = false;
  // Cachez la boîte de sélection après la fin de la sélection
  selectionBox.style.display = 'none';
});

// Ajoutez un gestionnaire d'événements click à chaque bouton SVG
svgButtons.forEach((button) => {
  button.addEventListener('click', (event) => {
    // Obtenez l'identifiant de la div cible depuis l'attribut data-target
    const targetId = event.currentTarget.getAttribute('data-target');

    // Récupérez la div cible en dehors de la classe .resize-handle
    const targetDiv = document.getElementById(targetId);

    // Vérifiez si la div cible est actuellement visible
    const isDivVisible = window.getComputedStyle(targetDiv).display !== 'none';

    // Récupérez tous les boutons SVG et retirez la classe "active_svg" de tous
    svgButtons.forEach((svgButton) => {
      svgButton.classList.remove('active_svg');
    });

    // Ajoutez la classe "active_svg" au bouton SVG actuel
    event.currentTarget.classList.add('active_svg');

    // Récupérez tous les éléments de contenu et masquez-les
    const contentBoxes = document.querySelectorAll('.content-box');
    contentBoxes.forEach((box) => {
      box.style.display = 'none';
    });

    // Affichez la div cible uniquement si elle n'est pas déjà visible
    if (!isDivVisible) {
      targetDiv.style.display = 'block';
    }
  });
});

// Ajoutez un gestionnaire d'événements pour désactiver le mode de dessin
document.addEventListener('keydown', (event) => {
  if (event.key === "Escape") {
    shapeDrawer.stopDrawingMode();
  }
});

// Ajoutez un gestionnaire d'événements de clic à la div ovale
ovalShapeButton.addEventListener('click', () => {
  // Activez le mode de dessin
  shapeDrawer.startDrawingMode();
});

// Raccourci clavier pour annuler le dessin (Ctrl + Z)
document.addEventListener('keydown', (event) => {
  // Vérifiez si la touche "Ctrl" (ou "Cmd" sur macOS) est enfoncée et que la touche "Z" est pressée
  if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
    shapeDrawer.undoDrawing();
  }
});

Borderradiuscentral.addEventListener('input', (e) => {
  // Mettez à jour la largeur de la div en fonction de la valeur de l'input
  const newWidth = parseInt(e.target.value);
  if (!isNaN(newWidth)) {
    divSize = newWidth;
    divElement.style.borderRadius = divSize + 'px';
  }
});

BackgroundColorCentral.addEventListener('input', (e) => {
  const newBackgroundColor = e.target.value;
  centrer_background_fff_dessin.style.backgroundColor = newBackgroundColor;
});