#version 140

uniform sampler2D texFire;    // iChannel0 equivalent (output from first pass)
uniform vec2 resolution;     // iResolution equivalent

void main() {
    vec2 fragCoord = gl_FragCoord.xy;
    
    // Exact Shadertoy premultiply logic
    vec4 col = texture2D(texFire, fragCoord.xy / resolution.xy);
    gl_FragColor = vec4(col.rgb * col.a, 1.0);
}
