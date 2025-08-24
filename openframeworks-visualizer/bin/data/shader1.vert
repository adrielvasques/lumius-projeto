#version 140
//  Pass-through simples (sem varyings extra)

in  vec4 position;   // OF: built-in attrib 0
void main() {
    gl_Position = position;
}
