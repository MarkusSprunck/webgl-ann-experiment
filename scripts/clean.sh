#!/bin/bash

# Clean script - removes all build artifacts
# Usage: ./scripts/clean.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo -e "${YELLOW}🧹 Cleaning build artifacts...${NC}"
echo ""

cd "$PROJECT_ROOT"

# Remove dist folder
if [ -d "dist" ]; then
  rm -rf dist
  echo -e "${GREEN}✓${NC} Removed dist/"
fi

# Remove node_modules (optional, with confirmation)
if [ "$1" = "--all" ]; then
  if [ -d "node_modules" ]; then
    echo -e "${RED}Removing node_modules...${NC}"
    rm -rf node_modules
    echo -e "${GREEN}✓${NC} Removed node_modules/"
  fi

  if [ -f "package-lock.json" ]; then
    rm -f package-lock.json
    echo -e "${GREEN}✓${NC} Removed package-lock.json"
  fi
fi

# Remove log files
find . -name "*.log" -type f -delete 2>/dev/null || true
echo -e "${GREEN}✓${NC} Removed log files"

# Remove test coverage
if [ -d "coverage" ]; then
  rm -rf coverage
  echo -e "${GREEN}✓${NC} Removed coverage/"
fi

echo ""
echo -e "${GREEN}✓ Clean completed!${NC}"

if [ "$1" != "--all" ]; then
  echo ""
  echo -e "Tip: Use ${YELLOW}./scripts/clean.sh --all${NC} to also remove node_modules"
fi
