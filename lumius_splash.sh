#!/bin/bash

# LUMIUS Fullscreen Splash Screen for Raspberry Pi
# Optimized for embedded platform
SUDO_PASSWORD="Recife32@"

# Create temporary splash image optimized for Raspberry Pi
create_splash_image() {
    local message="$1"
    # Get current display resolution
    local resolution=$(xrandr | grep '*' | awk '{print $1}' | head -1)
    if [ -z "$resolution" ]; then
        resolution="1920x1080"  # fallback
    fi
    
    convert -size $resolution xc:black \
        -fill "#00ffff" -pointsize 80 -font "DejaVu-Sans-Bold" \
        -gravity center -annotate +0-80 "LUMIUS" \
        -fill "#666666" -pointsize 18 \
        -gravity center -annotate +0+10 "ARTE GENERATIVA AUDIOVISUAL" \
        -fill "#555555" -pointsize 16 \
        -gravity center -annotate +0+35 "RASPBERRY PI EMBARCADO" \
        -fill "#00aaff" -pointsize 14 \
        -gravity center -annotate +0+60 "v1.0 - NEURAL MATRIX" \
        -fill "#00ff00" -pointsize 20 \
        -gravity center -annotate +0+120 "$message" \
        /tmp/lumius_splash.png
}

# Show splash screen
show_splash() {
    # Kill any existing feh processes
    pkill feh 2>/dev/null
    sleep 1
    
    # Create initial splash
    create_splash_image "INITIALIZING SYSTEM..."
    
    # Show fullscreen splash
    feh --fullscreen --hide-pointer --no-menus --zoom fill /tmp/lumius_splash.png &
    SPLASH_PID=$!
    
    echo "Splash PID: $SPLASH_PID"
}

# Update splash message
update_splash() {
    local message="$1"
    create_splash_image "$message"
}

# Close splash screen
close_splash() {
    kill $SPLASH_PID 2>/dev/null
    pkill feh 2>/dev/null
    rm -f /tmp/lumius_splash.png 2>/dev/null
}

# Main launcher
launch_with_splash() {
    # Check dependencies for Raspberry Pi
    if ! command -v convert &> /dev/null; then
        echo "Error: ImageMagick not installed. Install with: sudo apt install imagemagick"
        exit 1
    fi
    
    if ! command -v feh &> /dev/null; then
        echo "Error: feh not installed. Install with: sudo apt install feh"
        exit 1
    fi
    
    # Check if running on Raspberry Pi
    if [ -f /proc/device-tree/model ]; then
        PI_MODEL=$(cat /proc/device-tree/model)
        echo "Running on: $PI_MODEL"
    fi
    
    # Ensure GPU memory split is adequate for graphics
    GPU_MEM=$(vcgencmd get_mem gpu | cut -d= -f2 | cut -d'M' -f1)
    if [ "$GPU_MEM" -lt 128 ]; then
        echo "Warning: GPU memory is ${GPU_MEM}M. Consider increasing to 128M+ for better graphics performance."
    fi
    
    # Show splash
    show_splash
    sleep 2
    
    # Step 1: Check dependencies
    update_splash "CHECKING DEPENDENCIES..."
    sleep 2
    
    # Step 2: Compile OpenFrameworks for Raspberry Pi
    update_splash "COMPILING VISUAL ENGINE..."
    cd /home/lumius/lumius_project/openframeworks-visualizer
    
    # Check if project directory exists
    if [ ! -f "Makefile" ]; then
        update_splash "ERROR - NO MAKEFILE FOUND"
        echo "Error: Makefile not found in $(pwd)"
        sleep 5
        close_splash
        exit 1
    fi
    
    # Clean and fix permissions for Raspberry Pi
    echo "Fixing permissions and cleaning..."
    echo "$SUDO_PASSWORD" | sudo -S chown -R $USER:$USER . 2>/dev/null || true
    rm -rf obj/ 2>/dev/null || true
    mkdir -p obj/linuxarmv7l/Release/src  # ARM architecture for RPi
    
    echo "Starting compilation for ARM..."
    
    # Use limited parallel jobs for Raspberry Pi to avoid memory issues
    if ! make -j2 > build.log 2>&1; then
        update_splash "COMPILATION ERROR - BUILD FAILED"
        echo "Build failed - check build.log for details"
        tail -20 build.log
        sleep 5
        close_splash
        exit 1
    fi
    
    echo "Compilation successful!"
    
    # Step 3: Prepare to launch
    update_splash "LUMIUS SYSTEM READY"
    sleep 2
    
    # Close splash FIRST
    close_splash
    sleep 1
    
    # Step 4: Initialize audio system
    update_splash "INITIALIZING AUDIO MATRIX..."
    
    # Configure Bluetooth audio
    BT_SINK=$(pactl list short sinks | grep bluez | head -1 | cut -f2)
    if [ ! -z "$BT_SINK" ]; then
        pactl set-default-sink "$BT_SINK"
        echo "Bluetooth audio configured: $BT_SINK"
    fi
    
    # Setup audio environment variables
    export PULSE_RUNTIME_PATH=/run/user/$(id -u)/pulse
    export XDG_RUNTIME_DIR=/run/user/$(id -u)
    
    # Setup control file
    CONTROL_FILE="/home/lumius/lumius_project/openframeworks-visualizer/bin/data/control.txt"
    mkdir -p "$(dirname "$CONTROL_FILE")"
    cat > "$CONTROL_FILE" << EOF
effect:1
rgb_r:255
rgb_g:255
rgb_b:255
speed:1.0
intensity:1.0
volume:50
EOF
    
    # Step 5: Hide taskbar and prepare fullscreen
    update_splash "PREPARING FULLSCREEN MODE..."
    
    # Hide taskbar/panel
    export DISPLAY=:0
    pcmanfm --desktop-off 2>/dev/null &
    lxpanel --profile LXDE-pi --command=exit 2>/dev/null || true
    
    sleep 1
    
    # Step 6: Launch visualizer in true fullscreen
    cd /home/lumius/lumius_project/openframeworks-visualizer
    echo -e "\033[1;34m◢ LAUNCHING FULLSCREEN VISUALIZER ◣\033[0m"
    
    # Close splash FIRST
    close_splash
    sleep 1
    
    # Force PulseAudio and Bluetooth audio
    export PULSE_RUNTIME_PATH="/run/user/$(id -u)/pulse"
    export XDG_RUNTIME_DIR="/run/user/$(id -u)"
    
    # Ensure PulseAudio is running for current user
    pulseaudio --check || pulseaudio --start --daemonize
    
    # Set Bluetooth as default sink
    BT_SINK=$(pactl list short sinks | grep bluez | head -1 | cut -f2)
    if [ ! -z "$BT_SINK" ]; then
        pactl set-default-sink "$BT_SINK"
        echo "Using Bluetooth audio: $BT_SINK"
    fi
    
    # Launch in fullscreen mode with proper audio
    ./bin/openframeworks-visualizer 2>&1 | tee visualizer.log &
    VISUALIZER_PID=$!
    
    echo -e "\033[0;36m◢ LUMIUS FULLSCREEN ACTIVE ◣\033[0m"
    echo -e "\033[0;32m✓ Visualizer PID: $VISUALIZER_PID\033[0m"
    echo -e "\033[1;33mPress Ctrl+C to shutdown system\033[0m"
    echo -e "\033[1;33mControl via SSH: ./control_panel_remote.py\033[0m"
    echo -e "\033[1;36m────────────────────────────────────────\033[0m"
    
    # Monitor visualizer only
    while true; do
        if ! kill -0 $VISUALIZER_PID 2>/dev/null; then
            echo -e "\n\033[0;33m◢ VISUALIZER STOPPED ◣\033[0m"
            echo -e "\033[0;31m◢ LUMIUS SYSTEM OFFLINE ◣\033[0m"
            exit 0
        fi
        sleep 2
    done
}

# Handle Ctrl+C
trap 'echo -e "\n\033[0;31m◢ EMERGENCY SHUTDOWN ◣\033[0m"; close_splash; pkill -f "openframeworks-visualizer" 2>/dev/null; exit 0' INT

# Start launcher
launch_with_splash
