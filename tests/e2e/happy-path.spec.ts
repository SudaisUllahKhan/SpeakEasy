/**
 * SpeakEasy — Happy-Path E2E Tests
 *
 * Covers:
 *   1. Login page loads with correct branding and auth buttons
 *   2. Dev login API call (returns sessionToken in dev, 403 in prod)
 *   3. Dashboard greeting and CTA (authenticated)
 *   4. Topics tab — topic cards visible
 *   5. Progress tab — "Your Progress" heading
 *   6. Settings tab — "Settings" heading and sign-out button
 *
 * Auth strategy:
 *   POST /api/auth/dev-login → sessionToken → set `next-auth.session-token` cookie.
 *   If dev-login returns 403 (production build), authenticated-route tests are skipped
 *   and the failure is logged as an APP ENVIRONMENT NOTE (not a test bug).
 */

import { test, expect, type BrowserContext, type Page } from '@playwright/test';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BASE = 'https://speak-easy-khaki.vercel.app';

/** Attempt dev login. Returns the session token or null if unavailable. */
async function devLogin(page: Page): Promise<string | null> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (process.env.E2E_SECRET) headers['x-e2e-secret'] = process.env.E2E_SECRET;
  const resp = await page.request.post(`${BASE}/api/auth/dev-login`, {
    data: { email: 'dev@speakeasy.test' },
    headers,
  });
  if (resp.status() !== 200) {
    console.log(
      `[APP ENV NOTE] dev-login returned ${resp.status()} — ` +
      'set E2E_SECRET env var to enable authenticated tests on Vercel.'
    );
    return null;
  }
  const body = await resp.json() as { sessionToken?: string };
  return body.sessionToken ?? null;
}

/** Install a NextAuth session cookie so the app treats this browser as logged in. */
async function setSessionCookie(context: BrowserContext, token: string) {
  await context.addCookies([
    {
      name: 'next-auth.session-token',
      value: token,
      domain: 'speak-easy-khaki.vercel.app',
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
    },
  ]);
}

// ─── Test 1: Login page loads ─────────────────────────────────────────────────

test('login page loads and shows SpeakEasy branding and Continue with Google button', async ({ page }) => {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  // Page title contains SpeakEasy
  await expect(page).toHaveTitle(/SpeakEasy/i);

  // Brand logo — "Speak" and "Easy" are rendered side-by-side in two spans
  const brandText = page.locator('a[aria-label="SpeakEasy home"], .text-\\[var\\(--color-primary\\)\\], span');
  // More robust: look for the visible "Speak" or "Easy" text on the page
  await expect(page.getByText('Speak', { exact: true })).toBeVisible();
  await expect(page.getByText('Easy', { exact: true })).toBeVisible();

  // Sub-heading on login card
  await expect(
    page.getByText('Sign in to continue your speaking journey')
  ).toBeVisible();

  // Primary auth buttons
  await expect(page.getByRole('button', { name: /Continue with Google/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Continue with Apple/i })).toBeVisible();

  // Email magic-link option
  await expect(page.getByRole('button', { name: /Send magic link/i })).toBeVisible();
  await expect(page.locator('input[type="email"]')).toBeVisible();
});

// ─── Test 2: Dev login API call ───────────────────────────────────────────────

test('dev login: POST /api/auth/dev-login returns sessionToken or 403', async ({ page }) => {
  const resp = await page.request.post(`${BASE}/api/auth/dev-login`, {
    data: { email: 'dev@speakeasy.test' },
  });

  // In development: expect 200 + sessionToken
  // In production:  endpoint is guarded by NODE_ENV check → returns 403
  const status = resp.status();
  console.log(`[dev-login] HTTP status: ${status}`);

  if (status === 200) {
    const body = await resp.json() as { sessionToken?: string; deepLink?: string };
    console.log('[dev-login] sessionToken received:', body.sessionToken?.substring(0, 8) + '...');
    expect(body).toHaveProperty('sessionToken');
    expect(typeof body.sessionToken).toBe('string');
    expect(body.sessionToken!.length).toBeGreaterThan(10);
  } else if (status === 403) {
    // Expected on production deployment — not a test bug
    const body = await resp.json() as { error?: string };
    console.log('[APP ENV NOTE] dev-login disabled in production:', body.error);
    expect(body).toHaveProperty('error');
  } else {
    // Any other status is unexpected
    throw new Error(`Unexpected dev-login status: ${status}`);
  }
});

// ─── Test 3: Dashboard shows greeting ────────────────────────────────────────

test('dashboard shows greeting and start-lesson CTA when authenticated', async ({ page, context }) => {
  const token = await devLogin(page);

  if (!token) {
    // dev-login is unavailable on this deployment — document as environment gap
    console.log(
      '[SKIP] dashboard test: dev-login returned 403. ' +
      'Set NODE_ENV=development on the deployment to enable this test.'
    );
    test.skip();
    return;
  }

  await setSessionCookie(context, token);
  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle');

  // Must stay on dashboard (not redirect to login)
  expect(page.url()).toContain('/dashboard');

  // Time-of-day greeting (Good morning / Good afternoon / Good evening)
  const greetingLocator = page.locator('text=/Good (morning|afternoon|evening)/i');
  await expect(greetingLocator).toBeVisible({ timeout: 10_000 });

  // Start today's lesson CTA link/button
  await expect(
    page.getByText("Start today's lesson", { exact: false })
  ).toBeVisible();
});

// ─── Test 4: Navigate to Topics tab ──────────────────────────────────────────

test('topics tab shows "All Topics" heading and topic cards', async ({ page, context }) => {
  const token = await devLogin(page);

  if (!token) {
    console.log('[SKIP] topics test: dev-login returned 403.');
    test.skip();
    return;
  }

  await setSessionCookie(context, token);
  await page.goto('/topics');
  await page.waitForLoadState('networkidle');

  expect(page.url()).toContain('/topics');

  // Page heading
  await expect(page.getByRole('heading', { name: /All Topics/i })).toBeVisible({ timeout: 10_000 });

  // At least one topic card should be rendered (seeded data has 10 topics)
  const topicCards = page.locator('a[href^="/topics/"]');
  await expect(topicCards.first()).toBeVisible({ timeout: 10_000 });
  const count = await topicCards.count();
  console.log(`[topics] Found ${count} topic card(s)`);
  expect(count).toBeGreaterThanOrEqual(1);
});

// ─── Test 5: Navigate to Progress tab ────────────────────────────────────────

test('progress tab shows "Your Progress" heading', async ({ page, context }) => {
  const token = await devLogin(page);

  if (!token) {
    console.log('[SKIP] progress test: dev-login returned 403.');
    test.skip();
    return;
  }

  await setSessionCookie(context, token);
  await page.goto('/progress');
  await page.waitForLoadState('networkidle');

  expect(page.url()).toContain('/progress');

  await expect(
    page.getByRole('heading', { name: /Your Progress/i })
  ).toBeVisible({ timeout: 10_000 });
});

// ─── Test 6: Navigate to Settings tab ────────────────────────────────────────

test('settings tab shows "Settings" heading and sign-out button', async ({ page, context }) => {
  const token = await devLogin(page);

  if (!token) {
    console.log('[SKIP] settings test: dev-login returned 403.');
    test.skip();
    return;
  }

  await setSessionCookie(context, token);
  await page.goto('/settings');
  await page.waitForLoadState('networkidle');

  expect(page.url()).toContain('/settings');

  // "Settings" h1
  await expect(
    page.getByRole('heading', { name: /Settings/i, level: 1 })
  ).toBeVisible({ timeout: 10_000 });

  // Sign-out button
  await expect(
    page.getByRole('button', { name: /Sign out/i })
  ).toBeVisible({ timeout: 10_000 });
});

// ─── Test 7: Unauthenticated access redirects to /login ──────────────────────

test('protected routes redirect unauthenticated users to /login', async ({ page }) => {
  const protectedRoutes = ['/dashboard', '/topics', '/progress', '/settings'];

  for (const route of protectedRoutes) {
    await page.goto(route);
    await page.waitForLoadState('networkidle');
    const url = page.url();
    expect(url, `Expected ${route} to redirect to /login, got ${url}`).toContain('/login');
    console.log(`[redirect] ${route} → ${url} ✓`);
  }
});

// ─── Test 8: Bottom navigation is present on authenticated pages ──────────────

test('bottom navigation renders Home/Topics/Review/Progress/Profile tabs', async ({ page, context }) => {
  const token = await devLogin(page);

  if (!token) {
    console.log('[SKIP] bottom-nav test: dev-login returned 403.');
    test.skip();
    return;
  }

  await setSessionCookie(context, token);
  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle');

  // Bottom nav items
  const nav = page.locator('nav').filter({ hasText: 'Home' });
  await expect(nav).toBeVisible({ timeout: 10_000 });

  for (const label of ['Home', 'Topics', 'Review', 'Progress', 'Profile']) {
    await expect(
      nav.getByText(label, { exact: true }),
      `Expected bottom-nav label "${label}" to be visible`
    ).toBeVisible();
  }
});
