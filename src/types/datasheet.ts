export interface DatasheetContent {
  questions: Record<string, string[]>;
  answers: Record<string, string>;
}

export interface DatasheetData {
  id: string;
  dataset_id: string;
  template_version: string;
  content: DatasheetContent;
  created_at: string;
  updated_at: string;
  markdown?: string;
}

export interface DatasheetCreatePayload {
  dataset_id: string;
  content: DatasheetContent;
}

export interface DatasheetReplacePayload {
  content: DatasheetContent;
}
