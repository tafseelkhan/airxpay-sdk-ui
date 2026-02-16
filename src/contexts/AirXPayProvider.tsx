// AirXPayProvider.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { AirXPayConfig } from "../types/type";
import { verifyPublicKey, SellerInitResponse } from "../api/seller";

// Extended context with verification state
interface AirXPayContextExtended extends AirXPayConfig {
  isValid: boolean;
  loading: boolean;
  sellerData?: SellerInitResponse;
  error?: string;
}

const AirXPayContext = createContext<AirXPayContextExtended | null>(null);
AirXPayContext.displayName = "AirXPayContext";

interface AirXPayProviderProps {
  config: AirXPayConfig;
  children: React.ReactNode;
  enableLogging?: boolean;
}

export const AirXPayProvider: React.FC<AirXPayProviderProps> = ({
  config,
  children,
  enableLogging = __DEV__,
}) => {
  const [state, setState] = useState<AirXPayContextExtended>({
    ...config,
    isValid: false,
    loading: true,
  });

  useEffect(() => {
    const validationErrors: string[] = [];

    // Validate baseUrl
    if (!config.baseUrl) {
      validationErrors.push("baseUrl is required");
    } else {
      try {
        new URL(config.baseUrl);
      } catch {
        validationErrors.push(
          "baseUrl must be a valid URL (e.g., https://api.airxpay.com)"
        );
      }
    }

    // Validate publicKey
    if (!config.publicKey) {
      validationErrors.push("publicKey is required");
    } else if (typeof config.publicKey !== "string") {
      validationErrors.push("publicKey must be a string");
    } else if (config.publicKey.length < 20) {
      validationErrors.push(
        "publicKey appears to be invalid. Please check your API key."
      );
    }

    if (validationErrors.length > 0) {
      const errorMessage = [
        "AirXPayProvider Configuration Error:",
        ...validationErrors.map((err) => `  • ${err}`),
        "",
        "Received config:",
        `  • baseUrl: ${config.baseUrl || "missing"}`,
        `  • publicKey: ${config.publicKey ? `${config.publicKey.substring(0, 8)}...` : "missing"}`
      ].join("\n");

      if (enableLogging) console.error("❌ AirXPay:", errorMessage);
      throw new Error(errorMessage);
    }

    if (enableLogging) {
      console.log(
        "%c✅ AirXPay Provider Initialized",
        "color: #10b981; font-weight: bold;",
        {
          baseUrl: config.baseUrl,
          publicKey: `${config.publicKey.substring(0, 8)}...`,
        }
      );
    }

    // Now call the public key verification API
    const verifyKey = async () => {
      try {
        const sellerData = await verifyPublicKey(config.baseUrl, config.publicKey);
        setState({ ...config, isValid: true, loading: false, sellerData });
        if (enableLogging) console.log("✅ Public key verified", sellerData);
      } catch (err: any) {
        console.error("❌ Public key verification failed", err);
        setState({ ...config, isValid: false, loading: false, error: err.message });
      }
    };

    verifyKey();

  }, [config, enableLogging]);

  return <AirXPayContext.Provider value={state}>{children}</AirXPayContext.Provider>;
};

// Hook: strict (throws if provider not found)
export const useAirXPay = (): AirXPayContextExtended => {
  const context = useContext(AirXPayContext);
  if (!context) {
    const errorMessage = [
      "❌ useAirXPay: Hook must be used within an AirXPayProvider",
      "",
      "This error occurs when:",
      "  1. Your component tree is not wrapped in <AirXPayProvider>",
      "  2. You have multiple React roots in your application",
      "  3. The provider is conditionally rendered",
      "",
      "Solution:",
      "  • Wrap your root component with AirXPayProvider:",
      "",
      "    <AirXPayProvider",
      "      config={{",
      '        baseUrl: "https://api.airxpay.com",',
      '        publicKey: "your_public_key_here"',
      "      }}",
      "    >",
      "      <App />",
      "    </AirXPayProvider>",
      "",
      "  • Verify the provider is not inside a conditional or loop",
      `  • Component location: ${new Error().stack?.split("\n")[2]?.trim() || "unknown"}`
    ].join("\n");

    if (__DEV__) {
      console.error(
        "%c❌ AirXPay Context Error",
        "color: #ef4444; font-size: 14px; font-weight: bold;",
        "\n" + errorMessage
      );
    }

    throw new Error(errorMessage);
  }
  return context;
};

// Hook: safe (returns null if missing)
export const useAirXPaySafe = (): AirXPayContextExtended | null => {
  try {
    return useAirXPay();
  } catch {
    return null;
  }
};

// Hook: access specific key
export const useAirXPayConfig = <K extends keyof AirXPayConfig>(
  key: K
): AirXPayConfig[K] | undefined => {
  const context = useAirXPaySafe();
  return context?.[key];
};

// Hook: check if provider ready
export const useProviderReady = (): boolean => {
  const context = useAirXPaySafe();
  return !!(context?.baseUrl && context?.publicKey && context.isValid);
};

// Consumer for advanced usage
export const AirXPayConsumer = AirXPayContext.Consumer;

export default AirXPayProvider;
