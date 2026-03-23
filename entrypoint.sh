#!/bin/sh
set -e

STATUS_FILE="/app/tldr-sync.json"
TLDR_DIR="/tldr-pages"

# Fix ownership of the volume mount so the nextjs user can read the pages
chown -R nextjs:nodejs "$TLDR_DIR" 2>/dev/null || true

# Write initial syncing status (runs as root, /app is accessible)
printf '{"status":"syncing","message":"Updating tldr-pages..."}' > "$STATUS_FILE"

# Run git sync in background as root (avoids permission complexity on the volume)
(
  if [ -d "${TLDR_DIR}/.git" ]; then
    echo "Pulling latest tldr-pages..."
    git -C "$TLDR_DIR" pull --depth=1 --ff-only origin main 2>&1 \
      && printf '{"status":"ready","message":"tldr-pages updated successfully"}' > "$STATUS_FILE" \
      || printf '{"status":"error","message":"Failed to pull tldr-pages"}' > "$STATUS_FILE"
  else
    echo "Cloning tldr-pages (this may take a minute)..."
    git clone --depth=1 https://github.com/tldr-pages/tldr "$TLDR_DIR" 2>&1 \
      && printf '{"status":"ready","message":"tldr-pages cloned successfully"}' > "$STATUS_FILE" \
      || printf '{"status":"error","message":"Failed to clone tldr-pages"}' > "$STATUS_FILE"
  fi
) &

# Start the Next.js server as nextjs user
echo "Starting tldr-webui..."
exec su-exec nextjs:nodejs node server.js
