# Lumius Project – Visualizador Audiovisual Reativo

Um sistema de visualização musical em tempo real usando openFrameworks com shaders GLSL áudio-reativos, projetado para Raspberry Pi com controle remoto via SSH.

## 🎨 Overview

O Lumius Project é um visualizador musical avançado que combina análise de áudio em tempo real com shaders GLSL para criar experiências visuais imersivas. O sistema processa música e entrada de microfone, gerando padrões visuais complexos que respondem dinamicamente às frequências de áudio (bass, mid, high).

### Características Principais

- **7 Obras Visuais Originais** com shaders GLSL customizados
- **Análise de Áudio em Tempo Real** (graves, médios, agudos)
- **Controle Remoto via SSH** por aplicação web
- **Suporte à Webcam** para efeitos híbridos e interativos
- **Controles Dinâmicos**: velocidade, intensidade e cores RGB
- **Otimizado para Raspberry Pi** com performance de 30fps

---

## 🎭 Obras Disponíveis

### Obra 1: Batuque
**Círculos concêntricos pulsantes**
- 15 camadas circulares que expandem e contraem conforme o som
- Centro reativo ao áudio
- Rotação suave das camadas externas
- Cores moduladas por bandas de frequência
- Zoom e intensidade controláveis

### Obra 2: Zebra
**Padrões de vibração acústica digital**
- Simulação visual inspirada em figuras de Chladni
- Padrões senoidais que vibram com a música
- Frequência média do áudio define o ritmo de transformação
- Cores HSV dinâmicas, brilho intenso
- Máscara de suavização mantém o visual limpo

### Obra 3: Ruído
**Pulsação e expansão central**
- Ondas e formas pulsantes emitidas do centro da tela
- Pulsação direta com as variações do som
- Distorções orgânicas, ruído visual, sensação de dissipação
- Mudanças de cor contínuas e intensidade ajustável

### Obra 4: Handshake
**Campo energético ondulante**
- Ondas bidimensionais cruzadas com distorção sonora
- Graves e médios influenciam a intensidade da vibração
- Mistura cromática dinâmica, sem predominância fixa
- Brilho e cintilação local sincronizados ao som
- Controle externo de paleta e tonalidade

### Obra 5: Visio Fungorum
**Distorção audiovisual com webcam**
- Imagem da câmera processada e distorcida em tempo real
- Ondas e ruídos sincronizados ao áudio
- Cores que pulsam com a música
- Ruído granulado cresce com o volume

### Obra 6: Lucis Effugium
**Aura de luz e bordas**
- Dois shaders em sequência: detecção de bordas + difusão luminosa
- Luz que vaza e se acumula a partir dos contornos da cena
- Som modula brilho, cor e movimento da luz
- Rastros visuais e sensação de memória

### Obra 7: Codex Sonorus
**Símbolos e bordas reativos ao som**
- Bordas da cena convertidas em símbolos gráficos
- Densidade, organização e cor dos símbolos moduladas pelo áudio
- Paleta de cores dinâmica conforme graves, médios e agudos
- Controle de densidade, velocidade e tonalidade

---

## 🎛️ Sistema de Controle

### Controles Disponíveis

- **Obra**: Seleção entre as 7 obras (1 a 7)
- **RGB**: Controle individual de vermelho, verde e azul (0-255)
- **Velocidade**: Multiplicador global de animação (0.1-10.0)
- **Intensidade**: Controle geral dos efeitos (0.1-10.0)
- **Volume**: Volume da música (0-100%)
- **Música**: Play/Pause

### Arquivo de Controle
O sistema lê continuamente o arquivo `control.txt`:
```
effect:1
rgb_r:255
rgb_g:128
rgb_b:64
speed:1.5
intensity:2.0
volume:75
music:play
```

---

## 🌐 Control App (SSH)

### Aplicação Web Remota
Localizada em `control-app/`:

- **Interface Web Responsiva** para controle remoto
- **Conexão SSH Automática** com o Raspberry Pi
- **Controles em tempo real** com sliders e botões
- **Preview dos efeitos** com descrição
- **Status do sistema** (áudio, câmera, performance)

### Como Usar
1. Configure as credenciais SSH no `config.json`
2. Execute `node server.js` na máquina de controle
3. Acesse `http://localhost:3000` no navegador
4. Controle o Lumius remotamente

---

## 📁 Scripts de Automação

### `build.sh`
```bash
./build.sh
```
- Compila o projeto openFrameworks
- Verifica dependências e otimiza para Raspberry Pi

### `run.sh` 
```bash
./run.sh
```
- Inicia o visualizador
- Ativa permissões de câmera, fullscreen e monitoramento

### `setup.sh`
```bash
./setup.sh
```
- Instala dependências do openFrameworks
- Configura drivers de áudio/vídeo

### `install-deps.sh`
```bash
./install-deps.sh
```
- Instala bibliotecas necessárias
- Configura V4L2 para câmera, codecs e ALSA/PulseAudio

### `start-service.sh`
```bash
./start-service.sh
```
- Executa como serviço do sistema, com auto-restart e logs

---

## 🔧 Configuração Técnica

### Requisitos de Sistema
- **Raspberry Pi 4** (ou superior)
- **OpenGL ES 2.0+**
- **Câmera USB/CSI** (opcional para obras 5–7)
- **Entrada de áudio** (microfone ou line-in)
- **Resolução**: 1920x1080 @ 30fps

### Estrutura de Arquivos
```
lumius_project/
├── openframeworks-visualizer/
│   ├── src/
│   ├── bin/data/
│   └── Makefile
├── control-app/
│   ├── public/
│   ├── server.js
│   └── config.json
├── scripts/
└── assets/
```

### Performance
- **30 FPS** constantes no Raspberry Pi 4
- **Análise de áudio** em 256 bins FFT
- **Shaders otimizados** para OpenGL ES

---

## 🚀 Instalação Rápida

```bash
git clone https://github.com/adrielvasques/lumius-projeto.git
cd lumius-projeto

# Coloque um arquivo music.wav na pasta:
cp /caminho/para/sua/musica.wav openframeworks-visualizer/bin/data/music.wav

# Configure permissões e ambiente
chmod +x *.sh
./rpi_setup.sh

# Compile
cd openframeworks-visualizer
make

# Execute
./bin/openframeworks-visualizer
```

---

## 🎵 Uso

- **Antes de executar, coloque um arquivo music.wav em openframeworks-visualizer/bin/data/**
- Teclas 1-7 trocam entre as obras
- Controle remoto pelo painel web via SSH
- Webcam USB para efeitos híbridos (Obras 5–7)
- Formatos suportados: `.wav` (recomendado), `.mp3`, `.ogg`

---

## 🔊 Análise de Áudio

- **Bass**: 0–85 Hz (graves, batidas)
- **Mid**: 85–2000 Hz (vocais, instrumentos)  
- **High**: 2000+ Hz (agudos, pratos)
- Cada obra reage de modo único a essas bandas

---

## 🎨 Personalização

- Adicione novos shaders em `bin/data/`
- Registre no `ofApp.cpp`
- Crie novos parâmetros no painel e no control.txt conforme necessário

---

**Lumius Project** – Transformando música em arte visual em tempo real, para plataformas acessíveis.
