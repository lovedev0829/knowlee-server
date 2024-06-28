export interface PdfRecordPageContent {
  index: number;
  content: string;
}

export interface PdfRecordMetadata {
  author: string;
  title: string;
  subject: string;
  keywords: string;
  producer: string;
  createdDate: number;
}