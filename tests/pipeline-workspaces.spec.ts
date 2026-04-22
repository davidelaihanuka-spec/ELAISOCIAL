import { expect, test } from '@playwright/test';

import {
  DEMO_IDS,
  clickNavCard,
  expectClientWorkspace,
  expectProjectWorkspace,
  getProjectIdByName,
  isoDateFromNow,
  openDemo,
  openProjectFlow,
  openProjectWorkspace,
  setClientPicker,
  setHiddenDate,
  waitForProjectByName,
  waitForView,
} from './helpers/app';

test.describe('pipeline and workspace workflows', () => {
  test('filters, sorts, and switches between kanban and list pipeline modes', async ({ page }) => {
    const ctx = await openDemo(page);

    await clickNavCard(page, 'cn-pipeline', 'pipeline');
    await expect(page.locator(`.vcard[data-id="${DEMO_IDS.projectAId}"]`)).toBeVisible();

    await page.locator('#view-pipeline .filter-chip').nth(1).click();
    await expect(page.locator(`.vcard[data-id="${DEMO_IDS.projectAId}"]`)).toBeVisible();

    await page.locator('#pipeline-enhancements .filter-chip').nth(1).click();
    await expect(page.locator(`.vcard[data-id="${DEMO_IDS.projectBId}"]`)).toBeVisible();

    await page.evaluate(() => {
      const select = document.getElementById('pipeline-sort') as HTMLSelectElement | null;
      if (!select) return;
      select.value = 'price-desc';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.locator('#vt-list').click();
    await expect(page.locator('#list-view-wrap')).toBeVisible();
    await expect(page.locator('.list-row').first()).toContainText(ctx.projectBName);

    await page.locator('#vt-kanban').click();
    await expect(page.locator('#kanban-view')).toBeVisible();
  });

  test('creates and edits a project with persistence across a non-reset reload', async ({ page }) => {
    const ctx = await openDemo(page);
    const projectName = `PW Project ${Date.now()}`;

    await openProjectFlow(page);
    await page.fill('#fn', projectName);
    await setClientPicker(page, 'fc', ctx.clientAName);
    await page.click('#stage-grid [data-stage="editing"]');
    await setHiddenDate(page, 'fd', isoDateFromNow(5));
    await page.locator('.project-flow-nav-btn[data-section="production"]').click();
    await page.fill('#fnotes', 'created in playwright');
    await page.locator('.project-flow-nav-btn[data-section="finance"]').click();
    await page.fill('#fp', '4200');
    await page.fill('#fdrive', 'https://drive.example.com/playwright-project');
    await page.evaluate(() => (window as any).saveProj?.());

    await waitForProjectByName(page, projectName);
    const projectId = await getProjectIdByName(page, projectName);
    expect(projectId).not.toBe('');

    await page.evaluate((id) => (window as any).openEdit?.(id), projectId);
    await expect(page.locator('#overlay')).toHaveClass(/open/);
    await page.locator('.project-flow-nav-btn[data-section="finance"]').click();
    await page.fill('#fp', '5300');
    await page.click('#stage-grid [data-stage="approval"]');
    await page.fill('#fdrive', 'https://drive.example.com/playwright-project-updated');
    await page.evaluate(() => (window as any).saveProj?.());

    await openDemo(page, { reset: false });
    await openProjectWorkspace(page, projectId);

    const projectState = await page.evaluate((id) => {
      const project = ((window as any).projects || []).find((item: any) => item.id === id);
      return { price: project?.price, stage: project?.stage, drive: project?.drive };
    }, projectId);

    expect(projectState).toMatchObject({
      price: '5300',
      stage: 'approval',
      drive: 'https://drive.example.com/playwright-project-updated',
    });
  });

  test('routes project workspace actions into edit, payments, tracking, tasks, and client flows', async ({ page }) => {
    const ctx = await openDemo(page);

    await openProjectWorkspace(page, DEMO_IDS.projectAId);

    await page.locator('.settings-btn[data-project-workspace-action="edit"]').click();
    await expect(page.locator('#overlay')).toHaveClass(/open/);
    await page.evaluate(() => (window as any).closeModal?.());

    await page.locator('.settings-btn[data-project-workspace-action="payments"]').click();
    await expect(page.locator('#proj-pay-panel')).toHaveClass(/open/);
    await page.evaluate(() => (window as any).closeProjPayPanel?.());

    await page.locator('.settings-btn[data-project-workspace-action="tracking"]').click();
    await expect(page.locator('#overlay-tracking')).toHaveClass(/open/);
    await page.evaluate(() => document.getElementById('overlay-tracking')?.classList.remove('open'));

    await page
      .locator('.settings-btn[data-project-workspace-action="task"]')
      .evaluate((element: HTMLElement) => element.click());
    await waitForView(page, 'tasks');
    await expect(page.locator('#task-title')).toHaveValue(new RegExp(ctx.projectAName));

    await openProjectWorkspace(page, DEMO_IDS.projectAId);
    await page.locator('.settings-btn[data-project-workspace-action="client"]').click();
    await expectClientWorkspace(page, ctx.clientAName);
  });

  test('supports bulk archive actions from pipeline mode', async ({ page }) => {
    await openDemo(page);

    await clickNavCard(page, 'cn-pipeline', 'pipeline');
    await page.locator('#bulk-toggle-btn').click();
    await page.locator(`.vcard[data-id="${DEMO_IDS.projectAId}"]`).click();
    await page.locator(`.vcard[data-id="${DEMO_IDS.projectBId}"]`).click();
    await page.locator('#bulk-archive-btn').click();

    await expect
      .poll(() =>
        page.evaluate(() => ((window as any).archiveData || []).map((item: any) => item.id).sort()),
      )
      .toEqual([DEMO_IDS.projectAId, DEMO_IDS.projectBId].sort());
  });
});
