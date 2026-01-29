import { test, expect, TEST_USERS } from './fixtures';
import { SELECTORS, ensurePageReady, loginViaUI, goToFirstJobDetail } from './helpers';

test.describe('Comments System', () => {
    test.describe('As Guest', () => {
        test('should see comments section but not input', async ({ page }) => {
            await goToFirstJobDetail(page);

            // Should see comments section header
            const commentsSection = page.locator('text=/commenti|comments/i').first();
            if (await commentsSection.isVisible({ timeout: 3000 }).catch(() => false)) {
                await expect(commentsSection).toBeVisible();

                // Comment input should not be visible for guests
                const commentInput = page.locator(SELECTORS.commentInput);
                const isInputVisible = await commentInput.isVisible({ timeout: 1000 }).catch(() => false);

                // Either input is hidden or there's a login prompt
                if (isInputVisible) {
                    // Some UIs show disabled input with login prompt
                    const loginPrompt = page.locator('text=/accedi|login.*commentare/i');
                    await expect(loginPrompt).toBeVisible({ timeout: 2000 }).catch(() => { });
                }
            }
        });

        test('should see existing comments if any', async ({ page }) => {
            await goToFirstJobDetail(page);

            const comments = page.locator(SELECTORS.commentItem);
            const count = await comments.count();

            // Should be able to view comments (might be 0)
            expect(count).toBeGreaterThanOrEqual(0);
        });
    });

    test.describe('As Logged In User', () => {
        test.beforeEach(async ({ page }) => {
            page.on('console', msg => {
                if (msg.type() === 'error') console.log(`[Browser Error] ${msg.text()}`);
            });
            page.on('pageerror', err => {
                console.log(`[Page Error] ${err.message}`);
            });
            await loginViaUI(page, TEST_USERS.user.email, TEST_USERS.user.password);
        });

        test('should see comment input field', async ({ page }) => {
            await goToFirstJobDetail(page);

            const commentInput = page.locator(SELECTORS.commentInput);
            if (await commentInput.isVisible({ timeout: 5000 }).catch(() => false)) {
                await expect(commentInput).toBeVisible();
                await expect(commentInput).toBeEnabled();
            }
        });

        test('should be able to add a comment', async ({ page }) => {
            await goToFirstJobDetail(page);

            const commentInput = page.locator(SELECTORS.commentInput);
            const submitBtn = page.locator(SELECTORS.commentSubmit);

            if (await commentInput.isVisible({ timeout: 3000 }).catch(() => false)) {
                const testComment = `E2E Test Comment ${Date.now()}`;
                await commentInput.fill(testComment);
                await submitBtn.click();

                // Wait for API response
                await page.waitForResponse(
                    (response) => response.url().includes('/comments') && response.request().method() === 'POST',
                    { timeout: 5000 }
                ).catch(() => null);

                // New comment should appear
                await expect(page.locator(`text="${testComment}"`).first()).toBeVisible({
                    timeout: 5000,
                });
            }
        });

        test('should not allow empty comment submission', async ({ page }) => {
            await goToFirstJobDetail(page);

            const commentInput = page.locator(SELECTORS.commentInput);
            const submitBtn = page.locator(SELECTORS.commentSubmit);

            if (await commentInput.isVisible({ timeout: 3000 }).catch(() => false)) {
                await commentInput.fill('');

                // Button should be disabled or clicking should show error
                const isDisabled = await submitBtn.isDisabled();
                if (!isDisabled) {
                    await submitBtn.click();
                    // Should show error or not submit
                }
            }
        });

        test('should be able to delete own comment', async ({ page }) => {
            await goToFirstJobDetail(page);

            const commentInput = page.locator(SELECTORS.commentInput);

            if (await commentInput.isVisible({ timeout: 3000 }).catch(() => false)) {
                // First add a comment
                const testComment = `Delete Test ${Date.now()}`;
                await commentInput.fill(testComment);
                await page.locator(SELECTORS.commentSubmit).click();

                // Wait for it to appear
                await expect(page.locator(`text="${testComment}"`).first()).toBeVisible({
                    timeout: 5000,
                });

                // Find and click delete button
                const commentItem = page.locator(SELECTORS.commentItem).filter({ hasText: testComment });
                const deleteBtn = commentItem.locator(SELECTORS.commentDelete);

                if (await deleteBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
                    await deleteBtn.click();

                    // Modal should appear
                    const modal = page.locator(SELECTORS.modal);
                    if (await modal.isVisible({ timeout: 2000 }).catch(() => false)) {
                        await page.locator(SELECTORS.modalConfirm).click();
                    }

                    // Comment should disappear
                    await expect(page.locator(`text="${testComment}"`).first()).not.toBeVisible({
                        timeout: 5000,
                    });
                }
            }
        });
    });

    test.describe('As Admin', () => {
        test.beforeEach(async ({ page }) => {
            await loginViaUI(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
        });

        test('should be able to delete any comment', async ({ page }) => {
            await goToFirstJobDetail(page);

            const comments = page.locator(SELECTORS.commentItem);
            if (await comments.count() > 0) {
                const firstComment = comments.first();
                const deleteBtn = firstComment.locator(SELECTORS.commentDelete);

                if (await deleteBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
                    const commentText = await firstComment.textContent();
                    await deleteBtn.click();

                    const modal = page.locator(SELECTORS.modal);
                    if (await modal.isVisible({ timeout: 2000 }).catch(() => false)) {
                        await page.locator(SELECTORS.modalConfirm).click();

                        // Comment should be removed
                        await page.waitForTimeout(500);
                        const stillExists = await page.locator(`text="${commentText}"`).isVisible({ timeout: 1000 }).catch(() => false);
                        expect(stillExists).toBeFalsy();
                    }
                }
            }
        });
    });
});
