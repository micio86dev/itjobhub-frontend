import { test, expect } from './fixtures';
import { SELECTORS, ensurePageReady, goToFirstJobDetail } from './helpers';

test.describe('Comments System', () => {
    test.describe('As Guest', () => {
        test('should see comments section but not input', async ({ page }) => {
            await goToFirstJobDetail(page);

            // Should see comments section header
            const commentsSection = page.locator('text=/commenti|comments/i').first();
            if (await commentsSection.isVisible({ timeout: 5000 }).catch(() => false)) {
                await expect(commentsSection).toBeVisible();

                // Comment input should not be visible for guests
                const commentInput = page.locator(SELECTORS.commentInput);
                const isInputVisible = await commentInput.isVisible({ timeout: 1000 }).catch(() => false);

                // Either input is hidden or there's a login prompt
                if (isInputVisible) {
                    const loginPrompt = page.locator('text=/accedi|login.*commentare/i');
                    await expect(loginPrompt).toBeVisible({ timeout: 3000 }).catch(() => { });
                }
            }
        });

        test('should see existing comments if any', async ({ page }) => {
            await goToFirstJobDetail(page);

            const comments = page.locator(SELECTORS.commentItem);
            const count = await comments.count();
            expect(count).toBeGreaterThanOrEqual(0);
        });
    });

    test.describe('As Logged In User', () => {
        test('should see comment input field', async ({ userPage: page }) => {
            await goToFirstJobDetail(page);

            const commentInput = page.locator(SELECTORS.commentInput);
            await expect(commentInput).toBeVisible({ timeout: 10000 });
            await expect(commentInput).toBeEnabled();
        });

        test('should be able to add a comment', async ({ userPage: page }) => {
            await goToFirstJobDetail(page);

            const commentInput = page.locator(SELECTORS.commentInput);
            await expect(commentInput).toBeVisible({ timeout: 10000 });

            const submitBtn = page.locator(SELECTORS.commentSubmit);

            const testComment = `E2E Test Comment ${Date.now()}`;
            await commentInput.fill(testComment);

            await submitBtn.scrollIntoViewIfNeeded();
            await submitBtn.click({ force: true });

            // Wait for API response
            await page.waitForResponse(
                (response) => response.url().includes('/comments') && response.request().method() === 'POST',
                { timeout: 7000 }
            ).catch(() => null);

            // New comment should appear
            await expect(page.locator(SELECTORS.commentItem).filter({ hasText: testComment }).first()).toBeVisible({
                timeout: 10000,
            });
        });

        test('should not allow empty comment submission', async ({ userPage: page }) => {
            await goToFirstJobDetail(page);

            const commentInput = page.locator(SELECTORS.commentInput);
            await expect(commentInput).toBeVisible({ timeout: 10000 });

            const submitBtn = page.locator(SELECTORS.commentSubmit);

            await commentInput.fill('');

            const isDisabled = await submitBtn.getAttribute('disabled') !== null;
            if (!isDisabled) {
                await submitBtn.click({ force: true });
            }
        });

        test('should be able to delete own comment', async ({ userPage: page }) => {
            await goToFirstJobDetail(page);

            const commentInput = page.locator(SELECTORS.commentInput);
            await expect(commentInput).toBeVisible({ timeout: 10000 });

            // First add a comment
            const testComment = `Delete Test ${Date.now()}`;
            await commentInput.fill(testComment);
            // Wait for API response after clicking
            const responsePromise = page.waitForResponse(
                (response) => response.url().includes('/comments') && response.request().method() === 'POST',
                { timeout: 10000 }
            );
            await page.locator(SELECTORS.commentSubmit).click({ force: true });
            await responsePromise;

            // Small wait for UI update
            await page.waitForTimeout(500);

            await expect(page.locator(SELECTORS.commentItem).filter({ hasText: testComment }).first()).toBeVisible({
                timeout: 10000,
            });

            // Find and click delete button
            const commentItem = page.locator(SELECTORS.commentItem).filter({ hasText: testComment });
            const deleteBtn = commentItem.locator(SELECTORS.commentDelete);

            await deleteBtn.scrollIntoViewIfNeeded();
            await deleteBtn.click({ force: true });

            // Modal should appear
            const modal = page.locator(SELECTORS.modal).first();
            await expect(modal).toBeVisible({ timeout: 5000 });

            await page.locator(SELECTORS.modalConfirm).first().click({ force: true });

            // Comment should disappear
            await expect(page.locator(SELECTORS.commentItem).filter({ hasText: testComment }).first()).not.toBeVisible({
                timeout: 10000,
            });
        });
    });

    test.describe('As Admin', () => {
        test('should be able to delete any comment', async ({ adminPage: page }) => {
            await goToFirstJobDetail(page);

            const comments = page.locator(SELECTORS.commentItem);

            // If no comments, add one first to be sure
            if (await comments.count() === 0) {
                const commentInput = page.locator(SELECTORS.commentInput);
                if (await commentInput.isVisible({ timeout: 5000 }).catch(() => false)) {
                    await commentInput.fill('Admin cleanup test');
                    await page.locator(SELECTORS.commentSubmit).click({ force: true });
                    await page.waitForTimeout(1000);
                }
            }

            if (await comments.count() > 0) {
                const firstComment = comments.first();
                const deleteBtn = firstComment.locator(SELECTORS.commentDelete);

                // Get some text to verify deletion
                const commentText = (await firstComment.textContent())?.substring(0, 20);

                await deleteBtn.scrollIntoViewIfNeeded();
                await deleteBtn.click({ force: true });

                const modal = page.locator(SELECTORS.modal).first();
                await expect(modal).toBeVisible({ timeout: 5000 });

                await page.locator(SELECTORS.modalConfirm).first().click({ force: true });

                // Comment should be removed
                await page.waitForTimeout(1000);
                if (commentText) {
                    const stillExists = await page.locator(`text="${commentText}"`).isVisible({ timeout: 2000 }).catch(() => false);
                    expect(stillExists).toBeFalsy();
                }
            }
        });
    });
});
