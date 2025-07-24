#version 140

attribute vec3 position;
attribute vec2 texcoord;

varying vec2 texCoordVarying;

void main() {
    texCoordVarying = texcoord;
    gl_Position = vec4(position, 1.0);
}
