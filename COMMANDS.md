# Command Reference - WebGL ANN TypeScript Project

Quick reference for all available commands in the project.

---

## 📦 Installation

```bash
npm install              # Install all dependencies
```

---

## 🛠️ Development Commands

```bash
# Start development server with watch mode
npm run dev              
# → Uses scripts/dev.sh
# → Port 8000 by default
# → Auto-reloads on file changes

# Simple development mode (no script)
npm run dev:simple
# → Basic esbuild watch mode

# Type checking (no build)
npm run type-check
# → Validates TypeScript without generating files
```

---

## 🏗️ Build Commands

```bash
# Production build (recommended)
npm run build:prod
# → Uses scripts/build.sh prod
# → Minified bundle
# → Production optimizations

# Development build
npm run build:dev
# → Uses scripts/build.sh dev
# → Source maps
# → No minification

# Full build (npm version)
npm run build:all
# → Bundle + copy assets
# → Alternative to build:prod

# TypeScript compilation only
npm run build
# → Compiles TS to JS in dist/
```

---

## 🧪 Testing Commands

```bash
# Run all tests
npm test
npm run test
# → Runs Jest test suite

# Watch mode (re-run on changes)
npm run test:watch
# → Continuous testing during development

# Generate coverage report
npm run test:coverage
# → Creates coverage/ directory with reports
```

---

## 🧹 Cleanup Commands

```bash
# Clean build artifacts
npm run clean
# → Removes dist/ folder

# Deep clean (including node_modules)
npm run clean:all
# → Uses scripts/clean.sh --all
# → Removes dist/, node_modules/, package-lock.json
```

---

## 🚀 Deployment Commands

```bash
# Start production server locally
npm start
# → Builds and serves on port 8000
# → Test production build locally

# Create deployment package
npm run deploy
# → Uses scripts/deploy.sh
# → Runs tests first
# → Creates timestamped deployment directory
# → Creates tarball for distribution
```

---

## 🔧 Direct Script Usage

### Build Script
```bash
# Production build
./scripts/build.sh prod

# Development build  
./scripts/build.sh dev

# Shows:
# - Build time
# - Bundle size
# - Files copied
# - Build info
```

### Development Server
```bash
# Start on default port (8000)
./scripts/dev.sh

# Start on custom port
./scripts/dev.sh 3000
```

### Cleanup Script
```bash
# Clean build artifacts
./scripts/clean.sh

# Clean everything
./scripts/clean.sh --all
```

### Deployment Script
```bash
# Create deployment package
./scripts/deploy.sh

# Specify target (optional)
./scripts/deploy.sh production
```

---

## 📋 Code Quality Commands

```bash
# Validate TypeScript types
npm run type-check

# Lint code (placeholder - not configured yet)
npm run lint

# Format code (placeholder - not configured yet)
npm run format
```

---

## 🔄 Git & CI/CD

### Regular Development
```bash
# Push changes (triggers CI/CD)
git add .
git commit -m "Your message"
git push

# CI/CD will automatically:
# - Run tests on Node 16, 18, 20
# - Build the project
# - Run code quality checks
# - Deploy (if on main/master)
```

### Creating Releases
```bash
# Create and push a version tag
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# Release workflow will automatically:
# - Run all tests
# - Build production version
# - Create tar.gz and zip packages
# - Generate SHA256 checksums
# - Create GitHub Release
# - Upload distribution files
```

---

## 🌐 Server Commands

```bash
# Serve dist/ directory (after build)
npx serve dist -p 8000

# Serve on different port
npx serve dist -p 3000

# Serve with different host
npx serve dist -l 8000
```

---

## 📊 Useful Commands

### View Build Info
```bash
# After building, view metadata
cat dist/build-info.json
```

### Check Bundle Size
```bash
# After building
du -h dist/bundle.js
ls -lh dist/bundle.js
```

### View Project Structure
```bash
tree -L 2 -I 'node_modules|.git'
```

### Find TypeScript Files
```bash
find src -name "*.ts"
```

### Count Lines of Code
```bash
find src -name "*.ts" | xargs wc -l
```

---

## 🎯 Common Workflows

### Starting Development
```bash
npm install          # First time only
npm run dev          # Start development
# Edit files → auto-reload
```

### Before Committing
```bash
npm run type-check   # Check types
npm test            # Run tests
git add .
git commit -m "..."
git push
```

### Creating Production Build
```bash
npm run build:prod   # Or ./scripts/build.sh prod
npm start           # Test locally
# Deploy dist/ to server
```

### Deploying to Production
```bash
npm run deploy
# Upload deploy-*.tar.gz to server
# Or let CI/CD handle it automatically
```

### Creating a Release
```bash
# Update version in package.json
npm version patch    # 1.0.0 → 1.0.1
# or
npm version minor    # 1.0.0 → 1.1.0
# or
npm version major    # 1.0.0 → 2.0.0

# Push with tags
git push && git push --tags

# GitHub Actions will create release automatically
```

---

## 🔍 Debugging Commands

```bash
# Build with verbose output
./scripts/build.sh dev 2>&1 | tee build.log

# Check for TypeScript errors
npx tsc --noEmit

# Run single test file
npm test -- tests/Neuron.test.ts

# Run tests with verbose output
npm test -- --verbose

# Check for security vulnerabilities
npm audit

# Fix vulnerabilities (if possible)
npm audit fix
```

---

## 📦 Package Management

```bash
# Install new dependency
npm install package-name

# Install dev dependency
npm install -D package-name

# Update dependencies
npm update

# Check outdated packages
npm outdated

# List installed packages
npm list --depth=0
```

---

## ⚡ Quick Reference

| Task | Command |
|------|---------|
| **Install** | `npm install` |
| **Dev Server** | `npm run dev` |
| **Build Prod** | `npm run build:prod` |
| **Test** | `npm test` |
| **Test Watch** | `npm run test:watch` |
| **Type Check** | `npm run type-check` |
| **Clean** | `npm run clean` |
| **Start Server** | `npm start` |
| **Deploy** | `npm run deploy` |
| **Release** | `git tag v1.0.0 && git push --tags` |

---

## 🎓 Tips

1. **Use `npm run dev`** for development - it has watch mode
2. **Run `npm test`** before committing changes
3. **Use `npm run type-check`** to catch type errors early
4. **The build scripts show useful info** - watch the output
5. **CI/CD runs automatically** on push - check GitHub Actions tab
6. **Create releases with tags** - GitHub Actions handles the rest

---

## 📞 Help

- Run any script with `--help` (if supported)
- Check `package.json` for all available scripts
- See documentation files for detailed guides
- All scripts have colored output for easy reading

---

**Last Updated:** January 30, 2026
**Project:** WebGL ANN TypeScript
