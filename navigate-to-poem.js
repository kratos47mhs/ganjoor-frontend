const { chromium } = require('@playwright/test');

async function navigateToRandomPoem() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('🌸 Navigating to Ganjoor Persian Poetry Platform...');

    // Go to home page
    await page.goto('http://localhost:3000');
    console.log('✅ Home page loaded');

    // Wait for poets to load
    await page.waitForSelector('[class*="persian-card"]');
    console.log('✅ Poets loaded');

    // Get all poet cards
    const poetCards = await page.locator('[class*="persian-card"]').all();
    console.log(`📚 Found ${poetCards.length} poets`);

    // Get a sample poem from the API to find a working navigation path
    console.log('🔍 Getting sample poem from API...');
    let foundPoems = false;

    try {
      const response = await fetch('http://localhost:8000/api/poems/?page_size=1');
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const samplePoem = data.results[0];
        console.log(`📚 Found sample poem: ID ${samplePoem.id}, Category ${samplePoem.category}, Poet: ${samplePoem.poet_name}`);

        // Navigate to the category page that contains this poem
        await page.goto(`http://localhost:3000/categories/${samplePoem.category}`);
        console.log(`📂 Navigated to category page: /categories/${samplePoem.category}`);

        // Wait for the category page to load
        await page.waitForURL(/\/categories\/\d+/);
        console.log(`📜 Category page loaded successfully`);

        // Check what's on the page
        const pageContent = await page.textContent('body');
        console.log('Page content preview:', pageContent.substring(0, 300));

        // Look for the specific poem link
        const poemLink = page.locator(`a[href*="/poems/${samplePoem.id}"]`);
        const poemExists = await poemLink.count() > 0;

        if (poemExists) {
          console.log(`🎨 Found poem link for ID ${samplePoem.id}`);
          await poemLink.click();
          console.log('🎨 Clicked on poem link');

          // Wait for poem page
          await page.waitForURL(/\/poems\/\d+/);
          console.log(`🌹 Poem page loaded: ${page.url()}`);

          // Get poem title
          const poemTitle = await page.locator('h1').textContent();
          console.log(`📖 Poem Title: ${poemTitle}`);

          // Get some poem content
          const poemContent = await page.locator('.persian-text').first().textContent();
          console.log(`📜 Poem Content Preview: ${poemContent?.substring(0, 100)}...`);

          console.log('\n🎉 Successfully navigated to a beautiful Persian poem!');
          console.log(`🌐 Current URL: ${page.url()}`);

          foundPoems = true;
        } else {
          console.log(`❌ Poem link for ID ${samplePoem.id} not found on category page`);
          console.log('🔄 Trying to find any poem link on this page...');

          // Fallback: click on any poem link
          const anyPoemLink = page.locator('a[href*="/poems/"]').first();
          const anyPoemExists = await anyPoemLink.count() > 0;

          if (anyPoemExists) {
            console.log('🎨 Found alternative poem link, clicking...');
            await anyPoemLink.click();

            // Wait for poem page
            await page.waitForURL(/\/poems\/\d+/);
            console.log(`🌹 Alternative poem page loaded: ${page.url()}`);

            // Get poem title
            const poemTitle = await page.locator('h1').textContent();
            console.log(`📖 Poem Title: ${poemTitle}`);

            // Get some poem content
            const poemContent = await page.locator('.persian-text').first().textContent();
            console.log(`📜 Poem Content Preview: ${poemContent?.substring(0, 100)}...`);

            console.log('\n🎉 Successfully navigated to a Persian poem via alternative route!');
            console.log(`🌐 Current URL: ${page.url()}`);

            foundPoems = true;
          } else {
            console.log('❌ No poem links found on category page at all');
            console.log('🔄 Falling back to direct poem navigation...');

            // Direct navigation as final fallback
            await page.goto(`http://localhost:3000/poems/${samplePoem.id}`);
            console.log(`🎨 Direct navigation to poem: /poems/${samplePoem.id}`);

            // Wait for poem page
            await page.waitForURL(/\/poems\/\d+/);
            console.log(`🌹 Poem page loaded: ${page.url()}`);

            // Get poem title
            const poemTitle = await page.locator('h1').textContent();
            console.log(`📖 Poem Title: ${poemTitle}`);

            // Get some poem content
            const poemContent = await page.locator('.persian-text').first().textContent();
            console.log(`📜 Poem Content Preview: ${poemContent?.substring(0, 100)}...`);

            console.log('\n🎉 Successfully navigated to Persian poem via direct route!');
            console.log(`🌐 Current URL: ${page.url()}`);

            foundPoems = true;
          }
        }
      } else {
        console.log('❌ No poems found in API response');
      }
    } catch (error) {
      console.log('❌ Error fetching sample poem from API:', error.message);
    }

    if (!foundPoems) {
      console.log('❌ Could not find any poems after trying multiple poets and categories');
      console.log('🔄 Trying direct poem navigation...');

      // Try navigating directly to some known poem IDs
      const testPoemIds = [1, 2, 3, 4, 5, 10, 100, 1000];

      for (const poemId of testPoemIds) {
        try {
          console.log(`🎨 Trying direct poem navigation to ID: ${poemId}`);
          await page.goto(`http://localhost:3000/poems/${poemId}`, { waitUntil: 'networkidle' });

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
              foundPoems = true;
              break;
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

      if (!foundPoems) {
        console.log('❌ Could not find any poems even with direct navigation');
        console.log('💡 This suggests the database may not have poem data, or API endpoints are not working');
      }
    }

  } catch (error) {
    console.error('❌ Error during navigation:', error.message);
  } finally {
    await browser.close();
  }
}

navigateToRandomPoem();
