// src/core/rules/random.ts

/**
 * 🔐 Custom Random Bytes Generator
 * Uses multiple entropy sources for better randomness
 */

export class RandomGenerator {
  private static instance: RandomGenerator;
  private pool: Uint8Array;
  private poolIndex: number = 0;

  private constructor() {
    // Initialize entropy pool
    this.pool = new Uint8Array(512);
    this.reseed();
  }

  static getInstance(): RandomGenerator {
    if (!RandomGenerator.instance) {
      RandomGenerator.instance = new RandomGenerator();
    }
    return RandomGenerator.instance;
  }

  /**
   * Generate random bytes
   */
  randomBytes(length: number): Uint8Array {
    const result = new Uint8Array(length);
    
    for (let i = 0; i < length; i++) {
      if (this.poolIndex >= this.pool.length) {
        this.reseed();
      }
      result[i] = this.pool[this.poolIndex++];
    }
    
    return result;
  }

  /**
   * Reseed entropy pool
   */
  private reseed(): void {
    // Collect entropy from various sources
    const entropy = this.collectEntropy();
    
    // Mix entropy into pool using XOR
    for (let i = 0; i < this.pool.length; i++) {
      this.pool[i] ^= entropy[i % entropy.length];
    }
    
    this.poolIndex = 0;
  }

  /**
   * Collect entropy from multiple sources
   */
  private collectEntropy(): Uint8Array {
    const sources: number[] = [];
    
    // Source 1: High-resolution timer
    sources.push(Date.now() & 0xff);
    sources.push((Date.now() >> 8) & 0xff);
    sources.push((Date.now() >> 16) & 0xff);
    sources.push((Date.now() >> 24) & 0xff);
    
    // Source 2: Memory usage (if available)
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const mem = process.memoryUsage();
      sources.push(mem.heapUsed & 0xff);
      sources.push((mem.heapUsed >> 8) & 0xff);
    }
    
    // Source 3: Navigation timing (browser)
    if (typeof performance !== 'undefined') {
      const time = performance.now();
      sources.push(Math.floor(time) & 0xff);
      sources.push(Math.floor(time / 256) & 0xff);
    }
    
    // Source 4: Math.random (fallback)
    for (let i = 0; i < 16; i++) {
      sources.push(Math.floor(Math.random() * 256));
    }
    
    return new Uint8Array(sources);
  }

  /**
   * Generate random integer between min and max
   */
  randomInt(min: number, max: number): number {
    const range = max - min;
    const bytes = this.randomBytes(4);
    const value = (bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3];
    return min + (Math.abs(value) % range);
  }

  /**
   * Generate random string (alphanumeric)
   */
  randomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const bytes = this.randomBytes(length);
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars[bytes[i] % chars.length];
    }
    
    return result;
  }
}

// Export singleton
export const random = RandomGenerator.getInstance();