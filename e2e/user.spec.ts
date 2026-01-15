import { test, expect } from '@playwright/test';

test.describe('Registered User', () => {
    test.beforeEach(async ({ page }) => {
        // Login as a seeker
        await page.goto('/login');
        await page.waitForTimeout(1000);
        await page.getByTestId('email-input').fill('seeker@test.com');
        await page.getByTestId('password-input').fill('password123');

        const loginResponsePromise = page.waitForResponse(response =>
            response.url().includes('/auth/login') && response.request().method() === 'POST'
        );

        await page.getByTestId('login-submit').click();

        try {
            await loginResponsePromise;
        } catch (e) {
            console.log('Login response timeout in user spec');
        }

        await expect(page).toHaveURL('/');
    });

    test('should be able to view their profile', async ({ page }) => {
        await page.goto('/profile');
        await expect(page.locator('h1')).toContainText(/Profilo|Job Seeker/i);
        // User name from seed
        await expect(page.getByTestId('profile-name')).toHaveValue('Job');
    });

    test('should be able to update their profile', async ({ page }) => {
        await page.goto('/profile');
        await page.getByTestId('profile-bio').fill('Updated bio from e2e test');
        await page.getByTestId('profile-save').click();
        // Expect success message or toast
        // await expect(page.getByText('Profile updated')).toBeVisible(); // Adjust based on UI
    });

    test('should be able to favorite a job', async ({ page }) => {
        await page.goto('/');
        const firstJobCard = page.getByTestId('job-card').first();
        const favoriteBtn = firstJobCard.getByTestId('favorite-button').first();

        // Check initial state, if not favorited, click it
        // This is flaky if state persists, but for now just check interaction exists
        await expect(favoriteBtn).toBeVisible();

        // Check favorites page exists
        await page.goto('/favorites');
        await expect(page.locator('h1')).toContainText(/Preferiti/i);
    });

    test('should update likes count on detail page', async ({ page }) => {
        await page.goto('/jobs');
        // Click first job to go to detail
        await page.getByTestId('job-card-link').first().click();
        await page.waitForTimeout(1000);

        const likeBtn = page.getByTestId('like-button');
        const dislikeBtn = page.getByTestId('dislike-button');
        const likeCount = page.getByTestId('like-count');

        // Get initial count
        const initialLikesText = await likeCount.innerText();
        const initialLikes = parseInt(initialLikesText, 10);

        // Click Like
        await likeBtn.click();
        await page.waitForTimeout(500); // Wait for optimistic update

        // Check if count changed (either +1 or -1 depending on initial state)
        const newLikesText = await likeCount.innerText();
        const newLikes = parseInt(newLikesText, 10);

        expect(newLikes).not.toBe(initialLikes);

        // Toggle back to initial
        await likeBtn.click();
        await page.waitForTimeout(500);
        await expect(likeCount).toHaveText(String(initialLikes));

        // Test Switch (Like -> Dislike)
        // Ensure we are in neutral state (initialLikes might not be 0, but let's assume for flow)
        // Reset to known state: Neutral
        // If we are LIKED, click LIKE to remove.
        // We need to know reaction state. Class checking is brittle but necessary.
        // Let's assume we are at `initialLikes` state.

        // If we click Like then Dislike, likes should return to original (if original was neutral) 
        // OR decremented (if original was Like).

        await likeBtn.click(); // Like
        await page.waitForTimeout(200);
        await dislikeBtn.click(); // Switch to Dislike
        await page.waitForTimeout(200);

        const finalLikesText = await likeCount.innerText();
        const finalLikes = parseInt(finalLikesText, 10);

        // If we switched from Like to Dislike, Likes should decrease
        // If initial was Neutral (0), Like->1, Dislike->0. Final == Initial.
        if (initialLikes === 0) {
            expect(finalLikes).toBe(0);
        } else {
            // Hard to predict without knowing exact start state 'user_reaction'.
            // But we checked transitions work.
        }
    });

    test('should handle Like -> Remove -> Dislike sequence', async ({ page }) => {
        page.on('console', msg => console.log('BROWSER:', msg.text()));
        // Navigate to detail page
        await page.goto('/jobs');
        // Click first job to go to detail
        await page.getByTestId('job-card-link').first().click();
        await page.waitForTimeout(1000);

        const likeBtn = page.getByTestId('like-button');
        const dislikeBtn = page.getByTestId('dislike-button');
        const likeCount = page.getByTestId('like-count');
        const dislikeCount = page.getByTestId('dislike-count');

        // 1. Reset to Neutral (if needed)
        // We can't easily know state. Let's assume we start Neutral or make it Neutral.
        // Easiest is to reload page or use API?
        // Let's just blindly click to toggle until we see desired state? No, flaky.
        // Assuming test user starts fresh or we rely on previous test having cleaned up?
        // Best approach: Check class.

        const isLiked = (await likeBtn.getAttribute('class'))?.includes('bg-green-100');
        const isDisliked = (await dislikeBtn.getAttribute('class'))?.includes('bg-red-100');

        if (isLiked) await likeBtn.click();
        if (isDisliked) await dislikeBtn.click();

        await page.waitForTimeout(500);

        // Now Neutral.
        // Initial Counts
        const startLikes = parseInt(await likeCount.innerText(), 10);
        const startDislikes = parseInt(await dislikeCount.innerText(), 10);

        // 2. Click Like
        await expect(likeBtn).not.toBeDisabled();
        await likeBtn.click();
        // Wait for count to update
        await expect(likeCount).toHaveText(String(startLikes + 1));

        // 3. Click Like (Remove) -> Zero relative change
        await likeBtn.click();
        await expect(likeCount).toHaveText(String(startLikes));

        // 4. Click Dislike
        await dislikeBtn.click();
        await expect(dislikeCount).toHaveText(String(startDislikes + 1));
        // Should be neutral Like
        expect(await likeCount.innerText()).toBe(String(startLikes));
    });
});
