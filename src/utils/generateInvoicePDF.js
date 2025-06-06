import * as html_to_pdf from 'html-pdf-node';
import { renderFile } from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const generateInvoicePDF = async (data) => {
    const templatePath = path.join(__dirname, '../../mailer/templates/billingInvoice.ejs');
    // Render your HTML with EJS
    const htmlString = await renderFile(templatePath, { data });
    const file = { content: htmlString };
    const options = { format: 'A4' };
    // Generate PDF from rendered HTML
    const pdfBuffer = await html_to_pdf.generatePdf(file, options);
    return pdfBuffer;
};
export default generateInvoicePDF;
