// ---- API Response Types ----

export interface IApiResponse {
  intent: 'query' | 'provision' | 'chat' | 'analyze' | 'update' | 'delete' | 'site_operation' | 'file_operation' | 'item_operation';
  reply: string;

  // Query-specific fields
  source_list?: string;
  resource_link?: string;
  data_summary?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  suggested_actions?: string[];

  // Provision-specific fields
  resource_links?: string[];
  blueprint?: any; // eslint-disable-line @typescript-eslint/no-explicit-any

  // Validation fields
  requires_confirmation?: boolean;
  warnings?: string[];

  // Gathering-specific fields
  requires_input?: boolean;
  session_id?: string;
  question_prompt?: string;
  current_field?: string;
  field_type?: string;
  field_options?: string[];
  progress?: { current: number; total: number };
  specification_preview?: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  quick_suggestions?: string[];

  // Enhanced features
  preview?: IProvisioningPreview;
  analysis?: IContentAnalysis;
  deletion_impact?: IDeletionImpact;
  web_part_decision?: IWebPartDecision;
  context_summary?: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  confirmation_text?: string;
  pending_file_id?: string;

  // Structured error fields
  error_code?: string;
  error_category?: 'auth' | 'permission' | 'validation' | 'service' | 'internal' | 'timeout';
  recovery_hint?: string;
  correlation_id?: string;
}

export interface IProvisioningPreview {
  operation_type: 'create' | 'update' | 'delete';
  resources: IResourceChange[];
  visual_representation: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  estimated_duration: string;
  warnings: string[];
  dependencies?: string[];
}

export interface IResourceChange {
  resource_type: string;
  resource_name: string;
  action: string;
  before_state?: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  after_state?: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  diff?: string[];
}

export interface IContentAnalysis {
  resource_type: string;
  resource_name: string;
  summary: string;
  topics: string[];
  purpose?: string;
  audience?: string;
  key_features: string[];
  recommendations?: string[];
}

export interface IDeletionImpact {
  resource_type: string;
  resource_name: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  warnings: string[];
  affectedItems?: number;
  dependencies?: string[];
  confirmation_required?: boolean;
}

export interface IWebPartDecision {
  decision: 'builtin' | 'custom';
  web_part_type?: string;
  web_part_title?: string;
  reasoning: string;
  complexity_score: number;
  alternative_options?: string[];
}

export interface IApiError {
  detail: string | {
    error: {
      code: string;
      message: string;
      recovery_hint?: string;
      correlation_id?: string;
    };
  };
}

export interface IChatHistoryItem {
  role: string;
  content: string;
}

// ---- Chat Message Model ----

export interface IChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;

  // Intent-specific metadata
  intent?: 'query' | 'provision' | 'chat' | 'analyze' | 'update' | 'delete' | 'site_operation' | 'file_operation' | 'item_operation';
  sourceList?: string;
  resourceLink?: string;
  dataSummary?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  suggestedActions?: string[];
  resourceLinks?: string[];
  blueprint?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  requiresConfirmation?: boolean;
  warnings?: string[];

  // Interactive gathering metadata
  requiresInput?: boolean;
  sessionId?: string;
  questionPrompt?: string;
  currentField?: string;
  fieldType?: string;
  fieldOptions?: string[];
  progress?: string;
  specificationPreview?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  quickSuggestions?: string[];

  // Enhanced features
  preview?: IProvisioningPreview;
  analysis?: IContentAnalysis;
  deletionImpact?: IDeletionImpact;
  webPartDecision?: IWebPartDecision;
  contextSummary?: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  confirmationText?: string;

  // Structured error fields
  errorCode?: string;
  errorCategory?: string;
  recoveryHint?: string;
  correlationId?: string;
}

export interface IAttachedFile {
  file: File;
  name: string;
  size: number;
  type: string;
}
