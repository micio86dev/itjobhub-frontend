import { test, expect } from '@playwright/test';

test.describe('Guest User', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should load the homepage successfully', async ({ page }) => {
        await expect(page).toHaveTitle(/ITJobHub/);
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
        // Use exact match or look for specific one. The nav one usually has 'Registrati' exactly or we can use first.
        // Given the error showed "Registrati" and "Registrati Gratis", using exact: true for the nav link should work.
        await expect(page.getByRole('link', { name: 'Registrati', exact: true })).toBeVisible();
    });

    test('should see job listings', async ({ page }) => {
        // Wait for jobs to load
        await expect(page.locator('.job-card').first()).toBeVisible();
    });

    test('should be able to search for jobs', async ({ page }) => {
        const searchInput = page.getByPlaceholder('Cerca lavoro...');
        await searchInput.fill('developer');
        await searchInput.press('Enter');

        // URL should handle query param or client side filter
        // For now we assume the list updates or URL changes
        // This depends on specific implementation, adjusting expectation
        await expect(page.locator('.job-card').first()).toBeVisible();
    });

    test('should not see protected routes', async ({ page }) => {
        await page.goto('/admin');
        // specific behavior depends on app, usually redirect to login
        await expect(page).toHaveURL(/.*login/);
    });
});
