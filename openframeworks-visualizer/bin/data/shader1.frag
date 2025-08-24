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

void main() {
    vec2 u = (gl_FragCoord.xy + gl_FragCoord.xy - resolution.xy) / resolution.y;    
    
    // Smooth zoom effect influenced by intensity
    float zoom = 1.0 + sin(time * 0.2) * (0.2 + intensityMultiplier * 0.1);
    u *= zoom;
    
    vec3 color = vec3(0.0);
    
    // Fixed number of circles
    for (float i = 0.0; i < 15.0; i++) {
        // Continuous rotation for arcs only
        if (i > 0.0) {
            float rotSpeed = time * 0.03 + i * 0.03;
            float c = cos(rotSpeed);
            float s = sin(rotSpeed + 0.33);
            u = mat2(c, -s, s, c) * u;
        }
        
        // Shape distance - continuous circles
        float dist = abs(length(u * u) - i * 0.04) + 0.005;
        
        // Only center circle (i=0) changes color with music
        vec3 shapeColor;
        if (i < 1.0) {
            // Center: audio-reactive colors with intensity-controlled frequency
            float colorSpeed = time * 0.2 * intensityMultiplier;
            float hueShift = bassLevel * 3.0 + midLevel * 2.5 + highLevel * 2.0 + colorSpeed;
            shapeColor = (cos(hueShift + vec3(0, 2.09, 4.18)) + 1.0);
        } else {
            // Arcs: fixed colors
            shapeColor = (cos(i * 0.618 + vec3(0, 2.09, 4.18)) + 1.0);
        }
        
        // Accumulate color
        color += 0.006 / dist * shapeColor;
        
        i++;
    }
    
    // Apply RGB modulation
    color *= rgbMod;
    
    gl_FragColor = vec4(color, 1.0);
}