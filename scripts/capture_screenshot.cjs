const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Navigate to the study page
  await page.goto('http://localhost:5173/study', { waitUntil: 'networkidle' });
  
  // Find a day row that is NOT completed and click its checkbox to trigger the inline picker
  // The 'mark complete' text is visible or the checkbox is there.
  // We can look for aria-label="Mark Day X complete" where X is some incomplete day.
  const checkbox = await page.locator('button[aria-label*="complete"]').filter({ hasNotText: 'incomplete' }).first();
  await checkbox.click();
  
  // Wait for the inline picker animation to finish
  await page.waitForTimeout(1000);
  
  // Take a screenshot of the specific row
  const row = await checkbox.locator('xpath=./ancestor::div[contains(@class, "relative")]').first();
  const artifactsDir = 'C:/Users/ABC/.gemini/antigravity-ide/brain/33c429ba-17f6-4a9f-b487-36047b55eeb2/scratch/';
  await row.screenshot({ path: artifactsDir + 'picker_screenshot.png' });
  
  await browser.close();
  console.log('Screenshot saved to ' + artifactsDir + 'picker_screenshot.png');
})();
