#version 140
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

const float pixel_size = 0.004;

float getPixel(vec2 uv, float alpha) {
    return length(texture2D(cameraTexture, uv).rgb) * alpha / sqrt(3.0);
}

void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    // Flip coordinates to fix orientation
    uv.y = 1.0 - uv.y;
    uv.x = 1.0 - uv.x;
    
    float aspect_ratio = resolution.x / resolution.y;
    float animTime = time * speed;
    
    // INTENSITY controls edge detection pixel density - higher intensity = more detailed detection
    float basepixel_size = pixel_size;
    float intensity_factor = 1.0 / clamp(intensity, 0.1, 3.0); // Invert intensity: high intensity = small pixels
    float dynamicPixelSize = basepixel_size * intensity_factor;
    
    // Audio-reactive modulation on top of intensity control
    dynamicPixelSize *= (1.0 + audioLevel * 0.5);
    
    vec2 pixel = vec2(dynamicPixelSize/aspect_ratio, dynamicPixelSize);
    vec2 noise_uv = uv - mod(uv, pixel);
    
    // Audio-reactive distortion
    vec2 distortion = vec2(
        sin(animTime * 3.0 + uv.y * 20.0 + bassLevel * 10.0) * audioLevel * 0.02,
        cos(animTime * 2.5 + uv.x * 15.0 + midLevel * 8.0) * audioLevel * 0.02
    );
    noise_uv += distortion;
    
    vec3 col = texture2D(cameraTexture, noise_uv).rgb;
    
    float sumX = 0.0;
    float sumY = 0.0;
    
    // Sobel X operator
    sumX += getPixel(noise_uv + vec2(-pixel.x, pixel.y), -1.0);
    sumX += getPixel(noise_uv + vec2(     0.0, pixel.y), -2.0);
    sumX += getPixel(noise_uv + vec2( pixel.x, pixel.y), -1.0);
    sumX += getPixel(noise_uv + vec2(-pixel.x,-pixel.y),  1.0);
    sumX += getPixel(noise_uv + vec2(     0.0,-pixel.y),  2.0);
    sumX += getPixel(noise_uv + vec2( pixel.x,-pixel.y),  1.0);
    
    // Sobel Y operator
    sumY += getPixel(noise_uv + vec2(-pixel.x,-pixel.y), -1.0);
    sumY += getPixel(noise_uv + vec2(-pixel.x,     0.0), -2.0);
    sumY += getPixel(noise_uv + vec2(-pixel.x, pixel.y), -1.0);
    sumY += getPixel(noise_uv + vec2( pixel.x,-pixel.y),  1.0);
    sumY += getPixel(noise_uv + vec2( pixel.x,     0.0),  2.0);
    sumY += getPixel(noise_uv + vec2( pixel.x, pixel.y),  1.0);
    
    float edge = abs(sumX) + abs(sumY);
    
    // Audio-reactive threshold
    float threshold = mix(0.1, 0.4, audioLevel);
    edge = step(threshold, edge);
    
    // Audio-reactive colors
    vec3 edgeColor = vec3(1.0);
    
    // Color cycling based on audio
    float colorPhase = animTime * 2.0 + audioLevel * 8.0;
    edgeColor.r = 0.5 + 0.5 * sin(colorPhase + bassLevel * 5.0);
    edgeColor.g = 0.5 + 0.5 * sin(colorPhase + midLevel * 4.0 + 2.0);
    edgeColor.b = 0.5 + 0.5 * sin(colorPhase + highLevel * 3.0 + 4.0);
    
    // Apply RGB modulation
    edgeColor *= rgbMod;
    
    vec3 finalColor = edgeColor * edge;
    
    gl_FragColor = vec4(finalColor, edge);
}
