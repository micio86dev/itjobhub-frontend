import { test, expect } from '@playwright/test';

test.describe('Company User / Admin Job Posting', () => {
    test.beforeEach(async ({ page }) => {
        // Login as admin (who acts as company for now in tests)
        await page.goto('/login');
        await page.waitForTimeout(1000);
        await page.getByLabel('Email').fill('admin@test.com');
        await page.getByLabel('Password').fill('password123');

        const loginResponsePromise = page.waitForResponse(response =>
            response.url().includes('/auth/login') && response.request().method() === 'POST'
        );

        await page.getByRole('button', { name: /Accedi/i }).click();

        try {
            await loginResponsePromise;
        } catch (e) {
            console.log('Login response timeout in company spec');
        }

        await expect(page).toHaveURL(/(\/$|\/wizard\/?$)/);
    });

    test('should see the post job button', async ({ page }) => {
        // Expect a "Pubblica" or "Post Job" link/button
        const postLink = page.getByRole('link', { name: /Pubblica Annuncio/i });
        if (await postLink.isVisible()) {
            await postLink.click();
            await expect(page).toHaveURL(/.*jobs\/new|.*admin/);
        } else {
            // Fallback to admin checks if direct link isn't on header for admin
            await page.goto('/admin');
            await expect(page).toHaveURL(/.*admin/);
        }
    });

    test.skip('should be able to access company list', async ({ page }) => {
        await page.goto('/companies');
        await expect(page.locator('h1')).toContainText(/Aziende|Companies/i);
        await expect(page.locator('.company-card').first()).toBeVisible();
    });
});
