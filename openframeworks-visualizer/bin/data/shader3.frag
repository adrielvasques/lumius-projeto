// Burst-Wave  – versão “Bright”
#version 140
uniform float time;
uniform vec2  resolution;
uniform float audioLevel, bassLevel, midLevel, highLevel;

/* --------- constantes --------- */
const float CELL_SCALE  = 10.0;
const float HUE_SPEED   = 0.35;
const float PETAL_BASE  = 10.0;
const float SWIRL_FREQ  = 5.0, SWIRL_GAIN = 1.3;
const float NOISE_GAIN  = 0.35, NOISE_SPEED = 0.40;
const float CHROM_SHIFT = 0.012;
const float FLASH_GAIN  = 1.55;    /* ▲ mais claro */

/* --------- novas constantes --------- */
const float PULSE_SPEED = 0.8;
const float PULSE_GAIN = 0.5;
const float FRAG_DISTORT = 0.3;
const float EXP_SCALE = 1.0; // Aumentar escala para maior impacto
const float EXP_SPEED = 0.5; // Ajustar velocidade para maior dinamismo

/* --------- utils (mesmos) -------- */
vec4 perm(vec4 x){
    return mod((34.0 * x + 1.0) * x, 289.0);
}
#define PI 3.14159265359

vec2 cell2x2(vec2 P){
    float K = 1.0 / 7.0;
    float K2 = 1.0 / 14.0;
    float J = 0.8;
    vec2 Pi = mod(floor(P), 289.0);
    vec2 Pf = fract(P);
    vec4 p = perm(vec4(Pi.x) + vec4(0, 1, 0, 1));
         p = perm(p + vec4(Pi.y) + vec4(0, 0, 1, 1));
    vec4 ox = mod(p, 7.0) * K + K2;
    vec4 oy = mod(floor(p * K), 7.0) * K + K2;
    vec4 dx = Pf.x + vec4(-0.5, -1.5, -0.5, -1.5) + J * ox;
    vec4 dy = Pf.y + vec4(-0.5, -0.5, -1.5, -1.5) + J * oy;
    vec4 d = dx * dx + dy * dy;
    if (d.y < d.x) d.xy = d.yx;
    if (d.z < d.x) d.xz = d.zx;
    if (d.w < d.x) d.xw = d.wx;
    d.y = min(d.y, min(d.z, d.w));
    return sqrt(d.xy);
}
float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float vnoise(vec2 p){
    vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);
    float a=hash(i), b=hash(i+vec2(1,0)),
          c=hash(i+vec2(0,1)), d=hash(i+vec2(1,1));
    return mix(mix(a,b,f.x), mix(c,d,f.x), f.y);
}
vec3 hsv2rgb(vec3 c){
    vec4 K=vec4(1.,2./3.,1./3.,3.);
    vec3 p=abs(fract(c.xxx+K.xyz)*6.-K.www);
    return c.z*mix(K.xxx,clamp(p-K.xxx,0.,1.),c.y);
}

/* ------------- main ------------- */
void main(){
    vec2 uv = (gl_FragCoord.xy / resolution) * 2.0 - 1.0;
    uv.x *= resolution.x / resolution.y;

    float r = length(uv);
    float angle = atan(uv.y, uv.x);

    // Pulsação rápida e intensa
    float pulse = sin(time * PULSE_SPEED * 3.0) * PULSE_GAIN * audioLevel * 2.0;
    pulse += sin(time * PULSE_SPEED * 6.0) * PULSE_GAIN * bassLevel * 1.5;
    pulse += cos(time * PULSE_SPEED * 1.5) * PULSE_GAIN * midLevel * 1.2;
    r += pulse;

    // Distorção rápida e reativa
    vec2 distort1 = vec2(vnoise(uv * 15.0 + time * FRAG_DISTORT * 4.0), vnoise(uv * 15.0 + vec2(1.0, 2.0) + time * FRAG_DISTORT * 4.0));
    vec2 distort2 = vec2(vnoise(uv * 8.0 + time * FRAG_DISTORT * 3.0), vnoise(uv * 8.0 + vec2(3.0, 1.5) + time * FRAG_DISTORT * 3.5));
    uv += (distort1 * bassLevel * 2.0 + distort2 * midLevel * 1.5) * FRAG_DISTORT;

    // Padrões circulares dinâmicos com crescimento exponencial
    float expEffect = exp(-EXP_SCALE * r) * sin(time * EXP_SPEED);
    float pattern = abs(sin(PI * uv.x * bassLevel) * cos(PI * uv.y * midLevel));
    pattern += abs(sin(PI * r * highLevel) * cos(PI * angle * 4.0));
    pattern += expEffect * 2.0; // Combinar efeito exponencial com padrões

    // Sistema de cores dinâmico e variado
    float hue1 = fract(time * 0.3 + pattern * 1.2 + bassLevel * 1.5);
    float hue2 = fract(time * 0.4 + pattern * 0.9 + midLevel * 1.2 + 0.2);
    float hue3 = fract(time * 0.5 + pattern * 0.7 + highLevel * 1.8 + 0.4);
    float hue4 = fract(time * 0.35 + pattern * 1.1 + audioLevel * 2.0 + 0.6);
    float hue5 = fract(time * 0.25 + pattern * 1.3 + (bassLevel + midLevel) * 1.0 + 0.8);
    
    float mix1 = sin(pattern * PI * 4.0 + time * 4.0 + bassLevel * 8.0) * 0.5 + 0.5;
    float mix2 = cos(pattern * PI * 6.0 + time * 5.0 + midLevel * 6.0) * 0.5 + 0.5;
    float mix3 = sin(pattern * PI * 8.0 + time * 3.0 + highLevel * 10.0) * 0.5 + 0.5;
    
    float hue = mix(mix(mix(hue1, hue2, mix1), mix(hue3, hue4, mix2), mix1), hue5, mix3);
    float sat = 1.0;
    float val = 1.0 + pattern * 1.2 + audioLevel * 1.0;
    val += sin(time * 8.0 + pattern * 15.0 + bassLevel * 12.0) * 0.3;
    val += cos(time * 6.0 + midLevel * 10.0) * 0.2;

    vec3 col = hsv2rgb(vec3(hue, sat, val));

    // Adicionar efeito de brilho
    col *= 1.0 + pattern * FLASH_GAIN;

    // Aberração cromática para efeito psicodélico
    float shift = CHROM_SHIFT * r;
    col.r += shift * 1.5;
    col.b += shift * 1.5;

    col *= 1.3 - r * 0.04; // Ajuste de brilho

    // Pós-processamento intenso
    col = mix(col, col * col, audioLevel * 0.8); // Contraste muito reativo
    col *= 1.0 + sin(time * 12.0 + length(col) * 15.0 + bassLevel * 20.0) * 0.2; // Cintilação intensa
    
    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
