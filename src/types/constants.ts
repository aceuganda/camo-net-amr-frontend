// datasets
export type DatasetType = {
  id: string;
  name: string;
  category: string;
  type: string;
  size: number;
  countries: string[];
  project_status: string;
  title: string;
  thematic_area: string;
  study_design: string;
  data_format: string;
  source: string;
  in_warehouse: boolean;
  start_date: string;
  end_date: string;
  protocol_id: string;
  country_protocol_id: string;
  on_hold_reason: string;
  data_collection_methods: string;
  entries_count: string;

  citation_info: string;

  project_type: string;
  main_project_name: string;
  data_capture_method: string;
  collection_period: string;

  amr_category: string;
  acronym: string;
  description: string;
};
export interface VariableInfo {
  type: string;
  description: string;
}

export interface DataSet {
  name: string;
  project_status: string;
  citation_info: string;
  data_storage_medium: string;
  grant_code: string;
  category: string;
  on_hold_reason: string;
  principal_investigator: string;
  data_types_collected: string;
  study_data_link: string;
  size: string;
  acronym: string | null;
  countries: string;
  pi_email: string;
  main_data_type: string;
  data_types_details: string;
  db_name: string;
  description: string | null;
  data_collection_methods: string;
  pi_contact: string;
  study_design: string;
  project_type: string;
  type: string;
  id: string;
  start_date: string;
  source: string;
  project_manager: string;
  additional_notes: string;
  main_project_name: string;
  version: string;
  title: string;
  end_date: string;
  thematic_area: string;
  pm_email: string;
  coordinator_name: string;
  data_capture_method: string;
  amr_category: string;
  protocol_id: string;
  data_format: string;
  pm_contact: string;
  coordinator_email: string;
  collection_period: string | null;
  created_at: string;
  country_protocol_id: string;
  entries_count: string;
  data_access_method: string;
  coordinator_contact: string;
  in_warehouse: boolean;
}

export interface UserPermissionType {
  user_id: string;
  last_update: string;
  title: string;
  resource: string;
  downloads_count: number;
  agreed_to_privacy: boolean;
  re_request_count: number;
  category: string;
  status: string;
  project_description: string;
  irb_number: string;
  id: string;
  denial_reason: string | null;
  referee_email: string;
  data_set_id: string;
  created_at: string;
  project_title: string;
  referee_name: string;
  institution: string;
  requested_variables: string[];
  approver_id: string | null;
}

export interface DatasetApiResponse {
  data_set: DataSet;
  is_super_admin: boolean;
  user_permissions: UserPermissionType[];
}

// Model-related types
export interface Model {
  name: string;
  modal_url: string;
  dataset_id: string;
  description: string;
  id: string;
  created_at: string;
}

export interface ModelInputMapping {
  [key: string]: number;
}

export interface ModelInput {
  name: string;
  type: "categorical" | "numeric";
  mapping?: ModelInputMapping;
  description?: string;
}

export interface ModelOutput {
  name: string;
  type: "categorical" | "numeric";
  mapping?: ModelInputMapping;
  description: string;
}

export interface ModelVariables {
  name: string;
  inputs: ModelInput[];
  output: ModelOutput;
}

export interface ModelDataset {
  data_set: {
    name: string;
    id: string;
  };
}

export interface ModelFormData {
  [key: string]: string | number;
}

export interface ModelPredictionResult {
  prediction: string | number;
  description?: string;
  probability?: number;
  unit?: string;
}

export interface ModelsPageProps {
  datasetId: string;
  dataset: ModelDataset;
}

// API Response types for models
export interface ModelsAPIResponse {
  models: Model[];
  variables: Record<string, ModelVariables>;
}

export interface ModelInferenceResponse {
  data: ModelPredictionResult;
}

export interface DataCardContact {
  role: string;
  name: string | null;
  email: string | null;
  phone: string | null;
}

export interface DataCard {
  id: string;
  name: string;
  title: string;
  description: string;
  acronym: string;
  thematic_area: string;
  countries: string;
  data_collection_methods: string;
  study_design: string;
  citation_info: string;
  doi: string | null;
  license: string | null;
  study_data_link: string;
  data_access_method: string;
  version?: string | null;
  data_format?: string | null;
  protocol_id: string | null;
  country_protocol_id: string | null;
  contacts: DataCardContact[];
  created_at: string;
  permalink: string;
}
