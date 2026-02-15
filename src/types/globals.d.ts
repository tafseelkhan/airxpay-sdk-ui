declare const __DEV__: boolean;

// Extend the Window interface to include the AirXPay object
interface Window {
  AirXPay: any; // You can replace 'any' with a more specific type if you have one
}

// Declare the AirXPay object globally
declare const AirXPay: any; // You can replace 'any' with a more specific type if you have one

// If you have specific types for AirXPay, you can define them here
// For example:
// interface AirXPay {
//   initialize: (config: AirXPayConfig) => void;
//    other methods and properties
// }

// interface AirXPayConfig {
//   apiKey: string;
//   environment: 'production' | 'sandbox';
//    other configuration options
// }

// You can also declare any other global variables or types as needed
// Example of declaring a global variable
