function shaderProgram(gl, vertShdrSrc, fragShdrSrc) {
  const vertShdr = gl.createShader(gl.VERTEX_SHADER);
  const fragShdr = gl.createShader(gl.FRAGMENT_SHADER);
  
  gl.shaderSource(vertShdr, vertShdrSrc);
  gl.shaderSource(fragShdr, fragShdrSrc);
  
  gl.compileShader(vertShdr);
  if(!gl.getShaderParameter(vertShdr, gl.COMPILE_STATUS)) {
    console.error('Error compiling vertex shader', gl.getShaderInfoLog(vertShdr));
    return;
  }
  gl.compileShader(fragShdr);
  if(!gl.getShaderParameter(fragShdr, gl.COMPILE_STATUS)) {
    console.error('Error compiling fragment shader', gl.getShaderInfoLog(fragShdr));
    return;
  }
  
  const program = gl.createProgram();
  
  gl.attachShader(program, vertShdr);
  gl.attachShader(program, fragShdr);
  gl.linkProgram(program);
  
  if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Error linking shader program', gl.getProgramInfoLog(program));
    return;
  }
  gl.validateProgram(program);
  if(!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
    console.error('Error validating shader program', gl.getProgramInfoLog(program));
    return;
  }
  
  return program;
}

function loadGL(canvas) {
  let gl = canvas.getContext('webgl');
  
  if(!gl) {
    gl = canvas.getContext('experimental-webgl');
    
    if(!gl) { 
      console.error('failure to load webgl');
      return;
    }
  }
  
  return gl;
}

function background(r, g, b, a) {
  gl.clearColor(r, g, b, a);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

class mat {
  constructor(cols, rows) {
    this.rows = rows;
    this.cols = cols;
    this.elements = [];
    
    for(let i = 0; i < cols; i++) { 
      this.elements.push([]);
      for(let j = 0; j < rows; j++) { 
        this.elements[i].push(0);
      }
    }
  }

  getCol(ind) { 
    let ret = [];
    for(let i = 0; i < this.rows; i++) ret.push(this.elements[ind][i]);
    return ret;
  };
  getRow(ind) {
    let ret = [];
    for(let i = 0; i < this.cols; i++) ret.push(this.elements[i][ind]);
    return ret;
  };
  get(col, row) { return this.elements[col][row]; };
  set(val, col, row) { 
    // console.log(val, col, row);
    this.elements[col][row] = val; 
  };
  fill(val) { for(let col of this.elements) for(let el of col) el = val; };
};

const rotZ = (angle) => {
  const matrix = new mat(3, 3);
  matrix.set(Math.cos(angle), 0, 0);
  matrix.set(-Math.sin(angle), 0, 1);
  matrix.set(Math.sin(angle), 1, 0);
  matrix.set(Math.cos(angle), 1, 1);
  matrix.set(1, 2, 2);

  return matrix;
}

const rotY = (angle) => {
  const matrix = new mat(3, 3);
  matrix.set(Math.cos(angle), 0, 0);
  matrix.set(-Math.sin(angle), 0, 2);
  matrix.set(Math.sin(angle), 2, 0);
  matrix.set(Math.cos(angle), 2, 2);
  matrix.set(1, 1, 1);

  return matrix;
}

const rotX = (angle) => {
  const matrix = new mat(3, 3);
  matrix.set(Math.cos(angle), 1, 1);
  matrix.set(-Math.sin(angle), 1, 2);
  matrix.set(Math.sin(angle), 2, 1);
  matrix.set(Math.cos(angle), 2, 2);
  matrix.set(1, 0, 0);

  return matrix;
}

const pairwiseSummation = (a, b) => {
  let ret = 0;
  for(let i = 0; i < a.length; i++) ret += a[i] * b[i];
  return ret;
};
const matMult = (a, b) => {
  const ret = new mat(b.cols, a.rows);
  for(let i = 0; i < ret.rows; i++) for(let j = 0; j < ret.cols; j++) ret.set(pairwiseSummation(a.getRow(i), b.getCol(j)), j, i);
  return ret;
};

const vecToMat = (vec) => { 
  const matrix = new mat(1, vec.length);
  for(let i = 0; i < vec.length; i++) matrix.set(vec[i], 0, i);
  return matrix; 
};

const matToVec = (mat) => { 
  const vector = [];
  for(let i = 0; i < mat.rows; i++) vector.push(mat.get(0, i));
  return vector; 
};

const vert = `precision mediump float;
attribute vec3 vertPos;

void main() {
 gl_Position = vec4(vertPos, 1.0);
}`;

const frag = `precision mediump float;

void main() {
 gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
}`;

let trVerts;

let gl;

let projectionMode = 'ortho';

const h = 0.55;

const orthographicButton = () => { projectionMode = 'ortho'; };
const perspectiveButton = () => { projectionMode = 'persp'};
function setup() {
  const canv = document.querySelector('#glCanvas');

  gl = loadGL(canv);

  const orthographicProjection = document.querySelector('.orthoBut');
  orthographicProjection.onclick = orthographicButton;
  const perspectiveProjection = document.querySelector('.perspBut');
  perspectiveProjection.onclick = perspectiveButton;

  const shdr = shaderProgram(gl, vert, frag);

  trVerts = [ // X, Y, Z
    -h, -h, -h, 
     h, -h, -h,
     h,  h, -h,
    -h,  h, -h,
    -h, -h, -h, 

    -h, -h,  h, 
     h, -h,  h,
     h,  h,  h,
    -h,  h,  h,
    -h, -h,  h, 

     h, -h,  h,
     h, -h, -h,
     h, -h,  h,

     h,  h,  h,
     h,  h, -h,
     h,  h,  h,

    -h,  h,  h,
    -h,  h, -h,
    -h,  h,  h,

    -h,  h, -h,
  ];
  
  const trVBO = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, trVBO);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(trVerts), gl.DYNAMIC_DRAW);
  
  const posAttLoc = gl.getAttribLocation(shdr, 'vertPos');
  gl.vertexAttribPointer(
    posAttLoc, // attribute loc
    3, // number of elements per attribute (vec3)
    gl.FLOAT, // type of elements
    gl.FALSE,
    3 * Float32Array.BYTES_PER_ELEMENT, // size of a vertex (x, y, z) in bytes
    0 // offset from the beginning of a single vertex to this attribute in bytes
  );
  gl.enableVertexAttribArray(posAttLoc);

  gl.useProgram(shdr);

  console.log('amongus');
  window.requestAnimationFrame(draw);
}
window.onload = setup;

const perspMat = new mat(3, 2);

const orthoMat = new mat(3, 2);
orthoMat.set(1, 0, 0);
orthoMat.set(1, 1, 1); // Orthographic

let theta = 0, theta2 = 10, lastloop = Date.now(), dt = 0, rps = 1/10, distance = 1.6;
function draw(timestamp) {
  const thisloop = timestamp;
  dt = 1000/(thisloop-lastloop);
  lastloop = thisloop;


  
  for(let i = 0; i < trVerts.length; i += 3) {
    const pre = vecToMat([trVerts[i], trVerts[i+1], trVerts[i+2]]);
    const rotated = matMult(rotX(theta), matMult(rotY(Math.PI*Math.cos(theta)), matMult(rotZ(2*Math.PI*Math.sin(theta)), pre)));
    
    let projected;
    if(projectionMode === 'persp') {
      const z = 1 / (distance - rotated.get(0, 2));

      perspMat.set(z, 0, 0);
      perspMat.set(z, 1, 1); // Perspective

      projected = matMult(perspMat, rotated);
      background(142/255, 184/255, 184/255, 1);
    } else {
      projected = matMult(orthoMat, rotated); // Orthographic
      background(161/255, 162/255, 162/255);
    }
    
    gl.bufferSubData(gl.ARRAY_BUFFER, i * Float32Array.BYTES_PER_ELEMENT, new Float32Array(matToVec(projected)));
  }

  gl.drawArrays(gl.LINE_LOOP, 0, trVerts.length/3);

  theta += rps*2*Math.PI/dt;
  theta2 += rps*Math.PI/dt;
  window.requestAnimationFrame(draw);
}