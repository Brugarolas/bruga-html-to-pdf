const fs = require('fs');
const puppeteer = require('puppeteer');
const { PDFDocument, rgb } = require('pdf-lib');

async function readLinksFromFile(filePath) {
    return fs.readFileSync(filePath, 'utf8').split('\n').filter(content => Boolean(content.trim()));
}

async function readMetadataFromFile(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

async function createCustomPage(browser, contentHTML, outputFilename) {
    const page = await browser.newPage();
    await page.setContent(contentHTML);
    const pdf = await page.pdf({ format: 'A4' });
    fs.writeFileSync(outputFilename, pdf);
    await page.close();
}

async function applyCSSAndConvertToPDF(browser, link, cssPath, index) {
    const page = await browser.newPage();
    await page.goto(link, { waitUntil: 'networkidle0' });

    const customCSS = fs.readFileSync(cssPath, 'utf8');
    await page.addStyleTag({ content: customCSS });

    const pdf = await page.pdf({ format: 'A4' });
    fs.writeFileSync(`./docs/page_${index}.pdf`, pdf);
    await page.close();
}

async function mergePDFs(filePaths, outputFilePath) {
    const mergedPdf = await PDFDocument.create();

    for (const filePath of filePaths) {
        const pdf = await PDFDocument.load(fs.readFileSync(filePath));
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach(page => mergedPdf.addPage(page));
    }

    // Add page numbers here if needed

    const mergedPdfBytes = await mergedPdf.save();
    fs.writeFileSync(outputFilePath, mergedPdfBytes);
}

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const metadata = await readMetadataFromFile('./config/print_metadata.json');
    const links = await readLinksFromFile('./config/links_to_print.txt');
    const pdfFiles = [];

    // Creating the first page
    const imageBase64 = fs.readFileSync('./config/image_title.png', 'base64');
    const firstPageHTML = `
        <div style="text-align: center; margin-top: 36%;">
            <img src="${imageBase64}" style="margin-bottom: 112px;">
            <h1 style="font-size: 28px; font-weight: bolder; font-family: 'Roboto', sans-serif;">${metadata.title}</h1>
        </div>`;
    await createCustomPage(browser, firstPageHTML, './docs/page_0.pdf');
    pdfFiles.push('./docs/page_0.pdf');

    // Creating the second page
    const subtitle = 'Made with <3 by Andrés Brugarolas Martínez with Bruga\'s HTML to PDF converter'
    const secondPageHTML = `
        <div style="display: flex; justify-content: center; align-items: center; height: 100%;">
            <p style="font-size: 16px; font-weight: bold; font-family: 'Courier New', monospace;">${subtitle}</p>
        </div>`;
    await createCustomPage(browser, secondPageHTML, './docs/page_1.pdf');
    pdfFiles.push('./docs/page_1.pdf');

    // Processing the rest of the pages
    for (let i = 0; i < links.length; i++) {
        await applyCSSAndConvertToPDF(browser, links[i], './config/print_style.css', i + 2);
        pdfFiles.push(`./docs/page_${i + 2}.pdf`);
    }

    await browser.close();
    await mergePDFs(pdfFiles,`./docs/${metadata.file}.pdf`);
    console.log('PDFs merged successfully!');
})();
