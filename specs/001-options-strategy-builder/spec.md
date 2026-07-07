# Feature Specification: Options Strategy Builder

**Feature Branch**: `001-options-strategy-builder`

**Created**: 2026-07-06

**Status**: Draft

**Input**: User description: "Build Spread Studio, a multi-leg options strategy builder for active traders, as a client-only web app with deterministic synthetic market data."

## User Scenarios & Testing

### User Story 1 - Explore an option chain (Priority: P1)

As an active options trader, I select one of 8 synthetic underlyings and inspect a
deterministic option chain with expirations, strikes, bid, ask, mid, IV, and delta.

**Why this priority**: The chain is the starting point for every strategy decision. Without
trusted quote data, no later builder or analysis flow has useful inputs.

**Independent Test**: Select each available underlying and verify that the chain shows 4
fixed expirations, 21 strikes per expiration, and quote fields for calls and puts.

**Acceptance Scenarios**:

1. **Given** the trader opens the builder, **When** they select an underlying, **Then** the option chain updates to that underlying with deterministic quotes.
2. **Given** a chain is visible, **When** the trader changes expiration, **Then** the visible strike ladder updates while preserving the selected underlying.
3. **Given** the app is reloaded, **When** the same underlying and expiration are selected, **Then** the same quotes are shown as before.

---

### User Story 2 - Build from strategy templates (Priority: P1)

As a trader, I apply a named options strategy template and get sensible default legs
relative to the at-the-money strike.

**Why this priority**: Templates are the fastest path from market data to a risk picture,
especially for defined-risk spread traders and learners.

**Independent Test**: Apply each strategy template and verify that expected legs are
created with side, quantity, option type, strike, and expiration.

**Acceptance Scenarios**:

1. **Given** an underlying and expiration are selected, **When** the trader selects long call, **Then** one buy call leg is added near at the money.
2. **Given** an underlying and expiration are selected, **When** the trader selects iron condor, **Then** four same-expiration option legs are added around the current spot price.
3. **Given** a template is applied, **When** the trader applies a different template, **Then** the builder replaces the prior template legs with the new template legs.

---

### User Story 3 - Edit custom strategy legs (Priority: P1)

As a trader, I add, edit, and remove individual legs so I can customize a strategy beyond
the provided templates.

**Why this priority**: Custom leg editing is required for power users and for validating
that the builder is more than a static template demo.

**Independent Test**: Add a leg from the chain, edit its side, quantity, strike, and type,
then remove it and confirm the strategy analysis updates at each step.

**Acceptance Scenarios**:

1. **Given** the chain is visible, **When** the trader adds a buy call at a strike, **Then** the leg appears in the strategy editor.
2. **Given** a leg is in the editor, **When** the trader changes side or quantity, **Then** the strategy metrics recalculate.
3. **Given** multiple legs exist, **When** the trader removes one leg, **Then** the analysis and order ticket reflect the remaining legs only.

---

### User Story 4 - See live strategy risk (Priority: P1)

As a trader, I see payoff at expiration, breakevens, max profit, max loss, net debit or
credit, and per-leg plus aggregate Greeks while I build.

**Why this priority**: The core user value is seeing risk before committing to a simulated
order.

**Independent Test**: Build a single-leg strategy, a defined-risk vertical, and an iron
condor, then verify metrics and payoff shape update without leaving the builder.

**Acceptance Scenarios**:

1. **Given** a strategy has at least one leg, **When** the analysis panel renders, **Then** it shows payoff, breakevens, max profit, max loss, and net debit or credit.
2. **Given** a defined-risk strategy is selected, **When** the trader reviews max loss, **Then** the value is finite and displayed in dollars.
3. **Given** a strategy has unlimited upside or downside, **When** max profit or loss is unbounded, **Then** the app labels the metric as unlimited instead of showing a misleading number.

---

### User Story 5 - Rehearse a simulated order (Priority: P2)

As a trader, I open an order ticket, review the legs, confirm a simulated mid-price fill,
and see the order in history.

**Why this priority**: Rehearsal turns analysis into a complete decision workflow without
connecting to a broker or accepting real risk.

**Independent Test**: Build a strategy, open the ticket, confirm the order, then navigate
to order history and verify that the simulated order is present.

**Acceptance Scenarios**:

1. **Given** a valid strategy exists, **When** the trader opens the order ticket, **Then** the ticket shows all legs and the net premium.
2. **Given** the order ticket is open, **When** the trader confirms the order, **Then** a simulated order is recorded with a mid-price fill.
3. **Given** an order has been confirmed, **When** the trader opens order history, **Then** the order appears with underlying, legs, timestamp, and net premium.

---

### User Story 6 - Save and reload strategies (Priority: P2)

As a trader, I save a strategy and reload it later so I can compare or revisit a setup.

**Why this priority**: Saved strategies make the demo feel like a working trader tool and
support repeat exploration.

**Independent Test**: Save a custom strategy, leave the builder, reload it from the saved
strategies list, and verify the same legs and analysis return.

**Acceptance Scenarios**:

1. **Given** a strategy has at least one leg, **When** the trader saves it, **Then** it appears in the saved strategies list.
2. **Given** a saved strategy exists, **When** the trader reloads it, **Then** the builder restores the same underlying, expiration, and legs.

---

### User Story 7 - Review product analytics (Priority: P3)

As a product manager, I open analytics and see activation funnel progress, template
popularity, and my live session events.

**Why this priority**: The product must demonstrate a self-service analytics mindset, not
only trading-domain UI.

**Independent Test**: Complete the builder-to-order flow, open analytics, and verify that
the live session counts update alongside a seeded demo dataset.

**Acceptance Scenarios**:

1. **Given** no live actions have occurred, **When** analytics opens, **Then** seeded demo funnel and template popularity data are visible and labeled.
2. **Given** the trader selects a template and places an order, **When** analytics opens in the same browser session, **Then** live counts for those actions are visible.
3. **Given** the analytics dashboard renders, **When** the user compares seeded and live data, **Then** the source of each dataset is clear.

### Edge Cases

- The trader attempts to analyze or place an order with no legs.
- A strategy has unlimited max profit or unlimited max loss.
- A selected template cannot find an ideal strike because the underlying price is near an edge of the strike ladder.
- Browser storage is empty, unavailable, or already contains prior demo data.
- The user reloads the page after selecting an underlying, placing an order, or saving a strategy.
- The user changes the underlying after building a strategy.
- Analytics contains both seeded events and live events for the same event name.

## Requirements

### Functional Requirements

- **FR-001**: The app MUST provide 8 synthetic underlyings with fictional but plausible market profiles.
- **FR-002**: The app MUST generate option chains deterministically from the fixed market date 2026-07-06.
- **FR-003**: Each underlying MUST provide 4 fixed expirations and 21 strikes per expiration.
- **FR-004**: Chain quotes MUST include bid, ask, mid, IV, and delta for calls and puts.
- **FR-005**: The builder MUST support these 9 templates: long call, long put, covered call, cash-secured put, bull call spread, bear put spread, iron condor, long straddle, and long strangle.
- **FR-006**: Template selection MUST create sensible default legs relative to the current at-the-money strike.
- **FR-007**: Users MUST be able to add, edit, and remove legs with side, quantity, instrument type, strike where applicable, and expiration where applicable.
- **FR-008**: All option legs in a strategy MUST share one strategy-level expiration in v1.
- **FR-009**: The builder MUST support stock legs where required for covered-call behavior.
- **FR-010**: The analysis panel MUST show payoff at expiration, breakevens, max profit, max loss, and net debit or credit for the current strategy.
- **FR-011**: The analysis panel MUST show per-leg and aggregate delta, gamma, theta per day, and vega per volatility point.
- **FR-012**: The app MUST identify unlimited max profit or max loss when the payoff profile is unbounded.
- **FR-013**: The app MUST allow a trader to open a simulated order ticket for a strategy with at least one leg.
- **FR-014**: The order ticket MUST display all legs and a simulated mid-price fill before confirmation.
- **FR-015**: Confirmed simulated orders MUST appear in an order history view.
- **FR-016**: Users MUST be able to save strategies and reload them into the builder.
- **FR-017**: The app MUST track the following events exactly: `page_view`, `chain_viewed`, `template_selected`, `leg_edited`, `strategy_analyzed`, `order_ticket_opened`, `order_placed`, and `strategy_saved`.
- **FR-018**: Analytics MUST show an activation funnel from chain viewed to strategy built to strategy analyzed to order placed.
- **FR-019**: Analytics MUST show template popularity.
- **FR-020**: Analytics MUST merge a deterministic seeded dataset with the visitor's live session events and clearly label event source.
- **FR-021**: Event properties MUST match the tracking plan in docs/product/success-metrics.md.
- **FR-022**: The app MUST work without external APIs, auth, a database, or server-side persistence.
- **FR-023**: Live market data, positions P/L over time, margin modeling, futures, calendars, and diagonals MUST remain out of scope for v1.

### Key Entities

- **Underlying**: A synthetic tradable symbol with name, spot price, volatility profile, and market profile.
- **Expiration**: A fixed options expiration date available for an underlying.
- **Option Quote**: A call or put quote at a strike and expiration, including bid, ask, mid, IV, and Greeks.
- **Strategy Leg**: A stock or option component with side, quantity, strike where applicable, expiration where applicable, and quote data where applicable.
- **Strategy**: The current group of legs, selected underlying, selected expiration, and optional template source.
- **Analysis Result**: Payoff series, breakevens, max profit, max loss, net premium, and aggregate Greeks for a strategy.
- **Order**: A simulated confirmed order with legs, fill assumption, underlying, timestamp, and net premium.
- **Saved Strategy**: A persisted strategy configuration that can be restored into the builder.
- **Analytics Event**: A tracked user action with event name, timestamp, session id, source, and allowed properties.

## Success Criteria

### Measurable Outcomes

- **SC-001**: A first-time visitor can select an underlying, apply the iron condor template, review max loss and breakevens, and open the order ticket in under 2 minutes.
- **SC-002**: The primary journey from chain selection to confirmed simulated order completes without any network dependency.
- **SC-003**: Repeating the same underlying, expiration, and template selection after a reload produces the same quotes and strategy metrics.
- **SC-004**: All 9 templates produce valid strategies with visible analysis and no missing required leg fields.
- **SC-005**: The analytics dashboard shows nonzero seeded funnel data on first load and live session event counts after user actions.
- **SC-006**: The product can demonstrate the full activation funnel in a single browser session.
- **SC-007**: v1 scope exclusions are visible in the product docs and are not exposed as incomplete UI controls.

## Assumptions

- The app is a demo and learning tool, not a brokerage service.
- All market data and order fills are simulated.
- One browser profile represents one local demo user.
- Browser storage is sufficient for orders, saved strategies, and capped analytics events.
- Option prices are per-share premiums; P/L is shown in dollars using standard equity option contract multiplier assumptions.
- Single-expiration strategies are sufficient for v1; calendars and diagonals require their own later spec.
- The analytics funnel counts stage completion for product demonstration and does not need vendor-grade attribution in v1.
