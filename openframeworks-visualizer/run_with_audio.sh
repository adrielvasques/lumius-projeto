#!/bin/bash

# Audio wrapper for openFrameworks with Bluetooth support
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

# Launch OpenFrameworks with proper audio environment
exec ./bin/openframeworks-visualizer "$@"