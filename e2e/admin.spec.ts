import { test, expect } from '@playwright/test';

test.describe('Admin User', () => {
    test.beforeEach(async ({ page }) => {
        // Login as admin
        await page.goto('/login');
        await page.waitForTimeout(1000);

        await page.getByTestId('email-input').fill('admin@test.com');
        await page.getByTestId('password-input').fill('password123');

        // Capture response
        const loginResponsePromise = page.waitForResponse(response =>
            response.url().includes('/auth/login') && response.request().method() === 'POST'
        );

        await page.getByTestId('login-submit').click();

        try {
            const response = await loginResponsePromise;
            const status = response.status();
            console.log(`Login Request Body: ${response.request().postData()}`);
            console.log(`Login Response Status: ${status}`);

            if (status !== 200 && status !== 201) {
                console.log(`Login Body: ${await response.text()}`);
            }
        } catch (e) {
            console.log('Login response timeout');
        }

        await expect(page).toHaveURL(/(\/|\/wizard\/$)/);
        // Wait for auth state to settle
        // Check for something that appears only when logged in, e.g. Logout button or Profile link
        // This helps ensure the auth context is ready before navigating to /admin
        // Adjust selector based on actual generic header found in other tests
        // await expect(page.locator('text=Logout')).toBeVisible(); // Generic fallback
        await page.waitForTimeout(4000); // explicit wait to be safe with state hydration
    });



    test('should be able to delete a job from detail page', async ({ page }) => {
        // Listen for console logs
        page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));

        await page.waitForTimeout(2000); // Wait for Client Side navigation and localstorage set

        // Debug LocalStorage
        const authState = await page.evaluate(() => {
            return {
                token: localStorage.getItem('auth_token'),
                user: localStorage.getItem('auth_user')
            };
        });
        console.log('LocalStorage after login:', authState);

        test.expect(authState.token).toBeTruthy();

        // Go to jobs list
        await page.goto('/jobs');
        await page.waitForTimeout(2000); // Wait for hydration on new page
        // Wait for JobsContext to potentially trigger 401
        await page.waitForTimeout(3000);

        // Debug LocalStorage again
        const authState2 = await page.evaluate(() => {
            return {
                token: localStorage.getItem('auth_token'),
                user: localStorage.getItem('auth_user')
            };
        });
        console.log('LocalStorage after navigation:', authState2);

        // Find the first link to detail
        const jobLink = page.getByTestId('job-card-link').first();
        if (await jobLink.count() > 0) {
            await jobLink.click();
            await expect(page).toHaveURL(/\/jobs\/detail\//);

            // Wait heavily for the eliminates button which appears only if logged in
            // If we are logged out, this will timeout
            await expect(page.getByTestId('delete-button').first()).toBeVisible({ timeout: 10000 });
            await page.getByTestId('delete-button').first().click();

            // Check for modal
            await expect(page.getByRole('dialog')).toBeVisible();
            await expect(page.getByText('Sei sicuro di voler eliminare questo annuncio?')).toBeVisible();

            // Confirm delete
            await page.getByTestId('modal-confirm').click();

            // Should redirect to jobs list
            await expect(page).toHaveURL(/\/jobs\/?$/);
        } else {
            console.log('No jobs found to test delete');
        }
    });
});
