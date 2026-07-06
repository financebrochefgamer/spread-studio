# Discovery Brief: Multi-Leg Options Strategy Builder

Date: 2026-07-06
Author: PM
Status: Input to specs/001 (spec.md)

Method note: this is a portfolio project. The personas below are synthesized from public
trader-community research (broker forums, options-education communities) and formatted the
way a real discovery brief from 6 to 8 customer interviews would be.

## Problem

Active options traders assemble multi-leg positions (verticals, condors, straddles) in
tools that treat the order ticket as the product. Risk comprehension comes last: max loss,
breakevens, and net Greeks are buried behind extra clicks or missing entirely. Traders
either build spreadsheets on the side or take positions whose risk shape they have not
actually seen.

## Personas

### 1. Marcus, 54: The Income Trader

Sells covered calls and cash-secured puts monthly against a long-term portfolio.

- JTBD: "When I pick a strike to sell, I want to see premium vs. assignment risk side by
  side, so I can collect income without surprise assignments."
- Pains: comparing candidate strikes is manual; breakeven after premium is mental math;
  chain UIs optimize for speed of order entry, not decision quality.

### 2. Priya, 38: The Defined-Risk Spread Trader

Software engineer. Trades verticals and iron condors weekly, often around events.

- JTBD: "When I structure a spread, I want max loss and breakevens to update live as I
  adjust legs, so I can size the position before I commit."
- Pains: leg entry is slow; risk metrics appear only on a separate analyze tab; editing
  one leg often silently rebuilds the whole ticket.

### 3. Dev, 27: The Aspiring Multi-Leg Trader

Comfortable with single-leg calls and puts. Understands spread theory, has never placed one.

- JTBD: "When I try a strategy I read about, I want to see the payoff picture before any
  real order form, so I can learn without risking a mistake."
- Pains: multi-leg tickets are intimidating; no consequence-free rehearsal space; education
  content and trading tools live in different products.

## Top insights to requirements

| Insight | Requirement |
| --- | --- |
| Risk shape must be visible during construction, not after | Payoff chart, max P/L, breakevens update live in the builder |
| Templates are the entry point; custom legs are the power tool | 9 named templates plus a full leg editor |
| Trust requires seeing the same numbers a broker shows | Per-leg and aggregate Greeks, bid/ask/mid on every quote |
| Rehearsal beats tutorials | Simulated order flow with confirmations and history |

## Out of scope for v1

See roadmap.md for reasons: live market data, positions P/L over time, margin modeling,
futures, calendars, and diagonals.
