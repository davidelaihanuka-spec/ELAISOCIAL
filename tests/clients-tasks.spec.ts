import { expect, test } from '@playwright/test';

import {
  DEMO_IDS,
  clickNavCard,
  confirmDialog,
  expectClientWorkspace,
  expectProjectWorkspace,
  openDemo,
  setHiddenDate,
  waitForView,
} from './helpers/app';

test.describe('client and task workflows', () => {
  test('creates a client, edits details, and configures a package', async ({ page }) => {
    await openDemo(page);
    const clientName = `Playwright Client ${Date.now()}`;

    await page.evaluate(() => (window as any).openNewClientModal?.());
    await expect(page.locator('#overlay-new-client')).toHaveClass(/open/);
    await page.fill('#new-client-name', clientName);
    await page.fill('#new-client-contact', 'Automation Owner');
    await page.fill('#new-client-phone', '050-5555555');
    await page.fill('#new-client-email', 'playwright@example.com');
    await page.fill('#new-client-website', 'https://example.com');
    await page.fill('#new-client-address', 'Tel Aviv');
    await page.fill('#new-client-notes', 'Created by Playwright');
    await page.locator('#overlay-new-client button.btn-add').click();

    await waitForView(page, 'clients');
    await expect(page.locator('#client-overlay')).toHaveClass(/open/);
    await page.evaluate((name) => (window as any).openClientPanel?.(name), clientName);
    await expect(page.locator('#cp-name-input')).toHaveValue(clientName);

    await page.fill('#cp-phone', '050-7777777');
    await page.fill('#cp-email', 'updated@example.com');
    await page.fill('#cp-contact', 'Updated Contact');
    await page.locator('.cp-save').click();
    await expect(page.locator('#cp-phone')).toHaveValue('050-7777777');

    await page.evaluate(() => (window as any).openPackageSettings?.());
    await expect(page.locator('#overlay-package')).toHaveClass(/open/);
    await page.fill('#pkg-name', 'Playwright Package');
    await page.fill('#pkg-total', '6');
    await page.fill('#pkg-price', '6400');
    await setHiddenDate(page, 'pkg-start', '2026-04-05');
    await setHiddenDate(page, 'pkg-end', '2026-05-05');
    await page.evaluate(() => {
      const select = document.getElementById('pkg-paid') as HTMLSelectElement | null;
      if (!select) return;
      select.value = 'partial';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.evaluate(() => (window as any).savePackageSettings?.());

    await expect
      .poll(() => page.evaluate((name) => (window as any).clientData?.[name]?.package || null, clientName))
      .not.toBeNull();

    const packageState = await page.evaluate((name) => (window as any).clientData?.[name]?.package, clientName);
    expect(packageState).toMatchObject({
      name: 'Playwright Package',
      total: 6,
      price: '6400',
      paid: 'partial',
    });
  });

  test('opens client workspace actions and preserves task drafts from workspace entry points', async ({ page }) => {
    const ctx = await openDemo(page);

    await clickNavCard(page, 'cn-clients', 'clients');
    await page.locator('#clients-grid .client-card', { hasText: ctx.clientAName }).first().click();
    await expectClientWorkspace(page, ctx.clientAName);

    await page
      .locator('.settings-btn[data-client-workspace-action="task"]')
      .evaluate((element: HTMLElement) => element.click());
    await waitForView(page, 'tasks');
    await expect(page.locator('#task-title')).toHaveValue(new RegExp(ctx.clientAName));

    await page.evaluate((id) => (window as any).openProjectWorkspace?.(id), DEMO_IDS.projectAId);
    await expectProjectWorkspace(page, DEMO_IDS.projectAId);
    await page
      .locator('.settings-btn[data-project-workspace-action="task"]')
      .evaluate((element: HTMLElement) => element.click());
    await waitForView(page, 'tasks');
    await expect(page.locator('#task-title')).toHaveValue(new RegExp(ctx.projectAName));
  });

  test('validates, creates, completes, reopens, deletes, and routes from tasks', async ({ page }) => {
    const ctx = await openDemo(page);

    await clickNavCard(page, 'cn-tasks', 'tasks');
    const initialOpenCount = await page.locator('.task-row').count();

    await page.locator('#task-create-btn').click();
    await expect(page.locator('.task-row')).toHaveCount(initialOpenCount);

    const taskTitle = `Follow up ${Date.now()}`;
    await page.fill('#task-title', taskTitle);
    await page.fill('#task-due-date', '2026-04-09');
    await page.fill('#task-client-name', ctx.clientAName);
    await page.fill('#task-project-name', ctx.projectAName);
    await page.evaluate((id) => {
      const input = document.getElementById('task-project-id') as HTMLInputElement | null;
      if (input) input.value = id;
    }, DEMO_IDS.projectAId);
    await page.fill('#task-notes', 'Task created from Playwright');
    await page.locator('#task-create-btn').click();

    const taskRow = page.locator('.task-row', { hasText: taskTitle });
    await expect(taskRow).toBeVisible();

    await taskRow.locator('[data-complete-task]').click();
    await expect(page.locator('.task-row.done', { hasText: taskTitle })).toBeVisible();

    await page.locator('.task-row.done', { hasText: taskTitle }).locator('[data-reopen-task]').click();
    await expect(taskRow).toBeVisible();

    await page.locator('.task-row', { hasText: ctx.projectAName }).locator('[data-open-project]').first().click();
    await expectProjectWorkspace(page, DEMO_IDS.projectAId);

    await page.evaluate(() => (window as any).goView?.('tasks'));
    await waitForView(page, 'tasks');
    await taskRow.locator('[data-delete-task]').click();
    await confirmDialog(page);
    await expect(taskRow).toHaveCount(0);
  });

  test('moves a client to trash and restores it from the trash view', async ({ page }) => {
    await openDemo(page);
    const clientName = `Trash Restore Client ${Date.now()}`;

    await page.evaluate(() => (window as any).openNewClientModal?.());
    await page.fill('#new-client-name', clientName);
    await page.locator('#overlay-new-client button.btn-add').click();
    await expect(page.locator('#client-overlay')).toHaveClass(/open/);
    await page.evaluate((name) => (window as any).openClientPanel?.(name), clientName);

    await page.evaluate(() => (window as any).cpDeleteClient?.());
    await confirmDialog(page);

    await expect
      .poll(() =>
        page.evaluate((name) => ((window as any).trashData || []).some((item: any) => item.name === name), clientName),
      )
      .toBe(true);

    await clickNavCard(page, 'cn-trash', 'trash');
    await page.evaluate(() => (window as any).renderTrash?.());
    await expect(page.locator('#trash-list')).toContainText(clientName);

    const trashIndex = await page.evaluate((name) =>
      ((window as any).trashData || []).findIndex((item: any) => item.name === name),
    clientName);
    expect(trashIndex).toBeGreaterThanOrEqual(0);
    await page.evaluate((index) => (window as any).restoreTrash?.(index), trashIndex);

    await expect
      .poll(() => page.evaluate((name) => Boolean((window as any).clientData?.[name]), clientName))
      .toBe(true);
  });

  test('permanently deletes a trashed client item', async ({ page }) => {
    await openDemo(page);
    const clientName = `Trash Delete Client ${Date.now()}`;

    await page.evaluate(() => (window as any).openNewClientModal?.());
    await page.fill('#new-client-name', clientName);
    await page.locator('#overlay-new-client button.btn-add').click();
    await expect(page.locator('#client-overlay')).toHaveClass(/open/);
    await page.evaluate((name) => (window as any).openClientPanel?.(name), clientName);

    await page.evaluate(() => (window as any).cpDeleteClient?.());
    await confirmDialog(page);

    await expect
      .poll(() =>
        page.evaluate((name) => ((window as any).trashData || []).some((item: any) => item.name === name), clientName),
      )
      .toBe(true);

    await clickNavCard(page, 'cn-trash', 'trash');
    await page.evaluate(() => (window as any).renderTrash?.());
    await expect(page.locator('#trash-list')).toContainText(clientName);

    const trashIndex = await page.evaluate((name) =>
      ((window as any).trashData || []).findIndex((item: any) => item.name === name),
    clientName);
    expect(trashIndex).toBeGreaterThanOrEqual(0);
    await page.evaluate((index) => (window as any).permDelete?.(index), trashIndex);
    await confirmDialog(page);

    await expect
      .poll(() =>
        page.evaluate((name) => ((window as any).trashData || []).some((item: any) => item.name === name), clientName),
      )
      .toBe(false);
  });
});
