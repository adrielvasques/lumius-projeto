#!/bin/bash

# LUMIUS Remote Control via SSH
# Control LUMIUS system remotely

show_menu() {
    clear
    echo "🎛️  LUMIUS Remote Control"
    echo "========================"
    echo ""
    echo "1) Start LUMIUS System"
    echo "2) Stop LUMIUS System" 
    echo "3) View System Status"
    echo "4) View Live Logs"
    echo "5) System Monitor"
    echo "6) Restart System"
    echo "7) Exit"
    echo ""
    echo -n "Choose option [1-7]: "
}

start_system() {
    echo "🚀 Starting LUMIUS..."
    ./lumius_ssh.sh &
    echo "✅ System started in background"
    sleep 2
}

stop_system() {
    echo "🛑 Stopping LUMIUS..."
    pkill -f "control_panel.py"
    pkill -f "openframeworks-visualizer"
    pkill -f "lumius_ssh.sh"
    echo "✅ System stopped"
    sleep 2
}

show_status() {
    echo "📊 LUMIUS System Status"
    echo "======================"
    
    if pgrep -f "control_panel.py" > /dev/null; then
        echo "✅ Control Panel: RUNNING"
    else
        echo "❌ Control Panel: STOPPED"
    fi
    
    if pgrep -f "openframeworks-visualizer" > /dev/null; then
        echo "✅ Visualizer: RUNNING"
    else
        echo "❌ Visualizer: STOPPED"
    fi
    
    echo ""
    echo "Press Enter to continue..."
    read
}

view_logs() {
    echo "📝 Live Logs (Ctrl+C to exit)"
    echo "============================="
    if [ -f "/home/lumius/lumius_project/openframeworks-visualizer/visualizer.log" ]; then
        tail -f /home/lumius/lumius_project/openframeworks-visualizer/visualizer.log
    else
        echo "No log file found"
        sleep 2
    fi
}

system_monitor() {
    ./rpi_monitor.sh
}

restart_system() {
    echo "🔄 Restarting LUMIUS..."
    stop_system
    sleep 3
    start_system
}

# Main menu loop
while true; do
    show_menu
    read choice
    
    case $choice in
        1) start_system ;;
        2) stop_system ;;
        3) show_status ;;
        4) view_logs ;;
        5) system_monitor ;;
        6) restart_system ;;
        7) echo "👋 Goodbye!"; exit 0 ;;
        *) echo "❌ Invalid option"; sleep 1 ;;
    esac
done