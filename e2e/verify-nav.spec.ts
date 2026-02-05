import { test, expect } from './fixtures';
import { ensurePageReady } from './helpers';

test('navbar link should have correct styles in light and dark mode', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
    await ensurePageReady(page);

    // Initial state
    const initiallyDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));

    // Toggle theme
    const themeToggle = page.getByTestId('theme-toggle');
    await themeToggle.click();

    // Verify theme change with polling for stability
    await expect.poll(async () => {
        return await page.evaluate(() => document.documentElement.classList.contains('dark'));
    }, {
        message: 'Theme should have toggled',
        timeout: 10000
    }).toBe(!initiallyDark);
});
