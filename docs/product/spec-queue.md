# Spec queue

Status: living document, updated as specs move through the cycle documented in
docs/process/playbook.md (spec PR review session, plan, tasks, implementation review,
merge). This is the actual answer to "own the spec queue for your product area;
maintain a pipeline deep enough that engineering agents are never starved for
context."

## Shipped

| ID | Title | Priority signal | Evidence |
| --- | --- | --- | --- |
| 001 | Options strategy builder | Core product | specs/001-options-strategy-builder, live demo |
| 002 | Positions and scenario analysis | Post-trade visibility (posting language) | specs/002-positions-scenario-analysis, PR review across 2 rounds |
| 003 | Futures risk preview | Domain breadth, deliberately spec-only | specs/003-futures-risk-preview, PR review caught a real short-position P/L bug with zero code written |
| 004 | Analytics MCP server | "Self success measurement dashboards... internal MCP connections" (posting language) | specs/004-analytics-mcp-server, PR review across 2 rounds |
| 005 | Amplitude adapter behind env flag | "Amplitude, Databricks, or similar" (posting language) | specs/005-amplitude-adapter, PR review across 3 rounds |
| 006 | Broker-grade order entry | "Broker-dealer platform conventions, order entry UX" (posting language) | specs/006-broker-order-entry, spec PR review across 2 rounds (both caught a real inverted marketability rule, the third recurrence of this repo's signed-money sign-direction bug class), implementation PR review verified the fix by hand and independently confirmed a self-reported wide-spread finding against real generated data |
| - | Trading platform terminology audit | "Appreciation for what VIP-level active trader UX looks like" (posting language) | docs/product/terminology-audit.md, 11 findings fixed including two real defects (raw internal leg ids leaking into a risk warning, raw event names unformatted in the analytics panel), verified against real broker-platform conventions (thinkorswim, TradeStation's own product vocabulary) before any rename, verified visually in a live dev session and in production |

## In progress

None currently.

## Candidate backlog

Ranked by signal-to-effort. Confidence reflects how well-scoped the idea is today, not
whether it will be built. Pillar/arc values come from docs/product/vision.md: P1 is
Strategy Intelligence, P2 is Trader Development, arcs 1-4 are the ambition arcs.
Process artifacts carry "ops" instead of a pillar.

| ID (tentative) | Title | Pillar/arc | Role signal | Confidence | Dependencies | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 007 | Databricks event model | ops | Analytics stack fluency | High | None | Sample table schema (events_raw, events_clean, sessions) and real SQL against this repo's actual event shape, same pattern as the experiment memo |
| 008 | KPI tree | ops | Measurable business outcomes | High | None | Activity to activation to outcome to business-result model tied to this app's actual events |
| 009 | Margin and buying-power estimate | P1 / Arc 1 | Broker-dealer platform conventions | Medium | None (006 shipped; margin display belongs on the order-ticket surface it provides) | Simplified, explicitly labeled estimate per strategy type |
| 010 | Market data adapter | P1 / Arc 1 | Domain realism | Low | Constitution Principle II adapter-seam rules | Provider abstraction with a synthetic default; the reference real-ready seam |
| 011 | Multi-expiration payoff modeling | P1 / Arc 1 | Calendars and diagonals; the known hard problem | Medium | Pricing model valuation of the far leg at near expiration | Unlocks calendar and diagonal templates |
| 012 | Vol-surface and IV-context visualization | P1 / Arc 1 | Options analytics depth | Medium | None | Skew and term structure the chain generator already encodes, made visible |
| 013 | Strategy comparison | P1 / Arc 1 | Decision support | Medium | None | Side-by-side candidate structures on one payoff and Greeks view |
| 014 | Replayable market days | P2 / Arc 2 | Practice arena core | Medium | Scenario engine (002, shipped) | Deterministic scripted market paths a trader can rerun |
| 015 | Trade journal and performance analytics | P2 / Arc 2 | Retention and engagement | Medium | Positions history (002, shipped) | Journal entries attached to orders and positions, stats over simulated history |
| 016 | Agentic MCP control surface | P1+P2 / Arc 3 | Agentic brokerage wave | Medium | MCP server (004, shipped) | Build, analyze, stress, and order via the user's own agent; guardrails and audit log required |
| 017 | Strategy copilot adapter | P1 / Arc 3 | Customer-facing AI | Low | 016 preferred first | Natural-language strategy help behind an env flag, Amplitude adapter pattern |
| - | Platform surface map | ops | Cross-surface roadmap | Medium | None | Generic desktop/web/mobile framing |
| - | Competitive and AI-tooling watchlist | ops | Industry awareness | Medium | None | Recurring-scan habit, not a one-time matrix |
| - | Release brief (retroactive, for a past ship) | ops | Launch documentation | Medium | None | Demonstrates the artifact shape more than new capability |
| - | VIP-UX design philosophy note | ops | Professional-grade UX | Low | None | Articulate existing dense/dark UI choices as deliberate, not default |

## Decisions pending (need a human call, not an agent default)

- **Promote spec 003 (futures) from spec-only to implemented?** The repo currently
  makes a deliberate scope statement (options depth over futures breadth for the
  first cycles). Building it would strengthen domain breadth but reverses that
  statement; worth a real decision, not a default.

## Cycle time evidence

The posting targets "2-5 day feature cycles from intent to working prototype." This
repo's actual git history, spec-open commit to merged-implementation commit:

| Spec | Spec opened | Implementation merged | Elapsed |
| --- | --- | --- | --- |
| 002 (positions/scenario) | 2026-07-07 05:21 | 2026-07-07 10:21 | ~5 hours |
| 004 (MCP server) | 2026-07-07 11:33 | 2026-07-07 15:03 | ~3.5 hours |
| 005 (Amplitude adapter) | 2026-07-07 15:08 | 2026-07-07 15:46 | ~38 minutes |

Honest caveat: these are same-day, continuous-session numbers, not real
organizational cycle time. There was no human scheduling gap, no competing roadmap
work, no meeting overhead between steps. The claim this data actually supports is
narrower and more useful: the mechanical pipeline (spec review, plan, tasks,
implementation, code review, merge) takes hours when nothing blocks it, which means a
2-5 day organizational target is not bottlenecked by agent execution speed. Whatever
makes a real cycle take days instead of hours is human availability, review
scheduling, and competing priorities, not the spec-to-code mechanism itself. That is
worth saying explicitly in an interview rather than letting the fast numbers imply
something they do not prove.

## How this queue stays alive

Every shipped spec updates its row here in the same PR that merges the implementation
(tasks.md's final task already includes "update roadmap status"; this file gets the
same treatment). New candidates get added the moment a gap analysis or a discovery
insight identifies them, even if they sit at low confidence for a long time. An agent
picking up this repo cold should be able to read this table and know exactly what to
work on next without asking.
