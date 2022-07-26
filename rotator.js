function Rotator(canvas, callback, rotX, rotY) {
    canvas.addEventListener('mousedown', doMouseDown, false);
    let rotateX = (rotX === undefined) ? 0 : rotX;
    let rotateY = (rotY === undefined) ? 0 : rotY;
    let xLimit = 60;
    let center;
    let degreesPerPixelX = 90/canvas.height;
    let degreesPerPixelY = 180/canvas.width;
    this.getXLimit = function() {
        return xLimit;
    };
    this.setXLimit = function(limitInDegrees) {
        xLimit = Math.min(60, Math.max(0, limitInDegrees));
    };
    this.getRotationCenter = function() {
        return (center === undefined) ? [0,0,0] : center;
    };
    this.setRotationCenter = function(rotationCenter) {
        center = rotationCenter;
    };
    this.setAngles = function(rotX, rotY) {
        rotateX = Math.max(-xLimit, Math.min(xLimit, rotX));
        rotateY = rotY;
        if (callback) {
            callback();
        }
    };
    this.getAngles = function() {
        return [rotateX,rotateY];
    }
    this.getViewMatrix = function() {
        let cosX = Math.cos(rotateX/180*Math.PI);
        let sinX = Math.sin(rotateX/180*Math.PI);
        let cosY = Math.cos(rotateY/180*Math.PI);
        let sinY = Math.sin(rotateY/180*Math.PI);
        let mat = [
            cosY, sinX*sinY, -cosX*sinY, 0,
            0, cosX, sinX, 0,
            sinY, -sinX*cosY, cosX*cosY, 0,
            0, 0, 0, 1
        ];
        if (center !== undefined) {
            let t0 = center[0] - mat[0]*center[0] - mat[4]*center[1] - mat[8]*center[2];
            let t1 = center[1] - mat[1]*center[0] - mat[5]*center[1] - mat[9]*center[2];
            let t2 = center[2] - mat[2]*center[0] - mat[6]*center[1] - mat[10]*center[2];
            mat[12] = t0;
            mat[13] = t1;
            mat[14] = t2;
        }
        return mat;
    };
}