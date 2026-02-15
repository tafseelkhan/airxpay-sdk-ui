// types/sellertypes.ts

export type BusinessType = "individual" | "company";
// For future use, in case we want to support more business types like 'partnership', 'sole proprietorship', etc.

export type Mode = "test" | "live";

// KYCStatus represents the various stages of the KYC process for a seller.

export type KYCStatus = "not_submitted" | "pending" | "verified" | "rejected";
// SellerStatus represents the current status of the seller's account in the system.

export type SellerStatus = "active" | "suspended" | "blocked";
// KYCDocuments represents the various documents that a seller may need to submit for KYC verification. Each document is optional, as not all sellers may be required to submit all types of documents depending on their business type and location.
export interface KYCDocuments {
  panCardUrl?: string;
  aadhaarUrl?: string;
  identityProofUrl?: string;
  addressProofUrl?: string;
  selfieUrl?: string;
  businessRegistrationUrl?: string;
  gstCertificateUrl?: string;
}
// BankDetails represents the bank account information that a seller needs to provide for payouts. Some fields are optional, such as upiId and cancelledChequeUrl, as not all sellers may use UPI or have a cancelled cheque available.
export interface BankDetails {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  upiId?: string;
  cancelledChequeUrl?: string;
}
// Seller represents the main data structure for a seller in the system, including their personal and business information, KYC status, bank details, and other relevant fields. Some fields are optional to allow for flexibility in the onboarding process and to accommodate different types of sellers.
export interface Seller {
  _id?: string;
  sellerName: string;
  sellerEmail: string;
  sellerPhone?: string;
  businessName?: string;
  businessType: BusinessType;
  businessCategory?: string;
  country: string;
  dob?: string;
  nationality?: string;
  mode: Mode;
  kycStatus: KYCStatus;
  isKycCompleted: boolean;
  kycDocuments?: KYCDocuments;
  bankDetails?: BankDetails;
  isBankDetailsCompleted: boolean;
  status: SellerStatus;
  sellerDID?: string;
  walletId?: string;
  developerId?: string;
  developerUserId?: string;
  developerClientKey?: string;
  onboardedPlatforms?: string[];
}
// SellerOnboardingProps defines the properties that are passed to the seller onboarding component. It includes information about the seller's current status, KYC completion, bank details completion, and callback functions for navigating through the onboarding steps and completing the process.
export interface SellerOnboardingProps {
  sellerId?: string;
  mode: Mode;
  initialStep?: number;
  isKycCompleted: boolean;
  isBankDetailsCompleted: boolean;
  kycStatus: KYCStatus;
  status: SellerStatus;
  initialData?: Partial<Seller>;
  onNext: (stepData: Partial<Seller>, step: number) => void;
  onBack: (currentStep: number) => void;
  onComplete: (sellerData: Seller) => void;
  loading?: boolean;
}
// StepConfig defines the structure of each step in the seller onboarding process, including its unique identifier, display name, key for internal use, and whether the step is required to complete the onboarding.
export interface StepConfig {
  id: number;
  name: string;
  key: "basic" | "kyc" | "bank" | "complete";
  isRequired: boolean;
}
// FormErrors is a simple interface that defines the structure of an object used to store validation error messages for form fields. The keys are the names of the form fields, and the values are the corresponding error messages, which can be undefined if there are no errors for that field.
export interface FormErrors {
  [key: string]: string | undefined;
}
// This file defines the TypeScript types and interfaces related to sellers in the system, including their KYC status, bank details, and onboarding process. These types will be used throughout the application to ensure type safety and consistency when working with seller data.
