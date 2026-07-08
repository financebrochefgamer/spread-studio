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
whether it will be built.

| ID (tentative) | Title | Role signal | Confidence | Dependencies | Notes |
| --- | --- | --- | --- | --- | --- |
| 007 | Databricks event model | "Amplitude, Databricks, or similar" (posting) | High | None | Sample table schema (events_raw, events_clean, sessions) and real SQL against this repo's actual event shape, same pattern as the experiment memo |
| 008 | KPI tree | "Measurable improvements in trade volume, post-trade visibility, and retention" (posting, verbatim) | High | None | Activity to activation to outcome to business-result model tied to this app's actual events |
| - | Platform surface map | "Roadmap... across TITAN X, HUB, and Mobile" (posting) | Medium | None | Generic desktop/web/mobile framing, not TradeStation product names |
| - | Competitive and AI-tooling watchlist | "Evaluate industry and competitive developments... proactively flag shifts" (posting) | Medium | None | Recurring-scan habit, not a one-time matrix |
| - | Release brief (retroactive, for a past ship) | "Manage product launches... documentation generated efficiently using AI" (posting) | Medium | None | Demonstrates the artifact shape more than new capability |
| - | VIP-UX design philosophy note | "Appreciation for what VIP-level active trader UX looks like" (posting) | Low | None | Articulate existing dense/dark UI choices as deliberate, not default |
| 009 | Margin and buying-power estimate | "Broker-dealer platform conventions" (posting) | Medium | None (006 shipped; margin display belongs on the same order-ticket surface it now provides) | Simplified, explicitly labeled estimate per strategy type |
| 010 | Market data adapter | Domain realism | Low | Violates default determinism unless carefully scoped as an opt-in adapter, same pattern as 005 | Provider abstraction with a synthetic default, deferred until there's a concrete reason to add real data risk |

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
