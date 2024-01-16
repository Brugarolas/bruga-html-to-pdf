import fs from 'fs';
import puppeteer from 'puppeteer';
import { PDFDocument } from 'pdf-lib';
import terminal from 'terminal-kit';
import chalk from 'chalk';
// import ora from 'ora';
import fsPromises from 'fs/promises';
import path from 'path';

const tmpFolderPath = path.join('.', 'tmp');
const term = terminal.terminal;

class Color {
  constructor(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  mix(color, percent) {
    const r = Math.round(this.r + percent * (color.r - this.r));
    const g = Math.round(this.g + percent * (color.g - this.g));
    const b = Math.round(this.b + percent * (color.b - this.b));

    return new Color(r, g, b);
  }

  rgb(r, g, b) {
    return new Color(r, g, b);
  }

  toChalk() {
    return chalk.rgb(this.r, this.g, this.b);
  }
}

const Colors = {};
Colors.red = new Color(255, 0, 0);
Colors.orange = new Color(255, 136, 0);
Colors.yellow = new Color(255, 255, 0);
Colors.green = new Color(0, 255, 0);

function getGradientColor(progress) {
  // Define the gradient colors
  const gradient = [
    { percent: 0, color: Colors.red },
    { percent: 0.33, color: Colors.orange },
    { percent: 0.66, color: Colors.yellow },
    { percent: 1, color: Colors.green }
  ];

  // Find the two closest colors in the gradient
  let startColor, endColor;
  for (let i = 0; i < gradient.length - 1; i++) {
    if (progress >= gradient[i].percent && progress <= gradient[i + 1].percent) {
      startColor = gradient[i];
      endColor = gradient[i + 1];
      break;
    }
  }

  // Calculate the in-between color based on progress
  const colorProgress = (progress - startColor.percent) / (endColor.percent - startColor.percent);
  return startColor.color.mix(endColor.color, colorProgress);
}

function getOraRandomColor() {
  const colors = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white', 'gray'];
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
}

// Initialize the progress bar
let progressBar, spinner, progress = 0;

// Create and display the progress bar
async function createProgressBar() {
  progressBar = term.progressBar({
    width: 80,
    title: 'Building PDF:',
    eta: true,
    percent: true
  });

  // spinner = ora('Page 1').start();

  // spinner = await term.spinner('dotSpinner');
  // term('Page 1') ;
}

// Function to update the progress bar
function updateProgressBar(tasksCompleted, totalTasks) {
  // Calculate progress as a ratio of tasks completed to total tasks
  progress = tasksCompleted / totalTasks;

  // Update the progress bar
  progressBar.update(progress);

  // Apply gradient color based on progress
  term.moveTo(1, 2, getGradientColor(progress).toChalk()('Progress: ' + Math.round(progress * 100) + '%'));

  if (tasksCompleted >= totalTasks) {
    // Finished./docs
    term.moveTo(1, 3).green('Done!\n');
  } else {
    // spinner.color = getOraRandomColor();
    // spinner.text = `Page ${tasksCompleted + 1}`;

    // term('Page ' + (tasksCompleted + 1));
  }
}

// Let's start by creating the progress bar
await createProgressBar();

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
  fs.writeFileSync(`./tmp/page_${index}.pdf`, pdf);
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

async function createTmpFolder(tmpFolder = tmpFolderPath) {
  try {
    await fsPromises.access(tmpFolder);
  } catch {
    await fsPromises.mkdir(tmpFolder);
  }
}

(async () => {
  const links = await readLinksFromFile('./config/links_to_print.txt');
  const totalTasks = links.length + 2;
  updateProgressBar(0, totalTasks);

  const browser = await puppeteer.launch({ headless: 'new' });
  const metadata = await readMetadataFromFile('./config/print_metadata.json');
  const pdfFiles = [];

  await createTmpFolder()

  // Creating the first page
  const imageBase64 = fs.readFileSync('./config/image_title.png', 'base64');
  const firstPageHTML = `
        <div style="text-align: center; margin-top: 32%;">
            <img src="data:image/png;base64, ${imageBase64}" style="max-width: 100%; max-height: 100%; margin-bottom: 112px;">
            <h1 style="font-size: 28px; font-weight: bolder; font-family: 'Roboto', sans-serif;">${metadata.title}</h1>
        </div>`;
  await createCustomPage(browser, firstPageHTML, './tmp/page_0.pdf');

  pdfFiles.push('./tmp/page_0.pdf');
  updateProgressBar(1, totalTasks)

  // Creating the second page
  const subtitle = 'Made with <3 by Andrés Brugarolas Martínez with Bruga\'s HTML to PDF converter'
  const secondPageHTML = `
        <div style="display: flex; justify-content: center; align-items: center; height: 100%;">
            <p style="font-size: 16px; font-weight: bold; font-family: 'Courier New', monospace; text-align: center; padding: 50px;">${subtitle}</p>
        </div>`;
  await createCustomPage(browser, secondPageHTML, './tmp/page_1.pdf');

  pdfFiles.push('./tmp/page_1.pdf');
  updateProgressBar(2, totalTasks)

  // Processing the rest of the pages
  for (let i = 0; i < links.length; i++) {
    await applyCSSAndConvertToPDF(browser, links[i], './config/print_style.css', i + 2);

    pdfFiles.push(`./tmp/page_${i + 2}.pdf`);
    updateProgressBar(i + 3, totalTasks)
  }

  await browser.close();
  await mergePDFs(pdfFiles, `./docs/${metadata.file}.pdf`);
  await fsPromises.rm(tmpFolderPath, { recursive: true, force: true });

  console.log('PDFs merged successfully!');
})();
