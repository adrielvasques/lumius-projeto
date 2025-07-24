#!/bin/bash

# LUMIUS Remote Control Setup Script
echo "=== LUMIUS Remote Control Setup ==="
echo ""

# Enable SSH on Raspberry Pi
echo "Enabling SSH service..."
sudo systemctl enable ssh
sudo systemctl start ssh

# Get IP address
IP=$(hostname -I | awk '{print $1}')
echo "Raspberry Pi IP: $IP"

# Create remote control instructions
cat > /home/lumius/picoEncoderProject/REMOTE_CONTROL_INSTRUCTIONS.txt << EOF
=== LUMIUS REMOTE CONTROL SETUP ===

1. ON YOUR COMPUTER:
   - Install Python SSH library: pip install paramiko
   - Copy the control-app folder to your computer
   - Run: python3 control_panel_remote.py

2. CONNECTION SETTINGS:
   - Raspberry Pi IP: $IP
   - Username: lumius
   - Password: [your lumius user password]

3. ON RASPBERRY PI:
   - Run: ./lumius_launcher_rpi4.sh
   - Choose option 2 (Remote Panel)
   - Only the visualizer will run on RPi4

4. BENEFITS:
   - Control panel uses your computer's GPU
   - Raspberry Pi focuses only on visuals
   - Better performance and responsiveness
   - Control from anywhere on the network

EOF

echo ""
echo "Setup completed!"
echo "Instructions saved to: REMOTE_CONTROL_INSTRUCTIONS.txt"
echo ""
echo "To use remote control:"
echo "1. Run: ./lumius_launcher_rpi4.sh"
echo "2. Choose option 2 (Remote Panel)"
echo "3. On your computer, connect to IP: $IP"