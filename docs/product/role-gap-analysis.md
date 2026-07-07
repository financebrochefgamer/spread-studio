# Role Gap Analysis: AI-Native Active Trader PM

Date: 2026-07-07
Status: Working guide for future specs
Audience: PM owner, Claude Code, Codex, and reviewers

**Acceptance note (2026-07-07):** authored by an agent working the repo in parallel
during v2 implementation. Reviewed for accuracy and accepted as the working spec
queue; linked from docs/product/roadmap.md. Gap 15 described spec 002 as in-flight
(T113/T114 open); by the time this note was added, spec 002 had merged, deployed to
https://spread-studio.vercel.app, and been verified end to end in production, so treat
that section as a historical snapshot rather than current status. Everything else
holds as forward-looking backlog. Phase 0 in the "Recommended Implementation Roadmap"
section is now complete.

## Purpose

This document maps Spread Studio against an AI-native Active Trader Product Manager
role. The repo already proves a strong core: spec-driven development, AI-agent
execution, options-domain fluency, self-service analytics thinking, tests, CI, and a
deployed demo.

The purpose here is not to downplay that strength. The purpose is to name the remaining
gaps clearly enough that they can become future specs, docs, tests, and demo evidence.

Use this document as a backlog of portfolio-hardening work. Each section explains:

- What the gap is
- Why the role cares
- What the repo currently proves
- What is missing
- What to build or document next
- What to learn along the way

## Executive Summary

Spread Studio is strongest where the role is most unusual:

- It uses specs, plans, and task lists as the source of truth.
- It shows AI agents implementing against those artifacts.
- It targets multi-leg options workflows rather than generic product management.
- It includes analytics events, a funnel, CI, Playwright, and a live demo.
- It now has a second spec cycle for positions and scenario analysis.

The biggest weaknesses are not that the repo lacks effort. They are that some role
requirements are currently simulated, local, or implicit:

- Discovery is synthetic rather than grounded in real trader interviews.
- Analytics is localStorage-based rather than connected to Amplitude, Databricks, or
  an MCP-backed data workflow.
- Cowork or desktop automation is not demonstrated.
- Futures, margin, buying power, compliance, live data, and broker platform constraints
  are deferred.
- Launch, CX, marketing, and stakeholder communication artifacts are not yet present.
- The spec queue is not deep enough to prove ownership of multiple parallel product
  tracks.

The repo can address these without becoming a real brokerage app. The right move is to
add precise product artifacts and deterministic demo implementations that show how these
areas would be handled in a professional environment.

## Current Strengths To Preserve

Do not lose these while filling gaps.

| Strength | Evidence in repo | Why it matters |
| --- | --- | --- |
| Spec-first workflow | `.specify/`, `specs/001-*`, `specs/002-*` | Matches the role's core daily rhythm |
| AI-agent execution | `docs/process/ai-workflow.md`, `docs/process/agent-handoff-review.md` | Shows agent orchestration, not just AI familiarity |
| Options domain | Strategy templates, payoff, Greeks, chain generation, positions scenario work | Maps directly to derivatives-focused active trader needs |
| Measurement mindset | `docs/product/success-metrics.md`, analytics page, event tracking | Shows KPI and funnel thinking before implementation |
| Deterministic demo discipline | Constitution, synthetic chain, no external services | Keeps the demo reliable in interviews |
| Verification | Vitest, Playwright, GitHub Actions, Vercel | Shows quality and spec fidelity |

## Gap Scorecard

| Gap | Current state | Risk if left unresolved | Suggested artifact |
| --- | --- | --- | --- |
| Real customer discovery | Synthesized personas | Looks like a smart demo, not validated PM work | `docs/research/` interview kit and synthesis |
| Cowork and desktop automation | Not shown | Misses one named tool in the role | `docs/process/desktop-automation-playbook.md` |
| Amplitude or Databricks | Local analytics only | Data fluency may appear theoretical | `specs/003-analytics-destination/` |
| MCP analytics workflow | Not shown | Misses "own dashboards through MCP" signal | `docs/process/mcp-analytics-playbook.md` |
| Futures | Roadmap only | Active trader breadth is options-heavy | `specs/003-futures-risk-preview/` or later |
| Margin and buying power | Deferred | Professional trading workflows feel incomplete | `specs/004-margin-buying-power/` |
| Broker order conventions | Simulated ticket only | Broker UX depth is under-demonstrated | Order preview and risk-check spec |
| Compliance and suitability | Basic disclaimer | Broker-dealer context is underdeveloped | Compliance guardrail doc |
| Live or delayed market data | Deferred | No provider integration story | Market data adapter spec |
| Launch and CX | Missing | PM operating model looks code-heavy | Release brief, FAQ, launch checklist |
| Competitive analysis | Missing | Strategy contribution signal is thin | Competitive landscape template |
| Spec queue ownership | Two feature tracks | Does not yet prove multiple deep tracks | Spec queue with scoring and status |
| Mobile/platform breadth | Responsive web only | TITAN X, HUB, Mobile mapping is absent | Platform surface map |
| Business impact | Demo metrics only | Measurable impact is hypothetical | KPI model and experiment plan |

## Gap 1: Real Trader Discovery

### What The Role Expects

The role expects direct customer discovery with VIP active traders. The PM should be able
to gather messy trader feedback, synthesize it with AI, and turn it into spec-ready
briefs.

### What Spread Studio Proves Today

`docs/product/discovery-brief.md` has personas, jobs-to-be-done, pains, and requirement
mapping. It is well structured and useful for agent execution.

### What Is Missing

The discovery is synthetic. That is acceptable for a portfolio demo if it is labeled,
but it does not prove that real trader input was collected or synthesized.

Missing evidence:

- Screener criteria for active trader participants
- Interview guide
- Raw note format
- Synthesis method
- Insight tags
- Decision log showing how findings changed the roadmap
- A clear line from quote or observation to spec requirement

### What To Add

Create a `docs/research/` folder:

- `docs/research/recruiting-criteria.md`
- `docs/research/interview-guide-active-traders.md`
- `docs/research/note-template.md`
- `docs/research/synthesis-2026-07.md`
- `docs/research/insight-to-spec-map.md`

The interview guide should cover:

- Trader profile: account type, underlyings, average order complexity, frequency
- Strategy workflow: discovery, setup, sizing, entry, monitoring, exit
- Tool stack: broker platform, spreadsheet, journal, charting, alerts
- Pain points: order entry, risk preview, post-trade visibility, mobile limitations
- Decision criteria: what makes a tool trustworthy enough for real money
- Metrics: time to structure, abandoned orders, monitoring frequency, support needs

### Learning Notes

Discovery for this role is not just "ask users what they want." It should produce
agent-ready intent.

A useful pattern:

1. Capture raw notes in the user's language.
2. Extract jobs, pains, constraints, and decision triggers.
3. Turn repeated pains into requirements.
4. Turn edge cases into acceptance criteria.
5. Turn uncertainty into explicit assumptions or out-of-scope notes.

AI helps most in steps 2 through 4. It should not invent findings. It should structure
what you observed.

### Spec Candidate

`specs/003-discovery-backed-risk-workflow/`

Goal: Take 3 to 5 real or mock-interview transcripts and produce a ranked set of
product changes with traceability from insight to requirement.

## Gap 2: Cowork And Desktop Automation

### What The Role Expects

The role names Cowork for desktop automation and Claude Code for direct agentic
workflows. The implied behavior is that the PM can use agents not only to write code,
but also to operate tools, validate workflows, capture evidence, and reduce manual
coordination.

### What Spread Studio Proves Today

The repo shows terminal-based agent workflows with Claude Code and Codex. It also uses
Playwright for browser automation, which is adjacent and valuable.

### What Is Missing

There is no explicit Cowork or desktop automation evidence. Because Cowork may be an
internal or unavailable tool, the repo should not pretend to use it. Instead, show a
portable equivalent workflow and document how it would map to Cowork.

### What To Add

Create:

- `docs/process/desktop-automation-playbook.md`

Recommended sections:

- What desktop automation is for
- Which workflows are safe to automate
- Which workflows require human approval
- Example runbook: capture screenshots after deploy
- Example runbook: verify GitHub PR checks
- Example runbook: gather Vercel deployment evidence
- Example runbook: compare live demo against acceptance criteria
- How this maps to Cowork if available

Add scripts or tests only where useful. Playwright is the best repo-native automation
tool for web validation. Do not add fake Cowork wrappers.

### Learning Notes

Desktop automation is different from code generation:

- Code generation changes files.
- Browser automation validates user workflows.
- Desktop automation operates existing apps and sites.
- Agent orchestration decides which tool is appropriate and records evidence.

A strong PM workflow is not "let AI click everything." It is:

1. Define the task.
2. Define success criteria.
3. Let automation do repetitive navigation or validation.
4. Review evidence.
5. Decide what changes.

### Spec Candidate

`docs/process/desktop-automation-playbook.md` first. A feature spec is not required
unless automation changes the product.

## Gap 3: Amplitude, Databricks, And Self-Service Analytics

### What The Role Expects

The role expects the PM to own success measurement dashboards, use internal MCP
connections, monitor KPIs autonomously, and act without waiting for reports.

### What Spread Studio Proves Today

The repo has:

- A tracking plan
- Event names and properties
- Local event persistence
- Seeded analytics
- Funnel and template popularity views
- Tests for analytics aggregation

That is a strong product-thinking signal.

### What Is Missing

The analytics pipeline is local. It does not show how events would move into a real
analytics tool or warehouse.

Missing evidence:

- Destination schema
- User/session identity strategy
- Event validation rules
- Sample Amplitude funnel/dashboard design
- Sample Databricks table model and SQL
- Dashboard operating cadence
- MCP read workflow for querying metrics

### What To Add

Create a new spec:

`specs/003-analytics-destination/`

Possible scope:

- Add an analytics adapter interface
- Keep localStorage as the default implementation
- Add a mock Amplitude adapter that logs payloads in development
- Add event schema validation
- Add sample SQL in `docs/analytics/`
- Add dashboard definitions as Markdown

Suggested docs:

- `docs/analytics/event-schema.md`
- `docs/analytics/amplitude-dashboard-spec.md`
- `docs/analytics/databricks-model.md`
- `docs/analytics/kpi-operating-cadence.md`
- `docs/process/mcp-analytics-playbook.md`

### Learning Notes: Amplitude

Amplitude is commonly used for product analytics. The core objects are:

- Event: something a user did, such as `order_placed`
- Event property: context for the event, such as `underlying` or `legs`
- User property: stable trait about the user or account
- Session: a group of actions in one visit
- Funnel: ordered event sequence
- Cohort: users who match behavior or traits
- Retention: whether users return after an action

For this repo, the natural Amplitude funnel is:

1. `chain_viewed`
2. `template_selected` or `leg_edited`
3. `strategy_analyzed`
4. `order_placed`
5. `position_closed`

The key PM skill is not merely sending events. It is deciding which events matter,
defining them before code exists, and preventing noisy or ambiguous tracking.

### Learning Notes: Databricks

Databricks is often used as a lakehouse and analytics platform. For this product, a
simple model would be:

- `events_raw`: all event payloads exactly as received
- `events_clean`: validated events with typed columns
- `sessions`: one row per user session with derived funnel flags
- `orders`: simulated or real order records
- `positions`: open/closed position lifecycle records

Example questions a PM might answer:

- Which template leads to the highest order-ticket open rate?
- Where do active traders abandon the build-to-order flow?
- Do users who stress-test positions return more often?
- Are high-value traders using multi-leg strategies more than single-leg?

### Learning Notes: MCP

MCP, or Model Context Protocol, lets an AI assistant connect to tools and data sources
through structured interfaces. For a PM analytics workflow, an MCP server might expose:

- Query a dashboard
- Run a saved SQL query
- Fetch recent funnel metrics
- Search customer feedback
- Create a ticket from an insight

The repo can document the desired MCP workflow without needing private company systems.
For example:

1. Ask the agent for yesterday's funnel drop-off.
2. Agent calls an analytics MCP query.
3. Agent summarizes the signal.
4. PM decides whether to open a spec or investigation.
5. Agent writes the first draft of the spec.

## Gap 4: Futures And Broader Derivatives Breadth

### What The Role Expects

The role covers complex options strategies, futures, and derivatives tooling. Spread
Studio is currently strongest in equity options.

### What Spread Studio Proves Today

It proves multi-leg equity options fluency:

- Calls and puts
- Volatility and expirations
- Greeks
- Strategy templates
- Payoff
- Post-entry scenario analysis

### What Is Missing

Futures introduce different conventions:

- Contract multipliers
- Tick sizes and tick values
- Expiration and roll behavior
- Daily settlement and mark-to-market
- Margin models
- Futures options
- Different order and risk conventions

### What To Add

Create a future spec:

`specs/004-futures-risk-preview/`

Keep it deterministic. Do not connect live futures data first. Build a small synthetic
futures universe:

- ES-style equity index future
- CL-style energy future
- ZN-style rate future
- GC-style metals future

For each contract, model:

- Symbol
- Description
- Tick size
- Tick value
- Contract multiplier
- Point value
- Expiration month
- Synthetic last price

Feature idea:

- Futures contract selector
- Quantity input
- Tick/point P&L calculator
- Scenario move in ticks or percent
- Initial and maintenance margin placeholder
- Contract spec panel

### Learning Notes

Equity options P&L usually uses premium x 100 x contracts. Futures P&L is based on the
contract's tick or point value. A one-point move in one product may not mean the same
dollar move as another.

For example, a futures spec usually needs:

- Minimum price increment
- Dollar value of that increment
- Trading hours
- Expiration and settlement rules
- Margin requirements

The PM lesson: never assume all derivatives share the same money convention.

## Gap 5: Margin And Buying Power

### What The Role Expects

Professional active traders care about whether a trade can be placed, how much capital
it consumes, and how risk changes under portfolio constraints.

### What Spread Studio Proves Today

The app shows max profit, max loss, net premium, Greeks, and position P&L. That is
decision support, but not a buying-power model.

### What Is Missing

Missing concepts:

- Buying-power effect
- Reg T style margin
- Defined-risk spread treatment
- Naked option requirements
- Covered vs uncovered classification
- Cash-secured put treatment
- Portfolio margin or stress-based margin
- Futures initial and maintenance margin

### What To Add

Create:

`specs/005-margin-buying-power/`

Keep the model explicitly simplified:

- Covered call: stock value less credit received, or a simplified covered requirement
- Cash-secured put: strike x 100 x contracts minus credit
- Vertical spread: max loss
- Iron condor: wider wing risk minus credit
- Long premium: debit paid
- Naked short option: deterministic simplified formula, clearly labeled

Add a margin explainer:

- `docs/domain/margin-buying-power-primer.md`

### Learning Notes

Max loss and margin are related but not always identical.

- For defined-risk spreads, buying-power effect often approximates max loss.
- For naked options, max loss can be very large or unlimited, while margin is a broker
  requirement that estimates risk under rules.
- For futures, margin is not a down payment. It is performance bond collateral.

The PM should avoid false precision. A demo can say "simplified buying-power estimate"
and still show domain understanding.

## Gap 6: Broker-Dealer Order Entry Conventions

### What The Role Expects

The role mentions broker-dealer platform conventions, order entry UX, and professional
active trader expectations. A simulated order ticket is a good start, but a broker
workflow has more structure.

### What Spread Studio Proves Today

The app has:

- Simulated order ticket
- Mid-price fill assumption
- Order history
- Position lifecycle

### What Is Missing

Potential missing conventions:

- Limit vs market
- Net debit vs net credit display
- Time in force
- Route or venue abstraction
- Order preview and confirmation
- Warnings for wide spreads
- Strategy name/classification
- Options approval level
- Estimated commission and fees
- Buying-power effect
- NBBO and midpoint
- Complex order book eligibility
- Cancel/replace
- Partial fills

### What To Add

Create:

`specs/006-order-preview-risk-checks/`

Scope ideas:

- Add order type and limit price fields
- Display net debit or credit explicitly
- Add deterministic warnings:
  - Wide bid/ask spread
  - Unlimited risk
  - Buying-power estimate unavailable
  - Strategy has more than four legs
- Add order preview step before confirmation
- Add acceptance tests for warnings

### Learning Notes

Order entry UX is not just a form. It is a risk communication surface. The user needs
to know:

- What am I buying or selling?
- Am I paying or receiving premium?
- What is my worst case?
- What can change before fill?
- What capital does this consume?
- What happens after I click confirm?

Professional tools are dense because active traders need answers without hunting.

## Gap 7: Compliance, Suitability, And Trust Guardrails

### What The Role Expects

The job description does not explicitly center compliance, but any broker-dealer
product lives inside compliance and suitability constraints.

### What Spread Studio Proves Today

The README has a clear disclaimer: simulated data, simulated orders, not investment
advice, not a brokerage service.

### What Is Missing

Potential guardrails:

- Persistent in-app simulation label
- Options risk disclosure link placeholder
- No advice wording in UI
- No performance claims
- No hidden real-money implication
- Auditability of simulated actions
- Account approval level concept
- PII and privacy policy posture for analytics

### What To Add

Create:

- `docs/product/compliance-guardrails.md`
- `specs/007-simulation-and-risk-disclosures/`

Small product changes:

- Add a compact "Simulated" label near the order ticket and positions page
- Add deterministic warnings for unlimited-risk strategies
- Add no-advice wording in an unobtrusive place
- Ensure analytics contains no free text and no PII

### Learning Notes

Compliance guardrails should not read like legal theater. They should change product
behavior:

- Prevent misleading labels
- Make risk visible
- Avoid implied recommendations
- Keep user data minimal
- Preserve audit trails for important actions

## Gap 8: Live Or Delayed Market Data

### What The Role Expects

Active trader platforms depend on market data, even if a portfolio demo should avoid
fragile APIs. The PM should understand quote freshness, entitlements, data quality, and
provider constraints.

### What Spread Studio Proves Today

The deterministic chain is a strength. It makes the demo reliable and testable.

### What Is Missing

No data adapter story:

- Provider abstraction
- Delayed vs real-time labels
- Quote timestamp and staleness
- Entitlements
- Rate limits
- Caching
- Retry and fallback
- Error states
- Test doubles

### What To Add

Create:

`specs/008-market-data-adapter/`

Keep deterministic mode as default. Add interfaces and a mock provider:

- `MarketDataProvider`
- `SyntheticMarketDataProvider`
- `MockDelayedMarketDataProvider`
- Quote freshness metadata
- UI labels for simulated, delayed, or real-time
- Test coverage for provider failure

### Learning Notes

Market data is a product surface, not just an API. Users need to know:

- Is this real-time?
- Is it delayed?
- When was it last updated?
- Is it tradable?
- What happens if data is stale?

The PM trap is to say "add live data" without specifying freshness, entitlements,
fallbacks, and UI states.

## Gap 9: Platform Ownership Across Desktop, Web, And Mobile

### What The Role Expects

The role mentions Active Trader ownership across TITAN X, HUB, and Mobile. Even if those
are company-specific surfaces, the PM should show platform-aware thinking.

### What Spread Studio Proves Today

The app is a web demo with a dense desktop-style interface. It has some responsive
layout behavior, but the product story is mainly desktop web.

### What Is Missing

Missing platform mapping:

- Which features belong on desktop first?
- Which workflows make sense on mobile?
- What should mobile show as read-only vs editable?
- What state should carry across platforms?
- What latency or density constraints differ by surface?

### What To Add

Create:

- `docs/product/platform-surface-map.md`
- `specs/009-mobile-position-monitoring/`

Example platform split:

| Workflow | Desktop | Web/HUB | Mobile |
| --- | --- | --- | --- |
| Build complex strategy | Primary | Supported | Limited/edit-light |
| Review payoff and Greeks | Primary | Primary | Summary-first |
| Monitor open positions | Primary | Primary | Primary |
| Close position | Primary | Supported | Supported with strong confirmation |
| Analyze scenario | Rich controls | Rich controls | Preset scenarios first |

### Learning Notes

Platform PM is not "make it responsive." It is deciding where each workflow belongs.
Active traders may build on desktop but monitor on mobile. That changes feature
priority, information density, and alerting.

## Gap 10: Launch, CX, And Cross-Functional Operating Model

### What The Role Expects

The role includes launch management, marketing and CX coordination, documentation, and
communication generated efficiently with AI tooling.

### What Spread Studio Proves Today

The repo has strong product and implementation docs, but not launch artifacts.

### What Is Missing

Missing launch evidence:

- Release brief
- Customer-facing release notes
- CX support FAQ
- Known limitations
- Rollout plan
- Success readout template
- Stakeholder update
- Post-launch metric review

### What To Add

Create:

- `docs/launch/release-brief-v1.md`
- `docs/launch/cx-faq-v1.md`
- `docs/launch/known-limitations-v1.md`
- `docs/launch/post-launch-readout-template.md`

### Learning Notes

Launch work turns shipped code into adopted product. A feature is not really done when
it deploys. It is done when:

- The target user understands it.
- Support knows how to answer questions.
- Stakeholders know what changed.
- Metrics are watched.
- Follow-up decisions are made.

AI can draft release notes and FAQs, but the PM owns accuracy and tone.

## Gap 11: Competitive And Industry Awareness

### What The Role Expects

The PM should evaluate FinTech, AI tooling, and active trader developments, then flag
roadmap implications.

### What Spread Studio Proves Today

There is no explicit competitive analysis artifact.

### What Is Missing

Missing evidence:

- Competitor matrix
- Product pattern inventory
- AI tooling watchlist
- Active trader trend notes
- Decision memos connecting market shifts to roadmap changes

### What To Add

Create:

- `docs/research/competitive-landscape-template.md`
- `docs/research/ai-tooling-watchlist.md`
- `docs/product/decision-log.md`

For a real current competitor analysis, use dated research and cite sources. Avoid
stale claims.

### Learning Notes

Competitive analysis should not become a feature checklist. Better questions:

- What workflow does the competitor optimize?
- What user does it serve best?
- Where does it hide complexity?
- What risk communication patterns does it use?
- What would change our roadmap?

## Gap 12: Deep Spec Queue Ownership

### What The Role Expects

The role says the PM owns the spec queue and keeps engineering agents supplied with
enough precise work that they are never starved for context.

### What Spread Studio Proves Today

The repo has:

- Spec 001: options strategy builder
- Spec 002: positions and scenario analysis
- Roadmap items

That is good, but still a small queue.

### What Is Missing

The repo needs a queue view with:

- Candidate specs
- Status
- Priority
- Confidence
- Dependencies
- User evidence
- Estimated agent complexity
- Open questions

### What To Add

Create:

`docs/product/spec-queue.md`

Suggested columns:

- ID
- Title
- Status
- User problem
- Role signal
- Priority
- Evidence
- Dependencies
- Next action

Initial queue candidates:

1. Finish spec 002 review and deploy
2. Analytics destination adapter
3. Margin and buying power estimate
4. Market data adapter
5. Futures risk preview
6. Broker order preview and risk checks
7. Mobile position monitoring
8. Launch/CX package

### Learning Notes

A spec queue is not a backlog dump. It is an inventory of intent that an agent can act
on. Each item should have enough context for a spec to be drafted without a long meeting.

## Gap 13: AI-Generated Code Review Skill

### What The Role Expects

The PM does not need to be the engineer, but should review AI-generated code at a high
level for quality and spec fidelity.

### What Spread Studio Proves Today

The agent handoff review document is excellent evidence. It caught real issues:

- Greeks missing the contract multiplier
- Duplicate order submissions
- Storage failures

### What Is Missing

The review method is documented narratively, but not as a reusable checklist.

### What To Add

Create:

`docs/process/ai-code-review-checklist.md`

Checklist categories:

- Spec fidelity
- Domain math
- Event tracking
- Error and empty states
- Determinism
- Browser storage safety
- Test coverage
- Accessibility basics
- User-facing copy
- No fake or misleading claims

### Learning Notes

For PM review, the best code questions are often product questions:

- Does the behavior match the acceptance criteria?
- Are risk numbers scaled correctly?
- Does the UI tell the truth?
- Are analytics events fired once and with the right properties?
- What happens on reload, empty state, or blocked storage?

## Gap 14: Business Impact And KPI Modeling

### What The Role Expects

The role asks for measurable improvements in trade volume, post-trade visibility, and
retention of high-value active traders.

### What Spread Studio Proves Today

The repo has a tracking plan and activation funnel. It does not yet connect product
changes to business outcomes.

### What Is Missing

Missing product strategy artifacts:

- KPI tree
- Baseline assumptions
- Experiment plan
- Impact forecast
- Guardrail metrics
- Post-launch readout

### What To Add

Create:

- `docs/product/kpi-tree.md`
- `docs/product/experiment-plan-risk-visibility.md`

Example KPI tree:

- Business goal: active trader retention
- Product outcome: more traders understand and manage multi-leg risk
- Leading indicators:
  - Strategy analyzed per session
  - Order ticket open rate
  - Position scenario usage
  - Position close completion
- Guardrails:
  - Abandoned ticket rate
  - Warning dismissal rate
  - Support contacts about order confusion

### Learning Notes

Good PM metrics separate:

- Activity: user did something
- Activation: user reached first value
- Outcome: user changed behavior in a valuable way
- Business result: the company benefited
- Guardrail: no unacceptable harm occurred

For this repo, `strategy_analyzed` is closer to activation than `page_view`. A confirmed
simulated order is deeper engagement, but not necessarily business value unless tied to
real trading behavior.

## Gap 15: Finish The In-Flight Positions Feature

### Current State

The current branch is `002-positions-implementation`. It is ahead of its remote. Local
verification passes:

- `npm run test`: 6 files passed, 28 tests passed
- `npm run build`: passed, including `/positions`

The task list shows:

- T101 through T112 complete
- T113 open: implementation PR, independent review, address findings
- T114 open: merge, deploy to Vercel, verify production e2e, update README feature list
  and roadmap status, refresh local talking points

### Why This Matters

Spec 002 is a strong role-alignment feature because it adds post-trade visibility and
scenario analysis. That maps directly to the job description. But until it is reviewed,
merged, deployed, and reflected in public docs, it is not as strong as the shipped v1.

### What To Do Next

1. Push the branch.
2. Open a PR.
3. Run an independent review focused on spec fidelity and domain math.
4. Address findings.
5. Merge to main.
6. Deploy to Vercel.
7. Run Playwright against production.
8. Update README and roadmap.
9. Update local interview talking points.

### Review Questions For Spec 002

- Does base position P&L round trip to approximately zero for debit and credit entries?
- Are Greeks consistently share-equivalent?
- Does a short premium position gain when days forward increases?
- Does closing ignore scenario sliders as specified?
- Are `scenario_adjusted` and `position_closed` tracked exactly once where expected?
- Does the empty state hide scenario sliders?
- Does analytics show the fifth funnel stage even when count is zero?

## Recommended Implementation Roadmap

### Phase 0: Finish What Is Already In Flight

Goal: Make spec 002 public and deployed.

Tasks:

- Finish T113 and T114
- Update README feature list
- Update roadmap status
- Add production verification note

Why first: it converts current branch work into public evidence.

### Phase 1: Add Role-Aligned Process Evidence

Goal: Fill non-code PM gaps quickly.

Tasks:

- Add `docs/product/spec-queue.md`
- Add `docs/process/ai-code-review-checklist.md`
- Add `docs/process/desktop-automation-playbook.md`
- Add `docs/launch/release-brief-v1.md`
- Add `docs/launch/cx-faq-v1.md`

Why second: these are high-signal, low-risk docs that show how the PM operates.

### Phase 2: Make Analytics Vendor-Ready

Goal: Show Amplitude, Databricks, and MCP fluency without needing private credentials.

Tasks:

- Write `specs/003-analytics-destination/`
- Add analytics adapter interface
- Add mock Amplitude adapter
- Add event schema validation
- Add sample SQL and dashboard specs
- Add MCP analytics playbook

Why third: the role explicitly values self-service measurement.

### Phase 3: Add Broker-Grade Risk Depth

Goal: Move from "good demo" to "active trader platform thinking."

Tasks:

- Margin and buying-power spec
- Order preview and risk checks spec
- Compliance guardrails doc
- Market data adapter spec

Why fourth: these prove broker-domain judgment.

### Phase 4: Expand Derivatives And Platform Breadth

Goal: Show roadmap ownership beyond equity options web.

Tasks:

- Futures risk preview spec
- Platform surface map
- Mobile position monitoring spec
- Competitive landscape and decision log

Why fifth: this addresses the breadth of TITAN X, HUB, Mobile, futures, and strategic
contribution.

## Suggested New Files

High priority:

- `docs/product/spec-queue.md`
- `docs/process/ai-code-review-checklist.md`
- `docs/process/desktop-automation-playbook.md`
- `docs/analytics/event-schema.md`
- `docs/analytics/amplitude-dashboard-spec.md`
- `docs/analytics/databricks-model.md`
- `docs/process/mcp-analytics-playbook.md`

Medium priority:

- `docs/research/interview-guide-active-traders.md`
- `docs/research/insight-to-spec-map.md`
- `docs/product/kpi-tree.md`
- `docs/product/platform-surface-map.md`
- `docs/product/compliance-guardrails.md`
- `docs/launch/release-brief-v1.md`
- `docs/launch/cx-faq-v1.md`

Future specs:

- `specs/003-analytics-destination/`
- `specs/004-futures-risk-preview/`
- `specs/005-margin-buying-power/`
- `specs/006-order-preview-risk-checks/`
- `specs/007-simulation-and-risk-disclosures/`
- `specs/008-market-data-adapter/`
- `specs/009-mobile-position-monitoring/`

## Practical Interview Positioning

Use honest language:

"This repo is a deterministic portfolio version of the workflow. I used Spec Kit style
artifacts to make intent executable by agents. The market data and analytics are local
by design so the demo is reliable, but the specs identify where live data, Amplitude,
Databricks, MCP, margin, and broker compliance would plug in."

Avoid overclaiming:

- Do not say real VIP traders were interviewed unless they were.
- Do not say it uses Cowork unless it does.
- Do not say it is broker-ready.
- Do not say local analytics equals Amplitude or Databricks.

Strong claim you can make:

"The repo demonstrates the operating model: discovery to metrics to spec to plan to
tasks to AI-agent implementation to review to deployment. The next hardening step is
to connect the same workflow to real discovery, vendor analytics, and broker-grade
risk constraints."

## Definition Of Done For This Gap Plan

This gap plan is complete when:

- Spec 002 is merged, deployed, and verified in production.
- README names the positions/scenario feature.
- A spec queue exists with at least 6 future candidate specs.
- Analytics has a vendor-ready adapter plan and sample dashboard definitions.
- Research docs distinguish synthetic assumptions from real trader findings.
- A launch/CX packet exists for v1.
- A broker-domain roadmap includes margin, market data, futures, and order risk checks.
- AI-agent review has a reusable checklist.

At that point, the repo will not just embody the role description. It will show a
repeatable operating system for doing the role.
