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
    
    const rotator = new Rotator(canvas, () => draw(gl, programInfo, buffers, texture, rotator), 315, 5);
    
    draw(gl, programInfo, buffers, texture, rotator);
}

function initBuffers(gl) {
    const positions = [
        // F L R B T
        // 0,0 SW WATER TILE
        0, 12, 0,
        28, 12, 0,
        28, 12, 28,
        0, 12, 28,
        // 1,0
        28, 12, 0,
        56, 12, 0,
        56, 12, 28,
        28, 12, 28,
        // 2,0
        56, 12, 0,
        84, 12, 0,
        84, 12, 28,
        56, 12, 28,
        // 3,0
        84, 12, 28,
        84, 12, 0,
        84, 24, 0,
        84, 24, 28,

        84, 24, 0,
        112, 36, 0,
        112, 36, 28,
        84, 24, 28,
        // 4,0
        112, 36, 0,
        140, 36, 0,
        140, 36, 28,
        112, 36, 28,
        // 5,0
        140, 36, 28,
        140, 36, 0,
        140, 48, 0,
        140, 48, 28,

        140, 48, 0,
        168, 48, 0,
        168, 48, 28,
        140, 48, 28,
        // 6,0
        168, 48, 28,
        168, 48, 0,
        168, 60, 0,
        168, 60, 28,

        168, 60, 0,
        196, 60, 0,
        196, 60, 28,
        168, 60, 28,
        // 7,0
        196, 60, 28,
        196, 60, 0,
        196, 72, 0,
        196, 72, 28,

        196, 72, 0,
        224, 72, 0,
        224, 72, 28,
        196, 72, 28,
        // 8,0
        224, 72, 0,
        252, 72, 0,
        252, 72, 28,
        224, 72, 28,
        // 9,0 SE GRASS TILE
        252, 72, 0,
        280, 72, 0,
        280, 72, 28,
        252, 72, 28,

        // 0,1
        0, 12, 28,
        28, 12, 28,
        28, 12, 56,
        0, 12, 56,
        // 1,1
        28, 12, 28,
        56, 12, 28,
        56, 12, 56,
        28, 12, 56,
        // 2,1
        56, 12, 28,
        84, 12, 28,
        84, 12, 56,
        56, 12, 56,
        // 3,1
        84, 24, 28,
        112, 36, 28,
        84, 36, 28,

        84, 12, 56,
        84, 12, 28,
        84, 24, 28,
        84, 24, 56,
        84, 24, 56,
        84, 24, 28,
        84, 36, 28,
        84, 36, 56,

        84, 36, 28,
        112, 36, 28,
        112, 36, 56,
        84, 36, 56,
        // 4,1
        112, 36, 28,
        140, 36, 28,
        140, 36, 56,
        112, 36, 56,
        // 5,1
        140, 48, 28,
        168, 48, 28,
        168, 60, 28,
        140, 60, 28,
        140, 60, 28,
        168, 60, 28,
        168, 72, 28,
        140, 72, 28,

        140, 36, 56,
        140, 36, 28,
        140, 48, 28,
        140, 48, 56,
        140, 48, 56,
        140, 48, 28,
        140, 60, 28,
        140, 60, 56,
        140, 60, 56,
        140, 60, 28,
        140, 72, 28,
        140, 72, 56,

        140, 72, 28,
        168, 72, 28,
        168, 72, 56,
        140, 72, 56,
        // 6,1
        168, 60, 28,
        196, 60, 28,
        196, 72, 28,
        168, 72, 28,
        168, 72, 28,
        196, 72, 28,
        196, 84, 28,
        168, 84, 28,

        168, 72, 56,
        168, 72, 28,
        168, 84, 28,
        168, 84, 56,

        168, 84, 28,
        196, 84, 28,
        196, 84, 56,
        168, 84, 56,
        // 7,1
        196, 72, 28,
        224, 72, 28,
        224, 84, 28,
        196, 84, 28,

        196, 84, 28,
        224, 84, 28,
        224, 84, 56,
        196, 84, 56,
        // 8,1
        224, 72, 28,
        252, 72, 28,
        252, 84, 28,
        224, 84, 28,

        252, 72, 28,
        252, 72, 56,
        252, 84, 56,
        252, 84, 28,

        224, 84, 28,
        252, 84, 28,
        252, 84, 56,
        224, 84, 56,
        // 9,1
        252, 72, 28,
        280, 72, 28,
        280, 72, 56,
        252, 72, 56,
    ];
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const textureCoordinates = [
        // 0,0 SW WATER TILE
        148/256, 503/1024,
        167/256, 503/1024,
        167/256, 484/1024,
        148/256, 484/1024,
        // 1,0
        168/256, 503/1024,
        187/256, 503/1024,
        187/256, 484/1024,
        168/256, 484/1024,
        // 2,0
        188/256, 503/1024,
        207/256, 503/1024,
        207/256, 484/1024,
        188/256, 484/1024,
        // 3,0
        8.15/256, 17/1024,
        27/256, 17/1024,
        27/256, 8.15/1024,
        8.15/256, 8.15/1024,

        68.15/256, 759/1024,
        87/256, 759/1024,
        87/256, 740/1024,
        68.15/256, 740/1024,
        // 4,0
        68.15/256, 187/1024,
        87/256, 187/1024,
        87/256, 168/1024,
        68.15/256, 168/1024,
        // 5,0
        28.15/256, 137/1024,
        47/256, 137/1024,
        47/256, 128.15/1024,
        28.15/256, 128.15/1024,

        28.15/256, 127/1024,
        46.85/256, 127/1024,
        46.85/256, 108.15/1024,
        28.15/256, 108.15/1024,
        // 6,0
        48.15/256, 137/1024,
        67/256, 137/1024,
        67/256, 128.15/1024,
        48.15/256, 128.15/1024,

        48.15/256, 127/1024,
        66.85/256, 127/1024,
        66.85/256, 108.15/1024,
        48.15/256, 108.15/1024,
        // 7,0
        68.15/256, 137/1024,
        87/256, 137/1024,
        87/256, 128.15/1024,
        68.15/256, 128.15/1024,

        68.15/256, 127/1024,
        86.85/256, 127/1024,
        86.85/256, 108.15/1024,
        68.15/256, 108.15/1024,
        // 8,0
        148.15/256, 759/1024,
        167/256, 759/1024,
        167/256, 740.15/1024,
        148.15/256, 740.15/1024,
        // 9,0 SE GRASS TILE
        168/256, 759/1024,
        187/256, 759/1024,
        187/256, 740/1024,
        168/256, 740/1024,

        // 0,1
        148/256, 483/1024,
        167/256, 483/1024,
        167/256, 464/1024,
        148/256, 464/1024,
        // 1,1
        168/256, 483/1024,
        187/256, 483/1024,
        187/256, 464/1024,
        168/256, 464/1024,
        // 2,1
        188/256, 483/1024,
        207/256, 483/1024,
        207/256, 464/1024,
        188/256, 464/1024,
        // 3,1
        48/256, 157/1024,
        67/256, 148/1024,
        48/256, 148/1024,

        28/256, 167/1024,
        47/256, 167/1024,
        47/256, 158/1024,
        28/256, 158/1024,
        28/256, 157/1024,
        47/256, 157/1024,
        47/256, 148/1024,
        28/256, 148/1024,

        68.15/256, 739/1024,
        87/256, 739/1024,
        87/256, 720/1024,
        68.15/256, 720/1024,
        // 4,1
        68.15/256, 167/1024,
        87/256, 167/1024,
        87/256, 148/1024,
        68.15/256, 148/1024,
        // 5,1
        8.15/256, 147/1024,
        26.85/256, 147/1024,
        26.85/256, 138/1024,
        8.15/256, 138/1024,
        8.15/256, 137/1024,
        26.85/256, 137/1024,
        26.85/256, 128.15/1024,
        8.15/256, 128.15/1024,

        8/256, 117/1024,
        27/256, 117/1024,
        27/256, 108/1024,
        8/256, 108/1024,
        8/256, 107/1024,
        27/256, 107/1024,
        27/256, 98/1024,
        8/256, 98/1024,
        8/256, 97/1024,
        27/256, 97/1024,
        27/256, 88.15/1024,
        8/256, 88.15/1024,

        28.15/256, 106.85/1024,
        47/256, 106.85/1024,
        47/256, 88/1024,
        28.15/256, 88/1024,
        // 6,1
        8.15/256, 87/1024,
        27/256, 87/1024,
        27/256, 78/1024,
        8.15/256, 78/1024,
        8.15/256, 77/1024,
        27/256, 77/1024,
        27/256, 68/1024,
        8.15/256, 68/1024,

        8/256, 37/1024,
        27/256, 37/1024,
        27/256, 28/1024,
        8/256, 28/1024,

        8.15/256, 66.85/1024,
        27/256, 66.85/1024,
        27/256, 48/1024,
        8.15/256, 48/1024,
        // 7,1
        8.15/256, 77/1024,
        27/256, 77/1024,
        27/256, 68/1024,
        8.15/256, 68/1024,

        28/256, 66.85/1024,
        47/256, 66.85/1024,
        47/256, 48/1024,
        28/256, 48/1024,
        // 8,1
        48.15/256, 77/1024,
        67/256, 77/1024,
        67/256, 68/1024,
        48.15/256, 68/1024,

        68.15/256, 67/1024,
        87/256, 67/1024,
        87/256, 58.15/1024,
        68.15/256, 58.15/1024,

        48/256, 67/1024,
        66.85/256, 67/1024,
        66.85/256, 48/1024,
        48/256, 48/1024,
        // 9,1
        168.15/256, 739/1024,
        187/256, 739/1024,
        187/256, 720/1024,
        168.15/256, 720/1024,
    ];
    const textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);

    const indices = [
        // 0,0 SW WATER TILE
        0, 1, 2,    0, 2, 3,
        // 1,0
        4, 5, 6,    4, 6, 7,
        // 2,0
        8, 9, 10,   8, 10, 11,
        // 3,0
        12, 13, 14, 12, 14, 15,

        16, 17, 18, 16, 18, 19,
        // 4,0
        20, 21, 22, 20, 22, 23,
        // 5,0
        24, 25, 26, 24, 26, 27,

        28, 29, 30, 28, 30, 31,
        // 6,0
        32, 33, 34, 32, 34, 35,

        36, 37, 38, 36, 38, 39,
        // 7,0
        40, 41, 42, 40, 42, 43,

        44, 45, 46, 44, 46, 47,
        // 8,0
        48, 49, 50, 48, 50, 51,
        // 9,0 SE GRASS TILE
        52, 53, 54, 52, 54, 55,

        // 0,1
        56, 57, 58, 56, 58, 59,
        // 1,1
        60, 61, 62, 60, 62, 63,
        // 2,1
        64, 65, 66, 64, 66, 67,
        // 3,1
        68, 69, 70,

        71, 72, 73, 71, 73, 74,
        75, 76, 77, 75, 77, 78,

        79, 80, 81, 79, 81, 82,
        // 4,1
        83, 84, 85, 83, 85, 86,
        // 5,1
        87, 88, 89, 87, 89, 90,
        91, 92, 93, 91, 93, 94,

        95, 96, 97, 95, 97, 98,
        99, 100, 101,   99, 101, 102,
        103, 104, 105,  103, 105, 106,

        107, 108, 109,  107, 109, 110,
        // 6,1
        111, 112, 113,  111, 113, 114,
        115, 116, 117,  115, 117, 118,

        119, 120, 121,  119, 121, 122,

        123, 124, 125,  123, 125, 126,
        // 7,1
        127, 128, 129,  127, 129, 130,

        131, 132, 133,  131, 133, 134,
        // 8,1
        135, 136, 137,  135, 137, 138,

        139, 140, 141,  139, 141, 142,

        143, 144, 145,  143, 145, 146,
        // 9,1
        147, 148, 149,  147, 149, 150,
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
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    // gl.enable(gl.CULL_FACE);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const projectionMatrix = glMatrix.mat4.create();
    glMatrix.mat4.ortho(projectionMatrix, 0, 500, 0, 500, 500, -500);

    const modelViewMatrix = glMatrix.mat4.create();
    let yRotation = rotator.getRotation();
    let scale = rotator.getScale();
    
    glMatrix.mat4.translate(modelViewMatrix, modelViewMatrix, [250, 250, 0]);
    glMatrix.mat4.rotate(modelViewMatrix, modelViewMatrix, 11*Math.PI/6, [1, 0, 0]);
    glMatrix.mat4.rotate(modelViewMatrix, modelViewMatrix, yRotation, [0, 1, 0]);
    glMatrix.mat4.scale(modelViewMatrix, modelViewMatrix, [scale, scale, scale]);
    glMatrix.mat4.translate(modelViewMatrix, modelViewMatrix, [-140, -36, -28]);
    // glMatrix.mat4.scale(modelViewMatrix, modelViewMatrix, [1, 2/3, 1]);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoords);
    gl.vertexAttribPointer(programInfo.attribLocations.textureCoords, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.textureCoords);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

    gl.useProgram(programInfo.program);

    gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
    gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(programInfo.uniformLocations.uTexture, 0);

    gl.drawElements(gl.TRIANGLES, 225, gl.UNSIGNED_SHORT, 0);
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