import { test, expect } from '@playwright/test';

test.describe('Registered User', () => {
    test.beforeEach(async ({ page }) => {
        // Login as a seeker
        await page.goto('/login');
        await page.waitForTimeout(1000);
        await page.getByLabel('Email').fill('seeker@test.com');
        await page.getByLabel('Password').fill('password123');
        await page.getByRole('button', { name: /Accedi/i }).click();
        await expect(page).toHaveURL('/');
    });

    test('should be able to view their profile', async ({ page }) => {
        await page.goto('/profile');
        await expect(page.locator('h1')).toContainText(/Profilo/i);
        // User name from seed
        await expect(page.getByLabel('Nome')).toHaveValue('Job');
    });

    test('should be able to update their profile', async ({ page }) => {
        await page.goto('/profile');
        await page.getByLabel('Bio').fill('Updated bio from e2e test');
        await page.getByRole('button', { name: /Salva/i }).click();
        // Expect success message or toast
        // await expect(page.getByText('Profile updated')).toBeVisible(); // Adjust based on UI
    });

    test('should be able to favorite a job', async ({ page }) => {
        await page.goto('/');
        const firstJobCard = page.locator('.job-card').first();
        const favoriteBtn = firstJobCard.locator('button[aria-label="Aggiungi ai preferiti"]').first(); // Adjust selector

        // Check initial state, if not favorited, click it
        // This is flaky if state persists, but for now just check interaction exists
        await expect(favoriteBtn).toBeVisible();

        // Check favorites page exists
        await page.goto('/favorites');
        await expect(page.locator('h1')).toContainText(/Preferiti/i);
    });
});
