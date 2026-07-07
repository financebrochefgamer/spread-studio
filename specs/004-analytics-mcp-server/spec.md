# Feature Specification: Analytics MCP Server

**Feature Branch**: `004-analytics-mcp-server`

**Created**: 2026-07-07

**Status**: In review

**Input**: docs/product/role-gap-analysis.md Gap 3 (Amplitude, Databricks, and
self-service analytics; specifically "MCP analytics workflow... misses 'own
dashboards through MCP' signal"). Directly maps to the target posting's phrase
"self-service analytics dashboards... using internal MCP connections."

## Problem

The role this repo targets expects a PM to query product metrics through an AI agent
connected to internal data, not by waiting on a dashboard someone else built. This
repo already has real metrics (the seeded activation funnel, template popularity,
event counts) but they are only reachable by opening /analytics in a browser. There is
no way for an agent, or a PM working through an agent, to ask "what's the funnel
conversion rate" and get a real, structured answer sourced from this repo's own data.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Query the activation funnel through an agent (Priority: P1)

A PM using Claude Desktop or Claude Code, with this repo's MCP server configured, asks
their agent about product funnel performance. The agent calls the MCP server and
returns real numbers sourced from this repo's own analytics data, not a guess.

**Why this priority**: This is the exact capability the target role names. Without it,
the repo only claims analytics thinking; with it, the repo demonstrates the specific
workflow (agent queries data, PM decides) the posting describes.

**Acceptance**:
- An MCP tool `get_funnel` returns the same five funnel stages and session counts that
  /analytics renders, computed by calling the same `aggregateFunnel` function the web
  app uses (lib/analytics/funnel.ts). No second implementation of funnel math. The
  counts field is exactly `aggregateFunnel`'s return value, key for key.
- The tool additionally returns a `percentOfChainViewed` figure per stage, a value the
  live page does NOT render. Formula, stated exactly so there is one way to build it:
  `round((stageCount / chainViewedCount) * 100, 1)`, using `chain_viewed`'s count as
  the denominator; if `chain_viewed` is 0, every percentage is 0 (not NaN, not an
  error).
- The tool takes no required arguments in v1 (source data is fixed) and returns within
  one second locally.
- Running the server and calling this tool through the official MCP inspector CLI
  produces session counts matching the live /analytics page's funnel numbers exactly.
  Percentages are not compared against the page, since the page has no percentage
  field to compare against; they are verified against the stated formula instead.

### User Story 2 - Query template popularity through an agent (Priority: P2)

The PM asks which strategy templates traders build most often. The agent returns a
ranked list sourced from the same data and function the /analytics page uses.

**Acceptance**:
- An MCP tool `get_template_popularity` returns template id and count pairs, sorted
  descending by count, computed from `templatePopularity` (lib/analytics/funnel.ts).
- Optional argument `limit` (positive integer) truncates the list; omitted means all
  templates with at least one count.

### User Story 3 - Query raw event counts through an agent (Priority: P3)

The PM asks how many times a specific tracked event fired. The agent returns exact
counts per event name.

**Acceptance**:
- An MCP tool `get_event_counts` returns a count for every event name in `EVENT_NAMES`
  (lib/analytics/events.ts, the executable list of 10 events; it agrees with
  docs/product/success-metrics.md's dictionary and is the enumerable contract). The
  handler layers a zero-fill over `countEventsByName`'s return value (which is
  `Partial<Record<EventName, number>>`, only including event names that actually
  fired), so every one of the 10 event names appears in the result, zero if absent.

### Edge cases

- Each tool handler accepts an injected events array (defaulting to `seededEvents()`
  at server startup, not hardcoded inside the handler). This is not extra scope: it is
  what makes "no duplicate math" honest (the handler is a thin wrapper around the
  existing aggregation functions, which already take an events array) and it is what
  makes the zero-events edge case actually testable, since v1's real data source never
  produces zero events on its own.
- Zero-events input: `get_funnel` and `get_event_counts` return all-zero structures
  (percentages 0 per the get_funnel formula's explicit zero-denominator rule), not an
  error; `get_template_popularity` returns an empty list.
- `limit` argument of zero or a non-integer: reject as an MCP tool error result
  (`isError: true` in the tool response), not an uncaught exception, so the rejection
  is visible and mechanically checkable through the inspector CLI. Do not silently
  clamp or ignore.
- The server must never write to disk, open a network port, or make an outbound
  request. It is a read-only, local, stdio-transport process.

## Requirements *(mandatory)*

### Functional

- FR-001: The server exposes exactly the three tools above in v1: `get_funnel`,
  `get_template_popularity`, `get_event_counts`. No write tools, no tools that accept
  free-text queries (typed, deterministic tools only, consistent with the rest of this
  repo's engineering discipline).
- FR-002: Data source in v1 is the deterministic seeded dataset, `seededEvents()`
  exported from lib/analytics/seed.ts (120 sessions), the same generator the live
  /analytics page merges with live browser events. The server has no access to a
  browser's localStorage (a Node process cannot read another process's browser
  storage); it is not in scope for v1 to bridge that gap. This limitation is stated in
  the tool descriptions returned to the connecting agent, not hidden.
- FR-003: No duplicate math. The MCP tool handlers call the existing
  `aggregateFunnel`, `templatePopularity`, and `countEventsByName` functions directly
  (all three from lib/analytics/funnel.ts); they do not reimplement funnel or
  aggregation logic. `templatePopularity`'s return objects use the field name
  `template` (not `templateId`); tool output preserves that field name.
- FR-004: Transport is stdio (the standard for local Claude Desktop and Claude Code
  MCP configuration). No HTTP server, no listening port.
- FR-005: The server is runnable as a standalone script independent of the Next.js
  dev/build process (`npm run mcp` or equivalent), because an agent's MCP client
  launches it directly as a subprocess, not through the web app. Named risk: every
  file in the lib/analytics import chain (funnel.ts, seed.ts, events.ts, types.ts)
  uses this repo's `@/` path alias, which Next's bundler and vitest.config.ts resolve
  today but a plain `node` or `tsx` invocation does not resolve automatically. The
  server must run with a mechanism that honors the existing tsconfig.json `paths`
  mapping (tsx supports this natively when pointed at the repo's tsconfig.json) rather
  than rewriting the existing `@/` imports in lib/analytics; plan.md confirms the
  exact invocation and adds a smoke check that the server boots without a module
  resolution error before any tool-level testing.

### Non-functional

- Determinism: identical tool calls always return identical results (the seed
  generator is already deterministic; the server adds no randomness or clock reads).
- Unit tests cover the three tool handlers against known seed-derived values: 120
  chain_viewed, 75 strategy_built, 49 strategy_analyzed, 27 order_placed, 0
  position_closed, the reference numbers established in
  docs/product/experiments/001-template-first-onboarding.md under the
  unordered/reach-count reading that `aggregateFunnel` actually computes (this is not
  yet asserted anywhere in tests/unit/analytics.test.ts, which only checks that
  chain_viewed and page_view counts are greater than zero; this spec's tests are the
  first to pin the exact values).
- Manual verification: a documented, repeatable command using the official MCP
  inspector CLI (`npx @modelcontextprotocol/inspector`) that exercises all three
  tools, recorded as verification evidence in the implementation PR, since a full
  automated MCP-protocol integration test is heavier scope than this feature's value
  justifies for v1.
- A committed example config snippet for Claude Desktop / Claude Code showing how to
  point at this server, so the capability is not just implemented but usable.

## Success criteria *(mandatory)*

- SC-1: Running the documented inspector command and calling all three tools returns
  session counts (get_funnel's counts, get_template_popularity's counts,
  get_event_counts) that match the live /analytics page's numbers exactly, with no
  discrepancy. get_funnel's percentOfChainViewed field, which has no page
  counterpart, is verified against its stated formula instead (see US1).
- SC-2: A reader of the README can go from "this repo has an MCP server" to actually
  connecting an agent to it, using only the documented config snippet and commands.
- SC-3: No new network-listening service, database, or hosted backend is introduced;
  the constitution holds ("no external APIs, no database, no auth" still describes the
  product itself; the MCP server is an additional, separate, local-only, stdio-only
  read tool over existing data). This spec does add two new package.json entries to
  build the server: `@modelcontextprotocol/sdk` (runtime dependency, the tool
  registration and stdio transport) and `tsx` (dev dependency, the script runner that
  resolves the `@/` path alias per FR-005). Both are named here so the addition is
  reviewed as part of this spec, not discovered later in a diff.

## Out of scope (with reasons)

- Bridging live browser localStorage events into the MCP server. Would require either
  a file-export feature in the web app (a real feature, its own spec) or a shared
  backend (violates the deterministic, no-database constitution). Left as a clearly
  named v2 extension.
- Write tools (creating events, modifying data). This is a read-only reporting surface
  by design; a write surface changes the trust model entirely and is not what the
  target role's "own dashboards through MCP" phrase asks for.
- Free-text or natural-language query tools. Typed, deterministic tools keep behavior
  provable and testable; a free-text tool would need its own LLM-in-the-loop
  evaluation story, which is a different feature.
- Remote or authenticated MCP transport (HTTP, SSE with auth). Local stdio is what
  Claude Desktop and Claude Code use directly and is sufficient to demonstrate the
  capability; remote transport is infrastructure the posting does not ask for.
