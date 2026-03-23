#!/bin/sh
set -e

STATUS_FILE="/app/tldr-sync.json"
TLDR_DIR="/tldr-pages"

# Fix ownership of the volume mount so the nextjs user can read the pages
chown -R nextjs:nodejs "$TLDR_DIR" 2>/dev/null || true

# Allow git to operate on the volume for ALL users (system-wide, non-fatal)
git config --system --add safe.directory "$TLDR_DIR" || true

# Write initial syncing status (runs as root, /app is accessible)
printf '{"status":"syncing","message":"Updating tldr-pages..."}' > "$STATUS_FILE"

# Run git sync in background as root (avoids permission complexity on the volume)
(
  if [ -d "${TLDR_DIR}/.git" ]; then
    echo "Pulling latest tldr-pages..."
    if git -C "$TLDR_DIR" fetch --depth=1 origin main 2>&1 \
      && git -C "$TLDR_DIR" reset --hard origin/main 2>&1; then
      COMMIT=$(git -C "$TLDR_DIR" rev-parse HEAD 2>/dev/null || echo "")
      echo "tldr-pages sync complete. commit=$COMMIT"
      printf '{"status":"ready","message":"tldr-pages updated successfully","commit":"%s"}' "$COMMIT" > "$STATUS_FILE"
    else
      printf '{"status":"error","message":"Failed to pull tldr-pages"}' > "$STATUS_FILE"
    fi
  else
    echo "Cloning tldr-pages (this may take a minute)..."
    if git clone --depth=1 https://github.com/tldr-pages/tldr "$TLDR_DIR" 2>&1; then
      COMMIT=$(git -C "$TLDR_DIR" rev-parse HEAD 2>/dev/null || echo "")
      echo "tldr-pages clone complete. commit=$COMMIT"
      printf '{"status":"ready","message":"tldr-pages cloned successfully","commit":"%s"}' "$COMMIT" > "$STATUS_FILE"
    else
      printf '{"status":"error","message":"Failed to clone tldr-pages"}' > "$STATUS_FILE"
    fi
  fi
) &

# Start the Next.js server as nextjs user
echo "Starting tldr-webui..."
exec su-exec nextjs:nodejs node server.js
