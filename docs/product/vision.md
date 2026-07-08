# Product vision

Status: north star, living document. Every feature spec must name the pillar
and arc it advances (constitution Principle VIII). Last updated 2026-07-08.

## North star

Spread Studio is the AI-native derivatives strategy platform: the place active
traders build, stress-test, and master multi-leg strategies. It exists to prove
that one experienced trader-PM directing AI agents ships a competitive
active-trader platform at the level of a senior engineering team, with no clash
of ideas between vision and execution.

The competitive frame is honest and ambitious. The incumbents are TradingView,
brokerage analyze tools, and options-strategy visualizers. We do not chase
their breadth. We beat them where depth wins.

## Twin pillars

### Pillar 1: Strategy Intelligence

Beat incumbent options analytics at strategy construction, scenario analysis,
and Greeks-level decision support. Incumbents treat options analytics as a
bolted-on tab. For us it is the core product. This pillar grows from what is
already shipped: the builder, templates, payoff engine, scenario engine, and
broker-grade order ticket.

### Pillar 2: Trader Development

The deterministic practice arena: paper trading, trade journaling, AI trade
review, replayable market scenarios, measurable skill progression. Synthetic
data is the feature, not the limitation. It is reproducible, fair, free, and
needs zero API keys. No incumbent can offer a perfectly replayable market.

## Competitive theses

1. Depth where incumbents are shallow. Options analytics is our core product,
   their side tab.
2. Zero friction. Free, instant, no signup, no data vendor, no paywall ladder.
3. AI-native in a way incumbents structurally cannot match. The platform
   exposes its engine to the user's own AI over MCP, and embedded AI features
   ship as opt-in adapters. The industry named this category "agentic
   brokerage" in 2026. Our architecture was already shaped for it.
4. Build velocity. Spec-driven AI agents deliver hours-level cycle times,
   documented publicly in this repo's history.

## AI-native product principles

Deterministic core, intelligent edges.

- All domain math (pricing, payoff, chains, analytics) stays deterministic and
  offline. This keeps the product testable, replayable, and free.
- AI enters through two proven patterns only:
  1. The MCP surface: the user's own agent operates the platform. Today that
     is read-only analytics. The arc is full build, analyze, stress, and order
     control.
  2. Env-flag adapters (the Amplitude pattern): off by default, deterministic
     fallback always, public demo byte-identical.
- Synthetic by default, real-ready by design. Every data and execution
  touchpoint goes through an adapter seam, so real market data or brokerage
  rails are a future integration, never a rewrite.

## Ambition arcs

Four arcs, each a sequence of normal spec cycles under specs/NNN-name/. Arcs
are priorities, not gates, and can interleave. The spec queue, not this doc,
decides what is next. Each arc has an exit test.

### Arc 1: Strategy Intelligence depth

Close the gap with incumbent analyze tools, then pass them. Multi-expiration
payoff modeling (calendars and diagonals). Vol-surface and IV-context
visualization. Margin and buying-power estimates. Richer scenario engine.
Strategy comparison. Order-routing and margining simulation depth.

Exit test: a serious options trader prefers our analyze surface to their
current broker's.

### Arc 2: Trader Development arena

Synthetic data becomes the star. Replayable deterministic market days. Trade
journaling attached to order and position history. Performance analytics over
simulated history. AI trade review. Measurable skill progression.

Exit test: a developing trader measurably improves here and can show it.

### Arc 3: Agentic platform

The MCP surface grows from read-only analytics to full platform control:
build, analyze, stress, order, and review from the user's own AI. A
natural-language strategy copilot ships as an env-flag adapter. Agentic
features get guardrails, logging, and audit trails. AI outputs get an
evaluation and experimentation discipline. Responsible-AI documentation fits
the regulated domain. The repo's own playbook and skills are packaged as the
agent-framework story.

Exit test: a complete strategy lifecycle driven entirely through the user's
own AI agent.

### Arc 4: Breadth and reach

Futures (promote spec 003 from spec-only). Alerts. Mobile layout. Charting
where it serves strategy intelligence. A multi-surface platform story.

Exit test: platform-scope roadmap credibility across surfaces and asset
classes.

## How the vision is enforced

- Constitution Principle VIII requires every feature spec to name its pillar
  and arc. Feature specs that advance no pillar are rejected at spec review.
- CLAUDE.md requires reading this doc before proposing, spec'ing, or planning
  any feature.
- docs/product/spec-queue.md tags every candidate with a pillar and arc.
- docs/product/roadmap.md organizes future work by these arcs.
