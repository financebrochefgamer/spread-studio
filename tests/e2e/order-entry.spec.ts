import { expect, test } from '@playwright/test';

test('non-marketable limit order becomes a working order, creates no position, and cancels cleanly', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('underlying-AURA').click();
  await page.getByTestId('template-bull_call_spread').click();
  await expect(page.getByTestId('leg-1')).toBeVisible();

  await page.getByTestId('open-ticket').click();
  await page.getByTestId('order-type-limit').click();
  // A bull call spread is a net debit of roughly a few hundred dollars at this
  // app's x100 contract multiplier; a one-cent limit is far below any realistic
  // net mid, so this is reliably non-marketable (netMid <= netLimitPrice is false).
  await page.getByTestId('limit-price-input').fill('0.01');
  await page.getByTestId('confirm-order').click();

  // Non-marketable limit orders close the ticket immediately without a "placed" state.
  await expect(page.getByTestId('confirm-order')).toHaveCount(0);

  await page.goto('/orders');
  await expect(page.getByTestId('order-row')).toHaveCount(0);
  await expect(page.getByTestId('working-order-row')).toHaveCount(1);
  await expect(page.getByTestId('working-order-row')).toContainText('AURA');

  await page.getByTestId('cancel-working-order').click();
  await expect(page.getByTestId('working-order-row')).toHaveCount(0);
});

test('marketable limit order fills immediately at net mid, like a market order', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('underlying-AURA').click();
  await page.getByTestId('template-bull_call_spread').click();
  await expect(page.getByTestId('leg-1')).toBeVisible();

  await page.getByTestId('open-ticket').click();
  await page.getByTestId('order-type-limit').click();
  // A limit far above any realistic net debit is always marketable.
  await page.getByTestId('limit-price-input').fill('999');
  await page.getByTestId('confirm-order').click();

  await expect(page.getByTestId('confirm-order')).toContainText('Order placed');
  await page.getByTestId('close-ticket').click();

  await page.goto('/orders');
  await expect(page.getByTestId('order-row')).toHaveCount(1);
  await expect(page.getByTestId('order-row')).toContainText('AURA');
  await expect(page.getByTestId('order-row')).toContainText('limit');
  await expect(page.getByTestId('working-order-row')).toHaveCount(0);
});

test('unlimited-risk warning is non-blocking: trader can still confirm the order', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('underlying-AURA').click();
  // A naked short call has unlimited max loss (highPriceSlope < 0).
  await page.locator('[data-testid^="add-call-"][data-testid$="-sell"]').first().click();
  await expect(page.getByTestId('leg-0')).toBeVisible();

  await page.getByTestId('open-ticket').click();
  await expect(page.getByTestId('risk-warning-unlimited')).toBeVisible();

  await page.getByTestId('confirm-order').click();
  await expect(page.getByTestId('confirm-order')).toContainText('Order placed');
  await page.getByTestId('close-ticket').click();

  await page.goto('/orders');
  await expect(page.getByTestId('order-row')).toHaveCount(1);
  await expect(page.getByTestId('order-row')).toContainText('AURA');
});
