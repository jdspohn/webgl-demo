function Camera(canvas, gl, callback, rotY, scale) {
    const body = document.querySelector('body');
    const btn = document.querySelector('#btn');
    canvas.addEventListener('wheel', doWheel, false);
    canvas.addEventListener('mousedown', doMouseDown, false);
    btn.addEventListener('click', doBtn, false);
        
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

    function doBtn(event) {
        body.classList.toggle('night');
        btn.classList.toggle('btnselect');
        night = !night;
        callback();
    }

    let rotateY = (rotY === undefined) ? 0 : rotY;
    let degreesPerPixelY = 0.25;
    
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