# LUMIUS Remote Control Panel

Controle o sistema LUMIUS remotamente usando seus recursos gráficos locais.

## 🖥️ Setup

### 1. No seu computador local:
```bash
# Instalar dependência SSH
pip install paramiko

# Executar painel remoto
python3 control_panel_remote.py
```

### 2. No Raspberry Pi:
```bash
# Apenas executar o visualizador
cd /home/lumius/picoEncoderProject/openframeworks-visualizer
./bin/openframeworks-visualizer
```

## 🔧 Configuração

1. **IP do Raspberry Pi**: Digite o IP do seu RPi4
2. **Usuário**: `lumius` (padrão)
3. **Senha**: Senha do usuário lumius
4. **Clique CONNECT**

## ✅ Vantagens

- **Performance**: Usa GPU do seu computador
- **Responsividade**: Interface mais fluida
- **Flexibilidade**: Controla de qualquer lugar da rede
- **Recursos**: Não sobrecarrega o Raspberry Pi

## 🎮 Uso

1. Conecte via SSH
2. Controle todos os efeitos remotamente
3. Mudanças são aplicadas em tempo real no RPi4
4. Visualizador roda apenas no Raspberry Pi

## 📡 Rede

Certifique-se que:
- RPi4 e computador na mesma rede
- SSH habilitado no RPi4: `sudo systemctl enable ssh`
- Firewall permite conexão SSH