import { test } from '@playwright/test';
import { mkdirSync } from 'fs';

test.skip(!process.env.SCREENSHOTS, 'screenshots only on demand');

test.beforeAll(() => {
  mkdirSync('docs/images', { recursive: true });
});

test('capture readme screenshots', async ({ page }) => {
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.goto('/');
  await page.addStyleTag({ content: 'nextjs-portal { display: none !important; }' });
  await page.getByTestId('underlying-AURA').click();
  await page.getByTestId('template-iron_condor').click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: 'docs/images/builder.png' });

  await page.getByTestId('open-ticket').click();
  await page.screenshot({ path: 'docs/images/ticket.png' });

  await page.getByTestId('confirm-order').click();
  await page.getByTestId('close-ticket').click();
  await page.goto('/analytics');
  await page.addStyleTag({ content: 'nextjs-portal { display: none !important; }' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'docs/images/analytics.png' });
});
