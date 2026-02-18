// src/core/crypto/pbkdf2.ts

import { random } from '../rule/random';

/**
 * 🔐 PBKDF2 Implementation (Password-Based Key Derivation Function)
 */

export class PBKDF2 {
  /**
   * Derive key using PBKDF2
   */
  static deriveKey(
    password: string,
    salt?: Uint8Array,
    iterations: number = 100000,
    keyLength: number = 32,
    digest: 'sha256' | 'sha512' = 'sha256'
  ): Uint8Array {
    // Generate salt if not provided
    const saltBytes = salt || random.randomBytes(16);
    
    // Convert password to bytes
    const passwordBytes = new TextEncoder().encode(password);
    
    // Initialize key array
    const derivedKey = new Uint8Array(keyLength);
    
    // HMAC-SHA256 implementation
    const hmac = this.hmacSha256(passwordBytes, saltBytes);
    
    // Iterate PBKDF2
    let u = hmac;
    const block1 = new Uint8Array(saltBytes.length + 4);
    block1.set(saltBytes);
    
    for (let i = 0; i < iterations; i++) {
      u = this.hmacSha256(passwordBytes, u);
      
      // XOR with previous
      for (let j = 0; j < u.length; j++) {
        if (j < keyLength) {
          derivedKey[j] ^= u[j];
        }
      }
    }
    
    return derivedKey;
  }

  /**
   * HMAC-SHA256 implementation
   */
  private static hmacSha256(key: Uint8Array, message: Uint8Array): Uint8Array {
    const blockSize = 64; // SHA-256 block size
    
    // Prepare key
    let preparedKey: Uint8Array;
    if (key.length > blockSize) {
      preparedKey = this.sha256(key);
    } else {
      preparedKey = new Uint8Array(blockSize);
      preparedKey.set(key);
    }
    
    // Create inner and outer padded keys
    const innerPad = new Uint8Array(blockSize);
    const outerPad = new Uint8Array(blockSize);
    
    for (let i = 0; i < blockSize; i++) {
      innerPad[i] = preparedKey[i] ^ 0x36;
      outerPad[i] = preparedKey[i] ^ 0x5c;
    }
    
    // Inner hash: SHA256(innerPad + message)
    const innerInput = new Uint8Array(innerPad.length + message.length);
    innerInput.set(innerPad);
    innerInput.set(message, innerPad.length);
    const innerHash = this.sha256(innerInput);
    
    // Outer hash: SHA256(outerPad + innerHash)
    const outerInput = new Uint8Array(outerPad.length + innerHash.length);
    outerInput.set(outerPad);
    outerInput.set(innerHash, outerPad.length);
    
    return this.sha256(outerInput);
  }

  /**
   * SHA-256 implementation
   */
  private static sha256(message: Uint8Array): Uint8Array {
    // Constants for SHA-256
    const K = [
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
      0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
      0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
      0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
      0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
      0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
      0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
      0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
      0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
      0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
      0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
      0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
      0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
      0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ];

    // Initial hash values
    let H = [
      0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
      0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
    ];

    // Pre-processing
    const originalLength = message.length;
    const bitLength = originalLength * 8;
    
    // Padding
    const paddingLength = (448 - (originalLength * 8 + 1) % 512 + 512) % 512;
    const totalLength = originalLength + 1 + paddingLength / 8 + 8;
    
    const padded = new Uint8Array(totalLength);
    padded.set(message);
    padded[originalLength] = 0x80;
    
    // Add length
    for (let i = 0; i < 8; i++) {
      padded[totalLength - 1 - i] = (bitLength >> (i * 8)) & 0xff;
    }

    // Process chunks
    for (let i = 0; i < totalLength; i += 64) {
      const chunk = padded.slice(i, i + 64);
      const w = new Uint32Array(64);
      
      // Prepare message schedule
      for (let j = 0; j < 16; j++) {
        w[j] = (chunk[j * 4] << 24) | (chunk[j * 4 + 1] << 16) |
               (chunk[j * 4 + 2] << 8) | chunk[j * 4 + 3];
      }
      
      for (let j = 16; j < 64; j++) {
        const s0 = this.rotr(w[j - 15], 7) ^ this.rotr(w[j - 15], 18) ^ (w[j - 15] >>> 3);
        const s1 = this.rotr(w[j - 2], 17) ^ this.rotr(w[j - 2], 19) ^ (w[j - 2] >>> 10);
        w[j] = (w[j - 16] + s0 + w[j - 7] + s1) & 0xffffffff;
      }

      // Initialize working variables
      let [a, b, c, d, e, f, g, h] = H;

      // Main loop
      for (let j = 0; j < 64; j++) {
        const S1 = this.rotr(e, 6) ^ this.rotr(e, 11) ^ this.rotr(e, 25);
        const ch = (e & f) ^ (~e & g);
        const temp1 = (h + S1 + ch + K[j] + w[j]) & 0xffffffff;
        const S0 = this.rotr(a, 2) ^ this.rotr(a, 13) ^ this.rotr(a, 22);
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const temp2 = (S0 + maj) & 0xffffffff;

        h = g;
        g = f;
        f = e;
        e = (d + temp1) & 0xffffffff;
        d = c;
        c = b;
        b = a;
        a = (temp1 + temp2) & 0xffffffff;
      }

      // Update hash values
      H[0] = (H[0] + a) & 0xffffffff;
      H[1] = (H[1] + b) & 0xffffffff;
      H[2] = (H[2] + c) & 0xffffffff;
      H[3] = (H[3] + d) & 0xffffffff;
      H[4] = (H[4] + e) & 0xffffffff;
      H[5] = (H[5] + f) & 0xffffffff;
      H[6] = (H[6] + g) & 0xffffffff;
      H[7] = (H[7] + h) & 0xffffffff;
    }

    // Convert to bytes
    const result = new Uint8Array(32);
    for (let i = 0; i < 8; i++) {
      result[i * 4] = (H[i] >> 24) & 0xff;
      result[i * 4 + 1] = (H[i] >> 16) & 0xff;
      result[i * 4 + 2] = (H[i] >> 8) & 0xff;
      result[i * 4 + 3] = H[i] & 0xff;
    }

    return result;
  }

  private static rotr(x: number, n: number): number {
    return (x >>> n) | (x << (32 - n));
  }
}