# Domain knowledge to build

Active trading domain fluency that this repo's simulated math can model but cannot
teach by itself. The goal is to reach the posting's bar: "working knowledge... enough
to write accurate specs without needing a SME for every requirement."

## Options and derivatives (deepen, not start from zero)

The repo already required understanding this well enough to specify Black-Scholes
Greeks, vol skew, and multi-leg payoff correctly, and to catch a reviewer's finding
that deep ITM long puts can show positive theta. Areas to go deeper:

- Real order flow around earnings and events: how implied vol actually behaves into
  and out of a catalyst, versus the fixed-term-lift model this repo uses for
  simplicity.
- Assignment and exercise mechanics in practice: early assignment risk on short ITM
  options, especially around dividends, and how professional platforms surface it.
- Multi-leg order execution reality: how a real broker fills a 4-leg iron condor (one
  net price vs. leg-by-leg), and what "complex order book eligibility" (mentioned in
  role-gap-analysis Gap 6) actually means operationally.

## Futures

specs/003-futures-risk-preview specs a synthetic tick/point model but was deliberately
not built. Study before promoting it to an implementation:

- Contract specifications for real products (ES, CL, ZN, GC style): tick size, tick
  value, contract multiplier, and why they differ so much between products.
- Daily settlement and mark-to-market: futures P&L realizes daily, unlike the
  options-style unrealized P&L this repo already models.
- Initial vs. maintenance margin as performance bond collateral, not a down payment,
  and how it differs conceptually from options buying-power.
- Roll mechanics: why traders roll a futures position before expiration and what
  "front month" vs. "back month" liquidity looks like in practice.

## Margin and buying power

- Reg T margin for equities and options: initial margin, maintenance margin,
  house/broker requirements above the regulatory minimum.
- Portfolio margin: how it differs from strategy-based (Reg T) margin, and why it
  matters for active, multi-leg options traders specifically.
- The distinction max loss vs. margin requirement: for defined-risk spreads they often
  approximate each other; for naked/undefined-risk positions they diverge sharply, and
  a broker's margin model is a risk estimate under rules, not a mathematical certainty.

## Broker-dealer platform conventions

- Order types beyond market/limit: stop, stop-limit, trailing stop, and how each
  behaves specifically for options versus equities.
- Time in force conventions (day, GTC, fill-or-kill, immediate-or-cancel) and which
  matter most for active, multi-leg strategies.
- NBBO (National Best Bid and Offer) and how it constrains what "fair" fill pricing
  looks like, versus this repo's simplified mid-price fill assumption.
- What separates professional-grade order entry from consumer-grade: information
  density, keyboard-first workflows, one-click risk visibility, versus a form-first,
  wizard-style consumer flow.

## Licensing (if pursued)

- Series 7 (General Securities Representative) and Series 63 (state law) are the
  baseline for a securities role; Series 4 (Registered Options Principal) and Series
  24 (General Securities Principal) are supervisory/principal-level, listed in the
  posting as "currently or previously held," implying they'd expect deep familiarity
  with the regulatory frameworks even without holding them personally.
- Understand what each license's exam actually covers (not just that it exists) before
  deciding whether pursuing one is worth the time investment for this specific role
  archetype.
