import {expect, test, type Locator, type Page} from '@playwright/test';

const mobileWidths = [320, 390, 768] as const;
const locales = ['', '/zh-Hant'];

async function openDrawer(page: Page): Promise<Locator> {
  const toggle = page.locator('.navbar__toggle');
  await expect(toggle).toBeVisible();
  await toggle.click();
  const drawer = page.locator('.navbar-sidebar');
  await expect(drawer).toBeVisible();
  return drawer;
}

async function expectDrawerPainted(page: Page, drawer: Locator) {
  const painted = await drawer.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    const point = document.elementFromPoint(
      Math.max(rect.left + 8, 1),
      Math.max(rect.top + 8, 1),
    );
    return {
      height: rect.height,
      opacity: Number(style.opacity),
      visible: style.visibility !== 'hidden' && style.display !== 'none',
      receivesPaint:
        point === element || Boolean(point?.closest('.navbar-sidebar')),
    };
  });
  expect(painted.visible).toBe(true);
  expect(painted.opacity).toBeGreaterThan(0);
  expect(painted.height).toBeGreaterThan(page.viewportSize()!.height * 0.8);
  expect(painted.receivesPaint).toBe(true);
}

test.describe('published public surfaces', () => {
  test('mobile drawer is painted and navigable at supported widths, themes, and locales', async ({
    page,
  }) => {
    for (const colorScheme of ['light', 'dark'] as const) {
      await page.emulateMedia({colorScheme});
      for (const width of mobileWidths) {
        await page.setViewportSize({width, height: 820});
        for (const locale of locales) {
          await page.goto(`${locale || '/'}`);
          const drawer = await openDrawer(page);
          await expectDrawerPainted(page, drawer);
          const destination = drawer.locator('a.menu__link').first();
          await expect(destination).toBeVisible();
          const href = await destination.getAttribute('href');
          expect(href).toBeTruthy();
          await destination.click();
          await expect(page).toHaveURL(
            new RegExp(href!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
          );
        }
      }
    }
  });

  test('Escape, close, and rapid close/reopen restore a usable drawer state', async ({
    page,
  }) => {
    await page.setViewportSize({width: 390, height: 820});
    await page.goto('/');
    const toggle = page.locator('.navbar__toggle');
    const drawer = await openDrawer(page);

    await page.keyboard.press('Escape');
    await expect(drawer).not.toBeVisible();
    await expect(toggle).toBeFocused();

    await openDrawer(page);
    await page.locator('.navbar-sidebar__close').click();
    await expect(drawer).not.toBeVisible();
    await expect(toggle).toBeFocused();

    await openDrawer(page);
    await page.locator('.navbar-sidebar__close').click();
    await toggle.click();
    await page.locator('.navbar-sidebar__close').click();
    await toggle.click();
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
    await expect(drawer).toBeVisible();
    await expectDrawerPainted(page, drawer);
  });

  test('author bio stays unclamped without overlap and role cards retain published order', async ({
    page,
  }) => {
    await page.setViewportSize({width: 390, height: 820});
    await page.goto('/blog/authors/team');
    const bio = page.locator('.aa-author-surface .avatar__intro small').first();
    await expect(bio).toBeVisible();
    const bioLayout = await bio.evaluate((element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      const parent = element.parentElement!.getBoundingClientRect();
      return {
        lineClamp: style.getPropertyValue('line-clamp'),
        webkitLineClamp: style.getPropertyValue('-webkit-line-clamp'),
        overflow: style.overflow,
        bottom: rect.bottom,
        parentBottom: parent.bottom,
      };
    });
    expect(bioLayout.lineClamp).not.toMatch(/^\d+$/);
    expect(bioLayout.webkitLineClamp).not.toMatch(/^\d+$/);
    expect(bioLayout.overflow).toBe('visible');
    expect(bioLayout.bottom).toBeLessThanOrEqual(bioLayout.parentBottom + 1);

    await page.goto('/roles');
    const roles = await page.locator('main h2').allTextContents();
    expect(roles).toEqual([
      'Security and risk',
      'Platform and SRE',
      'Engineering',
      'Product, QA and assurance',
    ]);
  });

  test('reduced-motion hero canvas paints one stable static frame', async ({
    page,
  }) => {
    await page.emulateMedia({reducedMotion: 'reduce'});
    await page.setViewportSize({width: 1440, height: 900});
    await page.goto('/');
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible();
    const first = await canvas.evaluate((element: HTMLCanvasElement) => ({
      width: element.width,
      height: element.height,
      image: element.toDataURL(),
    }));
    expect(first.width).toBeGreaterThan(0);
    expect(first.height).toBeGreaterThan(0);
    await page.waitForTimeout(150);
    await expect(canvas).toHaveJSProperty('width', first.width);
    await expect(canvas).toHaveJSProperty('height', first.height);
    await expect(
      canvas.evaluate((element: HTMLCanvasElement) => element.toDataURL()),
    ).resolves.toBe(first.image);
  });
});
