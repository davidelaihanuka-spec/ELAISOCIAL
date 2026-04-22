import path from 'node:path';

import { expect, test } from '@playwright/test';

import {
  DEMO_IDS,
  clickNavCard,
  openDemo,
  openProjectWorkspace,
  waitForView,
} from './helpers/app';

const SAMPLE_RECEIPT = path.resolve(process.cwd(), 'tests/fixtures/sample-receipt.pdf');

test.describe('payments, ledger, and receipts workflows', () => {
  test('adds, previews, edits, and deletes a project payment with a receipt', async ({ page }) => {
    const ctx = await openDemo(page);

    await openProjectWorkspace(page, DEMO_IDS.projectBId);
    await page.locator('.settings-btn[data-project-workspace-action="payments"]').click();
    await expect(page.locator('#proj-pay-panel')).toHaveClass(/open/);

    await page.fill('#ppp-new-amount', '250');
    await page.fill('#ppp-new-date', '2026-04-08');
    await page.evaluate(() => (window as any).selectPPPMethod?.('transfer'));
    await page.locator('#ppp-new-receipt').setInputFiles(SAMPLE_RECEIPT);
    await page.locator('button[onclick="savePppNewPayment()"]').click();

    await expect
      .poll(() =>
        page.evaluate((id) => {
          const project = ((window as any).projects || []).find((item: any) => item.id === id);
          return project?.paymentHistory?.length || 0;
        }, DEMO_IDS.projectBId),
      )
      .toBeGreaterThan(1);

    await page.locator('[onclick="viewReceipt(0)"], .receipt-thumb, .receipt-thumb-pdf').first().click();
    await expect(page.locator('#receipt-lb')).toBeVisible();
    await page.locator('#receipt-lb').click();

    await page.evaluate(() => (window as any).togglePppEdit?.(0));
    await page.fill('#ppp-edit-amt-0', '300');
    await page.evaluate(() => (window as any).savePppEdit?.(0));

    await expect
      .poll(() =>
        page.evaluate((id) => {
          const project = ((window as any).projects || []).find((item: any) => item.id === id);
          return project?.paymentHistory?.[0]?.amount || 0;
        }, DEMO_IDS.projectBId),
      )
      .toBe(300);

    await page.evaluate(() => (window as any).deletePppEntry?.(0));
    await expect
      .poll(() =>
        page.evaluate((id) => {
          const project = ((window as any).projects || []).find((item: any) => item.id === id);
          return project?.paymentHistory?.length || 0;
        }, DEMO_IDS.projectBId),
      )
      .toBe(1);

    await page.evaluate(() => (window as any).closeProjPayPanel?.());
    await clickNavCard(page, 'cn-receipts', 'receipts');
    await expect(page.locator('#receipts-grid')).toBeVisible();
    await page.locator('[data-open-source]').first().click();
    await waitForView(page, 'payments');
    await expect(page.locator('#pay-detail-screen')).toBeVisible();
    await expect(page.locator('#pay-detail-name')).toContainText(ctx.clientAName);
  });

  test('adds a package payment, updates receipts state, and routes through ledger', async ({ page }) => {
    const ctx = await openDemo(page);

    await page.evaluate((name) => (window as any).openPkgPayPanel?.(name), ctx.clientAName);
    await expect(page.locator('#proj-pay-panel')).toHaveClass(/open/);

    await page.fill('#ppp-new-amount', '400');
    await page.fill('#ppp-new-date', '2026-04-09');
    await page.evaluate(() => (window as any).selectPPPMethod?.('bit'));
    await page.locator('#ppp-new-receipt').setInputFiles(SAMPLE_RECEIPT);
    await page.locator('button[onclick^="savePkgNewPayment("]').click();

    await expect
      .poll(() =>
        page.evaluate((name) => (window as any).clientData?.[name]?.package?.paymentHistory?.length || 0, ctx.clientAName),
      )
      .toBeGreaterThan(1);

    await page.evaluate(() => (window as any).closeProjPayPanel?.());
    await clickNavCard(page, 'cn-ledger', 'ledger');
    await expect(page.locator('#ledger-grid')).toBeVisible();
    await page.locator('.ledger-row').first().click();
    await waitForView(page, 'payments');
    await expect(page.locator('#pay-detail-screen')).toBeVisible();

    await clickNavCard(page, 'cn-receipts', 'receipts');
    await page.locator('[data-toggle-sent]').first().click();

    await expect
      .poll(() => page.evaluate((name) => Boolean((window as any).clientData?.[name]?.receiptSent), ctx.clientAName))
      .toBe(true);

    await page.locator('[data-open-receipt]').first().click();
    await expect(page.locator('#receipt-lb')).toBeVisible();
  });
});
