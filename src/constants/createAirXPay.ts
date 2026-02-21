// src/core/airxpay-backend.ts

import { AirXPay } from '../core/in/airxpay';

/**
 * 🚀 REAL createAirXPay function for Node.js backend
 * 
 * @example
 * const { airxpay } = createAirXPay({
 *   secretKey: 'sk_live_...',
 *   publicKey: 'pk_live_...',
 *   environment: 'live'
 * });
 * 
 * await airxpay.flixora.createMerchant({...});
 * await airxpay.flixora.getMerchantStatus({ merchantId: '...' });
 */
export function createAirXPay(options: {
  secretKey: string;
  publicKey: string;
  environment?: 'test' | 'live';
  enableLogging?: boolean;
}) {
  const { secretKey, publicKey, environment = 'test', enableLogging = true } = options;

  // ✅ Validation
  if (!secretKey) {
    throw new Error('AirXPay: secretKey is required');
  }
  if (!publicKey) {
    throw new Error('AirXPay: publicKey is required');
  }

  console.log('\n🏗️ ===== AIRXPAY BACKEND INITIALIZED =====');
  console.log('🔐 Secret key present:', !!secretKey);
  console.log('🔑 Public key present:', !!publicKey);
  console.log('🌍 Environment:', environment);
  console.log('==========================================\n');

  // ✅ Create REAL AirXPay instance
  const airxpay = new AirXPay(
    secretKey,
    publicKey,
    {
      mode: environment,
      enableLogging,
    }
  );

  // ✅ Return ONLY flixora namespace with 2 methods
  return {
    airxpay: {
      flixora: {
        /**
         * Create a new merchant
         */
        createMerchant: async (payload: any) => {
          try {
            const result = await airxpay.createMerchant(payload);
            return result;
          } catch (error) {
            console.error('❌ createMerchant failed:', error);
            throw error;
          }
        },

        /**
         * Get merchant status
         */
        getMerchantStatus: async (params: { merchantId: string }) => {
          try {
            const result = await airxpay.getMerchantStatus(params.merchantId);
            return result;
          } catch (error) {
            console.error('❌ getMerchantStatus failed:', error);
            throw error;
          }
        }
      }
    }
  };
}