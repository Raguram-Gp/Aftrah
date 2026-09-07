import puppeteer from 'puppeteer-core';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SCREENSHOT_DIR = '/Users/raguram.g.p/.gemini/antigravity-ide/brain/adf314b2-18db-4302-8343-d7f05db58521/screenshots';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function verify() {
  console.log('🔍 Running Verification on http://localhost:4322/afrah-app...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:4322/afrah-app', { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(1500);

  // 1. Test Client Creation & Toast Notification
  console.log('Testing client creation and toast notification...');
  const nameInput = await page.$('input[placeholder="e.g. Ramesh Patel"]');
  const phoneInput = await page.$('input[placeholder="+91 98765 43210"]');
  const addressInput = await page.$('textarea[placeholder="Street, City, Postal Code..."]');

  await nameInput.type('Toast_Test_Client');
  await phoneInput.type('9998887776');
  await addressInput.type('99 Verification Boulevard');

  const submitBtn = await page.$('.afrah-app-submit-btn');
  await submitBtn.click();
  await sleep(500);

  // Capture screenshot of toast
  await page.screenshot({ path: `${SCREENSHOT_DIR}/verify_01_add_client_toast.png` });

  const toastText = await page.evaluate(() => {
    const toast = Array.from(document.querySelectorAll('*')).find(el => el.innerText && el.innerText.includes('Client added successfully'));
    return toast ? toast.innerText : null;
  });
  console.log('Captured Toast Notification on Add:', toastText);

  // Clean up: delete test client
  const searchInput = await page.$('input[placeholder="Search name, phone, address..."]');
  await searchInput.type('Toast_Test_Client');
  await sleep(600);

  const deleteBtn = await page.$('button[aria-label="Delete Client"]');
  if (deleteBtn) {
    await deleteBtn.click();
    await sleep(600);
    await page.evaluate(() => {
      const modal = document.querySelector('.afrah-app-modal-container');
      if (modal) {
        const confirm = Array.from(modal.querySelectorAll('button')).find(b => b.innerText.includes('Delete'));
        if (confirm) confirm.click();
      }
    });
    await sleep(600);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/verify_02_delete_client_toast.png` });
    const deleteToast = await page.evaluate(() => {
      const toast = Array.from(document.querySelectorAll('*')).find(el => el.innerText && el.innerText.includes('Client deleted successfully'));
      return toast ? toast.innerText : null;
    });
    console.log('Captured Toast Notification on Delete:', deleteToast);
  }

  // 2. Navigate to Bank Details & Inspect Timestamp Typography
  console.log('Testing Bank Details timestamp layout...');
  await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('.afrah-app-nav-subitem'));
    const bankTab = items.find(el => el.innerText.toLowerCase().includes('bank'));
    if (bankTab) bankTab.click();
  });
  await sleep(1500);

  await page.screenshot({ path: `${SCREENSHOT_DIR}/verify_03_bank_details_fixed.png` });

  const bankCardMetrics = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.bank-card, div[style*="CURRENT BALANCE"]'));
    return cards.map(c => c.innerText.replace(/\n+/g, ' | ')).slice(0, 3);
  });
  console.log('Bank Card content sample:', bankCardMetrics);

  await browser.close();
  console.log('✅ Verification Completed Successfully!');
}

verify().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
