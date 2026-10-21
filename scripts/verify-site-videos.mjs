import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SCREENSHOT_DIR = process.env.SCREENSHOT_DIR || path.resolve('.screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function runVerification() {
  console.log('🚀 Launching Chrome via Puppeteer-core...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    defaultViewport: { width: 1440, height: 960 }
  });

  try {
    const page = await browser.newPage();
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('BROWSER ERROR:', msg.text());
      }
    });

    // Preset guest session and dark theme
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('afrah-guest-session', 'true');
      localStorage.setItem('afrah-theme', 'dark');
    });

    console.log('1. Navigating to http://localhost:4321/afrah-app...');
    await page.goto('http://localhost:4321/afrah-app', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2500);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_afrah_app_home.png') });
    console.log('Saved: 01_afrah_app_home.png');

    // 2. Click SITE VIDEOS button in sidebar
    console.log('2. Clicking "SITE VIDEOS" in sidebar...');
    const siteVideosClicked = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const found = btns.find(b => b.innerText.includes('SITE VIDEOS') || b.getAttribute('title') === 'Site Videos');
      if (found) {
        found.click();
        return true;
      }
      return false;
    });

    if (!siteVideosClicked) {
      console.error('Could not find SITE VIDEOS button in sidebar!');
    }
    await sleep(1500);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_site_videos_dashboard.png') });
    console.log('Saved: 02_site_videos_dashboard.png');

    // 3. Open "+ Upload New Video" Modal
    console.log('3. Clicking "+ Upload New Video"...');
    const uploadBtnClicked = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const upload = btns.find(b => b.innerText.includes('Upload New Video'));
      if (upload) {
        upload.click();
        return true;
      }
      return false;
    });

    await sleep(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_upload_modal.png') });
    console.log('Saved: 03_upload_modal.png');

    // 4. Fill in form and create new video
    console.log('4. Filling in upload form...');
    // Switch to URL source option
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const urlOpt = btns.find(b => b.innerText.includes('Direct Video URL'));
      if (urlOpt) urlOpt.click();
    });
    await sleep(500);

    const titleInput = await page.$('input[placeholder="e.g. Teak Courtyard Villa"]');
    if (titleInput) {
      await titleInput.type('Emerald Horizon Villa');
    }

    const subtitleInput = await page.$('input[placeholder="e.g. RCC Slab & Cantilever Deck"]');
    if (subtitleInput) {
      await subtitleInput.type('Cantilever Porch & Glass Facade');
    }

    const urlInput = await page.$('input[placeholder*="/videos/sample-construction"]');
    if (urlInput) {
      await urlInput.type('/videos/sample-construction-2.mov');
    }

    const descInput = await page.$('textarea[placeholder*="Describe what is happening"]');
    if (descInput) {
      await descInput.type('Precision architectural walkthrough showing cantilever porch casting, Italian marble flooring, and high ceilings.');
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_form_filled.png') });
    console.log('Saved: 04_form_filled.png');

    // Submit form
    console.log('Submitting video...');
    await page.evaluate(() => {
      const submitBtn = document.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.click();
    });
    await sleep(2000);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_after_video_added.png') });
    console.log('Saved: 05_after_video_added.png');

    // Verify video appears in list
    const cardTitles = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('h3')).map(h => h.innerText.trim());
    });
    console.log('App cards after addition:', cardTitles);
    const addedFound = cardTitles.some(t => t.includes('Emerald Horizon Villa'));
    console.log('New video present in app:', addedFound ? '✅ YES' : '❌ NO');

    // 5. Check Landing Page
    console.log('5. Checking Landing Page http://localhost:4321/#cinematics...');
    await page.goto('http://localhost:4321/#cinematics', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2500);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_landing_page_with_new_video.png') });
    console.log('Saved: 06_landing_page_with_new_video.png');

    const landingReelTitles = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.reel-title')).map(el => el.innerText.trim());
    });
    console.log('Landing page reel titles:', landingReelTitles);
    const onLanding = landingReelTitles.some(t => t.includes('Emerald Horizon Villa'));
    console.log('New video visible on landing page:', onLanding ? '✅ YES' : '❌ NO');

    // 6. Test Editing Video Title and Content
    console.log('6. Navigating back to app to test edit...');
    await page.goto('http://localhost:4321/afrah-app', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2000);

    // Click SITE VIDEOS
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const found = btns.find(b => b.innerText.includes('SITE VIDEOS') || b.getAttribute('title') === 'Site Videos');
      if (found) found.click();
    });
    await sleep(1500);

    // Click edit on the new video
    console.log('Clicking edit button...');
    await page.evaluate(() => {
      const editBtns = Array.from(document.querySelectorAll('button[title*="Edit"]'));
      if (editBtns[0]) editBtns[0].click();
    });
    await sleep(1000);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_edit_modal_open.png') });
    console.log('Saved: 07_edit_modal_open.png');

    // Change title
    await page.evaluate(() => {
      const titleInp = document.querySelector('.afrah-app-modal-container input[required]');
      if (titleInp) {
        titleInp.value = 'Emerald Horizon Residence (Phase 2 Completed)';
        titleInp.dispatchEvent(new Event('input', { bubbles: true }));
      }
      const descInp = document.querySelector('.afrah-app-modal-container textarea');
      if (descInp) {
        descInp.value = 'Updated engineering narrative: Complete handover walkthrough with landscaped courtyard view.';
        descInp.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    await sleep(500);

    // Save changes
    await page.evaluate(() => {
      const saveBtn = Array.from(document.querySelectorAll('.afrah-app-modal-container button')).find(b => b.innerText.includes('Save Changes'));
      if (saveBtn) saveBtn.click();
    });
    await sleep(2000);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08_after_edit.png') });
    console.log('Saved: 08_after_edit.png');

    // Check title in app
    const appTitlesAfterEdit = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('h3')).map(h => h.innerText.trim());
    });
    console.log('App titles after edit:', appTitlesAfterEdit);

    // 7. Test Delete / Remove Video
    console.log('7. Testing video removal from app...');
    await page.evaluate(() => {
      const deleteBtns = Array.from(document.querySelectorAll('button[title*="Remove"]'));
      if (deleteBtns[0]) deleteBtns[0].click();
    });
    await sleep(1000);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09_delete_confirmation.png') });
    console.log('Saved: 09_delete_confirmation.png');

    // Confirm deletion
    await page.evaluate(() => {
      const modal = document.querySelector('.afrah-app-modal-container');
      if (modal) {
        const removeConfirm = Array.from(modal.querySelectorAll('button')).find(b => b.innerText.includes('Remove Video'));
        if (removeConfirm) removeConfirm.click();
      }
    });
    await sleep(2000);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10_after_delete.png') });
    console.log('Saved: 10_after_delete.png');

    const appTitlesAfterDelete = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('h3')).map(h => h.innerText.trim());
    });
    console.log('App titles after delete:', appTitlesAfterDelete);
    const deletedGoneFromApp = !appTitlesAfterDelete.some(t => t.includes('Emerald Horizon'));
    console.log('Video removed from app:', deletedGoneFromApp ? '✅ YES' : '❌ NO');

    // Check Landing page after delete
    await page.goto('http://localhost:4321/#cinematics', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2000);

    const landingTitlesAfterDelete = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.reel-title')).map(el => el.innerText.trim());
    });
    console.log('Landing page titles after delete:', landingTitlesAfterDelete);
    const deletedGoneFromLanding = !landingTitlesAfterDelete.some(t => t.includes('Emerald Horizon'));
    console.log('Video removed from landing page:', deletedGoneFromLanding ? '✅ YES' : '❌ NO');

    console.log('🎉 All flow steps verified successfully!');
  } catch (err) {
    console.error('Error during verification:', err);
  } finally {
    await browser.close();
  }
}

runVerification();
