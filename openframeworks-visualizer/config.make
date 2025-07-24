# Raspberry Pi 4 specific configuration
OF_ROOT = /home/lumius/openFrameworks

# Platform specific settings for Raspberry Pi 4
PROJECT_OPTIMIZATION_CFLAGS_RELEASE = -O2
PROJECT_OPTIMIZATION_CFLAGS_DEBUG = -g3

# Use hardware acceleration if available
PROJECT_CFLAGS = -DTARGET_RASPBERRY_PI