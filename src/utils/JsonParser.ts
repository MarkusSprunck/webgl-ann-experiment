/**
 * Modern JSON Parser - TypeScript
 * Replaces legacy Jsonhelper.js with native JSON.parse
 */

/**
 * Parse JSON text into objects
 * Uses native JSON.parse instead of eval (security improvement)
 */
export function createObjects(jsonText: string): any {
  try {
    return JSON.parse(jsonText);
  } catch (e) {
    console.error('Failed to parse JSON:', e);
    throw new Error('Invalid JSON: ' + (e as Error).message);
  }
}

// Expose globally for compatibility with legacy code
if (typeof window !== 'undefined') {
  (window as any).createObjects = createObjects;
  console.log('createObjects exposed to window');
}
