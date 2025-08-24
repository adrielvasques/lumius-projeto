#version 140
uniform sampler2D edgeTexture;
uniform sampler2D cameraTexture;
uniform vec2 resolution;
uniform float time;
uniform float speed;
uniform float audioLevel;
uniform float bassLevel;
uniform float midLevel;
uniform float highLevel;
uniform float intensity;  // Controls ASCII density
uniform vec3 rgbMod;

const float pixel_size = 0.01;
const float letter_change_speed = 0.01;

// Simple noise function
float noise(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// Simple character generation (without font texture)
float char(vec2 p, float c) {
    if (p.x < 0.0 || p.x > 1.0 || p.y < 0.0 || p.y > 1.0) return 0.0;
    
    // Generate simple character patterns based on c value
    vec2 grid = floor(p * 8.0);
    float pattern = 0.0;
    
    // Create different patterns based on character value
    float charType = mod(c, 4.0);
    
    if (charType < 1.0) {
        // Vertical lines
        pattern = step(3.0, grid.x) * step(grid.x, 4.0);
    } else if (charType < 2.0) {
        // Horizontal lines
        pattern = step(3.0, grid.y) * step(grid.y, 4.0);
    } else if (charType < 3.0) {
        // Cross pattern
        pattern = step(3.0, grid.x) * step(grid.x, 4.0) + step(3.0, grid.y) * step(grid.y, 4.0);
    } else {
        // Diagonal pattern
        pattern = step(0.5, fract((grid.x + grid.y) * 0.5));
    }
    
    return clamp(pattern, 0.0, 1.0);
}

void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    float animTime = time * speed;
    
    // Get edge detection result
    vec4 edgeData = texture2D(edgeTexture, uv);
    float edgeIntensity = edgeData.a;
    
    // Get original camera image
    vec3 camera = texture2D(cameraTexture, vec2(1.0 - uv.x, 1.0 - uv.y)).rgb;
    
    float aspect_ratio = resolution.x / resolution.y;
    
    // INTENSITY controls ASCII density - higher intensity = more ASCII characters
    // Range: intensity 0.1 = large pixels (few ASCII), intensity 2.0 = small pixels (many ASCII)
    float basepixel_size = pixel_size;
    float intensity_factor = 1.0 / clamp(intensity, 0.1, 3.0); // Invert intensity: high intensity = small pixels
    float dynamicPixelSize = basepixel_size * intensity_factor;
    
    // Audio-reactive pixel size modulation on top of intensity control
    dynamicPixelSize *= (0.8 + audioLevel * 0.4);
    
    vec2 pixelUV = vec2(dynamicPixelSize/aspect_ratio, dynamicPixelSize);
    vec2 noise_uv = uv - mod(uv, pixelUV);
    vec3 pixel = texture2D(cameraTexture, vec2(1.0 - noise_uv.x, 1.0 - noise_uv.y)).rgb;
    
    // Audio-reactive letter change speed
    float dynamicSpeed = letter_change_speed * (1.0 + audioLevel * 5.0);
    noise_uv.y = mod(noise_uv.y + dynamicSpeed * animTime, 1.0);
    
    // Generate character using noise
    float noiseVal = noise(noise_uv * 50.0 + animTime * 2.0);
    noiseVal = floor(noiseVal * 25.0 + 65.0); // ASCII range
    
    // Add audio influence to character selection
    noiseVal += bassLevel * 10.0 + midLevel * 5.0;
    
    vec2 pixel_uv = (
        vec2((1.0/dynamicPixelSize)*aspect_ratio, (1.0/dynamicPixelSize)) *  
        mod(uv, pixelUV)
    );
    
    float charPattern = char(pixel_uv, noiseVal);
    float intensity = length(pixel) / sqrt(3.0);
    
    // Audio-reactive colors
    vec3 matrixColor = vec3(0.0);
    
    // Different color modes based on audio frequencies
    if (bassLevel > 0.7) {
        // Red mode for strong bass
        matrixColor = vec3(2.0 * intensity * charPattern, 0.0, 0.0);
    } else if (midLevel > 0.6) {
        // Blue mode for mids
        matrixColor = vec3(0.0, 0.0, 2.0 * intensity * charPattern);
    } else {
        // Classic green matrix
        matrixColor = vec3(0.0, 2.0 * intensity * charPattern, 0.0);
    }
    
    // Mix with edge detection
    vec3 finalColor = mix(matrixColor, edgeData.rgb, edgeIntensity * 0.5);
    
    // Audio-reactive brightness pulsing
    float brightnessPulse = 1.0 + sin(animTime * 4.0 + audioLevel * 8.0) * audioLevel * 0.5;
    finalColor *= brightnessPulse;
    
    // Color cycling overlay
    float colorCycle = animTime * 1.0 + audioLevel * 3.0;
    vec3 cycleColor = vec3(
        0.5 + 0.5 * sin(colorCycle),
        0.5 + 0.5 * sin(colorCycle + 2.0),
        0.5 + 0.5 * sin(colorCycle + 4.0)
    );
    finalColor = mix(finalColor, finalColor * cycleColor, audioLevel * 0.3);
    
    // Apply RGB modulation
    finalColor *= rgbMod;
    
    // Add camera background with low opacity when no matrix effect
    vec3 backgroundCam = camera * 0.1;
    finalColor = mix(backgroundCam, finalColor, step(0.01, length(finalColor)));
    
    gl_FragColor = vec4(finalColor, 1.0);
}
