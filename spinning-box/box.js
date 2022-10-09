const vert = [
'precision mediump float;',
'',
'attribute vec2 vertPos;',
'',
'void main() {',
 'gl_Position = vec4(vertPos, 0.0, 1.0);',
'}'
].join('\n');

const frag = [
'precision mediump float;',
'',
'void main() {',
 'gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);',
'}'
].join('\n');

let trVerts;

let gl;

const h = 0.4;
function setup() {
  const canv = document.querySelector('#glCanvas');
  gl = loadGL(canv);
  
  const shdr = shaderProgram(vert, frag);

  trVerts = [ // X, Y, Z
    -h, h, 0,
    h, h, 0,
    h, -h, 0,
    -h, -h, 0
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
let theta = 0, theta2 = 10, lastloop = Date.now(), dt = 0, rps = 1/10, distance = 1, projectionMode = 'ortho';
function draw(timestamp) {
  const thisloop = timestamp;
  dt = 1000/(thisloop-lastloop);
  lastloop = thisloop;


  for(let i = 0; i < trVerts.length; i += 3) {
    const rotated = matMult(rotX(theta), matMult(rotY(Math.PI*Math.cos(theta)), matMult(rotZ(2*Math.PI*Math.sin(theta)), vecToMat([trVerts[i], trVerts[i+1], trVerts[i+2]]))));
    
    let projected;
    if(projectionMode === 'persp') {
      const z = 1 / (distance - rotated.get(0, 2));

      perspMat.set(z, 0, 0);
      perspMat.set(z, 1, 1); // Perspective

      projected = matMult(perspMat, rotated);
    } else projected = matMult(orthoMat, rotated);

    gl.bufferSubData(gl.ARRAY_BUFFER, i * Float32Array.BYTES_PER_ELEMENT, new Float32Array(matToVec(projected)));
  }

  gl.drawArrays(gl.LINE_LOOP, 0, trVerts.length/3);

  theta += rps*2*Math.PI/dt;
  theta2 += rps*Math.PI/dt;
  window.requestAnimationFrame(draw);
}