import { test, expect } from './fixtures';
import { ensurePageReady } from './helpers';

test.describe('Social Attribution & Authentication', () => {

    const providers = [
        { name: 'google', testId: 'social-login-google-btn', displayName: 'Google' },
        { name: 'github', testId: 'social-login-github-btn', displayName: 'GitHub' },
        { name: 'linkedin', testId: 'social-login-linkedin-btn', displayName: 'LinkedIn' }
    ];

    for (const provider of providers) {
        test(`should allow login via ${provider.name}`, async ({ page }) => {
            const mockToken = 'mock-jwt-token-999';

            await page.route('**/auth/oauth/**', async (route) => {
                const requestUrl = route.request().url();
                if (requestUrl.includes(`/auth/oauth/${provider.name}`)) {
                    await route.fulfill({
                        status: 200,
                        contentType: 'text/html',
                        body: `<html><body><script>document.cookie = "auth_token=${mockToken}; path=/; SameSite=Lax"; window.location.href = "/wizard";</script></body></html>`
                    });
                } else {
                    await route.continue();
                }
            });

            await page.goto('/login');
            await ensurePageReady(page);
            await page.getByTestId(provider.testId).click();
            await expect(page).toHaveURL(/\/wizard/, { timeout: 15000 });
        });
    }

    test('should show error if social login fails', async ({ page }) => {
        await page.goto('/login');
        await ensurePageReady(page);

        // Determine origin from current page
        const origin = new URL(page.url()).origin;
        console.log(`[E2E] Frontend origin: ${origin}`);

        // Intercept and redirect to the specific error URL
        await page.route('**/auth/oauth/**', async (route) => {
            console.log(`[E2E] Intercepted OAuth request, fulfilling with redirect to ${origin}/login?error=OAuth-Failed-Test-Nuclear`);
            await route.fulfill({
                status: 200,
                contentType: 'text/html',
                body: `<html><body><script>window.location.href = "${origin}/login?error=OAuth-Failed-Test-Nuclear";</script></body></html>`
            });
        });

        const googleBtn = page.getByTestId('social-login-google-btn');
        await expect(googleBtn).toBeVisible({ timeout: 10000 });

        // Wait for a bit for hydration and stability
        await page.waitForTimeout(2000);
        await googleBtn.click({ force: true });

        // Wait for redirect and check URL with poll
        await expect.poll(() => page.url(), {
            message: 'URL should contain error parameter after failed social login',
            timeout: 20000
        }).toContain('error=OAuth-Failed-Test-Nuclear');

        const errorMsg = page.getByTestId('login-error-message');
        // On Webkit sometimes it takes a while to render after URL change
        await expect(errorMsg).toBeVisible({ timeout: 15000 });
        await expect(errorMsg).toContainText(/OAuth-Failed-Test-Nuclear/i, { timeout: 10000 });
    });
});
