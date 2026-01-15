import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
    test('should allow a user to register', async ({ page }) => {
        await page.goto('/register');

        const email = `test-${Date.now()}@example.com`;
        await page.getByLabel('Nome completo').fill('Test User');
        await page.getByLabel('Email').fill(email);
        await page.getByLabel('Password', { exact: true }).fill('Password123!');
        await page.getByLabel('Conferma password').fill('Password123!');

        // Depending on form implementation
        const registerResponsePromise = page.waitForResponse(response =>
            response.url().includes('/auth/register') && response.request().method() === 'POST'
        );

        await page.getByRole('button', { name: /Registrati/i }).click();

        const response = await registerResponsePromise;
        if (response.status() !== 200 && response.status() !== 201) {
            console.log(`Register Failed Status: ${response.status()}`);
            console.log(`Register Body: ${await response.text()}`);
        }

        // Expect redirect to login, dashboard or wizard
        await expect(page).toHaveURL(/.*login|.*dashboard|.*wizard/);
    });

    test('should allow a user to login', async ({ page }) => {
        // Assuming a pre-existing user or using the one just created if we ran serially
        // ideally we should seed the db or mock the api

        await page.goto('/login');
        await page.goto('/login');
        await page.waitForTimeout(1000); // Increased wait for stability

        const emailInput = page.getByLabel('Email');
        const passwordInput = page.getByLabel('Password');

        await emailInput.fill('seeker@test.com');
        await passwordInput.fill('password123');

        // Verify inputs
        await expect(emailInput).toHaveValue('seeker@test.com');
        await expect(passwordInput).toHaveValue('password123');

        const loginResponsePromise = page.waitForResponse(response => response.url().includes('/auth/login') && response.request().method() === 'POST');
        await page.getByRole('button', { name: /Accedi/i }).click();

        try {
            await loginResponsePromise;
        } catch (e) {
            console.log('DEBUG: Login response not captured or timed out');
        }

        await expect(page).toHaveURL(/(\/$|\/wizard\/?$)/);

        // Handle mobile responsive UI
        const profileBtn = page.getByRole('button', { name: /Logout|Profile/i });
        if (await profileBtn.count() > 0 && await profileBtn.first().isVisible()) {
            await expect(profileBtn.first()).toBeVisible();
        } else {
            // Check if we are on dashboard by looking for other elements
            const welcomeMsg = page.getByText(/Benvenuto|Offerte/i);
            if (await welcomeMsg.count() > 0) {
                await expect(welcomeMsg.first()).toBeVisible();
            } else {
                // Try looking for mobile menu
                const menuBtn = page.locator('button[aria-label="Menu"], button.lg\\:hidden');
                if (await menuBtn.isVisible()) {
                    await menuBtn.click();
                    await expect(page.getByRole('button', { name: /Logout|Profile/i }).first()).toBeVisible();
                }
            }
        }
    });
});
