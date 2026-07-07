# UI and Event Contracts

Date: 2026-07-06

## Routes

| Route | Purpose | Primary verification |
| --- | --- | --- |
| `/` | Strategy builder, option chain, analysis, and order ticket | Build an iron condor and place a simulated order |
| `/orders` | Simulated order history and saved strategy reload | Confirmed orders and saved strategies are visible |
| `/analytics` | Funnel, template popularity, and live session events | Seeded data renders and live counts update |

## Required test ids

| Surface | Test id contract |
| --- | --- |
| Underlying picker | `underlying-{symbol}` |
| Chain table | `chain-table` |
| Template button | `template-{templateId}` |
| Leg row | `leg-{index}` |
| Max loss metric | `metric-max-loss` |
| Breakevens metric | `metric-breakevens` |
| Payoff chart | `payoff-chart` |
| Open ticket button | `open-ticket` |
| Confirm order button | `confirm-order` |
| Close ticket button | `close-ticket` |
| Order history row | `order-row` |
| Funnel stage | `funnel-stage-{eventName}` |
| Live session count | `live-{eventName}` |

## Event names

The app must emit only event names defined in `docs/product/success-metrics.md`:

- `page_view`
- `chain_viewed`
- `template_selected`
- `leg_edited`
- `strategy_analyzed`
- `order_ticket_opened`
- `order_placed`
- `strategy_saved`

## Analytics property contract

| Event | Required properties |
| --- | --- |
| `page_view` | `path` |
| `chain_viewed` | `underlying` |
| `template_selected` | `template`, `underlying` |
| `leg_edited` | `action`, `legs` |
| `strategy_analyzed` | `underlying`, `legs`, optional `template` |
| `order_ticket_opened` | `underlying`, `legs` |
| `order_placed` | `underlying`, `legs`, `net_premium` |
| `strategy_saved` | `underlying`, `legs` |

## Persistence keys

| Key | Contents |
| --- | --- |
| `spread-studio:events` | Live analytics events, capped at 2000 |
| `spread-studio:orders` | Simulated confirmed orders |
| `spread-studio:strategies` | Saved strategies |
| `spread-studio:session-id` | Browser session id in sessionStorage |
