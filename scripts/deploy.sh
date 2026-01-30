#!/bin/bash

# Deploy script - builds and prepares for deployment
# Usage: ./scripts/deploy.sh [target]

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

TARGET="${1:-production}"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo -e "${GREEN}🚀 WebGL ANN Deployment Script${NC}"
echo -e "${YELLOW}Target: $TARGET${NC}"
echo ""

cd "$PROJECT_ROOT"

# Step 1: Run tests
echo -e "${CYAN}Running tests...${NC}"
npm test
echo -e "${GREEN}✓ Tests passed${NC}"
echo ""

# Step 2: Build for production
echo -e "${CYAN}Building for production...${NC}"
./scripts/build.sh prod
echo -e "${GREEN}✓ Production build completed${NC}"
echo ""

# Step 3: Create deployment package
echo -e "${CYAN}Creating deployment package...${NC}"
DEPLOY_DIR="deploy-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$DEPLOY_DIR"

# Copy dist contents
cp -r dist/* "$DEPLOY_DIR/"

# Create deployment manifest
cat > "$DEPLOY_DIR/MANIFEST.txt" <<EOF
WebGL ANN Deployment Package
============================

Build Date: $(date)
Git Commit: $(git rev-parse HEAD 2>/dev/null || echo 'unknown')
Git Branch: $(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')
Version: $(node -p "require('./package.json').version")
Target: $TARGET

Files included:
$(cd "$DEPLOY_DIR" && find . -type f | sort)

Deployment Instructions:
1. Upload all files to your web server
2. Ensure the server serves static files
3. Access index.html from a web browser
4. Verify WebGL is enabled in the browser

Support: markus@example.com
EOF

echo -e "${GREEN}✓ Deployment package created: $DEPLOY_DIR${NC}"
echo ""

# Step 4: Create tarball
echo -e "${CYAN}Creating tarball...${NC}"
TARBALL="${DEPLOY_DIR}.tar.gz"
tar -czf "$TARBALL" "$DEPLOY_DIR"
echo -e "${GREEN}✓ Tarball created: $TARBALL${NC}"
echo ""

# Summary
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}Deployment Package Ready${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "Directory: ${YELLOW}$DEPLOY_DIR${NC}"
echo -e "Tarball:   ${YELLOW}$TARBALL${NC}"
echo -e "Size:      ${YELLOW}$(du -h "$TARBALL" | cut -f1)${NC}"
echo ""
echo -e "Next steps:"
echo -e "1. Review contents: ${CYAN}ls -la $DEPLOY_DIR${NC}"
echo -e "2. Test locally:    ${CYAN}npx serve $DEPLOY_DIR -p 8000${NC}"
echo -e "3. Deploy tarball:  ${CYAN}scp $TARBALL user@server:/path/${NC}"
echo ""
