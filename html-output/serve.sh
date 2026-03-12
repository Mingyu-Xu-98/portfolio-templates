#!/bin/bash
# Simple server to preview all resume templates
PORT=${1:-8080}
DIR="$(cd "$(dirname "$0")" && pwd)"
echo "Serving resume templates at: http://localhost:$PORT"
echo "Press Ctrl+C to stop"
cd "$DIR" && python3 -m http.server "$PORT"
