#!/bin/bash

# LUMIUS SSH Configuration Script
# Configure SSH access and X11 forwarding

echo "🔐 LUMIUS - Configuração SSH"
echo "============================"

# Enable SSH service
echo "📡 Habilitando SSH..."
sudo systemctl enable ssh
sudo systemctl start ssh

# Configure SSH for X11 forwarding
echo "🖥️  Configurando X11 forwarding..."
sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup

# Enable X11 forwarding in SSH config
if ! grep -q "X11Forwarding yes" /etc/ssh/sshd_config; then
    echo "X11Forwarding yes" | sudo tee -a /etc/ssh/sshd_config
fi

if ! grep -q "X11DisplayOffset 10" /etc/ssh/sshd_config; then
    echo "X11DisplayOffset 10" | sudo tee -a /etc/ssh/sshd_config
fi

if ! grep -q "X11UseLocalhost no" /etc/ssh/sshd_config; then
    echo "X11UseLocalhost no" | sudo tee -a /etc/ssh/sshd_config
fi

# Install X11 forwarding dependencies
echo "📦 Instalando dependências X11..."
sudo apt update
sudo apt install -y xauth x11-apps

# Restart SSH service
echo "🔄 Reiniciando SSH service..."
sudo systemctl restart ssh

# Get IP address
IP_ADDRESS=$(hostname -I | awk '{print $1}')

echo ""
echo "✅ SSH configurado com sucesso!"
echo ""
echo "📋 Informações de conexão:"
echo "   IP: $IP_ADDRESS"
echo "   Usuário: $USER"
echo "   Porta: 22"
echo ""
echo "🔗 Comandos de conexão:"
echo ""
echo "   # SSH simples (sem GUI):"
echo "   ssh $USER@$IP_ADDRESS"
echo ""
echo "   # SSH com X11 forwarding (com GUI):"
echo "   ssh -X $USER@$IP_ADDRESS"
echo ""
echo "   # SSH com compressão (conexão lenta):"
echo "   ssh -X -C $USER@$IP_ADDRESS"
echo ""
echo "🚀 Para executar LUMIUS via SSH:"
echo "   ./lumius_ssh.sh"
echo ""
echo "📊 Para monitorar sistema:"
echo "   ./rpi_monitor.sh"