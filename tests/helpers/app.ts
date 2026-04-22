import { expect, type Page } from '@playwright/test';

export const DEMO_IDS = {
  clientAId: 'client_demo_studio',
  clientBId: 'client_demo_test',
  projectAId: 'proj_demo_overdue',
  projectBId: 'proj_demo_waiting',
  projectCId: 'proj_demo_published',
  scriptAId: 'script_demo_1',
  scriptBId: 'script_demo_2',
} as const;

export type DemoContext = {
  clientAName: string;
  clientBName: string;
  projectAName: string;
  projectBName: string;
  projectCName: string;
  scriptAName: string;
  scriptBName: string;
  shootDayDate: string;
};

type OpenDemoOptions = {
  reset?: boolean;
};

export async function openDemo(page: Page, options: OpenDemoOptions = {}): Promise<DemoContext> {
  const suffix = options.reset === false ? '/?demo=1' : '/?demo=1&resetDemo=1';
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(suffix);
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        transition-duration: 0s !important;
        scroll-behavior: auto !important;
      }
    `,
  });

  await expect(page.locator('body')).toHaveClass(/reel-ready/);
  await expect(page.locator('#reel-auth-overlay')).toBeHidden();
  await waitForView(page, 'dashboard');
  return getDemoContext(page);
}

export async function getDemoContext(page: Page): Promise<DemoContext> {
  return page.evaluate((ids) => {
    const projects = (window as any).projects || [];
    const scripts = (window as any).scriptsData || [];
    const shootDays = (window as any).shootDaysData || [];
    const clientData = (window as any).clientData || {};

    const projectA = projects.find((item: any) => item.id === ids.projectAId) || {};
    const projectB = projects.find((item: any) => item.id === ids.projectBId) || {};
    const projectC = projects.find((item: any) => item.id === ids.projectCId) || {};
    const scriptA = scripts.find((item: any) => item.id === ids.scriptAId) || {};
    const scriptB = scripts.find((item: any) => item.id === ids.scriptBId) || {};

    const clientAName =
      Object.keys(clientData).find((name) => clientData[name]?.id === ids.clientAId) || projectA.client || '';
    const clientBName =
      Object.keys(clientData).find((name) => clientData[name]?.id === ids.clientBId) || projectC.client || '';

    return {
      clientAName,
      clientBName,
      projectAName: projectA.name || '',
      projectBName: projectB.name || '',
      projectCName: projectC.name || '',
      scriptAName: scriptA.title || '',
      scriptBName: scriptB.title || '',
      shootDayDate: shootDays[0]?.date || '',
    };
  }, DEMO_IDS);
}

export async function waitForView(page: Page, viewId: string) {
  await expect(page.locator(`#view-${viewId}`)).toBeVisible();
}

export async function clickNavCard(page: Page, cardId: string, viewId: string) {
  await page.locator(`#${cardId}`).evaluate((element: HTMLElement) => element.click());
  await waitForView(page, viewId);
}

export async function confirmDialog(page: Page) {
  await expect(page.locator('#confirm-overlay')).toHaveClass(/open/);
  await page.locator('#confirm-ok-btn').click();
}

export async function cancelDialog(page: Page) {
  await expect(page.locator('#confirm-overlay')).toHaveClass(/open/);
  await page.locator('#confirm-cancel-btn').click();
}

export async function setHiddenDate(page: Page, fieldId: string, value: string) {
  await page.evaluate(
    ([id, nextValue]) => {
      const win = window as any;
      if (typeof win.setDateValue === 'function') {
        win.setDateValue(id, nextValue);
        return;
      }
      const input = document.getElementById(id) as HTMLInputElement | null;
      if (input) input.value = nextValue;
    },
    [fieldId, value],
  );
}

export async function setClientPicker(page: Page, fieldId: string, value: string) {
  await page.evaluate(
    ([id, nextValue]) => {
      const win = window as any;
      if (typeof win.clpSetValue === 'function') {
        win.clpSetValue(id, nextValue);
        return;
      }
      const input = document.getElementById(id) as HTMLInputElement | null;
      if (input) input.value = nextValue;
    },
    [fieldId, value],
  );
}

export async function openProjectWorkspace(page: Page, projectId: string) {
  await page.evaluate((id) => (window as any).openProjectWorkspace?.(id), projectId);
  await expectProjectWorkspace(page, projectId);
}

export async function openClientWorkspace(page: Page, clientName: string) {
  await page.evaluate((name) => (window as any).openClientWorkspace?.(name), clientName);
  await expectClientWorkspace(page, clientName);
}

export async function expectProjectWorkspace(page: Page, projectId: string) {
  await waitForView(page, 'project-workspace');
  await expect
    .poll(() => page.evaluate(() => (window as any).REELApp?.state?.ui?.currentProjectId || null))
    .toBe(projectId);
}

export async function expectClientWorkspace(page: Page, clientName: string) {
  await waitForView(page, 'client-workspace');
  await expect
    .poll(() => page.evaluate(() => (window as any).REELApp?.state?.ui?.currentClientName || ''))
    .toBe(clientName);
}

export async function openProjectFlow(page: Page) {
  await page.evaluate(() => (window as any).openProjectFlow?.());
  await expect(page.locator('#overlay')).toHaveClass(/open/);
}

export async function waitForProjectByName(page: Page, projectName: string) {
  await expect
    .poll(() =>
      page.evaluate((name) => {
        const projects = (window as any).projects || [];
        return projects.some((item: any) => item.name === name);
      }, projectName),
    )
    .toBe(true);
}

export async function getProjectIdByName(page: Page, projectName: string): Promise<string> {
  return page.evaluate((name) => {
    const project = ((window as any).projects || []).find((item: any) => item.name === name);
    return project?.id || '';
  }, projectName);
}

export async function openSettings(page: Page) {
  await clickNavCard(page, 'cn-settings', 'settings');
}

export function isoDateFromNow(offsetDays: number) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

export async function searchAndSelect(page: Page, query: string, resultKind: string) {
  await page.fill('#gs-input', query);
  await expect(page.locator('#gs-results')).toBeVisible();
  await page
    .locator(`.gs-item[data-gs-kind="${resultKind}"]`)
    .first()
    .evaluate((element: HTMLElement) => element.click());
}
