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
    
    // Test 1: Simple color test
    if (uv.x < 0.25) {
        // Red quarter - just to test if shader is working
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    } else if (uv.x < 0.5) {
        // Green quarter - test camera texture
        vec3 cameraColor = texture2D(cameraTexture, uv).rgb;
        gl_FragColor = vec4(cameraColor, 1.0);
    } else if (uv.x < 0.75) {
        // Blue quarter - test grayscale conversion
        vec3 cameraColor = texture2D(cameraTexture, uv).rgb;
        float grayscale = dot(cameraColor.rgb, vec3(0.299, 0.587, 0.114));
        gl_FragColor = vec4(vec3(grayscale), 1.0);
    } else {
        // Last quarter - test basic edge detection (simple)
        vec2 texelSize = 1.0 / resolution.xy;
        vec3 center = texture2D(cameraTexture, uv).rgb;
        vec3 right = texture2D(cameraTexture, uv + vec2(texelSize.x, 0.0)).rgb;
        
        float centerGray = dot(center, vec3(0.299, 0.587, 0.114));
        float rightGray = dot(right, vec3(0.299, 0.587, 0.114));
        
        float diff = abs(centerGray - rightGray) * 10.0;
        diff = clamp(diff, 0.0, 1.0);
        
        gl_FragColor = vec4(vec3(diff), 1.0);
    }
}
