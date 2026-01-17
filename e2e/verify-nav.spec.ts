import { test, expect } from '@playwright/test';

test('navbar link should have correct styles in light and dark mode', async ({ page }) => {
    // Navigate to homepage
    await page.goto('http://localhost:5173');

    // Ensure we start in light mode
    await page.evaluate(() => document.documentElement.classList.remove('dark'));

    // Detect if we are on mobile
    const isMobile = await page.evaluate(() => window.innerWidth < 768);

    if (isMobile) {
        // Open mobile menu first
        await page.click('[data-testid="mobile-menu-button"]');
    }

    // Wait for the navbar link to be visible (nav-link for desktop, mobile-nav-link for mobile)
    const navLink = isMobile
        ? page.locator('.mobile-nav-link').first()
        : page.locator('.nav-link').first();

    await expect(navLink).toBeVisible();

    // Check light mode color
    // text-gray-700 is rgb(55, 65, 81)
    await expect(navLink).toHaveCSS('color', 'rgb(55, 65, 81)');

    // Toggle dark mode by clicking the actual theme toggle button
    await page.click('.theme-toggle');

    // Wait for the class to be applied
    await expect(page.locator('html')).toHaveClass(/dark/);

    // Check dark mode color
    // text-white is rgb(255, 255, 255)
    await expect(navLink).toHaveCSS('color', 'rgb(255, 255, 255)', { timeout: 10000 });
});
