#version 140

uniform sampler2D cameraTexture;
uniform float time;
uniform vec2 resolution;
uniform float audioLevel;
uniform float bassLevel;
uniform float midLevel;
uniform float highLevel;
uniform vec3 rgbMod;
uniform int effectMode;

float lookup(vec2 p) {
    vec4 c = texture2D(cameraTexture, p);
    return dot(c.rgb, vec3(0.299, 0.587, 0.114));
}

float sobel(vec2 p) {
    vec2 texelSize = 1.0 / resolution.xy;
    
    float tl = lookup(p + vec2(-1.0,  1.0) * texelSize);
    float cl = lookup(p + vec2(-1.0,  0.0) * texelSize);
    float bl = lookup(p + vec2(-1.0, -1.0) * texelSize);
    float ct = lookup(p + vec2( 0.0,  1.0) * texelSize);
    float cb = lookup(p + vec2( 0.0, -1.0) * texelSize);
    float tr = lookup(p + vec2( 1.0,  1.0) * texelSize);
    float cr = lookup(p + vec2( 1.0,  0.0) * texelSize);
    float br = lookup(p + vec2( 1.0, -1.0) * texelSize);
    
    float sobelX = tl + 2.0 * cl + bl - tr - 2.0 * cr - br;
    float sobelY = -tl - 2.0 * ct - tr + bl + 2.0 * cb + br;
    
    return sqrt(sobelX * sobelX + sobelY * sobelY);
}

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    
    // Simple edge detection
    float edge = sobel(uv);
    
    // Create different visualization modes based on effectMode
    vec3 finalColor = vec3(0.0);
    
    if (effectMode == 1) {
        // Mode 1: Show raw edge strength
        finalColor = vec3(edge * 10.0); // Amplify for visibility
    } else if (effectMode == 2) {
        // Mode 2: Binary edges (white/black)
        finalColor = edge > 0.05 ? vec3(1.0) : vec3(0.0);
    } else if (effectMode == 3) {
        // Mode 3: Different thresholds with colors
        if (edge > 0.1) {
            finalColor = vec3(1.0, 0.0, 0.0); // Red for strong edges
        } else if (edge > 0.05) {
            finalColor = vec3(0.0, 1.0, 0.0); // Green for medium edges
        } else if (edge > 0.02) {
            finalColor = vec3(0.0, 0.0, 1.0); // Blue for weak edges
        }
    } else {
        // Default: Show camera + edges overlay
        vec3 camera = texture2D(cameraTexture, uv).rgb;
        vec3 edges = vec3(edge > 0.05 ? 1.0 : 0.0);
        finalColor = camera * 0.5 + edges * 0.5;
    }
    
    gl_FragColor = vec4(finalColor, 1.0);
}
