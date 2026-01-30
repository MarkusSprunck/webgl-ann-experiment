# WebGL ANN TypeScript Project

A neural network visualization using WebGL and TypeScript.

## New Folder Structure

```
webgl-ann-experiment/
├── src/                          # Source code
│   ├── core/                     # Core ANN logic (Network, Layer, Neuron, Link, Pattern)
│   ├── factories/                # Factory patterns (ModelFactory)
│   └── app/                      # Application entry points (index.ts, remoteEntry.ts)
├── tests/                        # Test files
├── libs/                         # Third-party libraries (three.js, Detector.js, etc.)
├── public/                       # Static assets (HTML, CSS)
├── legacy/                       # Legacy WebGL renderer code
├── dist/                         # Build output (gitignored)
├── config/                       # Configuration files (archived)
└── typescript/                   # Old structure (can be removed after verification)
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation

```bash
npm install
```

### Development

```bash
# Build and serve the application
npm start

# Build only
npm run build:all

# Run in development mode with watch
npm run dev

# Run tests
npm test

# Clean build artifacts
npm clean
```

### Scripts

- `npm run clean` - Remove dist folder
- `npm run build` - Compile TypeScript
- `npm run bundle` - Bundle application with esbuild
- `npm run copy-assets` - Copy static assets to dist
- `npm run build:all` - Full build (bundle + copy assets)
- `npm test` - Run Jest tests
- `npm run dev` - Development mode with watch
- `npm start` - Build and serve on http://localhost:8000

## Application Features

- **Train**: Train the neural network
- **Reset**: Reset network weights
- **Recall**: Automatically recall patterns at configurable intervals
- **Stop**: Stop pattern recall
- **Interval (ms)**: Configure recall interval in milliseconds

## Architecture

### Core Components

- **Network**: Main neural network class
- **Layer**: Layer of neurons
- **Neuron**: Individual neuron with activation
- **Link**: Connection between neurons
- **Pattern**: Training pattern data

### Application Flow

1. HTML loads third-party libraries (three.js, Detector.js)
2. Legacy WebGL renderer initializes
3. TypeScript bundle loads as module
4. Application initializes network and binds UI controls
5. WebGL renders network visualization

## Key Changes from Old Structure

1. **Clear separation**: Source, tests, libs, and output are now in separate folders
2. **Simplified builds**: Single `dist/` output directory
3. **Better organization**: Core logic separated from application code
4. **Improved maintainability**: Easy to navigate and understand
5. **Path aliases**: Optional TypeScript path aliases for cleaner imports

## Browser Support

Requires a browser with WebGL support. The application automatically detects WebGL capability.

## License

(Add your license here)
