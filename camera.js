function Camera(canvas, gl, callback, rotY, scale) {
    canvas.addEventListener('wheel', doWheel, false);
    canvas.addEventListener('mousedown', doMouseDown, false);
        
    const observer = new ResizeObserver((entries) => onResize(entries[0], gl));
    observer.observe(gl.canvas, { box: "content-box" });

    let index = 0;
    let night = false;
    setInterval(() => {
        index = (index + 1) % 3;
        callback();
    }, 250);

    this.getIndex = function() {
        return index;
    };

    this.isNight = function() {
        return night;
    };

    let rotateY = (rotY === undefined) ? 0 : rotY;
    let degreesPerPixelY = 0.35;
    
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
            callback();
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

    // let num;
    // num = 0 or 3 depending on button press (+3 or -3?)
    // loop through [0,1,2] or [3,4,5]
        // each step of the loop happens every (x) seconds
        // if (!dragging) (and !resizing?) { 
            // callback() }

    // this.getNum = function() {
    //    return num;
    // }

    function onResize(entry, gl) {
        const size = entry.devicePixelContentBoxSize[0],
              width = size.inlineSize,
              height = size.blockSize;
        if (gl.canvas.width === width && gl.canvas.height === height) {
            return;
        }
        gl.canvas.width = width;
        gl.canvas.height = height;
        if ((gl.drawingBufferWidth < width) || (gl.drawingBufferHeight < height)) {
            gl.canvas.width = gl.drawingBufferWidth;
            gl.canvas.height = gl.drawingBufferHeight;
            gl.canvas.style.width = gl.canvas.width + 'px';
            gl.canvas.style.height = gl.canvas.height + 'px';
        }
        callback();
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