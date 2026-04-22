import path from 'node:path';

import { expect, test } from '@playwright/test';

import {
  DEMO_IDS,
  cancelDialog,
  clickNavCard,
  expectProjectWorkspace,
  openDemo,
  openSettings,
  searchAndSelect,
  waitForView,
} from './helpers/app';

const IMPORT_FIXTURE = path.resolve(process.cwd(), 'tests/fixtures/import-sample.json');

test.describe('insights, search, settings, and history workflows', () => {
  test('renders insights and routes search results across entity types', async ({ page }) => {
    const ctx = await openDemo(page);

    await clickNavCard(page, 'cn-insights', 'insights');
    await expect(page.locator('#insights-grid')).toBeVisible();

    await searchAndSelect(page, ctx.projectAName, 'project');
    await expectProjectWorkspace(page, DEMO_IDS.projectAId);

    await openDemo(page);
    await searchAndSelect(page, ctx.clientAName, 'client');
    await waitForView(page, 'clients');
    await expect(page.locator('#client-overlay')).toHaveClass(/open/);

    await openDemo(page);
    await searchAndSelect(page, ctx.scriptAName, 'script');
    await waitForView(page, 'scripts');
    await expect(page.locator('#overlay-script')).toHaveClass(/open/);

    await openDemo(page);
    await searchAndSelect(page, ctx.shootDayDate, 'shootday');
    await waitForView(page, 'calendar');
    await expect(page.locator('#sdp-overlay')).toHaveClass(/open/);

    await openDemo(page);
    await searchAndSelect(page, ctx.projectAName, 'payment');
    await waitForView(page, 'payments');
    await page.waitForTimeout(250);
    await expect(page.locator('#pay-detail-screen')).toBeVisible();
    await expect(page.locator('#pay-detail-name')).toContainText(ctx.clientAName);
    await expect(page.locator('#gs-results')).toBeHidden();
  });

  test('exports data, opens import confirmation, reconnects, and signs out from settings', async ({ page }) => {
    await openDemo(page);
    await openSettings(page);

    const download = page.waitForEvent('download');
    await page.locator('#settings-export-btn').click();
    await download;

    await page.locator('#settings-import-input').setInputFiles(IMPORT_FIXTURE);
    await expect(page.locator('#confirm-overlay')).toHaveClass(/open/);
    await cancelDialog(page);

    await page.locator('#settings-reconnect-btn').click();
    await expect(page.locator('#reel-auth-overlay')).toBeVisible();

    await page.evaluate(() => {
      document.getElementById('reel-auth-overlay')?.classList.add('hidden');
      document.body.classList.add('reel-ready');
    });

    await openSettings(page);
    await page.locator('#settings-signout-btn').click();
    await expect(page.locator('#settings-signout-btn')).toBeVisible();
  });

  test('captures and reapplies a full backup snapshot including newer stores', async ({ page }) => {
    await openDemo(page, { reset: false });

    const snapshot = await page.evaluate(() => {
      const backup = (window as any).collectBackupData?.();
      const counts = {
        tasks: JSON.parse(localStorage.getItem('reel_tasks') || '[]').length,
        tracking: JSON.parse(localStorage.getItem('reel_tracking') || '[]').length,
        archive: JSON.parse(localStorage.getItem('reel_archive') || '[]').length,
        trash: JSON.parse(localStorage.getItem('reel_trash') || '[]').length,
        activity: JSON.parse(localStorage.getItem('reel_activity') || '[]').length,
        shootDays: JSON.parse(localStorage.getItem('reel_shoot_days') || '[]').length,
      };
      (window as any).applyImportedBackup?.(backup);
      const persisted = {
        tasks: JSON.parse(localStorage.getItem('reel_tasks') || '[]').length,
        tracking: JSON.parse(localStorage.getItem('reel_tracking') || '[]').length,
        archive: JSON.parse(localStorage.getItem('reel_archive') || '[]').length,
        trash: JSON.parse(localStorage.getItem('reel_trash') || '[]').length,
        activity: JSON.parse(localStorage.getItem('reel_activity') || '[]').length,
        shootDays: JSON.parse(localStorage.getItem('reel_shoot_days') || '[]').length,
      };
      return { backup, counts, persisted };
    });

    expect(snapshot.backup.version).toBe(2);
    expect(Array.isArray(snapshot.backup.tasksData)).toBe(true);
    expect(Array.isArray(snapshot.backup.trackingData)).toBe(true);
    expect(Array.isArray(snapshot.backup.archiveData)).toBe(true);
    expect(Array.isArray(snapshot.backup.activityLog)).toBe(true);
    expect(Array.isArray(snapshot.backup.shootDaysData)).toBe(true);
    expect(snapshot.persisted).toEqual(snapshot.counts);
  });

  test('archives, restores, permanently deletes from archive, and renders history tabs', async ({ page }) => {
    const ctx = await openDemo(page);

    await page.evaluate((id) => (window as any).openEdit?.(id), DEMO_IDS.projectAId);
    await expect(page.locator('#overlay')).toHaveClass(/open/);
    await page.locator('#archive-btn').click();

    await clickNavCard(page, 'cn-history', 'history');
    await expect(page.locator('#hist-archive-list')).toContainText(ctx.projectAName);

    await page.fill('#history-search', ctx.projectAName);
    await expect(page.locator('#hist-archive-list')).toContainText(ctx.projectAName);
    await page.fill('#history-search', '');

    await page.locator('.hac-btn-restore').first().click();
    await expect
      .poll(() =>
        page.evaluate((id) => ((window as any).projects || []).some((item: any) => item.id === id), DEMO_IDS.projectAId),
      )
      .toBe(true);

    await page.evaluate((id) => (window as any).archiveProject?.(id), DEMO_IDS.projectAId);
    await clickNavCard(page, 'cn-history', 'history');
    await expect(page.locator('#hist-archive-list')).toContainText(ctx.projectAName);

    await page.evaluate((id) => (window as any).deleteFromArchive?.(id), DEMO_IDS.projectAId);
    await expect(page.locator('#confirm-overlay')).toHaveClass(/open/);
    await page.locator('#confirm-ok-btn').click();

    await expect
      .poll(() =>
        page.evaluate((id) => ((window as any).archiveData || []).some((item: any) => item.id === id), DEMO_IDS.projectAId),
      )
      .toBe(false);

    await page.locator('#hchip-log').click();
    await expect(page.locator('#hist-log-tab')).toBeVisible();

    await page.locator('#hchip-stats').click();
    await expect(page.locator('#hist-stats-content')).toBeVisible();

    await page.locator('#hchip-trash').click();
    await expect(page.locator('#hist-trash-tab')).toBeVisible();
  });
});
