#!/bin/bash

# LUMIUS Raspberry Pi Setup Script
# Configura o ambiente para performance otimizada

echo "🔧 LUMIUS - Configuração Raspberry Pi"
echo "======================================"

# Verificar se está rodando no Raspberry Pi
if [ ! -f /proc/device-tree/model ]; then
    echo "❌ Este script deve ser executado em um Raspberry Pi"
    exit 1
fi

PI_MODEL=$(cat /proc/device-tree/model)
echo "📱 Modelo detectado: $PI_MODEL"

# Configurações de performance
echo "⚡ Aplicando configurações de performance..."

# GPU Memory Split (mínimo 128MB para gráficos)
sudo raspi-config nonint do_memory_split 128

# Habilitar GPU
sudo raspi-config nonint do_gldriver G2

# Configurações de boot para performance
echo "🚀 Configurando boot otimizado..."

# Backup do config atual
sudo cp /boot/config.txt /boot/config.txt.backup

# Adicionar configurações de performance se não existirem
if ! grep -q "# LUMIUS Performance Settings" /boot/config.txt; then
    sudo tee -a /boot/config.txt << EOF

# LUMIUS Performance Settings
gpu_mem=128
gpu_freq=500
over_voltage=2
arm_freq=1800
core_freq=500
sdram_freq=500
force_turbo=1
disable_splash=1
boot_delay=0
EOF
fi

# Instalar dependências específicas para Raspberry Pi
echo "📦 Instalando dependências..."
sudo apt update
sudo apt install -y \
    imagemagick \
    feh \
    x11-xserver-utils \
    mesa-utils \
    libgl1-mesa-dev \
    libgles2-mesa-dev \
    libegl1-mesa-dev

# Configurar autostart do LUMIUS
echo "🎯 Configurando autostart..."
mkdir -p ~/.config/autostart

cat > ~/.config/autostart/lumius.desktop << EOF
[Desktop Entry]
Type=Application
Name=LUMIUS
Exec=/home/lumius/lumius_project/lumius_splash.sh
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
EOF

# Configurar resolução automática
echo "🖥️  Configurando display..."
if ! grep -q "hdmi_force_hotplug=1" /boot/config.txt; then
    echo "hdmi_force_hotplug=1" | sudo tee -a /boot/config.txt
fi

echo "✅ Configuração concluída!"
echo ""
echo "📋 Próximos passos:"
echo "   1. Reinicie o Raspberry Pi: sudo reboot"
echo "   2. O LUMIUS iniciará automaticamente após o boot"
echo "   3. Para desabilitar autostart: rm ~/.config/autostart/lumius.desktop"
echo ""
echo "⚠️  IMPORTANTE: O sistema foi configurado para máxima performance."
echo "   Certifique-se de ter refrigeração adequada."