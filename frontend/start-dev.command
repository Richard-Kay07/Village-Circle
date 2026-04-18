#!/bin/bash
# Double-click this file in Finder to install deps (if needed) and start the Next.js dev server.
# Then open http://localhost:5784 in your browser (or the URL shown in this window).

set -e
cd "$(dirname "$0")"

echo "VillageCircle360 frontend – starting dev server"
echo "-----------------------------------------------"

if ! command -v npm >/dev/null 2>&1; then
  echo "ERROR: npm not found. Install Node.js LTS from https://nodejs.org/"
  read -r _
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "Running npm install (first time)..."
  npm install
fi

echo ""
echo "Starting Next.js on port 5784..."
echo "When you see 'Ready', open: http://localhost:5784"
echo ""

# Open browser shortly after server may be up (user can refresh if needed)
(sleep 3 && open "http://localhost:5784" 2>/dev/null) &

exec npm run dev
