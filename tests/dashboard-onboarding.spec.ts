import { expect, test } from '@playwright/test';

import {
  DEMO_IDS,
  expectProjectWorkspace,
  openDemo,
  openSettings,
  waitForView,
} from './helpers/app';

async function openOnboardingFromSettings(page: Parameters<typeof test>[0]['page']) {
  await openSettings(page);
  await page.locator('#settings-open-onboarding-btn').click();
  await waitForView(page, 'onboarding');
}

test.describe('dashboard and onboarding workflows', () => {
  test('routes from dashboard cards into project, shoot-day, and payment flows', async ({ page }) => {
    const ctx = await openDemo(page);

    await page.locator('[data-open-project]').first().click();
    await expectProjectWorkspace(page, DEMO_IDS.projectAId);

    await page.evaluate(() => (window as any).goView?.('dashboard'));
    await waitForView(page, 'dashboard');

    await page.locator('[data-open-shootday]').first().click();
    await expect(page.locator('#sdp-overlay')).toHaveClass(/open/);
    await page.evaluate(() => (window as any).closeSDP?.());

    await page.locator('[data-open-payment]').first().evaluate((element: HTMLElement) => element.click());
    await waitForView(page, 'payments');
    await expect(page.locator('#pay-detail-screen')).toBeVisible();
    await expect(page.locator('#pay-detail-name')).toContainText(ctx.clientAName);
  });

  test('opens onboarding from settings and routes through shortcut actions', async ({ page }) => {
    await openDemo(page);

    await openOnboardingFromSettings(page);
    await page.locator('[data-onboarding-action="clients"]').click();
    await waitForView(page, 'clients');

    await openOnboardingFromSettings(page);
    await page.locator('[data-onboarding-action="pipeline"]').click();
    await waitForView(page, 'pipeline');

    await openOnboardingFromSettings(page);
    await page.locator('[data-onboarding-action="dashboard"]').click();
    await waitForView(page, 'dashboard');

    await openOnboardingFromSettings(page);
    await page.locator('[data-onboarding-action="dismiss"]').click();
    await waitForView(page, 'dashboard');
  });

  test('opens onboarding actions for settings, import, new client, and new project', async ({ page }) => {
    await openDemo(page);

    await openOnboardingFromSettings(page);
    await page.locator('[data-onboarding-action="settings"]').click();
    await waitForView(page, 'settings');

    await openOnboardingFromSettings(page);
    const importChooser = page.waitForEvent('filechooser');
    await page.locator('[data-onboarding-action="import"]').click();
    await importChooser;

    await openOnboardingFromSettings(page);
    await page.locator('[data-onboarding-action="new-client"]').click();
    await expect(page.locator('#overlay-new-client')).toHaveClass(/open/);
    await page.evaluate(() => (window as any).closeNewClientModal?.());

    await openOnboardingFromSettings(page);
    await page.locator('[data-onboarding-action="new-project"]').click();
    await expect(page.locator('#overlay')).toHaveClass(/open/);
    await page.evaluate(() => (window as any).closeModal?.());
  });
});
