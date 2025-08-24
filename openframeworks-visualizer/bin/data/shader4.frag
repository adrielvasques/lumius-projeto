#version 140

uniform float time;
uniform vec2 resolution;
uniform float audioLevel;
uniform float bassLevel;
uniform float midLevel;
uniform float highLevel;
uniform vec3 rgbMod;
uniform int effectMode;

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
    vec2 uv = (2.0 * gl_FragCoord.xy - resolution.xy) / min(resolution.x, resolution.y);

    for(float i = 1.0; i < 10.0; i++){
        // Audio influences the wave patterns with exponential
        float mix1 = 2.5 + exp(bassLevel) * 0.2 + sin(time * 0.1) * 0.2;
        float mix2 = 1.5 + exp(midLevel) * 0.15 + cos(time * 0.08) * 0.15;
        
        uv.x += 0.6 / i * cos(i * mix1 * uv.y + time);
        uv.y += 0.6 / i * cos(i * mix2 * uv.x + time);
    }
    
    // Many colors with smooth transitions
    float hue1 = fract(time * 0.05 + bassLevel * 0.3 + uv.x * 0.1);
    float hue2 = fract(time * 0.03 + midLevel * 0.2 + uv.y * 0.1);
    float hue3 = fract(time * 0.07 + highLevel * 0.4 + length(uv) * 0.1);
    
    vec3 color1 = hsv2rgb(vec3(hue1, 1.0, 1.0));
    vec3 color2 = hsv2rgb(vec3(hue2, 1.0, 1.0));
    vec3 color3 = hsv2rgb(vec3(hue3, 1.0, 1.0));
    
    // Mix colors based on position and audio
    float mix1 = sin(time - uv.y - uv.x) * 0.5 + 0.5;
    float mix2 = cos(time * 1.3 + uv.x + uv.y) * 0.5 + 0.5;
    
    vec3 finalColor = mix(mix(color1, color2, mix1), color3, mix2);
    finalColor *= 0.1 / abs(sin(time - uv.y - uv.x));
    
    finalColor *= rgbMod;
    
    gl_FragColor = vec4(finalColor, 1.0);
}