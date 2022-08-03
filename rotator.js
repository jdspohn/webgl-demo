function Rotator(canvas, callback, rotY) {
    canvas.addEventListener('mousedown', doMouseDown, false);
    let rotateY = (rotY === undefined) ? 0 : rotY;
    let degreesPerPixelY = 180/canvas.width;
    
    let prevX;
    let dragging = false;
    function doMouseDown(event) {
        if (dragging) {
            return;
        }
        dragging = true;
        document.addEventListener('mousemove', doMouseDrag, false);
        document.addEventListener('mouseup', doMouseUp, false);
        let r = canvas.getBoundingClientRect();
        prevX = event.clientX - r.left;
    };
    function doMouseDrag(event) {
        if (!dragging) {
            return;
        }
        let r = canvas.getBoundingClientRect();
        let x = event.clientX - r.left;
        let newRotY = rotateY + degreesPerPixelY * (-x + prevX);
        prevX = x;
        if (newRotY != rotateY) {
            rotateY = newRotY;
            if (callback) {
                callback();
            }
        }
    };
    function doMouseUp(event) {
        if (!dragging) {
            return;
        }
        dragging = false;
        document.removeEventListener('mousemove', doMouseDrag, false);
        document.removeEventListener('mouseup', doMouseUp, false);
    };
    
    this.getRotation = function() {
        let yRotation = rotateY/180*Math.PI;
        return yRotation;
    };
}