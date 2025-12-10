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

export interface CardAccountStatus {
  capturedApplicationIdentifier: string;
  productCode: string;
  subProductCode: string;
  acquisitionSourceName?: string;
  marketCellIdentifier?: string;
  productApplicationStatusCode: string;
  statusAdditionalInformation?: StatusAdditionalInformation;
  pendRequiredInformation?: PendRequiredInformation;
  productApplicationStatusChangeTimestamp: string;
  decisionEngineReferenceIdentifier?: string;
  secureMailInteractionIdentifier?: string;
  linkExpirationDate?: string;
}

export interface ChaseApplicationData {
  productApplicationIdentifier: string;
  customerFacingApplicationIdentifier?: string;
  cardAccountStatus: CardAccountStatus[];
  applicationSubmitTimestamp?: string;
  applicationCreateTimestamp?: string;
  applicationLastUpdateTimestamp?: string;
}
