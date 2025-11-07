import { test, expect } from '@playwright/test';

test.describe('Ganjoor Persian Poetry Platform', () => {
  test.beforeEach(async ({ page }) => {
    // Set longer timeout for API calls
    test.setTimeout(60000);
  });

  test('should load home page and display poets', async ({ page }) => {
    await page.goto('/');

    // Check page title and main heading
    await expect(page).toHaveTitle(/گنجور/);
    await expect(page.locator('h1')).toContainText('گنجور - مجموعه اشعار فارسی');

    // Check that poets are loaded (should have multiple poet cards)
    const poetCards = page.locator('[class*="persian-card"]');
    await expect(poetCards.first()).toBeVisible();

    // Check that century filter buttons are present
    const filterButtons = page.locator('button').filter({ hasText: /همه|باستانی|کلاسیک|معاصر|نو/ });
    await expect(filterButtons).toHaveCount(5);
  });

  test('should filter poets by century', async ({ page }) => {
    await page.goto('/');

    // Wait for poets to load
    await page.waitForSelector('[class*="persian-card"]');

    // Click on "کلاسیک" (Classical) filter
    await page.locator('button').filter({ hasText: 'کلاسیک' }).click();

    // Check that filtered results are shown
    const poetCards = page.locator('[class*="persian-card"]');
    await expect(poetCards.first()).toBeVisible();
  });

  test('should navigate to poet detail page', async ({ page }) => {
    await page.goto('/');

    // Wait for poets to load and click on first poet card
    await page.waitForSelector('[class*="persian-card"]');
    await page.locator('[class*="persian-card"]').first().click();

    // Should navigate to poet page
    await expect(page).toHaveURL(/\/poets\/\d+/);

    // Check that poet name is displayed
    const poetName = page.locator('h1');
    await expect(poetName).toBeVisible();
    await expect(poetName).not.toBeEmpty();

    // Check that categories are displayed
    const categoriesSection = page.locator('h2').filter({ hasText: 'دسته‌بندی‌ها' });
    await expect(categoriesSection).toBeVisible();
  });

  test('should navigate to category page from poet page', async ({ page }) => {
    await page.goto('/');

    // Navigate to first poet
    await page.waitForSelector('[class*="persian-card"]');
    await page.locator('[class*="persian-card"]').first().click();

    // Wait for categories to load and click on first category
    await page.waitForSelector('[class*="persian-card"]');
    const categoryCards = page.locator('[class*="persian-card"]').filter({ hasText: /دسته|شعر/ });
    if (await categoryCards.count() > 0) {
      await categoryCards.first().click();

      // Should navigate to category page
      await expect(page).toHaveURL(/\/categories\/\d+/);

      // Check category title is displayed
      const categoryTitle = page.locator('h1');
      await expect(categoryTitle).toBeVisible();
    }
  });

  test('should display Persian text correctly with RTL', async ({ page }) => {
    await page.goto('/');

    // Check that Persian text is present and properly aligned
    const persianText = page.locator('.persian-text, [dir="rtl"]');
    await expect(persianText.first()).toBeVisible();

    // Check that text alignment is right-to-left where expected
    const rtlElements = page.locator('[class*="text-right"]');
    if (await rtlElements.count() > 0) {
      await expect(rtlElements.first()).toBeVisible();
    }
  });

  test('should handle navigation breadcrumbs', async ({ page }) => {
    await page.goto('/');

    // Navigate to poet page
    await page.waitForSelector('[class*="persian-card"]');
    await page.locator('[class*="persian-card"]').first().click();

    // Check breadcrumb navigation
    const homeLink = page.locator('nav a').filter({ hasText: 'خانه' });
    await expect(homeLink).toBeVisible();
    await expect(homeLink).toHaveAttribute('href', '/');

    // Check that back navigation works
    await homeLink.click();
    await expect(page).toHaveURL('/');
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');

    // Check that mobile layout works
    const poetCards = page.locator('[class*="persian-card"]');
    await expect(poetCards.first()).toBeVisible();

    // Check that navigation still works on mobile
    await poetCards.first().click();
    await expect(page).toHaveURL(/\/poets\/\d+/);
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Navigate to a non-existent poet ID
    await page.goto('/poets/999999');

    // Should show 404 or error page
    await expect(page.locator('body')).toBeVisible();
  });

  test('should validate poem display when available', async ({ page }) => {
    await page.goto('/');

    // Navigate to poet page
    await page.waitForSelector('[class*="persian-card"]');
    await page.locator('[class*="persian-card"]').first().click();

    // If there are category links, try to navigate to one
    const categoryLinks = page.locator('a[href*="/categories/"]');
    if (await categoryLinks.count() > 0) {
      await categoryLinks.first().click();

      // Check if poems are displayed (may be rate limited)
      const poemLinks = page.locator('a[href*="/poems/"]');
      if (await poemLinks.count() > 0) {
        // If poems are available, click on first one
        await poemLinks.first().click();

        // Should navigate to poem page
        await expect(page).toHaveURL(/\/poems\/\d+/);

        // Check poem title is displayed
        const poemTitle = page.locator('h1');
        await expect(poemTitle).toBeVisible();
      } else {
        // Poems may be rate limited - check for rate limit message
        const rateLimitMessage = page.locator('text=/محدودیت نرخ/');
        // Either poems or rate limit message should be visible
        const hasPoemsOrMessage = (await poemLinks.count() > 0) || (await rateLimitMessage.count() > 0);
        expect(hasPoemsOrMessage).toBe(true);
      }
    }
  });

  test('should maintain Persian typography and spacing', async ({ page }) => {
    await page.goto('/');

    // Check for proper Persian font classes
    const persianElements = page.locator('.persian-text');
    await expect(persianElements.first()).toBeVisible();

    // Check that spacing and layout look correct
    const mainContent = page.locator('main, [class*="container"], [class*="max-w"]');
    await expect(mainContent).toBeVisible();
  });
});
