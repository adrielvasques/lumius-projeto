#!/bin/bash

# LUMIUS Dependencies Installer for Raspberry Pi 4
# Install all required packages for the project

echo "=== LUMIUS Dependencies Installer - Raspberry Pi 4 ==="
echo ""

# Update package list
echo "Updating package list..."
sudo apt update

# Install basic development tools
echo "Installing development tools..."
sudo apt install -y build-essential cmake git pkg-config

# Install OpenFrameworks dependencies
echo "Installing OpenFrameworks dependencies..."
sudo apt install -y libfreeimage-dev libopenal-dev libglfw3-dev libassimp-dev libglew-dev libgtk-3-dev libgstreamer1.0-dev libgstreamer-plugins-base1.0-dev

# Install audio libraries
echo "Installing audio libraries..."
sudo apt install -y libasound2-dev libpulse-dev librtaudio-dev libfmod-dev

# Install Python dependencies
echo "Installing Python dependencies..."
sudo apt install -y python3 python3-pip python3-tk python3-serial python3-paramiko

# Install image processing tools
echo "Installing image processing tools..."
sudo apt install -y imagemagick feh

# Install additional libraries for Raspberry Pi
echo "Installing Raspberry Pi specific libraries..."
sudo apt install -y libraspberrypi-dev

# Install OpenCV (optional, for camera features)
echo "Installing OpenCV..."
sudo apt install -y libopencv-dev python3-opencv

# Create necessary directories
echo "Creating project directories..."
mkdir -p /home/lumius/lumius_project/assets/{images,music,video}

# Set permissions
echo "Setting permissions..."
sudo chown -R $USER:$USER /home/lumius/lumius_project/

# Verify Python dependencies
echo "Verifying Python dependencies..."
python3 -c "import tkinter, paramiko; print('✅ Python dependencies OK')" 2>/dev/null || echo "❌ Python dependencies missing"

echo ""
echo "=== Installation completed! ==="
echo ""
echo "📦 Installed packages:"
echo "  - OpenFrameworks dependencies"
echo "  - Python3 + tkinter + paramiko"
echo "  - ImageMagick + feh"
echo "  - Audio libraries"
echo "  - Raspberry Pi libraries"
echo ""
echo "Next steps:"
echo "1. Make sure openFrameworks is installed in /home/lumius/openFrameworks"
echo "2. Build the OpenFrameworks visualizer"
echo "3. Run: ./lumius_splash.sh to start the system"
echo "4. For remote control: python3 control-app/control_panel_remote.py"
echo ""