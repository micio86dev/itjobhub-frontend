import { test, expect } from '@playwright/test';

test.describe('Internationalization (i18n)', () => {
    test('should persist language selection in cookies after page refresh', async ({ page, context }) => {
        // 1. Navigate to the homepage
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // 2. Open the language dropdown
        const langBtn = page.locator('.lang-btn');
        await expect(langBtn).toBeVisible();
        await langBtn.click();

        // 3. Select English (🇺🇸)
        const enBtn = page.locator('.lang-dropdown button:has-text("🇺🇸")');
        await expect(enBtn).toBeVisible();
        await enBtn.click();

        // 4. Verify that the language has changed
        const jobsLink = page.locator('.desktop-links .nav-link').first();
        await expect(jobsLink).toBeVisible();
        // In English it should be "Jobs"
        await expect(jobsLink).toHaveText(/Jobs/i, { timeout: 10000 });

        // 5. Check if the cookie is set
        const cookies = await context.cookies();
        const langCookie = cookies.find(c => c.name === 'preferred-language');
        expect(langCookie).toBeDefined();
        expect(langCookie?.value).toBe('en');

        // 6. Refresh the page
        await page.reload();
        await page.waitForLoadState('networkidle');

        // 7. Verify that the language is still English
        await expect(jobsLink).toHaveText(/Jobs/i, { timeout: 10000 });

        // 8. Open the language dropdown again
        await langBtn.click();

        // 9. Select Italian (🇮🇹)
        const itBtn = page.locator('.lang-dropdown button:has-text("🇮🇹")');
        await expect(itBtn).toBeVisible();
        await itBtn.click();

        // 10. Verify that it changed back to Italian (should be "Annunci")
        await expect(jobsLink).toHaveText(/Annunci/i, { timeout: 10000 });

        // 11. Refresh the page
        await page.reload();
        await page.waitForLoadState('networkidle');

        // 12. Verify that it remains Italian
        await expect(jobsLink).toHaveText(/Annunci/i, { timeout: 10000 });

        // 13. Check cookie again
        const updatedCookies = await context.cookies();
        const updatedLangCookie = updatedCookies.find(c => c.name === 'preferred-language');
        expect(updatedLangCookie?.value).toBe('it');
    });
});
