import { expect, test } from '@playwright/test';

function parseCurrency(text: string | null): number {
  if (!text) return NaN;
  return Number(text.replace(/[^0-9.-]/g, ''));
}

test('positions journey: credit position near-zero P&L, theta gesture, close, analytics', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('underlying-AURA').click();
  await page.getByTestId('template-cash_secured_put').click();
  await expect(page.getByTestId('leg-0')).toBeVisible();

  await page.getByTestId('open-ticket').click();
  await page.getByTestId('confirm-order').click();
  await page.getByTestId('close-ticket').click();

  await page.goto('/positions');
  await expect(page.getByTestId('position-row')).toHaveCount(1);
  await expect(page.getByTestId('position-row')).toContainText('AURA');

  const portfolioPl = page.getByTestId('portfolio-pl');
  await expect(portfolioPl).toBeVisible();
  const basePl = parseCurrency(await portfolioPl.textContent());
  expect(Math.abs(basePl)).toBeLessThan(20);

  // Roll days forward: a short premium (credit) position should gain as theta decays.
  await page.getByTestId('scenario-days').fill('10');
  await expect
    .poll(async () => parseCurrency(await portfolioPl.textContent()))
    .toBeGreaterThan(0);

  await page.getByTestId('scenario-reset').click();
  await expect(page.getByTestId('scenario-days')).toHaveValue('0');
  await expect(page.getByTestId('scenario-spot')).toHaveValue('0');
  await expect(page.getByTestId('scenario-vol')).toHaveValue('0');

  await page.locator('[data-testid^="close-position-"]').first().click();
  await expect(page.getByTestId('closed-row')).toHaveCount(1);
  await expect(page.getByTestId('closed-row')).toContainText('AURA');
  await expect(page.getByTestId('positions-empty')).toBeVisible();

  await page.goto('/analytics');
  await expect(page.getByTestId('live-position_closed')).toHaveText('1');
  await expect(page.getByTestId('live-scenario_adjusted')).not.toHaveText('0');
  await expect(page.getByTestId('funnel-stage-position_closed')).toBeVisible();
});
