export interface GoogleDrivePickerDocument {
    id: string;
    serviceId: string;
    mimeType: string;
    name: string;
    description: string;
    type: string;
    lastEditedUtc: number;
    iconUrl: string;
    url: string;
    embedUrl: string;
    sizeBytes: number;
    parentId: string;
    isShared: boolean;
    organizationDisplayName: string;
}
