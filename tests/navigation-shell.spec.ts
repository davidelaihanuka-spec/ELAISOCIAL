import { expect, test } from '@playwright/test';

import {
  DEMO_IDS,
  clickNavCard,
  expectClientWorkspace,
  expectProjectWorkspace,
  openDemo,
  waitForView,
} from './helpers/app';

test.describe('shell and navigation workflows', () => {
  test('requires hosting-provided config in hosted mode instead of exposing browser setup', async ({ page }) => {
    await page.goto('/?hosted=1');

    await expect(page.locator('#reel-auth-overlay')).toBeVisible();
    await expect(page.locator('#setup-section')).toBeHidden();
    await expect(page.locator('#login-section')).toBeHidden();
    await expect(page.locator('#reel-auth-status')).toContainText('Supabase');
    await expect
      .poll(() =>
        page.evaluate(() => ({
          canConfigureInApp: (window as any).REELApp?.config?.canConfigureInApp?.() ?? null,
          hasRuntimeConfig: (window as any).REELApp?.config?.hasRuntimeConfig?.() ?? null,
        })),
      )
      .toEqual({
        canConfigureInApp: false,
        hasRuntimeConfig: false,
      });
  });

  test('boots in demo mode and supports desktop plus dock navigation', async ({ page }) => {
    await openDemo(page);

    await expect(page.locator('#view-dashboard')).toBeVisible();
    await expect(page.locator('#auth-status-btn')).toContainText('Demo mode');
    await expect(page.locator('#inbox-chip')).toContainText('Inbox');

    await clickNavCard(page, 'cn-inbox', 'inbox');
    await expect(page.locator('#inbox-grid')).toBeVisible();

    await clickNavCard(page, 'cn-ledger', 'ledger');
    await expect(page.locator('#ledger-grid')).toBeVisible();

    await clickNavCard(page, 'cn-settings', 'settings');
    await expect(page.locator('#settings-grid')).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('.dock-item[data-view="history"]').evaluate((element: HTMLElement) => element.click());
    await waitForView(page, 'history');

    await page.locator('.dock-item[data-view="dashboard"]').evaluate((element: HTMLElement) => element.click());
    await waitForView(page, 'dashboard');
  });

  test('tracks back navigation through workspace routes', async ({ page }) => {
    const ctx = await openDemo(page);

    await clickNavCard(page, 'cn-clients', 'clients');
    await page.locator('#clients-grid .client-card', { hasText: ctx.clientAName }).first().click();
    await expectClientWorkspace(page, ctx.clientAName);

    await page.locator('[data-open-project-workspace]').first().click();
    await expectProjectWorkspace(page, DEMO_IDS.projectAId);

    await expect(page.locator('#topbar-back-btn')).toBeVisible();
    await page.locator('#topbar-back-btn').click();
    await expectClientWorkspace(page, ctx.clientAName);

    await page.locator('#topbar-back-btn').click();
    await waitForView(page, 'clients');
  });
});
