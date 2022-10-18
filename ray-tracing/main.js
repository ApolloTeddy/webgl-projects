const canvID = 'gl-canvas';

let canv, gl, time;
function setup() {
  canv = document.querySelector('#' + canvID);
  gl = loadGL(canv);

  time = new Time(0);
  window.requestAnimationFrame(draw);
}

function draw(timestamp) {
  time.update(timestamp);

  console.clear();
  console.log(time.deltaTime);
  window.requestAnimationFrame(draw);
}

window.onload = setup;