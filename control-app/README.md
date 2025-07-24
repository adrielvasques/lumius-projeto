# Shader Control Panel

Aplicação de controle para o visualizador de shaders do Pico Encoder.

## Como usar

1. **Instalar Python** (se não tiver):
   ```bash
   sudo apt install python3 python3-tk
   ```

2. **Executar o painel de controle**:
   ```bash
   cd control-app
   python3 control_panel.py
   ```

3. **Controles disponíveis**:
   - **Shader Selection**: Troca entre os 3 shaders
   - **Music Controls**: Play/Pause da música
   - **Volume**: Controla volume da música (0-100%)
   - **Speed Multiplier**: Acelera/desacelera animações (0.1x - 3.0x)
   - **Intensity Multiplier**: Controla intensidade dos efeitos de áudio (0.1x - 2.0x)

## Como funciona

- O painel escreve comandos no arquivo `control.txt`
- A aplicação openFrameworks lê este arquivo a cada frame
- Mudanças são aplicadas em tempo real

## Estrutura do arquivo de controle

```
shader:3
music:play
volume:75
speed:1.5
intensity:1.2
```

## Executar ambas aplicações

1. **Terminal 1** - Visualizador:
   ```bash
   cd openframeworks-visualizer
   make RunRelease
   ```

2. **Terminal 2** - Painel de controle:
   ```bash
   cd control-app
   python3 control_panel.py
   ```