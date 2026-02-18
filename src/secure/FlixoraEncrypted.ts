// src/secure/FlixoraEncrypted.ts

import { AES256, PBKDF2, random } from '../core/crypto';
import { 
  EncryptedData, 
  StoredKey, 
  KeyMetadata,
  KeyStorage,
  KeyMetadataStorage,
  EncryptionConfig,
  FlixoraEncryptedOptions 
} from './types';

/**
 * 🔐 FlixoraEncrypted - Secure Key Management Module
 * ✅ Using custom crypto implementation (no external dependencies)
 */
export class FlixoraEncrypted {
  private static instance: FlixoraEncrypted;
  
  private keyStore: KeyStorage = new Map();
  private metadataStore: KeyMetadataStorage = new Map();
  private encryptionKey: Uint8Array;
  private config: Required<EncryptionConfig>;
  private namespace: string;
  private enableLogging: boolean;
  private cleanupInterval: NodeJS.Timeout | null = null;

  private constructor(options: FlixoraEncryptedOptions = {}) {
    this.config = {
      algorithm: 'aes-256-gcm',
      keyDerivation: 'pbkdf2',
      iterations: 100000,
      memorySafe: true,
      autoEncryptTimeout: 60000,
      ...options.config
    };

    this.namespace = options.namespace || 'default';
    this.enableLogging = options.enableLogging || false;

    // Initialize encryption key using custom random generator
    if (options.masterKey) {
      this.encryptionKey = PBKDF2.deriveKey(
        options.masterKey,
        undefined,
        this.config.iterations,
        32
      );
    } else {
      this.encryptionKey = random.randomBytes(32);
    }

    this.startCleanupInterval();
  }

  public static getInstance(options?: FlixoraEncryptedOptions): FlixoraEncrypted {
    if (!FlixoraEncrypted.instance) {
      FlixoraEncrypted.instance = new FlixoraEncrypted(options);
    }
    return FlixoraEncrypted.instance;
  }

  public storeKey(keyName: string, keyValue: string): void {
    try {
      if (!keyName || !keyValue) {
        throw new Error('Key name and value are required');
      }

      const namespacedKey = this.getNamespacedKey(keyName);
      
      // Encrypt using custom AES implementation
      const encrypted = AES256.encrypt(keyValue, this.encryptionKey);

      const now = Date.now();
      this.keyStore.set(namespacedKey, {
        encrypted,
        timestamp: now,
        expiresAt: now + this.config.autoEncryptTimeout
      });

      this.metadataStore.set(namespacedKey, {
        name: keyName,
        createdAt: now,
        lastAccessed: now,
        accessCount: 0
      });

      this.log(`✅ Key stored securely: ${keyName}`);

      if (this.config.memorySafe) {
        (keyValue as any) = null;
      }
    } catch (error) {
      this.log(`❌ Failed to store key: ${keyName}`, error);
      throw new Error(`Key storage failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  public getKey(keyName: string): string {
    try {
      const namespacedKey = this.getNamespacedKey(keyName);
      
      if (!this.keyStore.has(namespacedKey)) {
        throw new Error(`Key not found: ${keyName}`);
      }

      const stored = this.keyStore.get(namespacedKey)!;

      if (Date.now() > stored.expiresAt) {
        this.autoEncryptKey(namespacedKey);
      }

      const metadata = this.metadataStore.get(namespacedKey)!;
      metadata.lastAccessed = Date.now();
      metadata.accessCount++;
      this.metadataStore.set(namespacedKey, metadata);

      // Decrypt using custom AES implementation
      const decrypted = AES256.decrypt(stored.encrypted, this.encryptionKey);

      this.log(`🔑 Key accessed: ${keyName}`);

      return decrypted;
    } catch (error) {
      this.log(`❌ Failed to retrieve key: ${keyName}`, error);
      throw new Error(`Key retrieval failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  public hasKey(keyName: string): boolean {
    return this.keyStore.has(this.getNamespacedKey(keyName));
  }

  public removeKey(keyName: string): void {
    const namespacedKey = this.getNamespacedKey(keyName);
    this.keyStore.delete(namespacedKey);
    this.metadataStore.delete(namespacedKey);
    this.log(`🗑️ Key removed: ${keyName}`);
  }

  public wipeAllKeys(): void {
    const keyCount = this.keyStore.size;
    this.keyStore.clear();
    this.metadataStore.clear();
    this.log(`⚠️ Wiped all keys (${keyCount} keys removed)`);
  }

  private autoEncryptKey(namespacedKey: string): void {
    const stored = this.keyStore.get(namespacedKey);
    if (!stored) return;

    try {
      const value = AES256.decrypt(stored.encrypted, this.encryptionKey);
      const newEncrypted = AES256.encrypt(value, this.encryptionKey);

      const now = Date.now();
      this.keyStore.set(namespacedKey, {
        encrypted: newEncrypted,
        timestamp: now,
        expiresAt: now + this.config.autoEncryptTimeout
      });

      this.log(`🔄 Auto-encrypted key: ${namespacedKey}`);
    } catch (error) {
      this.log(`❌ Auto-encryption failed for: ${namespacedKey}`, error);
    }
  }

  private cleanupExpiredKeys(): void {
    const now = Date.now();
    let expiredCount = 0;

    for (const [key, stored] of this.keyStore.entries()) {
      if (now > stored.expiresAt) {
        this.autoEncryptKey(key);
        expiredCount++;
      }
    }

    if (expiredCount > 0) {
      this.log(`🧹 Auto-encrypted ${expiredCount} expired keys`);
    }
  }

  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredKeys();
    }, 30000);

    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  public shutdown(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    this.wipeAllKeys();
    
    if (this.config.memorySafe) {
      this.encryptionKey.fill(0);
    }
    
    this.log('🛑 FlixoraEncrypted shutdown complete');
  }

  private getNamespacedKey(keyName: string): string {
    return `${this.namespace}:${keyName}`;
  }

  private log(message: string, data?: any): void {
    if (!this.enableLogging) return;
    console.log(`[FlixoraEncrypted] ${message}`, data ? data : '');
  }

  public getKeyMetadata(keyName: string): KeyMetadata | undefined {
    return this.metadataStore.get(this.getNamespacedKey(keyName));
  }

  public getKeyNames(): string[] {
    return Array.from(this.metadataStore.values()).map(m => m.name);
  }
}

export const createSecureVault = (options?: FlixoraEncryptedOptions): FlixoraEncrypted => {
  return FlixoraEncrypted.getInstance(options);
};