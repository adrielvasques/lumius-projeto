#version 140
uniform sampler2D cameraTexture;
uniform vec2 resolution;
uniform float time;
uniform float speed;       // Speed multiplier from control panel
uniform float audioLevel;
uniform float bassLevel;
uniform float midLevel;
uniform float highLevel;
uniform vec3 rgbMod;

const float STEP = 3.0;  // Reduced from 4.0 to make lines thinner

float lookup(vec2 p){ return dot(texture2D(cameraTexture,p).rgb,vec3(1)); }

float sobel(vec2 p){
    vec3 o = vec3(STEP/resolution.x,0,STEP/resolution.y);
    float tl=lookup(p+vec2(-1,1)*o.xz), cl=lookup(p+vec2(-1,0)*o.xy), bl=lookup(p+vec2(-1,-1)*o.xz);
    float ct=lookup(p+vec2( 0,1)*o.yz), cb=lookup(p+vec2( 0,-1)*o.yz);
    float tr=lookup(p+vec2( 1,1)*o.xz), cr=lookup(p+vec2( 1,0)*o.xy), br=lookup(p+vec2( 1,-1)*o.xz);
    vec2 g = vec2(tl+2.*cl+bl - tr-2.*cr-br, -tl-2.*ct-tr + bl+2.*cb+br);
    return dot(g,g);
}

void main(){
    vec2 uv = gl_FragCoord.xy / resolution;
    // Flip Y coordinate to fix orientation
    uv.y = 1.0 - uv.y;
    // Flip X coordinate to fix horizontal mirroring (right side appears on left)
    uv.x = 1.0 - uv.x;
    
    // CONTROLLED Audio-reactive sine wave pulsing - speed controlled by control panel
    float pulseIntensity = mix(0.002, 0.020, audioLevel); // Controlled range
    float pulseFreq = mix(1.0, 15.0, bassLevel + midLevel * 0.5); // Controlled frequency range
    
    // Use speed multiplier to control animation speed
    float animSpeed = time * speed;
    
    // Create controlled multi-layered sinusoidal distortion with speed control
    vec2 pulse1 = vec2(
        sin(animSpeed * pulseFreq + uv.y * 10.0 + bassLevel * 5.0) * pulseIntensity,
        cos(animSpeed * pulseFreq * 1.4 + uv.x * 8.0 + midLevel * 4.0) * pulseIntensity
    );
    
    vec2 pulse2 = vec2(
        sin(animSpeed * pulseFreq * 2.0 + uv.y * 6.0 + audioLevel * 3.0) * pulseIntensity * 1.5,
        cos(animSpeed * pulseFreq * 1.8 + uv.x * 5.0 + bassLevel * 3.5) * pulseIntensity * 0.7
    );
    
    // High frequency details - controlled treble reaction with speed
    vec2 pulse3 = vec2(
        sin(animSpeed * pulseFreq * 3.0 + uv.y * 20.0 + highLevel * 8.0) * pulseIntensity * 1.5,
        cos(animSpeed * pulseFreq * 3.2 + uv.x * 18.0 + highLevel * 7.0) * pulseIntensity * 1.5
    );
    
    // Combine all pulses - music drives the movement
    vec2 totalPulse = pulse1 + pulse2 + pulse3;
    vec2 pulsedUV = uv + totalPulse;
    
    // Calculate Sobel on both original and pulsed coordinates
    float e1 = sobel(uv);
    float e2 = sobel(pulsedUV);
    float e = max(e1, e2 * 0.9); // Combine edge detections
    
    // NO INTENSITY MULTIPLIER - keep edge strength natural to avoid red flashing
    
    // INTENSE color changes based on sound - VERY VISIBLE!
    vec3 baseColor = vec3(0.8, 0.3, 0.1); // Base orange
    
    // Create VIVID color palette that changes dramatically with music
    vec3 bassColor = vec3(2.0, 0.1, 0.6);   // BRIGHT RED for bass
    vec3 midColor = vec3(0.2, 2.0, 0.4);    // BRIGHT GREEN for mids  
    vec3 highColor = vec3(0.3, 0.5, 2.2);   // BRIGHT BLUE for highs
    
    // STRONG automatic color mixing - VERY VISIBLE changes!
    vec3 audioColor = baseColor;
    audioColor = mix(audioColor, bassColor, bassLevel * 0.95);   // MAXIMUM bass influence
    audioColor = mix(audioColor, midColor, midLevel * 0.90);     // MAXIMUM mid influence
    audioColor = mix(audioColor, highColor, highLevel * 0.85);   // MAXIMUM high influence
    
    // DRAMATIC color cycling with speed control - VERY VISIBLE!
    float colorCycle = sin(animSpeed * 3.0 + audioLevel * 15.0 + bassLevel * 12.0) * 0.8 + 1.2; // STRONGER cycling
    audioColor *= colorCycle;
    
    // INTENSE saturation boost - makes colors POP!
    float saturationBoost = 1.0 + (bassLevel + midLevel + highLevel) * 0.8; // STRONGER saturation
    audioColor *= saturationBoost;
    
    // STRONG brightness pulsing with bass hits
    float brightnessPulse = 1.0 + bassLevel * 0.9; // STRONGER bass brightness
    audioColor *= brightnessPulse;
    
    // Additional RAINBOW cycling effect for more variety
    float rainbowPhase = animSpeed * 1.5 + audioLevel * 10.0;
    vec3 rainbow = vec3(
        sin(rainbowPhase) * 0.3 + 1.0,
        sin(rainbowPhase + 2.0) * 0.3 + 1.0,
        sin(rainbowPhase + 4.0) * 0.3 + 1.0
    );
    audioColor *= rainbow;
    
    // AUTOMATIC color shifting effect - cycles through different color schemes
    float autoColorShift = animSpeed * 0.5 + audioLevel * 2.0;
    vec3 colorShift = vec3(
        sin(autoColorShift) * 0.5 + 1.0,           // Red channel cycling
        sin(autoColorShift + 2.094) * 0.5 + 1.0,   // Green channel cycling (120° phase)
        sin(autoColorShift + 4.188) * 0.5 + 1.0    // Blue channel cycling (240° phase)
    );
    audioColor *= colorShift;
    
    // BEAT detection color flash - sudden bright color changes on bass hits
    float beatFlash = smoothstep(0.7, 1.0, bassLevel) * 0.8; // Flash when bass is strong
    vec3 flashColor = vec3(2.0, 1.5, 0.5); // Bright yellow flash
    audioColor = mix(audioColor, flashColor, beatFlash);
    
    // CLAMP values to prevent white screen overflow!
    audioColor = clamp(audioColor, 0.0, 1.5); // Prevent extreme values
    
    // Apply RGB modulation from control panel
    audioColor *= rgbMod;
    
    // FINAL CLAMP and controlled output to prevent white screen
    vec3 col = audioColor * e;
    col = clamp(col, 0.0, 1.0); // Final clamp to prevent overflow
    
    gl_FragColor = vec4(col, e);
}
