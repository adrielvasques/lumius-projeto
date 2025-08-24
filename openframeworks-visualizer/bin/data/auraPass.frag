#version 140
uniform sampler2D prevAura;      // GL_TEXTURE0  (ping-pong)
uniform sampler2D edgeMask;      // GL_TEXTURE1  (output do passo A)

uniform float time;
uniform float speed;             // Speed multiplier from control panel
uniform vec2  resolution;        // = aura FBO size (meia res)
uniform float audioLevel;        // já suavizado!
uniform float bassLevel;         // Added for more reactivity
uniform float midLevel;          // Added for more reactivity
uniform float highLevel;         // Added for more reactivity
uniform vec3  rgbMod;

const float DECAY = 0.95;        // Increased for more stability

void main(){
    vec2 uv = gl_FragCoord.xy / resolution;

    /* 1.  Blur controlado com speed - velocidade controlada pelo painel */
    float animSpeed = time * speed; // Use speed multiplier
    float basePulse = sin(animSpeed * 4.0 + audioLevel * 10.0) * 0.5 + 1.5; // Speed affects pulsing
    float blurRadius = mix(1.0, 4.0, audioLevel) * basePulse; // Range controlado
    vec2 px = blurRadius / resolution;
    vec4 sum = texture2D(edgeMask, uv);      // centro
    
    // Blur controlado com speed
    for(int i=0;i<6;i++){  // Menos samples
        float a = (i/6.0)*6.2831853;
        float rotationPulse = sin(animSpeed * 8.0 + bassLevel * 5.0) * 0.5; // Speed affects rotation
        a += rotationPulse;
        vec2  off = vec2(cos(a),sin(a))*px;
        sum += texture2D(edgeMask, uv+off);
    }
    vec3 fresh = (sum / 7.0).rgb;

    /* 2.  Controle de spread moderado */
    float spread = mix(0.002, 0.02, audioLevel); // Range controlado
    
    /* 3.  Decay com variação moderada */
    float dynamicDecay = mix(DECAY - 0.08, DECAY + 0.05, bassLevel); // Variação controlada
    
    vec3 prev = texture2D(prevAura, uv).rgb * dynamicDecay;

    /* 4.  Combine with audio enhancement */
    vec3 aura = prev + fresh;
    
    /* 5.  Audio-reactive color enhancement APENAS onde há conteúdo */
    // Só aplica cores onde já existe aura (evita fundo branco)
    float auraStrength = length(aura);
    if(auraStrength > 0.01) {  // Só processa onde há conteúdo visível
        aura.r *= mix(1.0, 1.8, bassLevel * 0.6);   // Boost BEM menor para bass
        aura.g *= mix(1.0, 1.9, midLevel * 0.5);    // Boost BEM menor para mids
        aura.b *= mix(1.0, 2.0, highLevel * 0.4);   // Boost BEM menor para highs
        
        // Color cycling só onde há aura - controlado pelo speed
        float musicCycle = sin(animSpeed * 4.0 + bassLevel * 8.0) * 0.3 + 1.0; // Speed affects color cycling
        aura *= musicCycle;
        
        // Brightness pulse BEM controlado
        float brightnessPulse = 1.0 + audioLevel * 0.5; // Muito menor
        aura *= brightnessPulse;
        
        // CLAMP para evitar estouro
        aura = clamp(aura, 0.0, 1.2); // Evita valores extremos
    }
    
    /* 6.  RGB modulation and final output */
    aura *= rgbMod;
    
    /* 7.  Alpha transparente - SÓ mostra onde há fogo */
    float auraIntensity = length(aura);
    float alpha = smoothstep(0.0, 0.1, auraIntensity); // Transição suave para transparência
    
    // Limita o alpha para evitar tela branca
    alpha = min(alpha, 0.9);
    
    // FINAL CLAMP para evitar qualquer estouro
    aura = clamp(aura, 0.0, 1.0);
    
    gl_FragColor = vec4(aura, alpha);
}
