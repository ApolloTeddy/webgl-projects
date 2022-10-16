precision mediump float;
attribute vec3 vertPos;
attribute vec3 vertCol;
varying vec3 fragCol;

uniform mat4 mWorl;
uniform mat4 mView; // Uniforms for the rotation, position, projection, and view.
uniform mat4 mProj;

void main() {
  fragCol = vertCol;
  gl_Position = mProj * mView * mWorl * vec4(vertPos, 1.0);
}