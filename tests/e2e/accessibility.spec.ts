/**
 * SpeakEasy — Accessibility & UX Tests
 *
 * Covers:
 *   - Login page a11y: title, keyboard focus, accessible names, mobile viewport
 *   - Home page (public): heading level structure, CTA accessible name
 *   - Protected pages: redirect to login works correctly (auth gate a11y)
 *   - Mobile overflow: no horizontal scrollbar at 375–393px
 *
 * Auth strategy:
 *   POST /api/auth/dev-login is protected to NODE_ENV=development and returns
 *   403 on the production Vercel deployment.  When the endpoint IS available
 *   (local dev), authenticated tests run with a real session token.
 *   When unavailable, those tests fall back to asserting the app's auth-gate
 *   behaviour (unauthenticated visits to /dashboard and /topics must redirect
 *   to the login page — itself an accessibility requirement).
 */

import { test, expect, type APIRequestContext, type Page } from '@playwright/test';

// ─── Auth helper ─────────────────────────────────────────────────────────────

const BASE_URL = 'https://speak-easy-khaki.vercel.app';
const DEV_LOGIN_EMAIL = 'dev@speakeasy.test';

/**
 * Attempt a dev login.
 * Returns the session token string, or null if the endpoint is unavailable.
 */
async function tryDevLogin(request: APIRequestContext): Promise<string | null> {
  try {
    const headers: Record<string, string> = {};
    if (process.env.E2E_SECRET) headers["x-e2e-secret"] = process.env.E2E_SECRET;
    const res = await request.post(`${BASE_URL}/api/auth/dev-login`, {
      data: { email: DEV_LOGIN_EMAIL },
      headers,
      failOnStatusCode: false,
    });
    if (!res.ok()) {
      console.log(`[auth] dev-login returned HTTP ${res.status()} — authenticated path unavailable`);
      return null;
    }
    const body = await res.json() as { sessionToken?: string };
    return body.sessionToken ?? null;
  } catch {
    return null;
  }
}

/**
 * Set the NextAuth session cookie and navigate to the given path.
 */
async function loginAndGoto(page: Page, token: string, path: string) {
  await page.goto('/');
  await page.context().addCookies([
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
  await page.goto(path);
}

// ─────────────────────────────────────────────────────────────────────────────
// GROUP 1: LOGIN PAGE — unauthenticated, no token required
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Login page — accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  // ── 1. Meaningful <title> ──────────────────────────────────────────────────
  test('page has a meaningful <title> element', async ({ page }) => {
    const title = await page.title();
    expect(title.trim().length, 'page title must not be empty').toBeGreaterThan(0);
    expect(title.toLowerCase(), 'page title must not be "untitled"').not.toBe('untitled');
    expect(title.toLowerCase()).not.toMatch(/^(localhost|127\.0\.0\.1)/);

    const hasProductName =
      /speakeasy/i.test(title) ||
      /sign\s*in/i.test(title) ||
      /log\s*in/i.test(title) ||
      /english/i.test(title);

    expect(hasProductName, `title "${title}" does not contain a product or feature name`).toBe(true);
  });

  // ── 2. Google button is keyboard-focusable ─────────────────────────────────
  test('"Continue with Google" button is reachable via Tab key', async ({ page }) => {
    await page.keyboard.press('Tab');

    let reached = false;
    for (let i = 0; i < 15; i++) {
      const focusedLabel = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el) return '';
        return (
          el.getAttribute('aria-label') ??
          el.textContent?.trim() ??
          el.getAttribute('title') ??
          ''
        );
      });
      if (/google/i.test(focusedLabel)) {
        reached = true;
        break;
      }
      await page.keyboard.press('Tab');
    }
    expect(reached, '"Continue with Google" was not reached within 15 Tab keypresses').toBe(true);
  });

  // ── 3. All interactive elements have accessible names ─────────────────────
  test('all interactive elements have accessible names', async ({ page }) => {
    const results: Array<{ tag: string; outerHTML: string; name: string }> = await page.evaluate(() => {
      const interactive = Array.from(
        document.querySelectorAll<HTMLElement>('button, a[href], input, [role="button"]')
      );
      return interactive.map((el) => {
        const ariaLabel = el.getAttribute('aria-label') ?? '';
        const ariaLabelledBy = el.getAttribute('aria-labelledby') ?? '';
        const title = el.getAttribute('title') ?? '';
        const innerText = (el as HTMLElement).innerText?.trim() ?? '';
        const placeholder = (el as HTMLInputElement).placeholder ?? '';

        let labelledByText = '';
        if (ariaLabelledBy) {
          const labelEl = document.getElementById(ariaLabelledBy);
          labelledByText = labelEl?.textContent?.trim() ?? '';
        }

        const name =
          ariaLabel || labelledByText || title || innerText || placeholder;

        return {
          tag: el.tagName,
          outerHTML: el.outerHTML.slice(0, 200),
          name,
        };
      });
    });

    const unnamed = results.filter((r) => !r.name.trim());
    expect(
      unnamed,
      `Found ${unnamed.length} interactive elements without accessible names:\n` +
        unnamed.map((u) => `  ${u.outerHTML}`).join('\n')
    ).toHaveLength(0);
  });

  // ── 4. Mobile viewport — no horizontal scrollbar ──────────────────────────
  test('renders without horizontal overflow at 393px mobile width', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.waitForTimeout(300);

    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalOverflow, 'Login page has horizontal overflow at 393px width').toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GROUP 2: HOME PAGE — public, tests heading structure & CTA
// (Mirrors what we'd test on the authenticated dashboard)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Home page — heading structure & CTA accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  // ── 5. h1 heading exists ───────────────────────────────────────────────────
  test('home page has at least one h1 heading', async ({ page }) => {
    const h1Count = await page.locator('h1, [role="heading"][aria-level="1"]').count();
    expect(h1Count, 'Home page should have at least one h1 heading').toBeGreaterThan(0);
  });

  // ── 6. Primary CTA "Start speaking for free" has accessible name ──────────
  test('"Start speaking for free" CTA has an accessible name', async ({ page }) => {
    const cta = page.getByRole('link', { name: /start speaking for free/i }).first();
    await expect(cta).toBeVisible({ timeout: 10_000 });

    const accessibleName = await cta.evaluate((el: HTMLElement) => {
      const ariaLabel = el.getAttribute('aria-label');
      if (ariaLabel) return ariaLabel;
      return el.textContent?.trim() ?? '';
    });
    expect(accessibleName.trim().length, 'CTA link has no accessible name').toBeGreaterThan(0);
  });

  // ── 7. Home page has no horizontal overflow at 375px ──────────────────────
  test('home page has no content overflow at 375px mobile width', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(300);

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(
      scrollWidth,
      `Home page scrollWidth (${scrollWidth}) exceeds clientWidth (${clientWidth})`
    ).toBeLessThanOrEqual(clientWidth);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GROUP 3: AUTH GATE — protected pages redirect correctly
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Auth gate — unauthenticated access redirects accessibly', () => {
  // ── 8. /dashboard redirects unauthenticated users to login ────────────────
  test('visiting /dashboard without auth lands on a page with a sign-in option', async ({ page }) => {
    await page.goto('/dashboard');
    // The app should redirect to /login (or show the login wall).
    // We verify the user ends up somewhere with a sign-in option.
    await page.waitForURL(/\/(login|auth|$)/, { timeout: 10_000 });
    const url = page.url();
    expect(
      /login|auth|speak-easy-khaki\.vercel\.app\/?$/.test(url),
      `Expected redirect to login/auth page, got: ${url}`
    ).toBe(true);
  });

  // ── 9. /topics redirects unauthenticated users to login ───────────────────
  test('visiting /topics without auth lands on a page with a sign-in option', async ({ page }) => {
    await page.goto('/topics');
    await page.waitForURL(/\/(login|auth|$)/, { timeout: 10_000 });
    const url = page.url();
    expect(
      /login|auth|speak-easy-khaki\.vercel\.app\/?$/.test(url),
      `Expected redirect to login/auth page, got: ${url}`
    ).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GROUP 4: AUTHENTICATED — run when dev-login is available
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Dashboard — accessibility (authenticated, dev-login required)', () => {
  let sessionToken: string | null = null;

  test.beforeAll(async ({ request }) => {
    sessionToken = await tryDevLogin(request);
  });

  test.beforeEach(async ({ page }) => {
    test.skip(
      !sessionToken,
      'dev-login endpoint returned 403 (production deployment) — skipping authenticated dashboard tests'
    );
    await loginAndGoto(page, sessionToken!, '/dashboard');
  });

  // ── 10. Dashboard h1 heading ─────────────────────────────────────────────
  test('dashboard has at least one h1 heading', async ({ page }) => {
    const h1Count = await page.locator('h1, [role="heading"][aria-level="1"]').count();
    expect(h1Count, 'Dashboard should have at least one h1-level heading').toBeGreaterThan(0);
  });

  // ── 11. "Start today's lesson" CTA accessible name ───────────────────────
  test('"Start today\'s lesson" CTA has an accessible name', async ({ page }) => {
    const cta = page.getByText(/start today.?s lesson/i).first();
    await expect(cta).toBeVisible({ timeout: 10_000 });

    const accessibleName = await cta.evaluate((el: HTMLElement) => {
      let cur: HTMLElement | null = el;
      while (cur) {
        const label = cur.getAttribute('aria-label');
        if (label) return label;
        cur = cur.parentElement;
      }
      return el.textContent?.trim() ?? '';
    });
    expect(accessibleName.trim().length, 'CTA element has no accessible name').toBeGreaterThan(0);
  });

  // ── 12. Dashboard mobile overflow ────────────────────────────────────────
  test('dashboard has no content overflow at 375px width', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(300);

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(
      scrollWidth,
      `Dashboard scrollWidth (${scrollWidth}) exceeds clientWidth (${clientWidth})`
    ).toBeLessThanOrEqual(clientWidth);
  });
});

test.describe('Topics page — accessibility (authenticated, dev-login required)', () => {
  let sessionToken: string | null = null;

  test.beforeAll(async ({ request }) => {
    sessionToken = await tryDevLogin(request);
  });

  test.beforeEach(async ({ page }) => {
    test.skip(
      !sessionToken,
      'dev-login endpoint returned 403 (production deployment) — skipping authenticated topics tests'
    );
    await loginAndGoto(page, sessionToken!, '/topics');
  });

  // ── 13. Topic cards are visible and clickable ────────────────────────────
  test('topic cards are visible and clickable', async ({ page }) => {
    const topicLinks = page.locator('a[href^="/topics/"]');
    await expect(topicLinks.first()).toBeVisible({ timeout: 10_000 });
    const count = await topicLinks.count();
    expect(count, 'Expected at least 1 topic card link on the topics page').toBeGreaterThanOrEqual(1);
  });

  // ── 14. Topic card links are keyboard-focusable ──────────────────────────
  test('topic card links are focusable via keyboard', async ({ page }) => {
    const topicLinks = page.locator('a[href^="/topics/"]');
    await expect(topicLinks.first()).toBeVisible({ timeout: 10_000 });

    let reached = false;
    for (let i = 0; i < 25; i++) {
      await page.keyboard.press('Tab');
      const activeHref = await page.evaluate(() => {
        const el = document.activeElement as HTMLAnchorElement | null;
        return el?.getAttribute('href') ?? '';
      });
      if (/^\/topics\//.test(activeHref)) {
        reached = true;
        break;
      }
    }
    expect(reached, 'No topic card link became focused after 25 Tab keypresses').toBe(true);
  });

  // ── 15. Topics page mobile overflow ──────────────────────────────────────
  test('topics page has no content overflow at 375px width', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(300);

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(
      scrollWidth,
      `Topics scrollWidth (${scrollWidth}) exceeds clientWidth (${clientWidth})`
    ).toBeLessThanOrEqual(clientWidth);
  });
});
