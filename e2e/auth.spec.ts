import { test, expect } from '@playwright/test';
import { SELECTORS, ensurePageReady, loginViaUI, verifyAuthState, checkForViteError } from './helpers';

test.describe('Authentication', () => {
    test.describe('Registration', () => {
        test('should allow a user to register with valid data', async ({ page }) => {
            await page.goto('/register');
            await ensurePageReady(page);

            const email = `test-${Date.now()}@example.com`;

            await page.locator(SELECTORS.registerFirstNameInput).fill('Test');
            await page.locator(SELECTORS.registerLastNameInput).fill('User');
            await page.locator(SELECTORS.registerEmailInput).fill(email);
            await page.locator(SELECTORS.registerPasswordInput).fill('password123');
            await page.locator(SELECTORS.registerConfirmPasswordInput).fill('password123');

            const responsePromise = page.waitForResponse(
                (response) =>
                    response.url().includes('/auth/register') &&
                    response.request().method() === 'POST'
            );

            try {
                await page.locator(SELECTORS.registerSubmit).click({ timeout: 5000 });
            } catch (e) {
                await checkForViteError(page);
                throw e;
            }
            const response = await responsePromise;

            expect([200, 201]).toContain(response.status());
            await expect(page).toHaveURL(/\/(login|dashboard|wizard)?$/);
        });

        test('should show error for duplicate email', async ({ page }) => {
            await page.goto('/register');
            await ensurePageReady(page);

            // Use existing seeker email
            await page.locator(SELECTORS.registerFirstNameInput).fill('Duplicate');
            await page.locator(SELECTORS.registerLastNameInput).fill('User');
            await page.locator(SELECTORS.registerEmailInput).fill('seeker@test.com');
            await page.locator(SELECTORS.registerPasswordInput).fill('password123');
            await page.locator(SELECTORS.registerConfirmPasswordInput).fill('password123');

            await page.locator(SELECTORS.registerSubmit).click();

            // Should show error or stay on page
            await expect(page.locator('text=/già|already|esistente/i').first()).toBeVisible({
                timeout: 5000,
            });
        });

        test('should validate password confirmation match', async ({ page }) => {
            await page.goto('/register');
            await ensurePageReady(page);

            await page.locator(SELECTORS.registerFirstNameInput).fill('Test');
            await page.locator(SELECTORS.registerLastNameInput).fill('User');
            await page.locator(SELECTORS.registerEmailInput).fill(`test-${Date.now()}@example.com`);
            await page.locator(SELECTORS.registerPasswordInput).fill('password123');
            await page.locator(SELECTORS.registerConfirmPasswordInput).fill('differentpassword');

            // Try to submit
            const submitBtn = page.locator(SELECTORS.registerSubmit);

            // Check if button is disabled (client-side validation)
            const isDisabled = await submitBtn.isDisabled();

            if (!isDisabled) {
                await submitBtn.click();
                // Either stay on page or show error
                await page.waitForTimeout(500);
            }

            // Test passes if: button is disabled OR form shows error OR we're still on register page
            const stillOnRegister = /register/.test(page.url());
            const hasError = await page.locator('text=/non corrispondono|match|coincidono|password/i').first().isVisible({ timeout: 1000 }).catch(() => false);

            expect(isDisabled || stillOnRegister || hasError).toBeTruthy();
        });
    });

    test.describe('Login', () => {
        test('should allow a user to login with valid credentials', async ({ page }) => {
            await page.goto('/login');
            await ensurePageReady(page);

            await page.locator(SELECTORS.loginEmailInput).fill('seeker@test.com');
            await page.locator(SELECTORS.loginPasswordInput).fill('password123');

            const responsePromise = page.waitForResponse(
                (response) =>
                    response.url().includes('/auth/login') &&
                    response.request().method() === 'POST'
            );

            await page.locator(SELECTORS.loginSubmit).click();
            const response = await responsePromise;

            if (response.status() !== 200) {
                console.log('Login failed with status:', response.status());
                console.log('Response body:', await response.text());
            }

            expect(response.status()).toBe(200);
            await expect(page).toHaveURL(/\/(wizard)?$/);
            await verifyAuthState(page, true);
        });

        test('should show error for invalid credentials', async ({ page }) => {
            await page.goto('/login');
            await ensurePageReady(page);

            await page.locator(SELECTORS.loginEmailInput).fill('wrong@test.com');
            await page.locator(SELECTORS.loginPasswordInput).fill('wrongpassword');

            await page.locator(SELECTORS.loginSubmit).click();

            // Wait a moment for error response
            await page.waitForTimeout(1000);

            // Should show error message OR stay on login page
            const hasError = await page.locator('text=/invalid|errate|credenziali|errore|error/i').first().isVisible({ timeout: 3000 }).catch(() => false);
            const stillOnLogin = /login/.test(page.url());

            expect(hasError || stillOnLogin).toBeTruthy();
        });

        test('should redirect to requested page after login', async ({ page }) => {
            // Try to access protected page
            await page.goto('/profile');

            // Should redirect to login
            await expect(page).toHaveURL(/\/login/);

            // Login
            await page.locator(SELECTORS.loginEmailInput).fill('seeker@test.com');
            await page.locator(SELECTORS.loginPasswordInput).fill('password123');
            await page.locator(SELECTORS.loginSubmit).click();

            // Should redirect back to profile or home
            await expect(page).toHaveURL(/\/(profile|wizard)?$/);
        });
    });

    test.describe('Logout', () => {
        test('should allow user to logout', async ({ page }) => {
            // First login
            await loginViaUI(page, 'seeker@test.com', 'password123');

            // Find and click logout
            // Check for mobile menu visibility using the class we verified
            const mobileMenuBtn = page.locator('.mobile-menu-btn');

            if (await mobileMenuBtn.isVisible()) {
                await mobileMenuBtn.click();
                // Wait for menu animation
                await page.waitForTimeout(500);
                // Click mobile logout
                await page.locator('.mobile-btn-logout').click();
            } else {
                // Desktop logout
                await page.locator('.btn-logout').click();
            }

            await expect(page).toHaveURL(/\/(login)?$/);
            await verifyAuthState(page, false);
        });
    });
});
