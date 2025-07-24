#version 140
uniform sampler2D prevTexture;     // GL_TEXTURE0 – quadro anterior
uniform sampler2D cameraTexture;   // GL_TEXTURE1 – câmera

uniform float time;
uniform vec2  resolution;
uniform float audioLevel, bassLevel, midLevel, highLevel;
uniform vec3  rgbMod;

/* ---- parâmetros fáceis de mexer ---------------------------------- */
const float STEP  = 4.0;   // kernel Sobel
const float DECAY = 0.96;  // <1  → o fogo se apaga a cada frame

/* ---- Sobel ------------------------------------------------------- */
float lookup(vec2 p){ return dot(texture2D(cameraTexture, p).rgb, vec3(1)); }

float sobel(vec2 p){
    vec3 o = vec3(STEP/resolution.x, 0.0, STEP/resolution.y);
    float tl = lookup(p+vec2(-1, 1)*o.xz), cl = lookup(p+vec2(-1,0)*o.xy), bl = lookup(p+vec2(-1,-1)*o.xz);
    float ct = lookup(p+vec2( 0, 1)*o.yz), cb = lookup(p+vec2( 0,-1)*o.yz);
    float tr = lookup(p+vec2( 1, 1)*o.xz), cr = lookup(p+vec2( 1,0)*o.xy), br = lookup(p+vec2( 1,-1)*o.xz);
    vec2 g = vec2(tl+2.*cl+bl - tr-2.*cr-br, -tl-2.*ct-tr + bl+2.*cb+br);
    return dot(g, g);
}

/* ---- main -------------------------------------------------------- */
void main(){
    vec2 fc = gl_FragCoord.xy;
    
    /* Áudio suavizado vindo do C++ */
    float s = clamp(audioLevel*1.2 + bassLevel*0.8, 0.0, 1.0);

    /* UV base (ligeiro zoom pulsante) */
    vec2 uv = (1.0 - s*0.015)*(fc/resolution - 0.5) + 0.5;

    /* Bordas da câmera + ganho dinâmico */
    float dynamicGain = mix(3.0, 30.0, pow(s, 1.3));   // 3‒30 conforme volume
    vec3  edges = vec3(0.9,0.25,0.08) * sobel(uv) * dynamicGain;

    /* ---------- deslocamento radial, sentido “explosão à frente” --- */
    vec2  dir    = normalize(uv - 0.5 + 1e-6);              // evita div/0
    float phase  = 80.0*length(uv-0.5) - time*6.0;          // 80 = densidade de ondas
    float ripple = sin(phase);                              // -1..1
    uv += dir * ripple * 0.015;                             // intensidade 0.015

    /* Quadro final = anterior * DECAY + bordas atuais */
    vec3 fire = texture2D(prevTexture, uv).rgb * DECAY + edges;

    /* Realces por faixa (opcionais) */
    fire.r += bassLevel * 0.3;
    fire.g += midLevel  * 0.2;
    fire.b += highLevel * 0.1;

    /* Cor global & gama */
    fire *= rgbMod;
    fire  = pow(fire, vec3(0.8));

    gl_FragColor = vec4(fire, s);
}
