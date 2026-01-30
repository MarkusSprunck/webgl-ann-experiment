# WebGL ANN TypeScript

Neural network visualization with 3D WebGL rendering, real-time training/test monitoring, and interactive RMS charts.

## Features

- **Neural Network** - Backpropagation training with continuous mode
- **3D Visualization** - Real-time WebGL rendering of network activity
- **Train/Test Split** - 80/20 random split with dual RMS tracking (green=train, blue=test)
- **Interactive Chart** - Live Chart.js visualization showing complete training history
- **Overfitting Detection** - Monitor test RMS to detect overfitting
- **Pattern Recall** - Automatic pattern cycling (50ms interval)

## UI Controls

- **Train** - Start continuous training
- **Stop** - Stop training/recall
- **Recall** - Cycle through patterns
- **Reset** - Reset network and clear data

## Folder Structure

```
webgl-ann-experiment/
├── src/                          # TypeScript source code
│   ├── core/                     # Neural network (Network, Layer, Neuron, Link, Pattern)
│   ├── factories/                # ModelFactory with train/test split
│   ├── renderer/                 # WebGL 3D renderer (THREE.js)
│   ├── ui/                       # UI components (RMEChart)
│   ├── bootstrap/                # Application bootstrap
│   └── app/                      # Main application (index.ts, config.ts)
├── public/                       # Static assets
│   ├── index.html                # Main HTML
│   ├── bootstrap.js              # Standalone bootstrap
│   └── styles/                   # CSS files
├── tests/                        # Jest tests
├── libs/                         # Third-party (three.js, Detector.js, Jsonhelper.js)
├── scripts/                      # Build scripts (build.sh, dev.sh, deploy.sh)
├── legacy/                       # Original JS (kept for reference)
└── dist/                         # Build output (generated)
```

## Quick Start

```bash
npm install
npm start
# Open http://localhost:8000
```

## Scripts

- `npm start` - Build and serve on http://localhost:8000
- `npm run build` - Production build
- `npm run dev` - Development mode with watch
- `npm test` - Run tests
- `npm run clean` - Remove dist folder


## How It Works

1. **Data Split**: 200 patterns → 160 training (80%) + 40 test (20%)
2. **Training**: Uses only training set for backpropagation
3. **Evaluation**: Calculates RMS on both train and test sets
4. **Visualization**: Real-time 3D WebGL + Chart.js with dual RMS curves

**Interpreting Results:**
- Both lines decrease together = Good training
- Green ↓, Blue ↑ = Overfitting (stop training)
- Both plateau = Underfitting (train longer)

## Architecture

- **Core** (`src/core/`) - Network, Layer, Neuron, Link, Pattern
- **App** (`src/app/`) - Main logic, UI binding, training loop
- **Renderer** (`src/renderer/`) - WebGL 3D visualization (THREE.js)
- **UI** (`src/ui/`) - Chart.js RMS visualization
- **Factory** (`src/factories/`) - Network creation, train/test split

## Tech Stack

TypeScript • THREE.js • Chart.js • esbuild • Jest

## Requirements

WebGL-capable browser (Chrome, Firefox, Safari, Edge)

## Performance

Bundle: ~28KB • Training: ~1000 iter/sec • UI: 60 FPS

## Development

### Code Structure

```typescript
// Create network
const factory = new ModelFactory();
const network = factory.createBindTestPattern();

// Create train/test split (80/20)
factory.createTrainTestSplit();

// Train continuously
while (!stopTraining) {
  // Random training pattern
  const trainIndex = Math.floor(Math.random() * factory.getTrainSize());
  factory.activateTrainPattern(trainIndex);
  
  // Backpropagation
  network.trainBackpropagation(factory, 10, 10);
  
  // Evaluate
  const trainRms = network.rmsForIndices(factory, factory.trainIndices);
  const testRms = network.rmsForIndices(factory, factory.testIndices);
  
  // Update visualization
  updateDisplay(trainRms, testRms);
}
```

### Adding Tests

```typescript
// tests/MyFeature.test.ts
import { Network } from '../src/core/Network';

describe('Network', () => {
  it('should train and reduce error', () => {
    const network = new Network();
    // ... test implementation
  });
});
```

### Building

The build process:
1. Cleans dist folder
2. Creates directory structure
3. Bundles TypeScript with esbuild
4. Copies static assets (HTML, CSS, libs)
5. Generates build-info.json

## Troubleshooting

### Chart Not Showing
1. Check browser console for errors
2. Verify Chart.js loaded: `typeof Chart !== 'undefined'`
3. Try test page: http://localhost:8000/test-chart.html
4. See `TROUBLESHOOTING.md` for detailed steps

### Training Not Working
1. Check console for "Train/Test split created" message
2. Click Train button (not automatic)
3. Watch for RMS updates in header
4. Verify Stop button is enabled during training

### Build Errors
```bash
# Clean and rebuild
npm run clean
npm install
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run `npm test` and `npx tsc --noEmit`
6. Submit a pull request

## License

MIT License - See [LICENSE](LICENSE) file for details

## Acknowledgments

- Original WebGL renderer concept
- THREE.js for 3D visualization
- Chart.js for real-time charting
- TypeScript for type safety

