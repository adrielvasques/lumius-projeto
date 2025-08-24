#!/bin/bash

# Restore Raspberry Pi desktop elements
echo "🖥️  Restoring desktop..."

export DISPLAY=:0

# Restore taskbar
lxpanel --profile LXDE-pi &

# Restore desktop
pcmanfm --desktop &

echo "✅ Desktop restored"