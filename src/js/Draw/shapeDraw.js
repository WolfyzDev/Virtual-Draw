// Tableau pour stocker les formes dessinées
const drawnShapes = [];

let isDrawing = false;
let initialXDrag, initialYDrag;
let drawnShape = null;

function stopDrawingMode() {
    isDrawing = false;

    // Supprimez le gestionnaire d'événements de clic de la zone de dessin
    document.querySelector('.centrer_background_fff_dessin').removeEventListener('click', handleDrawingClick);

    // Supprimez le gestionnaire d'événements de déplacement de la zone de dessin
    document.querySelector('.centrer_background_fff_dessin').removeEventListener('mousemove', handleDrawingMove);

    // Réinitialisez la forme dessinée
    drawnShape = null;
}

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

function undoDrawing() {
    if (drawnShapes.length > 0) {
        // Supprimez la dernière forme dessinée de la zone de dessin
        const lastShape = drawnShapes.pop();
        lastShape.remove();
    }
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
        drawnShapes.push(drawnShape); // Ajoutez la forme au tableau
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
    shape.style.userSelect = 'none';
    shape.style.pointerEvents = 'none';

    return shape;
}


module.exports = {
    startDrawingMode: startDrawingMode,
    undoDrawing: undoDrawing,
    stopDrawingMode: stopDrawingMode
}