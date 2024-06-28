import { Document } from "langchain/document";
import { CSVLoader } from "langchain/document_loaders/fs/csv";
import { DocxLoader } from "langchain/document_loaders/fs/docx";
import { JSONLoader } from "langchain/document_loaders/fs/json";
import * as pdfjsLib from "pdfjs-dist";
import { PdfRecordPageContent } from "../types/record";
import { RequestError } from "../utils/globalErrorHandler";
import { getPdfTextWithPages } from "../utils/upload.utils";

export async function processFileContent(fileType: string, reqFileBuffer: Buffer) {
    let newDocs: Document<Record<string, any>>[] = [];
    switch (fileType) {
        case 'application/pdf': {
            // PDF processing code
            const loadingTask = pdfjsLib.getDocument({
                data: new Uint8Array(reqFileBuffer),
                useSystemFonts: true,
              });
            const pdf = await loadingTask.promise;
            const pages: PdfRecordPageContent[] = await getPdfTextWithPages(pdf);

            // tramsform the pdf in to langchain documents
            // We could use the pdf loader but this allows for a more custom structuing of the documents
            newDocs = pages.map((page, index) => {
                return new Document({
                    metadata: { page: index },
                    pageContent: page.content,
                });
            });
            newDocs = newDocs.filter(doc => doc && typeof doc === 'object' && doc.pageContent);
            return newDocs;
        }

        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
            // DOCX processing code
            const blob = new Blob([reqFileBuffer]);
            const loader = new DocxLoader(blob);
            newDocs = await loader.load();
            return newDocs;
        }

        case 'text/plain': {
            // TXT processing code
            const txtContent = reqFileBuffer.toString('utf-8');
            newDocs = [new Document({ pageContent: txtContent })];
            return newDocs;
        }

        // octent-stream is for CSV file
        case "application/octet-stream":
        case 'text/csv': {
            const blob = new Blob([reqFileBuffer]);
            const loader = new CSVLoader(blob);
            newDocs = await loader.load();
            return newDocs;
        }

        case "application/json": {
            const stringData = reqFileBuffer.toString();
            const parsedData = JSON.parse(stringData);

            if (Array.isArray(parsedData)) {
                newDocs = parsedData.map((doc) => {
                    return new Document({
                        pageContent: JSON.stringify(doc),
                    });
                });
                return newDocs;
            }
            newDocs = [new Document({ pageContent: stringData })];
            return newDocs;
        }

        default:
            throw new RequestError("Unsupported file type", 400);
    }
}

