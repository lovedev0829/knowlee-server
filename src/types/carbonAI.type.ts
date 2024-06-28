export declare enum IntegrationName {
  BOX = "BOX",
  CONFLUENCE = "CONFLUENCE",
  DROPBOX = "DROPBOX",
  FRESHDESK = "FRESHDESK",
  GITBOOK = "GITBOOK",
  GOOGLE_DRIVE = "GOOGLE_DRIVE",
  GMAIL = "GMAIL",
  INTERCOM = "INTERCOM",
  LOCAL_FILES = "LOCAL_FILES",
  NOTION = "NOTION",
  ONEDRIVE = "ONEDRIVE",
  OUTLOOK = "OUTLOOK",
  S3 = "S3",
  SALESFORCE = "SALESFORCE",
  SHAREPOINT = "SHAREPOINT",
  WEB_SCRAPER = "WEB_SCRAPER",
  ZENDESK = "ZENDESK",
  ZOTERO = "ZOTERO",
}

export declare enum SyncStatus {
  READY = "READY",
  QUEUED_FOR_SYNCING = "QUEUED_FOR_SYNCING",
  SYNCING = "SYNCING",
  SYNC_ERROR = "SYNC_ERROR",
}

export interface LocalFile {
  id: string;
  name: string;
  source: IntegrationName;
  external_file_id: string;
  tags: string[];
  sync_status: SyncStatus;
}

export interface WebScraper {
  urls: string[];
  validUrls: string[];
  tags: string[];
}

export type TagValue = string | number | string[] | number[];

export declare enum ActionType {
  INITIATE = "INITIATE",
  ADD = "ADD",
  UPDATE = "UPDATE",
  CANCEL = "CANCEL",
}

export interface OnSuccessDataFileObject {
  id: number;
  source: IntegrationName;
  organization_id: string;
  organization_supplied_user_id: string;
  organization_user_data_source_id: string;
  external_file_id: string;
  external_url: string;
  sync_status: SyncStatus;
  last_sync: string;
  tags: Record<string, TagValue> | null;
  file_statistics: object;
  file_metadata: object;
  chunk_size: number;
  chunk_overlap: number;
  name: string;
  enable_auto_sync: boolean;
  presigned_url: string;
  parsed_text_url: string;
  skip_embedding_generation: boolean;
  created_at: string;
  updated_at: string;
  action: ActionType;
}

export interface OnSuccessData {
  status: number;
  data: {
    data_source_external_id: string | null;
    sync_status: string | null;
    // files: LocalFile[] | WebScraper[] | OnSuccessDataFileObject[] | null;
    files: OnSuccessDataFileObject[];
  } | null;
  action: ActionType;
  event: ActionType;
  integration: IntegrationName;
}
