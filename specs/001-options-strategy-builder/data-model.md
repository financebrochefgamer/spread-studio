# Data Model: Options Strategy Builder

Date: 2026-07-06

## Underlying

- `symbol`: unique synthetic ticker
- `name`: display name
- `spot`: current synthetic price
- `baseVolatility`: base annualized implied volatility
- `profile`: market behavior label used to shape chain generation

Validation rules:

- Symbol is unique.
- Spot and base volatility are positive.
- Exactly 8 underlyings ship in v1.

## Expiration

- `date`: fixed ISO date
- `label`: display label
- `daysToExpiration`: positive calendar-day count from market date

Validation rules:

- Exactly 4 expirations are available.
- Dates are deterministic and later than the market date.

## Option Quote

- `underlying`: underlying symbol
- `expiration`: expiration date
- `strike`: strike price
- `type`: call or put
- `bid`, `ask`, `mid`: per-share premiums
- `iv`: annualized implied volatility
- `greeks`: delta, gamma, theta per day, vega per volatility point

Validation rules:

- Bid is less than or equal to mid; mid is less than or equal to ask.
- Prices are nonnegative.
- Each expiration has 21 strikes for calls and puts.

## Strategy Leg

- `id`: stable local id
- `instrument`: call, put, or stock
- `side`: buy or sell
- `quantity`: positive integer
- `strike`: required for option legs
- `expiration`: required for option legs
- `quote`: required for option legs

Validation rules:

- Quantity is at least 1.
- All option legs in a strategy share the strategy-level expiration.
- Stock legs do not have strike or expiration.

## Strategy

- `underlying`: selected symbol
- `expiration`: selected strategy-level expiration
- `legs`: ordered strategy legs
- `template`: optional template id

Validation rules:

- A strategy can be analyzed when it has at least one leg.
- A strategy can be ordered or saved when it has at least one valid leg.

## Analysis Result

- `payoff`: P/L points across a range of underlying prices
- `breakevens`: zero-crossing prices
- `maxProfit`: finite dollar amount or unlimited
- `maxLoss`: finite dollar amount or unlimited
- `netPremium`: dollars, positive for debit and negative for credit
- `greeks`: aggregate delta, gamma, theta, and vega
- `legGreeks`: per-leg Greeks

Validation rules:

- Payoff uses dollars, not per-share premiums.
- Unlimited profit or loss is represented explicitly.
- Breakevens are sorted ascending.

## Order

- `id`: stable local id
- `createdAt`: ISO timestamp
- `underlying`: selected symbol
- `expiration`: selected strategy-level expiration
- `legs`: confirmed legs
- `netPremium`: simulated fill value

Validation rules:

- Orders are simulated only.
- Orders are stored locally.

## Saved Strategy

- `id`: stable local id
- `createdAt`: ISO timestamp
- `name`: generated or user-visible strategy label
- `strategy`: saved strategy payload

Validation rules:

- Saved strategies are stored locally.
- Reloading a saved strategy restores underlying, expiration, template, and legs.

## Analytics Event

- `id`: stable local id
- `name`: one allowed event name
- `timestamp`: ISO timestamp
- `sessionId`: current browser session id
- `source`: seed or live
- `properties`: allowed event properties

Validation rules:

- Event names match `docs/product/success-metrics.md`.
- Events do not include PII or free-text input.
- Live local events are capped at 2000.
