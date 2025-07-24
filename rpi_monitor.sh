#!/bin/bash

# LUMIUS Raspberry Pi System Monitor
# Monitora temperatura, CPU e GPU durante execução

show_system_status() {
    clear
    echo "🔥 LUMIUS - Monitor Raspberry Pi"
    echo "==============================="
    echo "⏰ $(date)"
    echo ""
    
    # Temperatura
    TEMP=$(vcgencmd measure_temp | cut -d= -f2)
    echo "🌡️  Temperatura: $TEMP"
    
    # CPU Usage
    CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
    echo "💻 CPU Usage: ${CPU_USAGE}%"
    
    # Memory
    MEM_INFO=$(free -h | grep Mem)
    MEM_USED=$(echo $MEM_INFO | awk '{print $3}')
    MEM_TOTAL=$(echo $MEM_INFO | awk '{print $2}')
    echo "🧠 Memória: $MEM_USED / $MEM_TOTAL"
    
    # GPU Memory
    GPU_MEM=$(vcgencmd get_mem gpu)
    echo "🎮 GPU Memory: $GPU_MEM"
    
    # Throttling status
    THROTTLE=$(vcgencmd get_throttled)
    if [ "$THROTTLE" != "throttled=0x0" ]; then
        echo "⚠️  THROTTLING DETECTADO: $THROTTLE"
    else
        echo "✅ Sistema estável"
    fi
    
    echo ""
    echo "Pressione Ctrl+C para sair"
}

# Monitor contínuo
while true; do
    show_system_status
    sleep 2
done