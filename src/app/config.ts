/**
 * Environment configuration loader
 */

export interface EnvironmentConfig {
  recallIntervalMs: number;
  trainingIterations: number;
  learningRate: number;
  debug: boolean;
  logLevel: 'verbose' | 'error' | 'silent';
  webgl: {
    antialias: boolean;
    alpha: boolean;
    preserveDrawingBuffer: boolean;
  };
  server?: {
    port: number;
    host: string;
  };
}

const environments: Record<string, EnvironmentConfig> = {
  development: {
    recallIntervalMs: 50,
    trainingIterations: 100,
    learningRate: 0.3,
    debug: true,
    logLevel: 'verbose',
    webgl: {
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    },
    server: {
      port: 8000,
      host: 'localhost',
    },
  },
  production: {
    recallIntervalMs: 50,
    trainingIterations: 1000,
    learningRate: 0.3,
    debug: false,
    logLevel: 'error',
    webgl: {
      antialias: true,
      alpha: false,
      preserveDrawingBuffer: false,
    },
    server: {
      port: 8080,
      host: '0.0.0.0',
    },
  },
  test: {
    recallIntervalMs: 10,
    trainingIterations: 10,
    learningRate: 0.3,
    debug: true,
    logLevel: 'silent',
    webgl: {
      antialias: false,
      alpha: false,
      preserveDrawingBuffer: false,
    },
  },
};

/**
 * Get current environment name
 */
export function getEnvironment(): string {
  // Check if NODE_ENV is defined (set by build tools)
  // Use globalThis to safely access process in mixed environments
  const proc = (globalThis as any).process;
  if (typeof proc !== 'undefined' && proc.env && proc.env.NODE_ENV) {
    return proc.env.NODE_ENV;
  }

  // Check hostname for production environment
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.startsWith('192.168.')) {
      return 'production';
    }
  }

  // Default to development
  return 'development';
}

/**
 * Load configuration for current environment
 */
export function loadConfig(): EnvironmentConfig {
  const env = getEnvironment();
  const config = environments[env] || environments.development;

  if (config.debug) {
    console.log(`[Config] Loaded environment: ${env}`);
  }

  return config;
}

/**
 * Get configuration value
 */
export function getConfig<K extends keyof EnvironmentConfig>(
  key: K
): EnvironmentConfig[K] {
  const config = loadConfig();
  return config[key];
}

/**
 * Check if in development mode
 */
export function isDevelopment(): boolean {
  return getEnvironment() === 'development';
}

/**
 * Check if in production mode
 */
export function isProduction(): boolean {
  return getEnvironment() === 'production';
}

/**
 * Check if in test mode
 */
export function isTest(): boolean {
  return getEnvironment() === 'test';
}
