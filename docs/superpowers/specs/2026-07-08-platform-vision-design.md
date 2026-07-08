# Platform Vision: AI-Native Derivatives Strategy Platform

Date: 2026-07-08
Status: Approved design, pending implementation plan.

## Decision summary

Spread Studio's primary mission changes. It was a job-application portfolio demo.
It is now an ambitious, long-standing product: an AI-native derivatives strategy
platform intended to compete with TradingView, thinkorswim's Analyze tab, and
OptionStrat on strategy intelligence and trader development. Career evidence
becomes a byproduct of building a genuinely competitive product, not the goal.
This document is the approved design for (a) the vision itself and (b) the
mechanism that embeds the vision so every future spec cycle inherits it
automatically.

Decisions made during brainstorming, in order:

1. Platform vision becomes the repo's primary mission.
2. Market data stays synthetic and deterministic by default, indefinitely, as a
   deliberate product identity. But the architecture must stay real-ready:
   every data and execution touchpoint sits behind an adapter seam so real
   market data or brokerage rails are a future integration, never a rewrite.
3. "AI-driven" means both things at once. AI agents build the platform (the PoC
   thesis: one experienced trader-PM directing AI ships at senior-team level).
   AI also powers the platform (agentic and copilot features are the
   user-facing wedge).
4. The competitive wedge is twin pillars: Strategy Intelligence and Trader
   Development.
5. Embedding approach: constitution-anchored. The vision is wired into every
   file that already governs agent behavior, reusing enforcement machinery this
   repo has proven works.

## North star

Spread Studio is the AI-native derivatives strategy platform: the place active
traders build, stress-test, and master multi-leg strategies. It exists to prove
that one experienced trader-PM directing AI agents ships a competitive
active-trader platform at the level of a senior engineering team, with no clash
of ideas between vision and execution.

## Twin pillars

### Pillar 1: Strategy Intelligence

Beat incumbent options analytics at strategy construction, scenario analysis,
and Greeks-level decision support. Incumbents treat options analytics as a
bolted-on tab. For us it is the core product. This pillar grows from everything
already shipped: builder, templates, payoff engine, scenario engine,
broker-grade order ticket.

### Pillar 2: Trader Development

The deterministic practice arena: paper trading, trade journaling, AI trade
review, replayable market scenarios, measurable skill progression. Synthetic
data is the feature here, not the limitation. It is reproducible, fair, free,
and needs zero API keys. Incumbents cannot offer a perfectly replayable market.

## Competitive theses

1. Depth where incumbents are shallow. Options analytics is our core, their tab.
2. Zero friction. Free, instant, no signup, no data vendor, versus TradingView's
   paywall ladder.
3. AI-native in a way incumbents structurally cannot match. The platform exposes
   its engine to the user's own AI over MCP. Embedded AI features ship as
   opt-in adapters. The industry validated this direction in 2026: "agentic
   brokerage" is now a named category (Public's AI Agents, March 2026; Gemini's
   third-party AI connections, April 2026). We are architecturally ahead of it.
4. Build velocity. Spec-driven AI agents deliver hours-level cycle times,
   documented publicly in this repo's history.

## AI-native product principles

Deterministic core, intelligent edges.

- All domain math (pricing, payoff, chains, analytics) stays deterministic and
  offline. This is what makes the product testable, replayable, and free.
- AI enters through two proven patterns only:
  1. The MCP surface. The user's own agent operates the platform. Today that is
     read-only analytics. The arc is full build, analyze, stress, and order
     control.
  2. Env-flag adapters (the Amplitude pattern). Embedded LLM features are off
     by default, the public demo stays byte-identical, and there is always a
     deterministic fallback.
- Synthetic by default, real-ready by design. Every data and execution
  touchpoint goes through an adapter seam (the market-data adapter pattern
  already sketched as spec-queue item 010). Hooking up real data or real
  brokerage rails later is an integration task, not a rewrite.

## Ambition arcs

Four arcs, each a sequence of normal spec cycles under specs/NNN-name/. Arcs
are priorities, not gates. They can interleave. Each arc has an exit test and a
leadership-evidence line. Public docs keep the leadership lines generic; the
verbatim posting captures live in the private layer.

### Arc 1: Strategy Intelligence depth

Close the gap with incumbent analyze tools, then pass them.

- Multi-expiration payoff modeling (calendars and diagonals; the far leg must
  be valued with a pricing model at near expiration, the roadmap's known hard
  problem).
- Vol-surface and IV-context visualization.
- Margin and buying-power estimates (spec-queue item 009).
- Richer scenario engine: multi-leg stress paths, P&L over time.
- Strategy comparison (side-by-side candidate structures).
- Order-routing and margining simulation depth beyond the current ticket.

Exit test: a serious options trader prefers our analyze surface to
thinkorswim's. Leadership evidence: director-level active-trader product
ownership (multi-leg options depth, broker-dealer conventions, order entry UX).

### Arc 2: Trader Development arena

Synthetic data becomes the star.

- Replayable deterministic market days (scenario scripts a trader can rerun).
- Trade journaling attached to real order/position history in the app.
- Performance analytics over simulated history.
- AI trade review (via MCP surface or env-flag adapter, per the principles).
- Skill progression: measurable milestones a developing trader can show.

Exit test: a developing trader measurably improves here and can show it.
Leadership evidence: retention and engagement KPI ownership, customer
discovery translated into product requirements.

### Arc 3: Agentic platform

The MCP surface grows from read-only analytics to full platform control.

- Agent-driven strategy lifecycle: build, analyze, stress, order, review, all
  from the user's own AI.
- Natural-language strategy copilot as an env-flag adapter.
- Guardrails and monitoring for agentic features: what the agent may do,
  logged, auditable.
- Evaluation and experimentation discipline for AI outputs (A/B and POC triage
  applied to AI features, documented).
- Responsible-AI documentation for a regulated-domain product.
- PM enablement as a product artifact: this repo's playbook, skills, and prompt
  patterns packaged as the agent-framework story.

Exit test: a complete strategy lifecycle driven entirely through Claude.
Leadership evidence: director-level AI product ownership (customer-facing AI in
a trading platform, agent frameworks, guardrails, responsible AI).

### Arc 4: Breadth and reach

- Futures: promote spec 003 from spec-only to implemented.
- Alerts.
- Mobile layout.
- Charting where it serves strategy intelligence, not charting for its own sake.
- Multi-surface platform story (desktop, web, mobile framing).

Exit test: platform-scope roadmap credibility across surfaces and asset
classes. Leadership evidence: cross-platform roadmap ownership.

## Embedding mechanism

Every layer that already governs agent behavior gets wired to the vision. This
is the part that makes future iterations inherit the vision automatically.

1. `docs/product/vision.md` (new, public). North star, twin pillars,
   competitive theses, AI-native principles, the four arcs with exit tests.
   Generic language. No company or posting names.
2. `.specify/memory/constitution.md` (amend). Mission statement points to
   vision.md. Determinism reframed as "synthetic by default, real-ready by
   design" with the adapter-seam requirement. New principle: every new spec's
   header names the pillar and arc it advances; a spec that advances none is
   rejected.
3. `CLAUDE.md` (amend). Add to the Process section: read docs/product/vision.md
   before proposing, spec'ing, or planning any feature. Same enforcement
   position as the playbook rule that already works.
4. `docs/product/spec-queue.md` (amend). Candidate backlog reorganized under
   pillar and arc tags. New candidates from the arcs seeded into the table.
5. `docs/product/roadmap.md` (amend). Points to the vision arcs as the
   organizing structure going forward.
6. `CLAUDE.local.md` (amend, private). Standing rules updated: platform vision
   is primary, career evidence is the byproduct. The "every addition must map
   to a posting requirement" rule is replaced by "every addition must advance a
   vision pillar." Evidence map extended with the three leadership-level
   TradeStation postings captured verbatim (AI Products & Platforms Director;
   Product Management Director, Active Trader; Sr. Product Owner, Brokerage
   Services).
7. `docs/process/playbook.md` (append lesson). Record the vision-anchoring
   decision: strategy lives in one north-star doc, and every governing layer
   points at it, so no future session can plan without it.

## What does not change

- Spec-first discipline: no feature code without a spec cycle.
- TDD for domain math, Playwright journey for product behavior, CI green.
- Event-tracking rule: no untracked user-facing features.
- One implementer in the working tree at a time.
- The public demo stays free, deterministic, and free of API keys.
- The public repo never names target companies or postings in README, app
  code, or new docs.

## Error handling and risks

- Scope creep risk: arcs are ambitions, but work still enters only through
  ranked spec-queue items and normal spec cycles. The queue, not the vision,
  decides what is next.
- Vision drift risk: the constitution's pillar-citation rule is the guard. A
  spec that cites no pillar is rejected at spec review.
- Determinism erosion risk: the adapter-seam principle is the guard. Any spec
  touching data or execution must state its seam.
- Private/public leak risk: posting details stay in CLAUDE.local.md and
  professional-development/, which are already gitignored or personal.

## Testing and verification

This change is docs-only. No app code. Verification is:

- Spec self-review (placeholders, contradictions, scope, ambiguity).
- A consistency pass across all seven amended files after implementation.
- The repo's prose rules hold: no em-dashes, short sentences.

## Implementation sketch

One docs-only cycle delivered as a normal PR:

1. Write docs/product/vision.md.
2. Amend constitution, CLAUDE.md, spec-queue, roadmap, playbook.
3. Amend CLAUDE.local.md (not committed; it is gitignored).
4. Consistency pass, then PR review per playbook.

The detailed implementation plan is the next artifact (writing-plans skill).
