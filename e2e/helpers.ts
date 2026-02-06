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

  // Theme
  themeToggle: '[data-testid="theme-toggle"]',

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
  // Wait for page to be stable
  await page.waitForLoadState("load");
  await page.waitForLoadState("domcontentloaded");

  // Safari/WebKit specific: sometimes networkidle hangs or completes too early
  // We wait for the Qwik container to be present and some hydration signal if possible
  await page
    .waitForSelector("[q\\:container]", { state: "attached", timeout: 10000 })
    .catch(() => {});

  // Extra small grace period for hydration to settle on slower engines
  await page.waitForTimeout(500);

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
  if (isMobileViewport(page)) {
    const mobileMenu = page.locator(SELECTORS.mobileMenuButton);
    const isMenuOpen = await page
      .locator(".mobile-menu")
      .isVisible()
      .catch(() => false);
    if ((await mobileMenu.isVisible()) && !isMenuOpen) {
      await mobileMenu.click();
      await page.waitForTimeout(500);
    }
  }

  const logoutBtn = page
    .locator(SELECTORS.logoutButton)
    .filter({ visible: true })
    .first();
  await expect(logoutBtn).toBeVisible({ timeout: 5000 });
  await logoutBtn.click({ force: true });

  // Wait for navigation and cookie deletion
  let authToken;
  const maxRetries = 10;
  for (let i = 0; i < maxRetries; i++) {
    const cookies = await page.context().cookies();
    authToken = cookies.find((c) => c.name === "auth_token");
    if (!authToken) break;
    await page.waitForTimeout(500);
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
  if (!(await element.isVisible({ timeout: 500 }).catch(() => false))) {
    const mobileMenu = page.locator(SELECTORS.mobileMenuButton);
    if (await mobileMenu.isVisible({ timeout: 500 }).catch(() => false)) {
      await mobileMenu.click();
      await page.waitForTimeout(300);
    }
  }
  await element.click();
}

/**
 * Assert that a toast/notification appeared
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
 * Verify auth state
 */
export async function verifyAuthState(
  page: Page,
  shouldBeLoggedIn: boolean,
): Promise<void> {
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
    expect(authToken).toBeDefined();
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
    const logoutBtn = page
      .locator(SELECTORS.logoutButton)
      .filter({ visible: true })
      .first();
    await expect(logoutBtn).toBeVisible({ timeout: 5000 });
  } else {
    expect(authToken).toBeUndefined();
  }
}

/**
 * Ensure All Jobs View
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
  console.log("Navigating to /jobs...");
  await page.goto("/jobs");
  await ensurePageReady(page);
  await ensureAllJobsView(page);

  const jobCardLinkSelector = SELECTORS.jobCardLink;
  await page.waitForSelector(jobCardLinkSelector, {
    state: "visible",
    timeout: 15000,
  });

  // Safari resilience: Direct DOM click if regular click is flaky
  console.log("Clicking job card link via evaluate...");
  await page.evaluate((sel: string) => {
    const el = document.querySelector(sel) as HTMLElement;
    if (el) {
      el.scrollIntoView();
      el.click();
    }
  }, jobCardLinkSelector);

  await expect(page).toHaveURL(/\/jobs\/detail\//, { timeout: 20000 });
  await ensurePageReady(page);
}

/**
 * Get current like/dislike counts from job detail page
 */
export async function getReactionCounts(
  page: Page,
  scopeSelector?: string,
): Promise<{
  likes: number;
  dislikes: number;
}> {
  // Ensure the selectors exist in the DOM
  await page.waitForSelector(SELECTORS.likeCount, {
    state: "visible",
    timeout: 10000,
  });

  const countsHandle = await page.waitForFunction(
    ([selectors, scope]) => {
      const root = scope ? document.querySelector(scope) : document;
      if (!root) return null;

      const likesEl = root.querySelector(selectors.likeCount);
      const dislikesEl = root.querySelector(selectors.dislikeCount);

      if (!likesEl || !dislikesEl) return null;

      const lText = likesEl.textContent?.trim();
      const dText = dislikesEl.textContent?.trim();

      // Safari hydration check: text might be empty initially
      if (
        lText === "" ||
        dText === "" ||
        lText === undefined ||
        dText === undefined
      ) {
        return null;
      }

      const likes = parseInt(lText, 10);
      const dislikes = parseInt(dText, 10);

      if (isNaN(likes) || isNaN(dislikes)) return null;

      return { likes, dislikes };
    },
    [
      { likeCount: SELECTORS.likeCount, dislikeCount: SELECTORS.dislikeCount },
      scopeSelector,
    ] as const,
    { timeout: 15000 },
  );

  return (await countsHandle.jsonValue()) as {
    likes: number;
    dislikes: number;
  };
}
