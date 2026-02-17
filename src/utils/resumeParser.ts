import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Initialize PDF.js worker
// We have manually copied the worker to the /public folder to ensure it loads correctly
// without being mangled by the bundler.
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

export const resumeParser = {
    /**
     * Extracts text from a generic file (PDF or DOCX)
     */
    async parseFile(file: File): Promise<string> {
        const fileType = file.type;

        if (fileType === 'application/pdf') {
            return this.parsePDF(file);
        } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            return this.parseDOCX(file);
        } else {
            throw new Error('Unsupported file type. Please upload PDF or DOCX.');
        }
    },

    /**
     * Extracts text from PDF using pdfjs-dist
     */
    async parsePDF(file: File): Promise<string> {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;
            let fullText = '';

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map((item: any) => item.str).join(' ');
                fullText += pageText + '\n';
            }

            console.log(`PDF Parsed. Pages: ${pdf.numPages}, Length: ${fullText.length}`);
            return fullText;
        } catch (error) {
            console.error("Error parsing PDF:", error);
            throw new Error("Failed to parse PDF file. " + (error instanceof Error ? error.message : ""));
        }
    },

    /**
     * Extracts text from DOCX using mammoth
     */
    async parseDOCX(file: File): Promise<string> {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value;
    }
};
