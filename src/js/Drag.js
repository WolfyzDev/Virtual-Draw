let isDragging = false;

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

module.exports = {
    startDrag: startDrag,
    doDrag: doDrag,
    stopDrag: stopDrag
};