const { chromium } = require('@playwright/test');

async function testDirectPoemNavigation() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('🔄 Testing direct poem navigation...');

    // Try navigating directly to some known poem IDs from the API response
    const testPoemIds = [520004, 520005, 614011, 12056, 502025];

    for (const poemId of testPoemIds) {
      try {
        console.log(`🎨 Trying direct poem navigation to ID: ${poemId}`);
        await page.goto(`http://localhost:3000/poems/${poemId}`, { waitUntil: 'networkidle', timeout: 5000 });

        // Check if we're on a poem page
        const currentURL = page.url();
        if (currentURL.includes('/poems/')) {
          console.log(`🌹 Successfully navigated to poem page: ${currentURL}`);

          // Check if there's actual poem content
          const hasPoemContent = await page.locator('h1').count() > 0;
          if (hasPoemContent) {
            const poemTitle = await page.locator('h1').textContent();
            console.log(`📖 Poem Title: ${poemTitle}`);

            const poemContent = await page.locator('.persian-text').first().textContent();
            console.log(`📜 Poem Content Preview: ${poemContent?.substring(0, 100)}...`);

            console.log('\n🎉 Successfully found and displayed a Persian poem!');
            console.log(`🌐 Final URL: ${page.url()}`);
            return true; // Success
          } else {
            console.log(`⚠️ Poem page ${poemId} exists but has no content`);
          }
        } else {
          console.log(`⚠️ Poem ${poemId} redirected or not found`);
        }
      } catch (error) {
        console.log(`❌ Error accessing poem ${poemId}:`, error.message);
      }
    }

    console.log('❌ Could not find any poems even with direct navigation');
    console.log('💡 This suggests the database may not have poem data, or API endpoints are not working');
    return false;

  } catch (error) {
    console.error('❌ Error during direct navigation test:', error.message);
    return false;
  } finally {
    await browser.close();
  }
}

testDirectPoemNavigation();
