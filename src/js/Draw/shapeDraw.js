const mode = document.getElementById('Mode');
const canvas = document.getElementById('centrer_background_fff_dessin');
const listeShape = [];
let drawingMode = false;
let isDragging = false;
let startDragAdded = false;

function handleMouseDown(event) {
    isDragging = false;
}
function startDrag(event) {
    if (!startDragAdded) {
        canvas.addEventListener('mousedown', handleMouseDown);
        startDragAdded = true;
    }
    if (drawingMode) {
        const x = event.clientX;
        const y = event.clientY;

        // Calculer les coordonnées de la souris par rapport au canvas
        const rect = canvas.getBoundingClientRect();
        const xCanvas = x - rect.left;
        const yCanvas = y - rect.top;

        // Créé une div parent
        const div = document.createElement('div');
        div.classList.add('shape-contenaire');
        div.style.border = '1px solid black';
        div.style.position = 'absolute';
        div.style.width = '150px';
        div.style.height = '130px';
        div.style.left = xCanvas + 'px';
        div.style.top = yCanvas + 'px';

        // Créé une div enfant
        const divChild = document.createElement('div');
        divChild.classList.add('shape');
        divChild.style.border = '1px solid black';
        divChild.style.width = '50px';
        divChild.style.height = '30px';
        divChild.style.borderRadius = '50%';

        // Ajouter la div enfant à la div parent
        div.appendChild(divChild);

        // Ajouter la div parent au canvas
        canvas.appendChild(div);

        const shape = {
            x: xCanvas,
            y: yCanvas,
            width: 150,
            height: 130,
        };

        // Ajoute la forme à la liste des formes
        listeShape.push(shape);
    }
}

function endDrag(event) {
    if (drawingMode) {
        canvas.removeEventListener('mousedown', startDrag);
        canvas.removeEventListener('mousemove', DragShapeSilouette);
        canvas.removeEventListener('mouseup', endDrag);
    }
}

function DragShapeSilouette(event) {
    const x = event.clientX;
    const y = event.clientY;

    // Calculer les coordonnées de la souris par rapport au canvas
    const rect = canvas.getBoundingClientRect();
    const xCanvas = x - rect.left;
    const yCanvas = y - rect.top;

    // Récupérer la div parent
    const div = document.querySelector('.shape-contenaire');

    // Modifier la position de la div parent
    div.style.left = xCanvas + 'px';
    div.style.top = yCanvas + 'px';

    // Récupérer la div enfant
    const divChild = document.querySelector('.shape');

    // Modifier la position de la div enfant
    divChild.style.left = xCanvas + 'px';
    divChild.style.top = yCanvas + 'px';
}

function removeShape() {
    if (listeShape.length > 0) {
        // Récupérer la div parent
        const div = document.querySelector('.shape-contenaire');

        // Supprimer la div parent
        canvas.removeChild(div);

        // Supprimer la forme de la liste des formes
        listeShape.pop();

        console.log(listeShape);
    }
}


function startDrawingMode() {
    console.log(listeShape);
    mode.innerHTML = "Drawing Mode shape Click to start drawing";
    drawingMode = true;
    canvas.addEventListener('mousedown', startDrag);
    canvas.addEventListener('mousemove', DragShapeSilouette);
    // Faire en sorte que quand en apppuye sur la tocuhe escape, on arrête le mode dessin
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            endDrag();
        }

        if (event.key === 'z' && event.ctrlKey) {
            removeShape();
        }
    });
}

module.exports = {
    startDrawingMode: startDrawingMode,
}
