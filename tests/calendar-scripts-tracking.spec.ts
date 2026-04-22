import { expect, test } from '@playwright/test';

import {
  DEMO_IDS,
  clickNavCard,
  expectProjectWorkspace,
  isoDateFromNow,
  openDemo,
  openProjectWorkspace,
  setClientPicker,
  setHiddenDate,
  waitForView,
} from './helpers/app';

test.describe('calendar, scripts, and tracking workflows', () => {
  test('switches calendar modes, opens agenda routes, and creates a shoot day', async ({ page }) => {
    const ctx = await openDemo(page);

    await clickNavCard(page, 'cn-calendar', 'calendar');
    await expect(page.locator('#cal-grid')).toBeVisible();

    await page.locator('[data-calendar-mode="agenda"]').evaluate((element: HTMLElement) => element.click());
    await expect(page.locator('#calendar-agenda-list')).toBeVisible();

    await page.locator('.agenda-row[data-agenda-kind="project"]').first().click();
    await expectProjectWorkspace(page, DEMO_IDS.projectCId);

    await page.evaluate(() => (window as any).goView?.('calendar'));
    await waitForView(page, 'calendar');

    await page.evaluate(() => (window as any).openShootDayModal?.());
    await expect(page.locator('#overlay-shoot-day')).toHaveClass(/open/);
    await setHiddenDate(page, 'shoot-day-date', isoDateFromNow(6));
    await setClientPicker(page, 'shoot-day-client', ctx.clientAName);
    await page.fill('#shoot-day-notes', 'Playwright shoot day');
    await page.locator('#overlay-shoot-day .btn.btn-primary').click();

    await expect(page.locator('#sdp-overlay')).toHaveClass(/open/);
    await page.locator('.sdp-btn').first().click();
    await expect(page.locator('#overlay-script')).toHaveClass(/open/);
    await page.evaluate(() => (window as any).closeScriptModal?.());

    await page.evaluate(() => (window as any).openSDP?.((window as any).shootDaysData?.slice(-1)?.[0]?.date));
    await page.locator('.sdp-btn.sdp-btn-primary').click();
    await expect(page.locator('#overlay')).toHaveClass(/open/);
    await expect(page.locator('#fd')).toHaveValue(isoDateFromNow(6));
  });

  test('creates, edits, saves-more, deletes scripts, and routes to script search results', async ({ page }) => {
    const ctx = await openDemo(page);
    const scriptName = `PW Script ${Date.now()}`;
    const extraScriptName = `${scriptName} Extra`;

    await clickNavCard(page, 'cn-scripts', 'scripts');
    await page.locator('#subheader-scripts .subheader-btn').click();
    await expect(page.locator('#overlay-script')).toHaveClass(/open/);
    await page.fill('#sc-title', scriptName);
    await setClientPicker(page, 'sc-client', ctx.clientAName);
    await setHiddenDate(page, 'sc-shoot-date', isoDateFromNow(4));
    await page.fill('#sc-scene', 'Scene one');
    await page.locator('#sc-save-more-btn').click();

    await expect(page.locator('#sc-title')).toHaveValue('');
    await page.fill('#sc-title', extraScriptName);
    await setClientPicker(page, 'sc-client', ctx.clientAName);
    await page.fill('#sc-scene', 'Scene two');
    await page.locator('button[onclick="saveScript()"]').click();

    await expect(page.locator('#scripts-list')).toContainText(scriptName);
    await expect(page.locator('#scripts-list')).toContainText(extraScriptName);

    const scriptId = await page.evaluate((name) => {
      const script = ((window as any).scriptsData || []).find((item: any) => item.title === name);
      return script?.id || '';
    }, scriptName);

    await page.evaluate((id) => (window as any).openScriptEdit?.(id), scriptId);
    await page.fill('#sc-title', `${scriptName} Updated`);
    await page.locator('button[onclick="saveScript()"]').click();
    await expect(page.locator('#scripts-list')).toContainText(`${scriptName} Updated`);

    const extraScriptId = await page.evaluate((name) => {
      const script = ((window as any).scriptsData || []).find((item: any) => item.title === name);
      return script?.id || '';
    }, extraScriptName);

    await page.evaluate((id) => (window as any).openScriptEdit?.(id), extraScriptId);
    await page.locator('#sc-del-btn').click();
    await expect(page.locator('#scripts-list')).not.toContainText(extraScriptName);

    await page.fill('#gs-input', `${scriptName} Updated`);
    await expect(page.locator('#gs-results')).toBeVisible();
    await page.locator('.gs-item[data-gs-kind="script"]').first().click();
    await expect(page.locator('#overlay-script')).toHaveClass(/open/);
    await expect(page.locator('#sc-title')).toHaveValue(`${scriptName} Updated`);
  });

  test('adds, edits, and deletes tracking while updating project workspace summaries', async ({ page }) => {
    await openDemo(page);

    await openProjectWorkspace(page, DEMO_IDS.projectAId);
    await page.locator('.settings-btn[data-project-workspace-action="tracking"]').click();
    await expect(page.locator('#overlay-tracking')).toHaveClass(/open/);

    await page.evaluate(() => {
      const select = document.getElementById('tr-platform') as HTMLSelectElement | null;
      if (!select) return;
      select.value = 'instagram';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await setHiddenDate(page, 'tr-date', isoDateFromNow(1));
    await page.fill('#tr-time', '12:30');
    await page.fill('#tr-url', 'https://example.com/reel');
    await page.fill('#tr-views', '1200');
    await page.fill('#tr-likes', '140');
    await page.fill('#tr-comments', '22');
    await page.fill('#tr-shares', '12');
    await page.fill('#tr-saves', '18');
    await page.fill('#tr-reach', '1000');
    await page.fill('#tr-notes', 'Playwright tracking entry');
    await page.locator('#overlay-tracking .btn-save').click();

    await expect
      .poll(() =>
        page.evaluate((id) => ((window as any).trackingData || []).filter((item: any) => item.projectId === id).length, DEMO_IDS.projectAId),
      )
      .toBe(1);

    await openProjectWorkspace(page, DEMO_IDS.projectAId);
    await expect(page.locator('#project-workspace-grid')).toContainText('1,200');

    const trackingId = await page.evaluate((id) => {
      const entry = ((window as any).trackingData || []).find((item: any) => item.projectId === id);
      return entry?.id || '';
    }, DEMO_IDS.projectAId);

    await page.evaluate((id) => (window as any).openEditTracking?.(id), trackingId);
    await page.fill('#tr-views', '1300');
    await page.locator('#overlay-tracking .btn-save').click();

    await expect
      .poll(() =>
        page.evaluate((id) => {
          const entry = ((window as any).trackingData || []).find((item: any) => item.id === id);
          return entry?.views || 0;
        }, trackingId),
      )
      .toBe(1300);

    await page.evaluate((id) => (window as any).openEditTracking?.(id), trackingId);
    await page.locator('#tr-del-btn').click();
    await expect(page.locator('#confirm-overlay')).toHaveClass(/open/);
    await page.locator('#confirm-ok-btn').click();

    await expect
      .poll(() =>
        page.evaluate((id) => ((window as any).trackingData || []).some((item: any) => item.id === id), trackingId),
      )
      .toBe(false);
  });
});
