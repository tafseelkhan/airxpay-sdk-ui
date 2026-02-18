// src/core/crypto/types.ts

export interface CryptoKey {
  key: Uint8Array;
  algorithm: string;
  length: number;
}

export interface EncryptedData {
  iv: string;           // Base64
  data: string;         // Base64
  authTag?: string;     // Base64 (for GCM)
}

export interface PBKDF2Options {
  iterations: number;
  keyLength: number;
  digest: 'sha256' | 'sha512';
}

export interface AESCipher {
  encrypt(plaintext: string, key: Uint8Array, iv: Uint8Array): EncryptedData;
  decrypt(encrypted: EncryptedData, key: Uint8Array): string;
}