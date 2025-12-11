export interface ChaseError {
  errorCode: string;
}

export interface RequiredDocument {
  documentCategoryName: string;
  documentTypeName: string[];
}

export interface PendRequiredInformation {
  requiredDocuments?: RequiredDocument[];
}

export interface StatusAdditionalInformation {
  errors?: ChaseError[];
  straightThroughEligibilityIndicator?: boolean;
  requiredActionList?: string[];
}

export interface GenericAccountStatus {
    productCode: string;
    subProductCode: string;
    productApplicationStatusCode: string;
    statusAdditionalInformation?: StatusAdditionalInformation;
    pendRequiredInformation?: PendRequiredInformation;
    productApplicationStatusChangeTimestamp: string;
    decisionEngineReferenceIdentifier?: string;
    acquisitionSourceName?: string;
    marketCellIdentifier?: string;
}

// Specific interface for Cards (080)
export interface CardAccountStatus extends GenericAccountStatus {
  capturedApplicationIdentifier: string;
  secureMailInteractionIdentifier?: string;
  linkExpirationDate?: string;
}

export interface ChaseApplicationData {
  productApplicationIdentifier: string;
  customerFacingApplicationIdentifier?: string;
  // Credit Cards
  cardAccountStatus?: CardAccountStatus[];
  // Checking/Savings (Product Code 919 etc)
  enrollmentProductStatus?: GenericAccountStatus[]; 
  depositAccountStatus?: GenericAccountStatus[];
  lendingAccountStatus?: GenericAccountStatus[];
  investmentAccountStatus?: GenericAccountStatus[];
  
  applicationSubmitTimestamp?: string;
  applicationCreateTimestamp?: string;
  applicationLastUpdateTimestamp?: string;
}