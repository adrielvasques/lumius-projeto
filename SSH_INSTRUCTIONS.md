# 🌐 LUMIUS - Controle Remoto via SSH

## 📋 Configuração Inicial

### 1. No Raspberry Pi (uma vez):
```bash
# Configure SSH e dependências
./ssh_setup.sh

# Configure o sistema para Raspberry Pi
./rpi_setup.sh
```

### 2. Obter IP do Raspberry Pi:
```bash
hostname -I
# Anote o IP (ex: 192.168.0.17)
```

## 🔗 Conexões SSH

### SSH Simples (sem interface gráfica):
```bash
ssh lumius@192.168.0.17
```

### SSH com X11 Forwarding (para GUIs):
```bash
ssh -X lumius@192.168.0.17
```

### SSH com Compressão (conexão lenta):
```bash
ssh -X -C lumius@192.168.0.17
```

## 🚀 Executando LUMIUS

### No Raspberry Pi (via SSH):
```bash
# Inicia o sistema em modo remoto
./lumius_ssh.sh

# Monitor de sistema em terminal separado
./rpi_monitor.sh
```

### No Computador Remoto:
```bash
# Execute o painel de controle remoto
cd control-app
python3 control_panel_remote.py
```

## 🎛️ Como Funciona

1. **Raspberry Pi**: Executa o visualizer OpenFrameworks
2. **Arquivo de Controle**: `/home/lumius/lumius_project/openframeworks-visualizer/bin/data/control.txt`
3. **Controle Remoto**: `control_panel_remote.py` conecta via SSH e escreve comandos no arquivo
4. **Visualizer**: Lê o arquivo de controle e aplica os efeitos

## 📊 Comandos Úteis

### No SSH do Raspberry Pi:
```bash
# Ver logs em tempo real
tail -f openframeworks-visualizer/visualizer.log

# Parar sistema
pkill -f openframeworks-visualizer

# Ver arquivo de controle
cat openframeworks-visualizer/bin/data/control.txt

# Monitor de sistema
./rpi_monitor.sh
```

### Estrutura do Arquivo de Controle:
```
effect:1
rgb_r:255
rgb_g:255
rgb_b:255
speed:1.0
intensity:1.0
volume:50
```

## 🔧 Troubleshooting

### Problema: "Connection refused"
- Verifique se SSH está ativo: `sudo systemctl status ssh`
- Verifique IP: `hostname -I`

### Problema: "X11 forwarding not working"
- Use: `ssh -X -v lumius@IP` para debug
- Instale: `sudo apt install xauth x11-apps`

### Problema: "Control panel não conecta"
- Verifique se `lumius_ssh.sh` está rodando no RPi
- Confirme IP e senha no control_panel_remote.py
- Teste conexão: `ssh lumius@IP`

## 🎯 Fluxo Completo

1. **Setup** (uma vez):
   ```bash
   # No Raspberry Pi
   ./ssh_setup.sh
   ./rpi_setup.sh
   ```

2. **Execução**:
   ```bash
   # Terminal 1 - SSH no RPi
   ssh lumius@192.168.0.17
   ./lumius_ssh.sh
   
   # Terminal 2 - Monitor (opcional)
   ssh lumius@192.168.0.17
   ./rpi_monitor.sh
   
   # No computador remoto
   python3 control_panel_remote.py
   ```

3. **Controle**: Use a interface gráfica do `control_panel_remote.py` para controlar os efeitos visuais

4. **Shutdown**: Feche o control panel remoto ou use Ctrl+C no SSH