#!/bin/bash

# Build script for WebGL ANN TypeScript project
# Usage: ./scripts/build.sh [dev|prod]

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
MODE="${1:-prod}"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="$PROJECT_ROOT/dist"

echo -e "${GREEN}🚀 WebGL ANN Build Script${NC}"
echo -e "${YELLOW}Mode: $MODE${NC}"
echo -e "${YELLOW}Project root: $PROJECT_ROOT${NC}"
echo ""

# Function to print status
print_status() {
  echo -e "${GREEN}✓${NC} $1"
}

print_error() {
  echo -e "${RED}✗${NC} $1"
}

# Change to project root
cd "$PROJECT_ROOT"

# Step 1: Clean
echo "Step 1: Cleaning dist folder..."
if [ -d "$DIST_DIR" ]; then
  rm -rf "$DIST_DIR"
  print_status "Removed old dist folder"
fi

# Step 2: Create dist structure
echo ""
echo "Step 2: Creating dist structure..."
mkdir -p "$DIST_DIR/libs" "$DIST_DIR/styles"
print_status "Created dist directories"

# Step 3: Bundle TypeScript
echo ""
echo "Step 3: Bundling TypeScript..."
if [ "$MODE" = "dev" ]; then
  npx esbuild src/app/index.ts \
    --bundle \
    --sourcemap \
    --outfile="$DIST_DIR/bundle.js" \
    --define:process.env.NODE_ENV=\"development\"
else
  npx esbuild src/app/index.ts \
    --bundle \
    --sourcemap \
    --minify \
    --outfile="$DIST_DIR/bundle.js" \
    --define:process.env.NODE_ENV=\"production\"
fi
print_status "Bundled TypeScript (mode: $MODE)"

# Step 4: Copy static assets
echo ""
echo "Step 4: Copying static assets..."
cp public/index.html "$DIST_DIR/"
print_status "Copied index.html"

cp public/bootstrap.js "$DIST_DIR/"
print_status "Copied bootstrap.js"

if [ -d "public/styles" ]; then
  cp public/styles/* "$DIST_DIR/styles/" 2>/dev/null || true
  print_status "Copied CSS files"
fi

# Step 5: Copy libraries
echo ""
echo "Step 5: Copying third-party libraries..."
cp libs/* "$DIST_DIR/libs/"
print_status "Copied libraries"


# Step 6: Generate build info
echo ""
echo "Step 6: Generating build info..."
cat > "$DIST_DIR/build-info.json" <<EOF
{
  "buildDate": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "buildMode": "$MODE",
  "version": "$(node -p "require('./package.json').version")",
  "nodeVersion": "$(node -v)",
  "gitCommit": "$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')",
  "gitBranch": "$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')"
}
EOF
print_status "Generated build-info.json"

# Step 7: Display build summary
echo ""
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}Build Summary${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"

if [ -f "$DIST_DIR/bundle.js" ]; then
  BUNDLE_SIZE=$(du -h "$DIST_DIR/bundle.js" | cut -f1)
  echo -e "Bundle size: ${YELLOW}$BUNDLE_SIZE${NC}"
fi

if [ -f "$DIST_DIR/bundle.js.map" ]; then
  MAP_SIZE=$(du -h "$DIST_DIR/bundle.js.map" | cut -f1)
  echo -e "Source map:  ${YELLOW}$MAP_SIZE${NC}"
fi

echo -e "Output dir:  ${YELLOW}$DIST_DIR${NC}"
echo -e "Build mode:  ${YELLOW}$MODE${NC}"

# Count files
FILE_COUNT=$(find "$DIST_DIR" -type f | wc -l | tr -d ' ')
echo -e "Total files: ${YELLOW}$FILE_COUNT${NC}"

echo ""
print_status "Build completed successfully!"
echo ""
echo -e "To start the server: ${YELLOW}npm start${NC}"
echo -e "Or run: ${YELLOW}npx serve dist -p 8000${NC}"
