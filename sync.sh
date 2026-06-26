#!/bin/bash
# Sync files from virtual document portal to physical directories
echo "Syncing workspace to physical run directory..."
mkdir -p /home/anirudhvol2/JMD/frontend/src/pages
mkdir -p /home/anirudhvol2/JMD/backend

cp /run/user/1000/doc/c1d58c5c/JMD/package.json /home/anirudhvol2/JMD/
cp /run/user/1000/doc/c1d58c5c/JMD/frontend/package.json /home/anirudhvol2/JMD/frontend/
cp /run/user/1000/doc/c1d58c5c/JMD/frontend/vite.config.js /home/anirudhvol2/JMD/frontend/
cp /run/user/1000/doc/c1d58c5c/JMD/frontend/index.html /home/anirudhvol2/JMD/frontend/

# Copy src contents
cp -r /run/user/1000/doc/c1d58c5c/JMD/frontend/src/* /home/anirudhvol2/JMD/frontend/src/ 2>/dev/null || true

# Copy backend contents
cp -r /run/user/1000/doc/c1d58c5c/JMD/backend/* /home/anirudhvol2/JMD/backend/ 2>/dev/null || true

echo "Sync completed."
