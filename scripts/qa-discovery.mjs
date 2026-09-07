import puppeteer from 'puppeteer-core';
import fs from 'fs';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SCREENSHOT_DIR = '/Users/raguram.g.p/.gemini/antigravity-ide/brain/adf314b2-18db-4302-8343-d7f05db58521/screenshots';

async function main() {
  console.log('🚀 Starting Phase 1: Discovery & Mapping...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();
  
  const consoleMessages = [];
  const networkErrors = [];

  page.on('console', msg => {
    consoleMessages.push({ type: msg.type(), text: msg.text() });
  });

  page.on('requestfailed', request => {
    networkErrors.push({ url: request.url(), failure: request.failure()?.errorText });
  });

  console.log('Navigating to https://aftrah.vercel.app/afrah-app...');
  await page.goto('https://aftrah.vercel.app/afrah-app', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  await page.screenshot({ path: `${SCREENSHOT_DIR}/01_initial_discovery.png`, fullPage: true });
  console.log('Saved screenshot: 01_initial_discovery.png');

  const pageData = await page.evaluate(() => {
    const title = document.title;
    const url = window.location.href;

    const buttons = Array.from(document.querySelectorAll('button')).map((b, i) => ({
      index: i,
      text: b.innerText.trim().replace(/\n+/g, ' '),
      ariaLabel: b.getAttribute('aria-label'),
      className: b.className,
      disabled: b.disabled
    }));

    const inputs = Array.from(document.querySelectorAll('input, select, textarea')).map((el, i) => ({
      index: i,
      tag: el.tagName.toLowerCase(),
      type: el.getAttribute('type') || (el.tagName.toLowerCase() === 'textarea' ? 'textarea' : 'text'),
      name: el.getAttribute('name'),
      placeholder: el.getAttribute('placeholder'),
      value: el.value,
      required: el.required
    }));

    const links = Array.from(document.querySelectorAll('a')).map((a, i) => ({
      index: i,
      text: a.innerText.trim().replace(/\n+/g, ' '),
      href: a.getAttribute('href')
    }));

    const sidebarItems = Array.from(document.querySelectorAll('aside nav button, aside button, nav button')).map(b => b.innerText.trim().replace(/\n+/g, ' '));

    return {
      title,
      url,
      buttonsCount: buttons.length,
      buttons: buttons.slice(0, 30),
      inputsCount: inputs.length,
      inputs,
      linksCount: links.length,
      links: links.slice(0, 20),
      sidebarItems
    };
  });

  console.log('Discovery Results:', JSON.stringify(pageData, null, 2));
  console.log('Console messages:', consoleMessages);
  console.log('Network errors:', networkErrors);

  fs.writeFileSync(
    `${SCREENSHOT_DIR}/discovery_data.json`,
    JSON.stringify({ pageData, consoleMessages, networkErrors }, null, 2)
  );

  await browser.close();
}

main().catch(err => {
  console.error('Discovery failed:', err);
  process.exit(1);
});
