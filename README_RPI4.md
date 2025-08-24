# LUMIUS - Pico Encoder Visual System - Raspberry Pi 4

Sistema completo de controle HSB usando Raspberry Pi Pico com encoder rotativo e botões, visualizado em tempo real com openFrameworks no Raspberry Pi 4.

## 🚀 Quick Start - Raspberry Pi 4

### 1. Instalação de Dependências
```bash
cd picoEncoderProject
./install_deps_rpi4.sh
```

### 2. Launcher Automático
```bash
./lumius_launcher_rpi4.sh
```

### 3. Launcher com Splash Screen
```bash
./lumius_splash_rpi4.sh
```

## 📁 Estrutura Adaptada para Raspberry Pi 4

```
picoEncoderProject/
├── lumius_launcher_rpi4.sh     # 🚀 Launcher principal para RPi4
├── lumius_splash_rpi4.sh       # 🎨 Launcher com splash screen
├── build-all-rpi4.sh          # 🔧 Script de build para RPi4
├── install_deps_rpi4.sh        # 📦 Instalador de dependências
├── openframeworks-visualizer/  # 🎨 Aplicação visual openFrameworks
│   ├── config.make            # ⚙️ Configuração para RPi4
│   └── Makefile               # 📝 Makefile adaptado
└── ...
```

## 🔧 Configurações Específicas do Raspberry Pi 4

### OpenFrameworks
- **OF_ROOT**: `/home/lumius/openFrameworks`
- **Arquitetura**: `linuxaarch64` (ARM64)
- **Otimizações**: `-O2` para Release, `-g3` para Debug
- **Target**: `TARGET_RASPBERRY_PI`

### Dependências Instaladas
- Build tools: `build-essential`, `cmake`, `git`
- OpenFrameworks: `libfreeimage-dev`, `libopenal-dev`, `libglfw3-dev`
- Audio: `libasound2-dev`, `libpulse-dev`, `librtaudio-dev`
- Python: `python3`, `python3-tk`, `python3-serial`
- Imagem: `imagemagick`, `feh`
- Pico SDK: `gcc-arm-none-eabi`

## 🛠️ Build Manual

### 1. Instalar Dependências
```bash
./install_deps_rpi4.sh
```

### 2. Build Completo
```bash
./build-all-rpi4.sh
```

### 3. Build Específico
```bash
# Apenas firmware
./build-all-rpi4.sh -firmware

# Apenas openFrameworks
./build-all-rpi4.sh -openframeworks

# Clean build
./build-all-rpi4.sh -clean-openframeworks
```

## 🎮 Execução

### Launcher Simples
```bash
./lumius_launcher_rpi4.sh
```

### Launcher com Splash
```bash
./lumius_splash_rpi4.sh
```

### Manual
```bash
# Terminal 1 - Control Panel
cd control-app
python3 control_panel.py

# Terminal 2 - Visualizer
cd openframeworks-visualizer
make RunRelease
```

## 🔧 Troubleshooting Raspberry Pi 4

### Erro de Compilação OpenFrameworks
```bash
cd openframeworks-visualizer
sudo chown -R $USER:$USER .
rm -rf obj/
mkdir -p obj/linuxaarch64/Release/src
make clean
make
```

### Erro de Permissões
```bash
sudo chown -R $USER:$USER /home/lumius/picoEncoderProject/
```

### Audio não Funciona
```bash
# Verificar dispositivos
aplay -l

# Verificar PulseAudio
pulseaudio --check

# Reiniciar audio
sudo systemctl restart alsa-state
```

### Splash Screen não Aparece
```bash
# Instalar dependências
sudo apt install imagemagick feh

# Verificar display
echo $DISPLAY
```

## 📊 Performance Raspberry Pi 4

### Otimizações Aplicadas
- Compilação com `-O2` para Release
- Uso de hardware acceleration quando disponível
- Estrutura de diretórios ARM64 (`linuxaarch64`)
- Configurações específicas para Raspberry Pi

### Monitoramento
```bash
# CPU e Memória
htop

# Temperatura
vcgencmd measure_temp

# GPU
vcgencmd get_mem gpu
```

## 🚨 Diferenças da Versão Ubuntu

### Caminhos Atualizados
- Base: `/home/lumius/` (era `/home/adriel/`)
- OpenFrameworks: `/home/lumius/openFrameworks`
- Arquitetura: `linuxaarch64` (era `linux64`)

### Scripts Específicos
- `*_rpi4.sh` - Versões adaptadas para Raspberry Pi 4
- Configurações ARM64
- Dependências específicas do RPi4

### Hardware
- Raspberry Pi 4 com ARM64
- GPU VideoCore VI
- Audio via ALSA/PulseAudio

---

**LUMIUS v1.0 - Neural Matrix - Raspberry Pi 4**  
*Pico Encoder Visual System*