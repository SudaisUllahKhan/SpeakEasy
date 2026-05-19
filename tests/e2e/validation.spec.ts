/**
 * SpeakEasy – End-to-end validation and edge-case tests
 *
 * Covers:
 *  1. Login page: Terms / Privacy text visible
 *  2. Unauthenticated access to /dashboard redirects to login
 *  3. (Authenticated) Dashboard XP section visible
 *  4. (Authenticated) Topics page shows at least one topic card with name + progress bar
 *  5. (Authenticated) Settings page shows the dev user email
 *  6. (Authenticated) Navigating between tabs does not show blank screen
 *  7. (Authenticated) "Start Learning" button on dashboard is tappable (not disabled)
 *
 * Auth strategy
 * ─────────────
 * The dev-login API is restricted to NODE_ENV=development and returns 403 on
 * the live Vercel deployment. Authenticated tests therefore attempt the login
 * and skip gracefully when the endpoint is unavailable, so the test run does
 * not hard-fail because of infrastructure constraints.
 */

import { test, expect, type Page, type BrowserContext } from "@playwright/test";

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE = "https://speak-easy-khaki.vercel.app";
const DEV_EMAIL = "dev@speakeasy.test";
const COOKIE_NAME = "next-auth.session-token";
const COOKIE_DOMAIN = "speak-easy-khaki.vercel.app";

// ─── Auth helpers ─────────────────────────────────────────────────────────────

/**
 * Attempts to obtain a session token via the dev-login endpoint.
 * Returns the token string on success, or null when the endpoint is
 * unavailable (non-development environment).
 */
async function tryDevLogin(page: Page): Promise<string | null> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (process.env.E2E_SECRET) headers["x-e2e-secret"] = process.env.E2E_SECRET;
  const response = await page.request.post(`${BASE}/api/auth/dev-login`, {
    data: { email: DEV_EMAIL },
    headers,
  });

  if (!response.ok()) {
    // 403 = endpoint disabled on production; 404 = route doesn't exist.
    return null;
  }

  const body = (await response.json()) as Record<string, unknown>;
  if (typeof body.sessionToken !== "string" || !body.sessionToken) {
    return null;
  }

  return body.sessionToken;
}

/**
 * Sets up an authenticated browser context.
 * Returns true when auth succeeded, false when the dev-login endpoint is
 * unavailable (so callers can skip the test).
 */
async function setupAuth(context: BrowserContext, page: Page): Promise<boolean> {
  // Navigate to the base URL first so the domain is established in the context.
  await page.goto(BASE, { waitUntil: "domcontentloaded" });

  const token = await tryDevLogin(page);
  if (!token) {
    return false;
  }

  await context.addCookies([
    {
      name: COOKIE_NAME,
      value: token,
      domain: COOKIE_DOMAIN,
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
    },
  ]);

  return true;
}

// ─── Suite: Login page (no auth required) ────────────────────────────────────

test.describe("Login page — unauthenticated", () => {
  test("shows Terms and Privacy Policy links", async ({ page }) => {
    await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });

    // The login page contains the text: "By signing in you agree to our Terms
    // and Privacy Policy."  Both words are wrapped in <a> tags.
    await expect(page.getByRole("link", { name: "Terms" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Privacy Policy" })).toBeVisible();

    // Verify the surrounding prose is also present so we know it is the
    // consent notice and not some unrelated link.
    await expect(
      page.getByText(/by signing in you agree to our/i)
    ).toBeVisible();
  });

  test("shows Continue with Google button", async ({ page }) => {
    await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });

    const googleBtn = page.getByRole("button", { name: /continue with google/i });
    await expect(googleBtn).toBeVisible();
    // Must not be disabled — a disabled auth button would block all logins.
    await expect(googleBtn).toBeEnabled();
  });

  test("shows email magic-link input and send button", async ({ page }) => {
    await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("textbox", { name: /email/i })).toBeVisible();
    await expect(
      page.getByRole("button", { name: /send magic link/i })
    ).toBeVisible();
  });

  test("visiting /dashboard without auth redirects to login", async ({ page }) => {
    // The server issues a 307 → /login. Playwright follows the redirect.
    const response = await page.goto(`${BASE}/dashboard`);

    // After following redirects we should land on the login page.
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });

    // Extra: confirm the Google button is present (proves it is the real login
    // page and not a generic error page).
    await expect(
      page.getByRole("button", { name: /continue with google/i })
    ).toBeVisible();

    // Confirm the final HTTP status was a successful page load (2xx) after the
    // redirect chain — Playwright resolves to the last response in the chain.
    if (response) {
      expect(response.status()).toBeLessThan(400);
    }
  });

  test("visiting /topics without auth redirects to login", async ({ page }) => {
    await page.goto(`${BASE}/topics`);
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });

  test("visiting /settings without auth redirects to login", async ({ page }) => {
    await page.goto(`${BASE}/settings`);
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });
});

// ─── Suite: Authenticated — conditionally skipped when dev-login unavailable ──

test.describe("Authenticated user flows", () => {
  // We use a beforeEach that either sets up the session or skips the test.
  test.beforeEach(async ({ context, page }, testInfo) => {
    const authed = await setupAuth(context, page);
    if (!authed) {
      testInfo.skip(
        true,
        "Dev-login endpoint not available on this deployment " +
          "(NODE_ENV != development). Skipping authenticated tests."
      );
    }
  });

  test("dashboard: XP section is visible after login", async ({ page }) => {
    await page.goto(`${BASE}/dashboard`, { waitUntil: "domcontentloaded" });

    // Wait for the page to settle — either skeleton or real content.
    await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {
      // networkidle can time out on slow connections; continue anyway.
    });

    // We must not be redirected away to login.
    await expect(page).not.toHaveURL(/\/login/, { timeout: 5_000 });

    // The dashboard renders an XP stat. The label text is "XP" and it appears
    // in the stats row.  We accept either the real value or a skeleton
    // placeholder (the skeleton uses aria-hidden animated divs, but the label
    // text is still rendered).
    const xpLabel = page.getByText(/\bxp\b/i).first();
    await expect(xpLabel).toBeVisible({ timeout: 10_000 });
  });

  test("dashboard: Start Learning button is enabled", async ({ page }) => {
    await page.goto(`${BASE}/dashboard`, { waitUntil: "domcontentloaded" });

    await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {});
    await expect(page).not.toHaveURL(/\/login/);

    // The dashboard has a prominent CTA. Look for a link or button whose
    // accessible name contains "start" or "learn".
    const cta = page
      .getByRole("link", { name: /start\s+learning/i })
      .or(page.getByRole("button", { name: /start\s+learning/i }))
      .first();

    await expect(cta).toBeVisible({ timeout: 10_000 });

    // If it's a button it must not be disabled.
    const tagName = await cta.evaluate((el) => el.tagName.toLowerCase());
    if (tagName === "button") {
      await expect(cta).toBeEnabled();
    }

    // The element must be within the viewport so it is actually tappable.
    await expect(cta).toBeInViewport();
  });

  test("topics page: at least one topic card with name and progress bar", async ({
    page,
  }) => {
    await page.goto(`${BASE}/topics`, { waitUntil: "domcontentloaded" });

    await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {});
    await expect(page).not.toHaveURL(/\/login/);

    // Each topic card is a link that leads to the topic's lessons.
    // Wait for at least one card to appear.
    const topicCards = page.locator('a[href*="/topics/"]');
    await expect(topicCards.first()).toBeVisible({ timeout: 10_000 });

    const count = await topicCards.count();
    expect(count).toBeGreaterThanOrEqual(1);

    // Check the first card has a non-empty text name.
    const firstCard = topicCards.first();
    const cardText = (await firstCard.textContent()) ?? "";
    expect(cardText.trim().length).toBeGreaterThan(0);

    // A progress bar: HTML progress element, [role=progressbar], or a div with
    // aria-valuenow.  The topics page renders a styled div progress bar.
    const progressEl = page
      .locator('[role="progressbar"]')
      .or(page.locator("progress"))
      .or(page.locator('[aria-valuenow]'))
      .first();

    await expect(progressEl).toBeVisible({ timeout: 10_000 });
  });

  test("settings page: shows the dev user email", async ({ page }) => {
    await page.goto(`${BASE}/settings`, { waitUntil: "domcontentloaded" });

    await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {});
    await expect(page).not.toHaveURL(/\/login/);

    // The settings page shows the signed-in user's email.
    await expect(page.getByText(DEV_EMAIL)).toBeVisible({ timeout: 10_000 });
  });

  test("navigating between tabs does not produce a blank screen", async ({
    page,
  }) => {
    // Define the main in-app routes that correspond to bottom-tab navigation.
    const routes: Array<{ path: string; label: string }> = [
      { path: "/dashboard", label: "Dashboard" },
      { path: "/topics",    label: "Topics" },
      { path: "/progress",  label: "Progress" },
      { path: "/review",    label: "Review" },
    ];

    // We check each route in sequence.  On each page, either real content OR
    // skeleton shimmer placeholders must be visible within 5 seconds.
    // A completely blank page would have no visible children in <main> or the
    // app shell wrapper.
    for (const { path, label } of routes) {
      await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded" });

      // Give the page 5 s to show either skeleton or content.
      const hasVisibleContent = await page
        .locator("main, [data-testid='app-shell'], #__next > div")
        .filter({ has: page.locator(":visible") })
        .first()
        .waitFor({ state: "visible", timeout: 5_000 })
        .then(() => true)
        .catch(() => false);

      expect(
        hasVisibleContent,
        `${label} (${path}) appears blank — no visible content found within 5 s`
      ).toBe(true);

      // The page must not have silently redirected back to login.
      await expect(page, `${label} unexpectedly redirected to login`).not.toHaveURL(
        /\/login/
      );
    }
  });
});
