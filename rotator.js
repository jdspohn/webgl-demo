function Rotator(canvas, callback, rotY, scale) {
    canvas.addEventListener('wheel', doWheel, false);
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

    function doWheel(event) {
        let sign = Math.sign(-event.deltaY);
        if (sign == 1 && scale < 5) {
            scale++;
            callback();
        } else if (sign == -1 && scale > 1) {
            scale--;
            callback();
        }
    }

    this.getScale = function() {
        return scale;
    }
}


// at 0 degrees, 
//  mouse moving right = +x (targeting -x)
//  mouse moving up = +z (targeting -z)

// at 45 degrees,
// mouse moving right = +x, -z (targeting -x & +z)
// mouse moving up = +x, +y, +z (targeting -x, -y, -z)

// at 90 degrees,
// mouse moving right = -z (targeting +z)
// mouse moving up = +x (targeting -x)