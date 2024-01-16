const fs = require('fs');
const Piscina = require('piscina');
const puppeteer = require('puppeteer');
const { PDFDocument, rgb } = require('pdf-lib');
const os = require('os');
const path = require('path');

// Create ThreadPool with number of cores - 1 threads
const piscina = new Piscina({
  maxThreads: os.cpus().length / 2 - 1,
  filename: path.resolve(__dirname, 'converter_worker.js')
});

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
  const firstPageHTML = `
    <div style="text-align: center; margin-top: 36%;">
      <img src="file://${__dirname}/config/image_title.png" style="margin-bottom: 112px;">
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
  const createPdfsPromises = links.map((link, index) =>
    piscina.run({ link, cssPath: './config/print_style.css', pageIndex: i + index + 2 })
  );

  // Wait for all the promises to be resolved
  const batchPdfFiles = await Promise.all(createPdfsPromises);
  await browser.close();
  pdfFiles.push(...batchPdfFiles).sort();

  // Merge all the PDFs
  await mergePDFs(pdfFiles, `./docs/${metadata.file}.pdf`);

  // Delete all the PDFs
  const deletePromises = pdfFiles.map(pdfFile => new Promise((resolve, reject) => {
    fs.unlink(pdfFile, (err) => {
      if (err) reject(err);
      resolve(pdfFile);
    });
  }));

  await Promise.all(deletePromises);

  // Success!
  console.log('PDFs merged successfully!');
})();
