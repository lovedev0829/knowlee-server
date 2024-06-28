import { TextItem } from "pdfjs-dist/types/src/display/api";
import { RequestError } from "./globalErrorHandler";
import { PdfRecordPageContent } from "../types/record";
import { PDFDocumentProxy } from "pdfjs-dist";

export const getPdfTextWithPages = async (pdf: PDFDocumentProxy) => {
  if (!pdf) throw new RequestError('Could not load pdf from pdfjsLib', 500)
  
  try {
    const numPages = pdf.numPages;
    const pages: PdfRecordPageContent[] = [];

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      // marked content is not included by default
      const items = content.items as TextItem[];

      // possible implementation for ordered content(to be tested)
      // items.sort((a, b) => b.transform[5] - a.transform[5]);
      // const strings = items.map((item) => item.str);

      const strings = items.map((item) => item.str);

      pages.push({
        index: i,
        content: strings.join(" "),
      });
    }
    return pages
    
  } catch (error) {
    throw new RequestError("Error getting pdf text and pages", 500);
  }

}