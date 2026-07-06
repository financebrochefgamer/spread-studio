# Success Metrics and Tracking Plan

Date: 2026-07-06
Format: Amplitude-style tracking plan. Event names are snake_case and are the single
source of truth: code must use these exact strings.

## North star

Analyzed strategies per session: sessions where a trader sees the full risk picture
(payoff, max loss, breakevens) of a strategy they built.

## Activation funnel

Per session:

1. `chain_viewed` - trader opened an option chain
2. strategy built - first `template_selected` or `leg_edited` in the session
3. `strategy_analyzed` - analysis panel rendered with at least one leg
4. `order_placed` - simulated order confirmed

Target shape for a healthy funnel from seed baseline: 100% / 60% / 45% / 15%.

## Event dictionary

| Event | Trigger | Properties |
| --- | --- | --- |
| `page_view` | route mounted | `path` |
| `chain_viewed` | underlying selected or changed | `underlying` |
| `template_selected` | template applied to builder | `template`, `underlying` |
| `leg_edited` | leg added, updated, or removed | `action` (add/update/remove), `legs` (count) |
| `strategy_analyzed` | analysis panel rendered with >= 1 leg, debounced 800ms | `underlying`, `legs`, `template` (if any) |
| `order_ticket_opened` | ticket modal opened | `underlying`, `legs` |
| `order_placed` | simulated order confirmed | `underlying`, `legs`, `net_premium` |
| `strategy_saved` | strategy saved to list | `underlying`, `legs` |

## Implementation notes

- Events persist to localStorage (`spread-studio:events`), capped at 2000, with
  `source: 'live'`.
- Session id: `crypto.randomUUID()` stored in sessionStorage.
- The /analytics dashboard merges a deterministic seeded dataset (`source: 'seed'`,
  generated in lib/analytics/seed.ts) with live events, and labels them separately.
- v2 wires these same events to a real Amplitude project. See roadmap.md.

## Guardrails

- No PII exists in the product; events must never include free-text input.
- Event volume cap prevents unbounded localStorage growth.
