import { test, expect, createTestNews, deleteTestNews, TEST_USERS, API_BASE } from "./fixtures";
import { SELECTORS, ensurePageReady, navigateTo } from "./helpers";

test.describe("News Feature", () => {
    let newsId: string;
    let newsSlug: string;
    let adminToken: string;

    test.beforeAll(async ({ request }) => {
        // Login as admin to get token
        const loginRes = await request.post(`${API_BASE}/auth/login`, {
            data: {
                email: TEST_USERS.admin.email,
                password: TEST_USERS.admin.password
            }
        });
        const loginData = await loginRes.json();
        adminToken = loginData.data.token;

        // Create a test news article
        const timestamp = Date.now();
        newsSlug = `e2e-news-${timestamp}`;
        newsId = await createTestNews(request, adminToken, {
            title: `E2E News Title ${timestamp}`,
            slug: newsSlug,
            summary: "This is a summary for E2E testing",
            content: "<p>This is the content for E2E testing</p>",
            category: "Development",
            is_published: true
        });
    });

    test.afterAll(async ({ request }) => {
        if (newsId && adminToken) {
            await deleteTestNews(request, adminToken, newsId);
        }
    });

    test("Guest can view news list", async ({ page }) => {
        await navigateTo(page, "/news");

        // Check for header
        await expect(page.locator("h1")).toContainText("Tech News & Insights");

        // filters should be visible
        await expect(page.getByText("All")).toBeVisible();
        await expect(page.getByText("Development")).toBeVisible();

        // Check if our created news is present using the title
        // We might need to wait for hydration or list loading
        await expect(page.getByText(/E2E News Title/)).toBeVisible();
    });

    test("Guest can navigate to news detail", async ({ page }) => {
        await navigateTo(page, "/news");

        // Click on the news card
        // Need to find the specific card. 
        // Since we don't have unique data-testid per item easily, we search by text
        await page.getByText(/E2E News Title/).first().click();

        await expect(page).toHaveURL(new RegExp(`/news/${newsSlug}`));
        await ensurePageReady(page);

        // Verify content
        await expect(page.locator("h1")).toContainText(/E2E News Title/);
        await expect(page.locator("article")).toBeVisible();

        // Verify back link works
        const backLink = page.getByTestId("back-link");
        await expect(backLink).toBeVisible();
        await backLink.click();
        await expect(page).toHaveURL(/\/news$/);
    });

    test("Authenticated user can like news", async ({ userPage }) => {
        await navigateTo(userPage, `/news/${newsSlug}`);

        const likeBtn = userPage.getByTestId("like-btn");
        const dislikeBtn = userPage.getByTestId("dislike-btn");

        await expect(likeBtn).toBeVisible();
        await expect(dislikeBtn).toBeVisible();

        // Initial state logic depends on previous runs, but assuming fresh user/news it should be neutral
        // We'll just click and verify no error toast/action happens
        await likeBtn.click();

        // We can check if the count increased or button class changed, but that's flaky without data-testid for counts specifically separate or analyzing class
        // Let's check class change for active state (contains blue text)
        await expect(likeBtn).toHaveClass(/text-blue-600/);
    });

    test("Admin can see delete button", async ({ adminPage }) => {
        await navigateTo(adminPage, `/news/${newsSlug}`);

        const deleteBtn = adminPage.getByTestId("delete-article-btn");
        await expect(deleteBtn).toBeVisible();
    });
});
