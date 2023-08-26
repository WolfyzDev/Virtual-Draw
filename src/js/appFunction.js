const { ipcRenderer } = require('electron');

let isDragging = false;
let initialX = 0;
let initialY = 0;
let divSize = 200;
const divElement = document.querySelector('.centrer_background_fff_dessin');
divElement.style.width = divSize + 'px';
divElement.style.height = divSize + 'px';

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
  minimizeButton.addEventListener('click', () => ipcRenderer.send('minimize-window'));
  maximizeButton.addEventListener('click', () => ipcRenderer.send('maximize-window'));
  closeButton.addEventListener('click', () => ipcRenderer.send('close-window'));

  document.getElementById('custom-titlebar').addEventListener('mousedown', startDrag);
  document.addEventListener('mousemove', doDrag);
  document.addEventListener('mouseup', stopDrag);

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
        divSize = newWidth; // Ou newHeight, selon vos besoins

        divElement.style.width = divSize + 'px';
        divElement.style.height = divSize + 'px';

        // Mettre à jours l'input de la taille
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

  // Récupérez les éléments du formulaire de paramètres
  const widthInput = document.getElementById('width');
  const heightInput = document.getElementById('height');
  const backgroundColorInput = document.getElementById('background-color');

  // Ajoutez des écouteurs d'événements aux éléments du formulaire
  widthInput.addEventListener('input', (e) => {
    // Mettez à jour la largeur de la div en fonction de la valeur de l'input
    const newWidth = parseInt(e.target.value);
    if (!isNaN(newWidth)) {
      divSize = newWidth;
      divElement.style.width = divSize + 'px';
    }
  });

  heightInput.addEventListener('input', (e) => {
    // Mettez à jour la hauteur de la div en fonction de la valeur de l'input
    const newHeight = parseInt(e.target.value);
    if (!isNaN(newHeight)) {
      divSize = newHeight;
      divElement.style.height = divSize + 'px';
    }
  });

  backgroundColorInput.addEventListener('input', (e) => {
    // Mettez à jour la couleur de fond de la div en fonction de la valeur de l'input
    const newBackgroundColor = e.target.value;
    divElement.style.backgroundColor = newBackgroundColor;
  });

  // Imiter un click sur le bouton de maximisation dés que la fenêtre est chargée
  ipcRenderer.send('maximize-window');
});

document.addEventListener('wheel', (event) => {
  if (event.ctrlKey) {
    if (event.deltaY > 0) {
      // Réduire la taille
      divSize -= 10;
    } else {
      // Augmenter la taille
      divSize += 10;
    }

    // Mettez à jour la taille de la div
    divElement.style.width = divSize + 'px';
    divElement.style.height = divSize + 'px';

    // Récuperer la valeur de la taille de la div et la mettre à jour dans l'input
    const widthInput = document.getElementById('width');
    widthInput.value = divSize;
  }
});
const resizeHandle = document.querySelector('.resize-handle');
let isResizing = false;
let initialWidth = 0;
let initialHeight = 0;

resizeHandle.addEventListener('mousedown', (e) => {
  isResizing = true;
  initialX = e.clientX;
  initialY = e.clientY;
  initialWidth = divElement.offsetWidth;
  initialHeight = divElement.offsetHeight;

  divElement.classList.add('resizable-hover');
});

const selectionBox = document.querySelector('.selection-box');
let isSelecting = false;
let initialXSelection, initialYSelection, finalX, finalY;

document.body.addEventListener('mousedown', (e) => {
  const target = e.target;
  const isClickableElement = target.classList.contains('header') ||
    target.classList.contains('sidebar') ||
    target.classList.contains('resize-handle') ||
    target.classList.contains('centrer_background_fff_dessin');

  if (!isClickableElement) {
    isSelecting = true;
    initialXSelection = e.clientX;
    initialYSelection = e.clientY;

    // Positionnez la boîte de sélection au point initial
    selectionBox.style.left = initialXSelection + 'px';
    selectionBox.style.top = initialYSelection + 'px';
    selectionBox.style.width = '0px';
    selectionBox.style.height = '0px';

    selectionBox.style.display = 'block'; // Affichez la boîte de sélection
  }
});

document.body.addEventListener('mousemove', (e) => {
  if (isSelecting) {
    finalX = e.clientX;
    finalY = e.clientY;

    // Calculez la nouvelle position et la nouvelle taille de la boîte de sélection
    const newX = Math.min(initialXSelection, finalX);
    const newY = Math.min(initialYSelection, finalY);
    const newWidth = Math.abs(finalX - initialXSelection);
    const newHeight = Math.abs(finalY - initialYSelection);

    // Mettez à jour la position et la taille de la boîte de sélection
    selectionBox.style.left = newX + 'px';
    selectionBox.style.top = newY + 'px';
    selectionBox.style.width = newWidth + 'px';
    selectionBox.style.height = newHeight + 'px';

    // Vérifiez si la sélection entre en collision avec les éléments header, sidebar ou resize-handle
    const headerRect = document.querySelector('.header').getBoundingClientRect();
    const sidebarRect = document.querySelector('.sidebar').getBoundingClientRect();
    const resizeHandleRect = document.querySelector('.resize-handle').getBoundingClientRect();

    if (
      newX < headerRect.right &&
      newY < headerRect.bottom &&
      selectionBox.right > headerRect.left &&
      selectionBox.bottom > headerRect.top
    ) {
      // La sélection touche le header, vous pouvez prendre des mesures ici
      // Par exemple, réinitialiser les coordonnées de la sélection
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
      // La sélection touche la sidebar, vous pouvez prendre des mesures ici
      // Par exemple, réinitialiser les coordonnées de la sélection
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
      // La sélection touche le resize-handle, vous pouvez prendre des mesures ici
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

  // Faites quelque chose avec les coordonnées de la sélection (par exemple, envoyez-les à une fonction de traitement)
  handleSelection(initialXSelection, initialYSelection, finalX, finalY);
});

function handleSelection(initialX, initialY, finalX, finalY) {
  // Faites quelque chose avec les coordonnées de la sélection ici
  console.log(`Sélection de (${initialX}, ${initialY}) à (${finalX}, ${finalY})`);
}


// Récupérez une référence aux boutons SVG
// Récupérez une référence aux boutons SVG
const svgButtons = document.querySelectorAll('.sidebar svg');

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






let isDrawing = false;
let initialXDrag, initialYDrag;
let drawnShape = null;

function handleDrawingMove(event) {
  if (isDrawing) {
    // Récupérez les coordonnées de la souris
    const x = event.clientX;
    const y = event.clientY;

    // Calculez la distance parcourue par la souris depuis le dernier événement de déplacement
    const deltaX = x - initialXDrag;
    const deltaY = y - initialYDrag;

    // Mettez à jour les coordonnées initiales de la souris
    initialXDrag = x;
    initialYDrag = y;

    // Mettez à jour les coordonnées de la forme dessinée
    drawnShape.style.left = drawnShape.offsetLeft + deltaX + 'px';
    drawnShape.style.top = drawnShape.offsetTop + deltaY + 'px';
  }
}
function startDrawingMode() {
  // Activez le mode de dessin
  isDrawing = true;

  // Ajoutez un gestionnaire d'événements de clic à la zone de dessin
  document.querySelector('.centrer_background_fff_dessin').addEventListener('click', handleDrawingClick);

  // Ajoutez un gestionnaire d'événements de déplacement à la zone de dessin
  document.querySelector('.centrer_background_fff_dessin').addEventListener('mousemove', handleDrawingMove);
}

function handleDrawingClick(event) {
  if (isDrawing) {
    // Récupérez les coordonnées du clic de la souris
    const x = event.clientX;
    const y = event.clientY;

    // Créez la forme que vous souhaitez dessiner (ovale, cercle, etc.)
    drawnShape = createShape(x, y);

    // Ajoutez la forme à la zone de dessin
    document.querySelector('.centrer_background_fff_dessin').appendChild(drawnShape);
  }
}

// Fonction pour créer la forme (à personnaliser selon vos besoins)
function createShape(x, y) {
  const shape = document.createElement('div');
  shape.classList.add('drawn-shape');

  // Calculez les coordonnées relativement à la div centrale
  const centralDiv = document.querySelector('.centrer_background_fff_dessin');
  const centralDivRect = centralDiv.getBoundingClientRect();
  const relativeX = x - centralDivRect.left;
  const relativeY = y - centralDivRect.top;

  // Appliquez les coordonnées calculées
  shape.style.position = 'absolute';
  shape.style.left = relativeX + 'px';
  shape.style.top = relativeY + 'px';

  shape.style.width = '50px';
  shape.style.height = '30px';
  // Mettre une sorte de bordure radius autour de la forme dessinée une forme de ovale
  shape.style.borderRadius = '100%';

  shape.style.border = '1px solid black';

  return shape;
}


// Ajoutez un gestionnaire d'événements pour désactiver le mode de dessin
document.querySelector('.centrer_background_fff_dessin').addEventListener('dblclick', () => {
  stopDrawingMode();
});

function stopDrawingMode() {
  isDrawing = false;

  // Supprimez le gestionnaire d'événements de clic de la zone de dessin
  document.querySelector('.centrer_background_fff_dessin').removeEventListener('click', handleDrawingClick);

  // Réinitialisez la forme dessinée
  drawnShape = null;
}

// Récupérez la div ovale
const ovalShapeButton = document.getElementById('oval-shape-btn');

// Ajoutez un gestionnaire d'événements de clic à la div ovale
ovalShapeButton.addEventListener('click', () => {
  // Activez le mode de dessin
  startDrawingMode();
});