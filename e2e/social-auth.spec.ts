import { test, expect } from './fixtures';
import { ensurePageReady } from './helpers';

test.describe('Social Attribution & Authentication', () => {

    const providers = [
        { name: 'google', testId: 'social-login-google-btn' },
        { name: 'github', testId: 'social-login-github-btn' },
        { name: 'linkedin', testId: 'social-login-linkedin-btn' }
    ];

    for (const provider of providers) {
        test(`should allow login via ${provider.name}`, async ({ page }) => {
            const code = 'mock-auth-code';
            const mockUser = {
                id: '507f1f77bcf86cd799439011',
                email: `test-${provider.name}@example.com`,
                firstName: 'Test',
                lastName: 'User',
                role: 'user',
                profileCompleted: true
            };

            const mockToken = 'mock-jwt-token';

            // 1. Intercept the initial redirect to the backend auth URL
            const baseURL = page.context()._options.baseURL || 'http://127.0.0.1:5173';
            await page.route(`**/auth/oauth/${provider.name}`, async (route) => {
                // Simulate the backend redirecting to the frontend callback
                await route.fulfill({
                    status: 302,
                    headers: {
                        'location': `${baseURL}/auth/callback/${provider.name}?code=${code}`
                    }
                });
            });

            // 2. Intercept the backend callback API call
            await page.route((url) => url.href.includes(`/auth/oauth/${provider.name}/callback`), async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        success: true,
                        data: {
                            user: mockUser,
                            token: mockToken
                        }
                    })
                });
            });

            // 3. Go to login page
            await page.goto('/login');
            await ensurePageReady(page);

            // 4. Click social login button
            await page.getByTestId(provider.testId).click();

            // 5. Verify we are on the dashboard/wizard (after redirection from callback page)
            // The callback page has a 1.5s delay before redirecting
            await expect(page).toHaveURL(/\/(wizard)?$/, { timeout: 15000 });

            // 6. Verify authentication state by checking the cookie with retries
            await expect.poll(async () => {
                const cookies = await page.context().cookies();
                return cookies.find(c => c.name === 'auth_token');
            }, {
                message: 'auth_token cookie should be set',
                timeout: 5000
            }).toBeDefined();
        });
    }

    test('should show error if social login fails', async ({ page }) => {
        const provider = 'google';
        const code = 'invalid-code';
        const baseURL = page.context()._options.baseURL || 'http://127.0.0.1:5173';

        // 1. Intercept the initial redirect
        await page.route(`**/auth/oauth/${provider}`, async (route) => {
            await route.fulfill({
                status: 302,
                headers: { 'location': `${baseURL}/auth/callback/${provider}?code=${code}` }
            });
        });

        // 2. Intercept the backend callback API call with error
        await page.route(`**/auth/oauth/${provider}/callback`, async (route) => {
            await route.fulfill({
                status: 401,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: false,
                    message: 'OAuth authentication failed'
                })
            });
        });

        await page.goto('/login');
        await ensurePageReady(page);

        await page.getByTestId('social-login-google-btn').click();

        // Should stay on callback page or show error UI
        await expect(page).toHaveURL(new RegExp(`/auth/callback/${provider}`));
        await expect(page.locator('text=/OAuth authentication failed/i')).toBeVisible();
    });
});
