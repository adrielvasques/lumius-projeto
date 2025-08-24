#version 140

uniform float time;
uniform vec2 resolution;
uniform float audioLevel;
uniform float bassLevel;
uniform float midLevel;
uniform float highLevel;
uniform sampler2D cameraTexture;
uniform vec3 rgbMod;
uniform int effectMode;

// Simple noise function
float noise(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    
    // Fix horizontal mirroring - flip X coordinate
    vec3 camera = texture2D(cameraTexture, vec2(1.0 - uv.x, 1.0 - uv.y)).rgb;
    
    float cameraSum = camera.r + camera.g + camera.b;
    
    if(cameraSum < 0.01) {
        vec3 testColor = vec3(
            0.3 + 0.7 * sin(time * 2.0 + bassLevel * 8.0),
            0.3 + 0.7 * sin(time * 2.5 + midLevel * 6.0),
            0.3 + 0.7 * sin(time * 3.0 + highLevel * 10.0)
        ) * rgbMod;
        
        float pattern1 = sin(uv.x * 15.0 + time * 3.0) * cos(uv.y * 12.0 + time * 2.0);
        float pattern2 = sin(length(uv - 0.5) * 20.0 - time * 4.0);
        
        camera = testColor * (pattern1 * 0.3 + pattern2 * 0.4 + 0.5);
        
        if(abs(uv.x - 0.5) < 0.3 && abs(uv.y - 0.5) < 0.05) {
            camera = vec3(1.0, 0.0, 0.0);
        }
    } else {
        vec2 distortUV = uv;
        distortUV.x += sin(uv.y * 10.0 + time * 2.0 + bassLevel * 5.0) * 0.03;
        distortUV.y += cos(uv.x * 8.0 + time * 1.5 + midLevel * 4.0) * 0.03;
        
        vec3 distorted = texture2D(cameraTexture, vec2(distortUV.x, 1.0 - distortUV.y)).rgb;
        camera = mix(camera, distorted, audioLevel * 0.6);
        
        camera = sin(camera * (20.0 + bassLevel * 40.0) + time) * 0.4 + 0.6;
        camera *= rgbMod;
    }
    
    // Add noise overlay
    float noiseValue = noise(uv * 100.0 + time * 5.0) * 0.1;
    camera += vec3(noiseValue) * audioLevel;
    
    // Apply final RGB modulation
    camera *= rgbMod;
    
    gl_FragColor = vec4(camera, 1.0);
}