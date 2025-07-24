#version 140

uniform float time;
uniform vec2 resolution;
uniform float audioLevel;
uniform float bassLevel;
uniform float midLevel;
uniform float highLevel;
uniform vec3 rgbMod;
uniform int effectMode;
uniform float intensityMultiplier;

const float PI = 3.14159265;

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
    vec2 p = (2.0 * gl_FragCoord.xy - resolution.xy) / resolution.y;
    
    // Smooth zoom effect
    float zoom = 1.0 + sin(time * 0.2) * 0.15;
    p *= zoom;
    
    // Dynamic scale with exponential function and intensity control
    float scale = (6.0 + exp(sin(time * 0.3)) * 0.8 + 0.9);
    p *= scale;
    
    // Very smooth dynamic frequency
    float freq = 1.0 + sin(time * intensityMultiplier/10) * 0.05 + (midLevel/0.5) * 0.05;
    
    // Dynamic Chladni patterns
    float pattern = sin(PI * freq * p.x) * sin(PI * freq * p.y);
    pattern += sin(PI * freq * length(p) + time * 2.0) * 0.5;
    pattern += cos(PI * freq * (p.x + p.y) + time * 1.5) * 0.3;
    
    // Smooth threshold without harsh steps
    float mask = smoothstep(0.2, 0.4, abs(pattern));
    
    // Convert RGB to HSV base
    vec3 rgb = normalize(rgbMod + 0.001);
    float maxRGB = max(max(rgb.r, rgb.g), rgb.b);
    float minRGB = min(min(rgb.r, rgb.g), rgb.b);
    float delta = maxRGB - minRGB;
    float baseHue = 0.0;
    if(delta > 0.0) {
        if(maxRGB == rgb.r) baseHue = mod((rgb.g - rgb.b) / delta, 6.0);
        else if(maxRGB == rgb.g) baseHue = (rgb.b - rgb.r) / delta + 2.0;
        else baseHue = (rgb.r - rgb.g) / delta + 4.0;
    }

    float hueVariation = (bassLevel * 0.05 + midLevel * 0.04 + highLevel * 0.03 + time * 0.01) * 0.3;
    float hue = baseHue + sin(hueVariation) * 0.15; // ±15% variation around RGB base
    vec3 neonColor = hsv2rgb(vec3(hue, 1.0, 2.5));
    
    vec3 color = neonColor * mask;
    
    // Strong RGB influence
    color = mix(color, color * rgbMod, 0.8); // 80% RGB influence
    color *= (0.5 + length(rgbMod) * 0.5); // Brightness based on RGB intensity
    
    gl_FragColor = vec4(color, 1.0);
}