#!/bin/bash

# Development server script with watch mode
# Usage: ./scripts/dev.sh [port]

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

PORT="${1:-8000}"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo -e "${GREEN}🔥 WebGL ANN Development Server${NC}"
echo -e "${YELLOW}Port: $PORT${NC}"
echo ""

cd "$PROJECT_ROOT"

# Initial build
echo -e "${CYAN}Building application...${NC}"
./scripts/build.sh dev

echo ""
echo -e "${GREEN}Starting development server...${NC}"
echo -e "Server will be available at: ${YELLOW}http://localhost:$PORT${NC}"
echo -e "Press Ctrl+C to stop"
echo ""

# Start esbuild in watch mode in background
esbuild src/app/index.ts \
  --bundle \
  --sourcemap \
  --outfile=dist/bundle.js \
  --watch \
  --define:process.env.NODE_ENV=\"development\" &

ESBUILD_PID=$!

# Start serve
npx serve dist -p "$PORT" &
SERVE_PID=$!

# Cleanup function
cleanup() {
  echo ""
  echo -e "${YELLOW}Shutting down...${NC}"
  kill $ESBUILD_PID 2>/dev/null || true
  kill $SERVE_PID 2>/dev/null || true
  exit 0
}

# Register cleanup on exit
trap cleanup SIGINT SIGTERM

# Wait for processes
wait
