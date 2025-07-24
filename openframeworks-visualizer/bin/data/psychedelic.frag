#version 140

uniform float time;
uniform vec2 resolution;
uniform float speed;
uniform float audioLevel;
uniform float bassLevel;
uniform float midLevel;
uniform float highLevel;
uniform sampler2D cameraTexture;
uniform vec3 rgbMod;

// Simple noise function
float noise(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// HSV to RGB conversion
vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    float animTime = time * speed;
    
    // EFEITO 1: Distorções psicodélicas múltiplas
    vec2 distortUV = uv;
    
    // Distorção sinusoidal principal - controle por speed
    distortUV.x += sin(uv.y * 12.0 + animTime * 3.0 + bassLevel * 8.0) * (0.02 + audioLevel * 0.06);
    distortUV.y += cos(uv.x * 10.0 + animTime * 2.5 + midLevel * 6.0) * (0.02 + audioLevel * 0.06);
    
    // Distorção radial
    vec2 center = vec2(0.5);
    float dist = length(uv - center);
    float radialWave = sin(dist * 20.0 - animTime * 4.0 + audioLevel * 10.0) * 0.03;
    distortUV += normalize(uv - center) * radialWave * audioLevel;
    
    // Rotação dinâmica baseada no bass
    float rotation = animTime * 0.2 + bassLevel * 2.0;
    vec2 rotatedUV = uv - center;
    float cosR = cos(rotation);
    float sinR = sin(rotation);
    rotatedUV = vec2(
        rotatedUV.x * cosR - rotatedUV.y * sinR,
        rotatedUV.x * sinR + rotatedUV.y * cosR
    ) + center;
    
    // Mix entre diferentes distorções
    vec2 finalUV = mix(distortUV, rotatedUV, audioLevel * 0.5);
    
    // Fix horizontal mirroring - flip X coordinate
    vec3 camera = texture2D(cameraTexture, vec2(1.0 - finalUV.x, 1.0 - finalUV.y)).rgb;
    
    // EFEITO 2: Se não há câmera, mostra padrão psicodélico
    float cameraSum = camera.r + camera.g + camera.b;
    
    if(cameraSum < 0.01) {
        // Padrão psicodélico quando não há câmera
        vec3 psychPattern = vec3(
            0.5 + 0.5 * sin(animTime * 3.0 + bassLevel * 12.0 + uv.x * 15.0),
            0.5 + 0.5 * sin(animTime * 3.5 + midLevel * 10.0 + uv.y * 12.0),
            0.5 + 0.5 * sin(animTime * 4.0 + highLevel * 8.0 + dist * 20.0)
        );
        
        // Padrões geométricos
        float pattern1 = sin(uv.x * 20.0 + animTime * 5.0) * cos(uv.y * 18.0 + animTime * 4.0);
        float pattern2 = sin(dist * 30.0 - animTime * 6.0 + bassLevel * 15.0);
        
        camera = psychPattern * (0.7 + pattern1 * 0.2 + pattern2 * 0.3);
    } else {
        // EFEITO 3: Múltiplas camadas de câmera com diferentes distorções
        
        // Camada base
        vec3 baseCamera = camera;
        
        // Camada com mais distorção
        vec2 warpUV = uv;
        warpUV.x += sin(uv.y * 8.0 + animTime * 4.0 + bassLevel * 10.0) * 0.05;
        warpUV.y += cos(uv.x * 6.0 + animTime * 3.0 + midLevel * 8.0) * 0.05;
        vec3 warpedCamera = texture2D(cameraTexture, vec2(1.0 - warpUV.x, 1.0 - warpUV.y)).rgb;
        
        // Camada kaleidoscópica
        vec2 kaleidoUV = uv - center;
        float angle = atan(kaleidoUV.y, kaleidoUV.x) + animTime * 1.0 + audioLevel * 5.0;
        float kaleidoDist = length(kaleidoUV);
        float segments = 6.0 + bassLevel * 6.0; // 6 a 12 segmentos
        angle = mod(angle, 6.28318 / segments);
        kaleidoUV = kaleidoDist * vec2(cos(angle), sin(angle)) + center;
        vec3 kaleidoCamera = texture2D(cameraTexture, vec2(1.0 - kaleidoUV.x, 1.0 - kaleidoUV.y)).rgb;
        
        // Mix das camadas baseado no áudio
        camera = mix(baseCamera, warpedCamera, audioLevel * 0.6);
        camera = mix(camera, kaleidoCamera, bassLevel * 0.4);
        
        // EFEITO 4: Colorização psicodélica dinâmica
        
        // Shift de hue baseado no tempo e áudio
        float hueShift = animTime * 0.5 + audioLevel * 3.0 + bassLevel * 2.0;
        
        // Converter para HSV e modificar
        float maxC = max(max(camera.r, camera.g), camera.b);
        float minC = min(min(camera.r, camera.g), camera.b);
        float delta = maxC - minC;
        
        float hue = 0.0;
        if(delta > 0.001) {
            if(maxC == camera.r) {
                hue = ((camera.g - camera.b) / delta) / 6.0;
            } else if(maxC == camera.g) {
                hue = (2.0 + (camera.b - camera.r) / delta) / 6.0;
            } else {
                hue = (4.0 + (camera.r - camera.g) / delta) / 6.0;
            }
        }
        
        float saturation = (maxC > 0.001) ? delta / maxC : 0.0;
        float value = maxC;
        
        // Aplicar transformações HSV
        hue = fract(hue + hueShift * 0.3);
        saturation = clamp(saturation + audioLevel * 0.8, 0.0, 1.0);
        value = clamp(value + audioLevel * 0.3, 0.0, 1.0);
        
        // Converter de volta para RGB
        camera = hsv2rgb(vec3(hue, saturation, value));
        
        // EFEITO 5: Overlays de cor baseados em frequências
        vec3 bassOverlay = vec3(1.0, 0.1, 0.5) * bassLevel * 0.4;    // Rosa/Magenta para bass
        vec3 midOverlay = vec3(0.1, 1.0, 0.3) * midLevel * 0.35;     // Verde para mids
        vec3 highOverlay = vec3(0.2, 0.4, 1.0) * highLevel * 0.3;    // Azul para highs
        
        camera += bassOverlay + midOverlay + highOverlay;
        
        // EFEITO 6: Posterização dinâmica
        float posterLevels = 3.0 + audioLevel * 8.0; // 3 a 11 níveis
        camera = floor(camera * posterLevels) / posterLevels;
        
        // EFEITO 7: Contraste e brilho pulsante
        float contrast = 1.0 + audioLevel * 1.2;
        float brightness = 1.0 + sin(animTime * 5.0 + bassLevel * 8.0) * audioLevel * 0.5;
        camera = ((camera - 0.5) * contrast + 0.5) * brightness;
    }
    
    // EFEITO 8: Noise overlay psicodélico
    float noiseValue = noise(uv * 80.0 + animTime * 3.0);
    float coloredNoise = noise(uv * 60.0 + animTime * 2.0 + audioLevel * 5.0);
    vec3 noiseColor = vec3(
        noise(uv * 70.0 + animTime * 2.5) * bassLevel,
        noise(uv * 85.0 + animTime * 3.2) * midLevel,
        noise(uv * 95.0 + animTime * 2.8) * highLevel
    );
    camera += noiseColor * 0.15 + vec3(noiseValue) * audioLevel * 0.1;
    
    // EFEITO 9: Glitch em batidas fortes
    if(bassLevel > 0.75) {
        vec2 glitchUV = uv + vec2(
            (noise(uv * 100.0 + animTime * 10.0) - 0.5) * 0.05,
            (noise(uv * 120.0 + animTime * 12.0) - 0.5) * 0.03
        );
        vec3 glitchColor = texture2D(cameraTexture, vec2(1.0 - glitchUV.x, 1.0 - glitchUV.y)).rgb;
        camera = mix(camera, glitchColor * 1.5, 0.3);
    }
    
    // EFEITO 10: Breathing effect
    float breathe = sin(animTime * 1.5 + bassLevel * 4.0) * 0.15 + 1.0;
    camera *= breathe;
    
    // EFEITO 11: Vinheta dinâmica
    float vignette = 1.0 - length(uv - center) * (1.2 - audioLevel * 0.5);
    vignette = clamp(vignette, 0.4, 1.0);
    camera *= vignette;
    
    // Apply final RGB modulation from control panel
    camera *= rgbMod;
    
    // Clamp final para evitar oversaturation
    camera = clamp(camera, 0.0, 1.8);
    
    gl_FragColor = vec4(camera, 1.0);
}
