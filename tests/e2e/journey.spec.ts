import { expect, test } from '@playwright/test';

test('trader journey: chain to iron condor to order to analytics', async ({ page }) => {
  await page.goto('/');

  await page.getByTestId('underlying-AURA').click();
  await expect(page.getByTestId('chain-table')).toBeVisible();

  await page.getByTestId('template-iron_condor').click();
  await expect(page.getByTestId('leg-3')).toBeVisible();

  await expect(page.getByTestId('metric-max-loss')).not.toHaveText('Unlimited');
  await expect(page.getByTestId('metric-max-loss')).toContainText('$');
  await expect(page.getByTestId('metric-breakevens')).toContainText('/');
  await expect(page.getByTestId('payoff-chart')).toBeVisible();

  await page.waitForTimeout(1000);

  await page.getByTestId('open-ticket').click();
  await page.getByTestId('confirm-order').click();
  await page.getByTestId('close-ticket').click();

  await page.goto('/orders');
  await expect(page.getByTestId('order-row')).toHaveCount(1);
  await expect(page.getByTestId('order-row')).toContainText('AURA');

  await page.goto('/analytics');
  await expect(page.getByTestId('live-order_placed')).toHaveText('1');
  await expect(page.getByTestId('live-strategy_analyzed')).not.toHaveText('0');

  const viewed = Number(await page.getByTestId('funnel-stage-chain_viewed').textContent());
  const placed = Number(await page.getByTestId('funnel-stage-order_placed').textContent());
  expect(viewed).toBeGreaterThan(placed);
  expect(placed).toBeGreaterThan(0);
});

test('custom legs from the chain and save/load round trip', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('underlying-BOLT').click();

  await page.locator('[data-testid^="add-call-"][data-testid$="-buy"]').first().click();
  await expect(page.getByTestId('leg-0')).toBeVisible();

  await page.getByTestId('save-strategy').click();
  await page.goto('/orders');
  await page.getByTestId('strategy-load-0').click();

  await expect(page).toHaveURL('/');
  await expect(page.getByTestId('leg-0')).toBeVisible();
});
