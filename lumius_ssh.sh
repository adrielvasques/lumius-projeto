#!/bin/bash

# LUMIUS SSH/Remote Launcher
# Integrates with control_panel_remote.py for remote control

SUDO_PASSWORD="Recife32@"
CONTROL_FILE="/home/lumius/lumius_project/openframeworks-visualizer/bin/data/control.txt"

# SSH-friendly status display
show_status() {
    local message="$1"
    local timestamp=$(date '+%H:%M:%S')
    echo "[$timestamp] 🔥 LUMIUS: $message"
}

# Check if running via SSH
check_ssh_session() {
    if [ -n "$SSH_CLIENT" ] || [ -n "$SSH_TTY" ]; then
        echo "🌐 SSH session detected - Remote control mode"
        return 0
    else
        echo "💻 Local session detected"
        return 1
    fi
}

# Create control file directory
setup_control_file() {
    mkdir -p "$(dirname "$CONTROL_FILE")"
    # Initialize with default values
    cat > "$CONTROL_FILE" << EOF
effect:1
rgb_r:255
rgb_g:255
rgb_b:255
speed:1.0
intensity:1.0
volume:50
EOF
    show_status "Control file initialized: $CONTROL_FILE"
}

# Monitor control file for remote commands
monitor_control_file() {
    show_status "Monitoring control file for remote commands..."
    
    while true; do
        if [ -f "$CONTROL_FILE" ]; then
            # Check for shutdown command
            if grep -q "system:shutdown" "$CONTROL_FILE" 2>/dev/null; then
                show_status "SHUTDOWN COMMAND RECEIVED"
                return 1
            fi
            
            # Check for music commands
            if grep -q "music:" "$CONTROL_FILE" 2>/dev/null; then
                MUSIC_CMD=$(grep "music:" "$CONTROL_FILE" | cut -d: -f2)
                show_status "Music command: $MUSIC_CMD"
                # Handle music commands here if needed
                # Remove music command after processing
                sed -i '/music:/d' "$CONTROL_FILE"
            fi
        fi
        sleep 1
    done
}

# Remote launcher (for SSH sessions)
launch_remote() {
    show_status "INITIALIZING REMOTE MODE..."
    
    # Setup control file
    setup_control_file
    
    # Check dependencies
    show_status "CHECKING DEPENDENCIES..."
    
    # Step 1: Compile OpenFrameworks
    show_status "COMPILING VISUAL ENGINE..."
    cd /home/lumius/lumius_project/openframeworks-visualizer
    
    if [ ! -f "Makefile" ]; then
        show_status "ERROR - NO MAKEFILE FOUND"
        exit 1
    fi
    
    # Clean and compile
    echo "$SUDO_PASSWORD" | sudo -S chown -R $USER:$USER . 2>/dev/null || true
    rm -rf obj/ 2>/dev/null || true
    mkdir -p obj/linuxarmv7l/Release/src
    
    if ! make -j2 > build.log 2>&1; then
        show_status "COMPILATION FAILED - Check build.log"
        tail -10 build.log
        exit 1
    fi
    
    show_status "COMPILATION SUCCESSFUL"
    
    # Step 2: Launch visualizer (no local control panel for remote mode)
    show_status "STARTING VISUALIZER FOR REMOTE CONTROL..."
    
    # Set display for SSH X11 forwarding
    export DISPLAY=${DISPLAY:-:0}
    
    ./bin/openframeworks-visualizer 2>&1 | tee visualizer.log &
    VISUALIZER_PID=$!
    
    show_status "REMOTE SYSTEM ACTIVE"
    echo "🎨 Visualizer PID: $VISUALIZER_PID"
    echo "📝 Logs: visualizer.log"
    echo "🎛️  Control File: $CONTROL_FILE"
    echo ""
    echo "📡 Remote Control Instructions:"
    echo "  - Use control_panel_remote.py from another machine"
    echo "  - Connect to IP: $(hostname -I | awk '{print $1}')"
    echo "  - Monitor: ./rpi_monitor.sh"
    echo "  - View logs: tail -f visualizer.log"
    echo ""
    
    # Monitor control file and visualizer
    monitor_control_file &
    MONITOR_PID=$!
    
    while true; do
        if ! kill -0 $VISUALIZER_PID 2>/dev/null; then
            show_status "VISUALIZER STOPPED"
            kill $MONITOR_PID 2>/dev/null
            show_status "SYSTEM OFFLINE"
            exit 0
        fi
        
        if ! kill -0 $MONITOR_PID 2>/dev/null; then
            show_status "SHUTDOWN REQUESTED"
            kill $VISUALIZER_PID 2>/dev/null
            show_status "SYSTEM OFFLINE"
            exit 0
        fi
        
        sleep 2
    done
}

# Main execution
if check_ssh_session; then
    launch_remote
else
    # Local session - use original splash version
    exec ./lumius_splash.sh
fi