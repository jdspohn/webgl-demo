main();

async function main() {
    const canvas = document.querySelector('#glCanvas');
    const gl = canvas.getContext('webgl');

    if (!gl) {
        alert('Unable to initialize WebGL; this browser or machine may not support it.');
        return;
    }

    const vsSource = `
        attribute vec4 aVertexPosition;
        attribute vec2 aTextureCoords;
        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;
        varying vec2 vTextureCoords;
        void main() {
            gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
            vTextureCoords = aTextureCoords;
        }
    `

    const fsSource = `
        varying highp vec2 vTextureCoords;
        uniform sampler2D uTexture;
        void main() {
            gl_FragColor = texture2D(uTexture, vTextureCoords);
        }
    `

    const shaderProgram = initProgram(gl, vsSource, fsSource);

    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            textureCoords: gl.getAttribLocation(shaderProgram, 'aTextureCoords'),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
            uTexture: gl.getUniformLocation(shaderProgram, 'uTexture'),
        }
    }

    const buffers = initBuffers(gl);

    const texture = await loadTexture(gl, 'texture.png');
    
    const rotator = new Rotator(canvas, () => draw(gl, programInfo, buffers, texture, rotator), 315);
    
    draw(gl, programInfo, buffers, texture, rotator);
}

function initBuffers(gl) {
    const positions = [
        // front face
        0, 0, 0,
        28, 0, 0,
        28, 12, 0,
        0, 12, 0,
        // left face
        0, 0, 28,
        0, 0, 0,
        0, 12, 0,
        0, 12, 28,
        // grass tile
        0, 12, 0,
        28, 12, 0,
        28, 12, 28,
        0, 12, 28,
    ];
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const textureCoordinates = [
        // front face
        8/256, 405/1024,
        27/256, 405/1024,
        27/256, 396/1024,
        8/256,  396/1024,
        // left face
        8/256, 393/1024,
        27/256, 393/1024,
        27/256, 384/1024,
        8/256, 384/1024,
        // grass tile
        88/256, 599/1024,
        107/256, 599/1024,
        107/256, 580/1024,
        88/256, 580/1024,
    ];
    const textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);

    const indices = [
        // front face
        0, 1, 2,    0, 2, 3,
        // left face
        4, 5, 6,    4, 6, 7,
        // grass face
        8, 9, 10,   8, 10, 11,
    ];
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    return {
        position: positionBuffer,
        textureCoords: textureCoordBuffer,
        indices: indexBuffer,
    };
}

async function loadTexture(gl, url) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    const image = new Image();

    const complete = new Promise(resolve => {
        image.onload = function() {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    
            resolve(texture);
        };
    })
    image.src = url;
    return complete;
}

function draw(gl, programInfo, buffers, texture, rotator) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.CULL_FACE);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const projectionMatrix = glMatrix.mat4.create();
    glMatrix.mat4.ortho(projectionMatrix, 0, 500, 0, 500, -250, 250);

    const modelViewMatrix = glMatrix.mat4.create();
    let yRotation = rotator.getRotation();
    
    glMatrix.mat4.translate(modelViewMatrix, modelViewMatrix, [250, 250, 0]);
    glMatrix.mat4.rotate(modelViewMatrix, modelViewMatrix, 11*Math.PI/6, [1, 0, 0]);
    glMatrix.mat4.rotate(modelViewMatrix, modelViewMatrix, yRotation, [0, 1, 0]);
    glMatrix.mat4.scale(modelViewMatrix, modelViewMatrix, [5, 5, 5]);
    glMatrix.mat4.translate(modelViewMatrix, modelViewMatrix, [-14, -6, -14]);
    // glMatrix.mat4.scale(modelViewMatrix, modelViewMatrix, [1, 2/3, 1]);

    {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
    }

    {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoords);
        gl.vertexAttribPointer(programInfo.attribLocations.textureCoords, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(programInfo.attribLocations.textureCoords);
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

    gl.useProgram(programInfo.program);

    gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
    gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(programInfo.uniformLocations.uTexture, 0);

    {
        gl.drawElements(gl.TRIANGLES, 18, gl.UNSIGNED_SHORT, 0);
    }
}

function initProgram(gl, vsSource, fsSource) {
    
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vsSource);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the vertex shader: ' + gl.getShaderInfoLog(vertexShader));
        gl.deleteShader(vertexShader);
        return null;
    }

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fsSource);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the fragment shader: ' + gl.getShaderInfoLog(fragmentShader));
        gl.deleteShader(fragmentShader);
        return null;
    }

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}