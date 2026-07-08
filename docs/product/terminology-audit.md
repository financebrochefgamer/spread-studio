# Trading platform terminology audit

Date: 2026-07-08
Status: Findings and fixes applied

## Why this exists

The posting names "appreciation for what VIP-level active trader UX looks like and
what separates professional-grade tools from consumer-grade experiences" as a
required skill. Words are part of that surface, not decoration: a trader reads labels
faster than they read a design system. This audit reads every user-facing string in
the app against real broker-platform conventions and fixes the ones that read as
generic software instead of a trading desk.

## Method

Every literal string a user would actually read on screen was inventoried across
`app/` and `components/` (button labels, headers, empty states, warnings, table
columns). Each flagged item was checked against real platform conventions before
deciding on a fix, not renamed by feel:

- thinkorswim (Charles Schwab): confirmed "Trade" as the tab name for the order/chain
  screen, and "Working Orders" as the exact term for unfilled resting orders (this
  app already used "Working Orders" correctly; it was not a finding).
- Interactive Brokers: order-entry and order-type conventions (Limit, Market, TIF)
  cross-checked; this app's usage already matched.
- TradeStation's own platform (the target company): its order-entry surface is
  literally named the "Trade Bar" / "Order Bar," and its options module is
  "OptionStation Pro." Neither name is copied directly into this app; both are
  trademarked TradeStation product names, and copying them into a portfolio piece
  would read as derivative rather than as evidence of understanding the convention.
  Knowing the real name is what grounds the choice of "Trade" as this app's nav
  label instead: same convention (a named trade surface, not a generic "Builder"),
  without borrowing a trademark.

Sources: [thinkorswim Order Entry Tools](https://toslc.thinkorswim.com/center/howToTos/thinkManual/Trade/Order-Entry-Tools),
[thinkorswim Order Statuses](https://toslc.thinkorswim.com/center/howToTos/thinkManual/Trade/Order-Entry-Tools/Order-Statuses),
[IBKR Order Types](https://www.ibkrguides.com/traderworkstation/order-types.htm),
[TradeStation Trade Bar](https://help.tradestation.com/10_00/eng/tswebtrading/topics/place_trade.htm),
[TradeStation Matrix Trade Bar](https://help.tradestation.com/10_00/eng/tradestationhelp/matrix/matrix_trade_bar.htm).

## Findings and fixes

| # | Where | Was | Fixed to | Why |
| --- | --- | --- | --- | --- |
| 1 | Nav tab, page H1 (components/Nav.tsx, app/page.tsx) | "Builder" | "Trade" | "Builder" reads as generic app/website-builder software. "Trade" is thinkorswim's exact convention for this screen and is a plain, professional trading-desk word, not a borrowed trademark. |
| 2 | Analysis panel CTA button (components/AnalysisPanel.tsx) | "Ticket" (with a raffle-ticket icon) | "Review Order" (with a checklist-style icon) | A lone "Ticket" label with a ticket-stub icon reads like leftover internal/dev naming for the modal it opens, not a customer-facing call to action. "Review Order" describes what actually happens: the trader previews before confirming. |
| 3 | Analysis panel section header (components/AnalysisPanel.tsx) | "Risk" | "Analysis" | The section holds metrics, Greeks, the payoff chart, and order actions, not only risk figures. "Analysis" matches the content and echoes thinkorswim's "Analyze" tab. |
| 4 | Analysis panel empty state (components/AnalysisPanel.tsx) | "Analysis waits for the first leg." | "Add a leg to see its risk and payoff." | Whimsical, personified copy is a tone mismatch against the rest of the app's terse, numeric UI. |
| 5 | Order ticket wide-spread warning (components/OrderTicketModal.tsx) | Raw internal leg IDs printed directly, e.g. "Wide spread on leg(s): custom-call-185-buy." | Human-readable leg description, e.g. "Wide spread on leg(s): 185 Call, 175 Put." | Leaking an internal identifier into a risk warning a trader is meant to act on is a real defect, not a style choice: a live platform would never surface a raw ID string. |
| 6 | Analytics "Live session" table (app/analytics/page.tsx) | Raw snake_case event names printed unformatted (`order_ticket_opened`, `page_view`, ...) | Same humanizer already used two panels above (`labelFromId`) applied here too | Inconsistent: the Activation Funnel and Template Popularity panels on the same page already humanize labels. The Live Session table was the one place that didn't, and it read as an unfinished debug view. |
| 7 | Orders page section header (app/orders/page.tsx) | "Saved" | "Saved Strategies" | Matches the specificity of its sibling header "Working Orders" instead of leaving "saved what?" implicit. |
| 8 | Leg editor price display (components/LegEditor.tsx) | Inline, unlabeled `mid 1.85` | `Mid $1.85` | Unlabeled, uncapitalized, no currency formatting; read like debug output rather than a formatted UI field. |
| 9 | Positions empty state (app/positions/page.tsx) | "No open positions yet. Place an order from the Builder to see it here." | "No open positions. Place an order from Trade to open one." | Drops the casual "yet," updates the internal page reference for finding #1's rename, and states the actual outcome (an open position) instead of a vague "see it here." |
| 10 | Time in force controls and cells (components/OrderTicketModal.tsx, app/orders/page.tsx) | "GTC" shown with no expansion anywhere | Hover title "Good-Til-Canceled" added | Cheap, real-platform-standard polish: TIF abbreviations are conventionally expandable on hover rather than requiring the trader to already know them. |
| 11 | Analytics "Live session" panel event list (app/analytics/page.tsx) | Missing `working_order_placed` and `working_order_canceled` entirely; spec 006's two new events had no row anywhere in this panel | Both added to the tracked list, alongside the finding-6 formatting fix | Found while fixing #6, not part of the original terminology scan: spec 006 added these events to the tracking plan (docs/product/success-metrics.md) but the analytics page's own hardcoded event list was never updated to match, so a trader placing a working order saw no corresponding row here at all. |

## What was checked and found already correct

Worth stating explicitly, since an audit that only lists problems undersells what
already works: "Order ticket" (the modal title), Market/Limit, Day/GTC, "Net premium,"
debit/credit, "Breakevens," "Max profit"/"Max loss," the full Greeks vocabulary
(Delta, Gamma, Theta, Vega with per-day/per-point units), IV, DTE, bid/ask, and every
strategy template name (Iron Condor, Covered Call, Cash-Secured Put, etc.) are all
standard, correctly used broker-platform terminology and needed no changes.

## What was deliberately not changed

- Rho is not shown in the Greeks table. This is an existing scope decision (v1 tracks
  delta, gamma, theta, vega only), not a terminology defect; revisiting it is a
  product-scope question, not a wording fix, and belongs in a future spec if pursued.
- "TIF" as a bare column header abbreviation on the Orders page tables is left as is;
  real platforms (thinkorswim, IBKR) use the same bare abbreviation as a column
  header. Only the GTC value itself gained a hover expansion (finding 10).

## Verification

56/56 unit tests, production build, and all 6 real Playwright e2e journeys (order
entry, positions, chain-to-order-to-analytics) stayed green through every fix; none
of the renamed text is a test dependency (tests assert on `data-testid`, never on
visible copy). The fixes were also checked visually in a live dev-server session:
the nav and page header both read "Trade," the Analysis panel's "Review Order"
button and its checklist icon render correctly, and building an iron condor and
opening the order ticket showed the wide-spread warning reading "Wide spread on
leg(s): 140.00 Put." instead of a raw leg id, confirming finding 5's fix end to end.

