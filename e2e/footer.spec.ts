import { test, expect } from '@playwright/test';

test.describe('Footer', () => {
    test('should display footer with copyright and developer link', async ({ page }) => {
        await page.goto('/');

        // Check if footer exists
        const footer = page.locator('footer');
        await expect(footer).toBeVisible();

        // Check copyright
        await expect(footer).toContainText('ITJobHub');

        // Check developer link
        const devLink = footer.locator('a[href="https://micio86dev.it/"]');
        await expect(devLink).toBeVisible();
        await expect(devLink).toContainText('@miciodev');
    });
});
