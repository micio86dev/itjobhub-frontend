import { test, expect } from '@playwright/test';
import { ensurePageReady } from './helpers';

test.describe('Internationalization (i18n)', () => {
    test('should persist language selection in cookies after page refresh', async ({ page, context }) => {
        // Capture browser logs
        page.on('console', msg => console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`));

        // 1. Navigate to the homepage
        await page.goto('/');
        await ensurePageReady(page);

        console.log('[E2E] Homepage loaded');

        // 2. Open the language dropdown
        const langBtn = page.locator('.lang-btn');
        await langBtn.click();
        await page.waitForTimeout(1000);

        // 3. Select English (🇺🇸)
        const enBtn = page.getByTestId('lang-select-en');
        console.log(`[E2E] English button visibility: ${await enBtn.isVisible()}`);

        await enBtn.click();
        console.log('[E2E] English button clicked');
        await page.waitForTimeout(2000); // Wait longer for hydration/re-render

        // 4. Verify that it changed to English
        const i18nRoot = page.getByTestId('i18n-root');
        const currentLang = await i18nRoot.getAttribute('data-lang');
        console.log(`[E2E] Current data-lang after click: ${currentLang}`);

        await expect(i18nRoot).toHaveAttribute('data-lang', 'en', { timeout: 15000 });

        // 5. Check if the cookie is set
        const cookies = await context.cookies();
        const langCookie = cookies.find(c => c.name === 'preferred-language');
        console.log(`[E2E] Preferred language cookie: ${langCookie?.value}`);
        expect(langCookie?.value).toBe('en');

        // 6. Refresh the page
        await page.reload();
        await ensurePageReady(page);
        console.log('[E2E] Page reloaded');

        // 7. Verify that it remains English
        await expect(page.getByTestId('i18n-root')).toHaveAttribute('data-lang', 'en', { timeout: 15000 });

        // 8. Open the language dropdown again
        await page.locator('.lang-btn').click();
        await page.waitForTimeout(1000);

        // 9. Select Italian (🇮🇹)
        const itBtn = page.getByTestId('lang-select-it');
        await itBtn.click();
        await page.waitForTimeout(2000);

        // 10. Verify that it changed back to Italian
        await expect(page.getByTestId('i18n-root')).toHaveAttribute('data-lang', 'it', { timeout: 15000 });

        // 11. Refresh the page
        await page.reload();
        await ensurePageReady(page);

        // 12. Verify that it remains Italian
        await expect(page.getByTestId('i18n-root')).toHaveAttribute('data-lang', 'it', { timeout: 15000 });

        // 13. Check cookie again
        const updatedCookies = await context.cookies();
        const updatedLangCookie = updatedCookies.find(c => c.name === 'preferred-language');
        expect(updatedLangCookie?.value).toBe('it');
    });
});
