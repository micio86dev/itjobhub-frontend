import { Page, expect, Response } from "@playwright/test";

/**
 * Selectors for common UI elements using data-testid pattern
 */
export const SELECTORS = {
  // Auth - Login
  loginEmailInput: '[data-testid="login-form-email-input"]',
  loginPasswordInput: '[data-testid="login-form-password-input"]',
  loginSubmit: '[data-testid="login-form-submit-btn"]',

  // Auth - Register
  registerFirstNameInput: '[data-testid="register-form-firstname-input"]',
  registerLastNameInput: '[data-testid="register-form-lastname-input"]',
  registerEmailInput: '[data-testid="register-form-email-input"]',
  registerPasswordInput: '[data-testid="register-form-password-input"]',
  registerConfirmPasswordInput:
    '[data-testid="register-form-confirm-password-input"]',
  registerSubmit: '[data-testid="register-form-submit-btn"]',

  // Navigation
  loginLink: 'a[href="/login"]',
  registerLink: 'a[href="/register"]',
  logoutButton:
    '[data-testid="logout-button"], [data-testid="logout-button-desktop"], [data-testid="logout-button-mobile"]',
  mobileMenuButton:
    '[data-testid="mobile-menu-button"], button[aria-label="Menu"]',
  profileLink: '[data-testid="profile-link"], a[href="/profile"]',

  // Jobs
  jobCard: '[data-testid="job-card"]',
  jobCardLink: '[data-testid="job-card-link"]',
  searchQuery: '[data-testid="search-query"]',
  likeButton: '[data-testid="like-button"]',
  dislikeButton: '[data-testid="dislike-button"]',
  likeCount: '[data-testid="like-count"]',
  dislikeCount: '[data-testid="dislike-count"]',
  favoriteButton: '[data-testid="favorite-button"]',
  deleteButton: '[data-testid="delete-button"]',
  applyButton: '[data-testid="apply-button"]',

  // Profile
  profileFirstName: '[data-testid="profile-firstname"]',
  profileLastName: '[data-testid="profile-lastname"]',
  profileBio: '[data-testid="profile-bio"]',
  profileSave: '[data-testid="profile-save"]',

  // Comments
  commentInput: '[data-testid="comment-input"]',
  commentSubmit: '[data-testid="comment-submit"]',
  commentItem: '[data-testid="comment-item"]',
  commentDelete: '[data-testid="comment-delete"]',
  commentEdit: '[data-testid="comment-edit"]',

  // Modal
  modal: '[role="dialog"]',
  modalConfirm: '[data-testid="modal-confirm"]',
  modalCancel: '[data-testid="modal-cancel"]',

  // Admin
  adminLink: 'a[href="/admin"]',
  postJobLink: 'a[href*="jobs/new"], [data-testid="post-job-link"]',
} as const;

/**
 * Wait for page to be fully loaded and hydrated
 */
export async function ensurePageReady(page: Page): Promise<void> {
  // Wait for page to be stable, but don't hang forever
  await Promise.race([
    page.waitForLoadState("networkidle"),
    page.waitForTimeout(5000),
  ]).catch(() => {});
  await page.waitForLoadState("domcontentloaded");
  await checkForViteError(page);
}

/**
 * Check for Vite error overlay and throw if present
 */
export async function checkForViteError(page: Page): Promise<void> {
  const overlay = page.locator("vite-error-overlay");
  if (await overlay.isVisible().catch(() => false)) {
    const errorText = await overlay.evaluate(
      (el) => el.shadowRoot?.textContent || el.textContent,
    );
    throw new Error(`Vite Error Overlay Detected: ${errorText}`);
  }
}

/**
 * Login through UI (when API login is not suitable)
 */
export async function loginViaUI(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  // Check if we are already logged in as this user
  const currentCookies = await page.context().cookies();
  const hasToken = currentCookies.some((c) => c.name === "auth_token");

  await page.goto("/login");
  await ensurePageReady(page);

  // If we were redirected away from login, we might already be authenticated
  if (!page.url().includes("/login") && hasToken) {
    console.log("Already logged in, skipping UI login");
    return;
  }

  // Ensure we are on login page
  if (!page.url().includes("/login")) {
    await page.goto("/login");
    await ensurePageReady(page);
  }

  const emailInput = page.locator(SELECTORS.loginEmailInput);
  if (!(await emailInput.isVisible({ timeout: 5000 }).catch(() => false))) {
    // If still not there, maybe we are logged in but cookie check failed?
    const logoutBtn = page
      .locator(SELECTORS.logoutButton)
      .filter({ visible: true })
      .first();
    if (await logoutBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log("Logout button visible, already logged in. Skipping login.");
      return;
    }
  }

  await emailInput.fill(email);
  await page.locator(SELECTORS.loginPasswordInput).fill(password);

  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/auth/login") &&
      response.request().method() === "POST",
    { timeout: 20000 },
  );

  await page.locator(SELECTORS.loginSubmit).click();
  await responsePromise;

  // Wait for redirect
  await expect(page).not.toHaveURL(/\/login/);
}

/**
 * Logout through UI
 */
export async function logoutViaUI(page: Page): Promise<void> {
  const isMobile = page.viewportSize()?.width
    ? page.viewportSize()!.width < 768
    : false;

  if (isMobile) {
    const mobileMenu = page.locator('[data-testid="mobile-menu-button"]');
    // If we can't see the menu button, maybe we are already in the menu?
    // Or maybe we are on a larger screen? But isMobile check should handle that.
    if (await mobileMenu.isVisible()) {
      const isMenuOpen = await page
        .locator(".mobile-menu")
        .isVisible()
        .catch(() => false);
      if (!isMenuOpen) {
        await mobileMenu.click();
        await page.waitForTimeout(1000); // Increased wait for animation
      }
    }
  } else {
    // Desktop: Logout button is directly visible in the header
    // No user menu to open
  }

  const logoutBtn = page
    .locator(SELECTORS.logoutButton)
    .filter({ visible: true })
    .first();
  await expect(logoutBtn).toBeVisible({ timeout: 5000 });
  await logoutBtn.click({ force: true });

  // Wait for navigation and cookie deletion with retries
  let authToken;
  const maxRetries = 10;
  for (let i = 0; i < maxRetries; i++) {
    const cookies = await page.context().cookies();
    authToken = cookies.find((c) => c.name === "auth_token");
    if (!authToken) break;
    await page.waitForTimeout(500);
  }

  if (authToken) {
    const allCookies = await page.context().cookies();
    console.log(
      "Cookies found after failed logout:",
      allCookies.map((c) => c.name),
    );
  }
  expect(authToken).toBeUndefined();

  await expect(page).toHaveURL(/(\/login|\/$)/);
}

/**
 * Navigate to a page and wait for it to be ready
 */
export async function navigateTo(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await ensurePageReady(page);
}

/**
 * Check if we're on a mobile viewport
 */
export function isMobileViewport(page: Page): boolean {
  const viewportSize = page.viewportSize();
  return viewportSize ? viewportSize.width < 768 : false;
}

/**
 * Click an element that might be hidden behind mobile menu
 */
export async function clickNavElement(
  page: Page,
  selector: string,
): Promise<void> {
  const element = page.locator(selector).first();

  // If element is not visible, try opening mobile menu
  if (!(await element.isVisible({ timeout: 500 }).catch(() => false))) {
    const mobileMenu = page.locator(SELECTORS.mobileMenuButton);
    if (await mobileMenu.isVisible({ timeout: 500 }).catch(() => false)) {
      await mobileMenu.click();
      await page.waitForTimeout(300); // Animation
    }
  }

  await element.click();
}

/**
 * Assert that a toast/notification appeared with given text pattern
 */
export async function expectToast(
  page: Page,
  textPattern: RegExp,
): Promise<void> {
  const toast = page.locator('[role="alert"], .toast, [data-testid="toast"]');
  await expect(toast.filter({ hasText: textPattern }).first()).toBeVisible({
    timeout: 5000,
  });
}

/**
 * Wait for API response
 */
export async function waitForApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  method: string = "GET",
): Promise<Response> {
  const pattern =
    typeof urlPattern === "string" ? new RegExp(urlPattern) : urlPattern;
  return page.waitForResponse(
    (response) =>
      pattern.test(response.url()) && response.request().method() === method,
  );
}

/**
 * Verify auth state in localStorage
 */
export async function verifyAuthState(
  page: Page,
  shouldBeLoggedIn: boolean,
): Promise<void> {
  // Check for auth_token cookie with retries if we expect it to be there
  let authToken;
  const maxRetries = 10;
  for (let i = 0; i < maxRetries; i++) {
    const cookies = await page.context().cookies();
    authToken = cookies.find((c) => c.name === "auth_token");
    if (shouldBeLoggedIn && authToken) break;
    if (!shouldBeLoggedIn && !authToken) break;
    await page.waitForTimeout(500);
  }

  if (shouldBeLoggedIn) {
    if (!authToken) {
      // Log available cookies for debugging
      const allCookies = await page.context().cookies();
      console.log(
        "Cookies found during failed login check:",
        allCookies.map((c) => c.name),
      );
    }
    expect(authToken).toBeDefined();

    // Handle Mobile Menu visibility for logout button
    if (isMobileViewport(page)) {
      const mobileMenu = page.locator(SELECTORS.mobileMenuButton);
      const isMenuOpen = await page
        .locator(".mobile-menu")
        .isVisible()
        .catch(() => false);

      if ((await mobileMenu.isVisible()) && !isMenuOpen) {
        await mobileMenu.click();
        await page.waitForTimeout(300);
      }
    }

    // Also check UI - Logout button should be visible
    // Filter by visibility to ensure we don't pick the hidden desktop button on mobile
    const logoutBtn = page
      .locator(SELECTORS.logoutButton)
      .filter({ visible: true })
      .first();
    // We allow a small timeout because hydration might take a moment
    await expect(logoutBtn).toBeVisible({ timeout: 5000 });
  } else {
    expect(authToken).toBeUndefined();

    // Handle Mobile Menu for login link
    if (isMobileViewport(page)) {
      const mobileMenu = page.locator(SELECTORS.mobileMenuButton);
      const isMenuOpen = await page
        .locator(".mobile-menu")
        .isVisible()
        .catch(() => false);

      if ((await mobileMenu.isVisible()) && !isMenuOpen) {
        await mobileMenu.click();
        await page.waitForTimeout(300);
      }
    }

    // Check UI - Login link should be visible
    // Filter by visibility for mobile
    const loginLink = page
      .locator(SELECTORS.loginLink)
      .filter({ visible: true })
      .first();
    await expect(loginLink).toBeVisible({ timeout: 5000 });
  }
}

/**
 * Ensure we are viewing "All Jobs" not "Personalized Feed"
 */
export async function ensureAllJobsView(page: Page): Promise<void> {
  const personalizedBtn = page
    .locator("button")
    .filter({ hasText: /feed personalizzato|personalized/i })
    .first();
  if (await personalizedBtn.isVisible().catch(() => false)) {
    await personalizedBtn.click();
    await expect(
      page
        .locator("button")
        .filter({ hasText: /tutti|all jobs/i })
        .first(),
    ).toBeVisible({ timeout: 5000 });
  }
}

/**
 * Click first job card and go to detail page
 */
export async function goToFirstJobDetail(page: Page): Promise<void> {
  // Use /jobs to ensure we find a job card
  console.log("Navigating to /jobs...");
  await page.goto("/jobs");
  await ensurePageReady(page);
  await ensureAllJobsView(page);

  const jobCardLink = page.locator(SELECTORS.jobCardLink).first();
  await expect(jobCardLink).toBeVisible({ timeout: 15000 });
  await jobCardLink.click();

  await expect(page).toHaveURL(/\/jobs\/detail\//);
  await ensurePageReady(page);
}

/**
 * Get current like/dislike counts from job detail page
 */
export async function getReactionCounts(page: Page): Promise<{
  likes: number;
  dislikes: number;
}> {
  const likesText = await page.locator(SELECTORS.likeCount).innerText();
  const dislikesText = await page.locator(SELECTORS.dislikeCount).innerText();

  return {
    likes: parseInt(likesText, 10) || 0,
    dislikes: parseInt(dislikesText, 10) || 0,
  };
}
