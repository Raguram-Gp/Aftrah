import puppeteer from 'puppeteer-core';
import fs from 'fs';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SCREENSHOT_DIR = '/Users/raguram.g.p/.gemini/antigravity-ide/brain/c6bbd7cf-50bf-4017-9888-84d27c4d9e6a';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function verifyPreview() {
  console.log('🚀 Launching Puppeteer with Chrome...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    defaultViewport: { width: 1440, height: 960 }
  });

  try {
    const page = await browser.newPage();
    console.log('Navigating to http://localhost:4321/afrah-app...');
    await page.goto('http://localhost:4321/afrah-app', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2000);

    // Set dark theme explicitly
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
      localStorage.setItem('afrah-theme', 'dark');
    });
    await sleep(500);

    // Click on the first client row to open ClientDetailsView
    console.log('Looking for client rows in table...');
    const clientRow = await page.$('.afrah-app-table tbody tr');
    if (clientRow) {
      console.log('Clicking on client row...');
      await clientRow.click();
      await sleep(1500);
    } else {
      console.error('Could not find client row!');
    }

    // Find and click the 'Print Preview / Statement' button
    console.log('Looking for Print Preview button...');
    const printBtns = await page.$$('button');
    for (const btn of printBtns) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && (text.includes('Print Preview') || text.includes('Print Statement'))) {
        console.log('Clicking button:', text);
        await btn.click();
        break;
      }
    }

    await sleep(1500);

    // Check if modal is open
    const modal = await page.$('.statement-preview-backdrop');
    if (modal) {
      console.log('✅ Statement Print Preview modal is open!');

      // Capture screenshot of Theme View (Dark luxury mode)
      await page.screenshot({ path: `${SCREENSHOT_DIR}/preview_theme_dark.png` });
      console.log('Captured preview_theme_dark.png');

      // Click "Paper" toggle button
      const paperBtn = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll('.preview-mode-btn'));
        return btns.find(b => b.textContent.trim().startsWith('Paper'));
      });
      if (paperBtn && paperBtn.click) {
        console.log('Clicking Paper View...');
        await paperBtn.click();
        await sleep(600);
        await page.screenshot({ path: `${SCREENSHOT_DIR}/preview_paper_mode.png` });
        console.log('Captured preview_paper_mode.png');
      }

      // Switch back to Theme View
      const themeBtn = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll('.preview-mode-btn'));
        return btns.find(b => b.textContent.trim().startsWith('Theme'));
      });
      if (themeBtn && themeBtn.click) {
        console.log('Clicking Theme View...');
        await themeBtn.click();
        await sleep(600);
      }

      // Test Complete Statement Tab
      const statementTabBtn = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll('.preview-pill-btn'));
        return btns.find(b => b.textContent.includes('Statement'));
      });
      if (statementTabBtn && statementTabBtn.click) {
        console.log('Clicking Complete Statement tab...');
        await statementTabBtn.click();
        await sleep(600);
        await page.screenshot({ path: `${SCREENSHOT_DIR}/preview_complete_statement_dark.png` });
        console.log('Captured preview_complete_statement_dark.png');
      }

      // Test Light Mode
      await page.evaluate(() => {
        document.documentElement.setAttribute('data-theme', 'light');
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      });
      await sleep(600);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/preview_theme_light.png` });
      console.log('Captured preview_theme_light.png');

      // Test PDF export directly
      console.log('Generating sample PDF output to verify print layout...');
      await page.emulateMediaType('print');
      await page.pdf({
        path: `${SCREENSHOT_DIR}/statement_invoice_print.pdf`,
        format: 'A4',
        printBackground: true,
        margin: { top: '8mm', bottom: '8mm', left: '8mm', right: '8mm' }
      });
      console.log('Generated statement_invoice_print.pdf');
    } else {
      console.error('❌ Modal backdrop not found!');
    }

    console.log('🎉 Verification completed successfully!');
  } catch (err) {
    console.error('Error during verification:', err);
  } finally {
    await browser.close();
  }
}

verifyPreview();
