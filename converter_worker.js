const { parentPort } = require('piscina');
const fs = require('fs');

async function applyCSSAndConvertToPDF(link, cssPath, pageIndex) {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto(link, { waitUntil: 'networkidle0' });

  const customCSS = fs.readFileSync(cssPath, 'utf8');
  await page.addStyleTag({ content: customCSS });

  // Add footer for page number
  await page.evaluate((pageIndex) => {
    const footer = document.createElement('footer');
    footer.textContent = `Page ${pageIndex}`;
    footer.style.position = 'absolute';
    footer.style.bottom = '10px';
    footer.style.right = '10px';
    footer.style.fontSize = '12px';
    document.body.appendChild(footer);
  }, pageIndex);

  const pdf = await page.pdf({ format: 'A4' });
  const pdfName = `./docs/page_${pageIndex}.pdf`;
  fs.writeFileSync(pdfName, pdf);
  await page.close();
  await browser.close();
  return pdfName;
}

parentPort.on('message', async ({ link, cssPath, pageIndex }) => {
    const pdfFilename = await applyCSSAndConvertToPDF(link, cssPath, pageIndex);

    parentPort.postMessage(pdfFilename);
});
