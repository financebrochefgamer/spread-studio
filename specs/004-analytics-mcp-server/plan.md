# Implementation Plan: Analytics MCP Server

**Branch**: `004-mcp-implementation` | **Spec**: specs/004-analytics-mcp-server/spec.md | **Date**: 2026-07-07

## Summary

A local stdio MCP server exposing three read-only tools (get_funnel,
get_template_popularity, get_event_counts) over the existing deterministic seed
dataset, built with the official @modelcontextprotocol/sdk and run via tsx (resolves
this repo's existing `@/` tsconfig path alias with no import rewrites).

## Verified SDK API (checked against official docs/examples, not assumed)

```ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const server = new McpServer({ name: 'spread-studio-analytics', version: '1.0.0' });

server.registerTool(
  'tool_name',
  { title: '...', description: '...', inputSchema: SomeZodObjectSchema, annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false } },
  async (params) => ({ content: [{ type: 'text', text: JSON.stringify(output) }], structuredContent: output }),
);

const transport = new StdioServerTransport();
await server.connect(transport);
```

New dependencies (per spec SC-3): `@modelcontextprotocol/sdk`, `zod` (runtime);
`tsx` (dev). stdio transport rule: never write to stdout except the SDK's own framed
JSON-RPC; any diagnostic logging must go to stderr (`console.error`, never
`console.log`) or it corrupts the protocol stream.

## Module layout

- `mcp/handlers.ts` (pure, unit tested, no MCP SDK import): the three functions the
  spec calls tool handlers, taking an injected `AnalyticsEvent[]` (spec Edge Cases),
  so they are testable without booting a transport and reusable if the server is
  ever exposed a different way.
  - `getFunnelResult(events: AnalyticsEvent[]): { counts: FunnelCounts; percentOfChainViewed: Record<FunnelStage, number> }` — calls `aggregateFunnel(events)` unchanged for `counts`; computes `percentOfChainViewed[stage] = counts.chain_viewed === 0 ? 0 : Math.round((counts[stage] / counts.chain_viewed) * 1000) / 10` for every stage (one decimal place, per spec's exact formula).
  - `getTemplatePopularityResult(events: AnalyticsEvent[], limit?: number): { template: TemplateId; count: number }[]` — calls `templatePopularity(events)` unchanged, then `limit === undefined ? all : all.slice(0, limit)`. Does NOT validate limit (validation lives in the tool layer per spec's isError requirement, see mcp/server.ts below); this function assumes a valid positive integer or undefined.
  - `getEventCountsResult(events: AnalyticsEvent[]): Record<EventName, number>` — calls `countEventsByName(events)`, then zero-fills every name in `EVENT_NAMES` (lib/analytics/events.ts) that is absent from the partial result.
- `mcp/server.ts` (entry point, not unit tested directly, verified via manual inspector run per spec):
  - Imports `seededEvents` from `@/lib/analytics/seed`, the three functions above from `./handlers`.
  - Registers `get_funnel` (no input), `get_template_popularity` (optional `limit: z.number().int().positive().optional()`), `get_event_counts` (no input).
  - `get_template_popularity`'s handler validates `limit` itself before calling `getTemplatePopularityResult` — if `limit` is present and fails `Number.isInteger(limit) && limit > 0`, returns `{ content: [{ type: 'text', text: 'limit must be a positive integer' }], isError: true }` immediately. This is deliberately explicit in the handler (not left solely to zod's automatic schema rejection) because the spec requires this exact, testable `isError` shape as an acceptance criterion, and relying only on the SDK's built-in validation-error path would make the exact response shape an SDK implementation detail instead of a controlled one.
  - All three handlers call `seededEvents()` fresh per call (cheap, deterministic, avoids any shared mutable state) and pass the result to the corresponding `mcp/handlers.ts` function.
  - Creates `StdioServerTransport`, connects, done. No top-level `console.log` anywhere in this file or anything it imports at module scope.
- `package.json`: add the three dependencies above; add `"mcp": "tsx mcp/server.ts"` to scripts. `tsx` run this way has `process.cwd()` equal to the directory `npm run` was invoked from (repo root when run normally), and tsx resolves `tsconfig.json` (and its `paths`) relative to cwd, so the existing `@/` imports throughout `lib/analytics/*` resolve with zero changes to those files.
- `docs/mcp/claude-config-example.json`: a real, valid Claude Desktop / Claude Code MCP config snippet:
  ```json
  {
    "mcpServers": {
      "spread-studio-analytics": {
        "command": "npx",
        "args": ["tsx", "mcp/server.ts"],
        "cwd": "/absolute/path/to/spread-studio"
      }
    }
  }
  ```
  (placeholder path, with a README note to replace it with the local clone's absolute path).
- `README.md`: new "MCP server" section: what it exposes, the three tools, the config
  snippet above, and the inspector verification command (see Verification below).

## Constitution check

Read-only, local, stdio-only: no new backend for the app, no database, no network
port, no clock reads, no randomness beyond the existing deterministic seed generator.
Spec approved in PR #4 before this plan.

## Tests

Unit (tests/unit/mcp-handlers.test.ts), against `mcp/handlers.ts` directly (no SDK,
no transport):
1. `getFunnelResult(seededEvents())` returns `counts` exactly `{ chain_viewed: 120, strategy_built: 75, strategy_analyzed: 49, order_placed: 27, position_closed: 0 }` (the reference numbers from docs/product/experiments/001-template-first-onboarding.md, confirmed against the live aggregateFunnel in spec review) and `percentOfChainViewed` computed by the stated formula from those same counts (e.g. strategy_built: round(75/120*100, 1) = 62.5).
2. `getFunnelResult([])` returns all-zero counts and all-zero percentages (zero-denominator rule), not NaN.
3. `getTemplatePopularityResult(seededEvents())` returns the same ordering and counts as `templatePopularity(seededEvents())` directly (cross-check against the existing function, proving no duplicate math).
4. `getTemplatePopularityResult(seededEvents(), 2)` returns exactly 2 entries, the top 2 by count.
5. `getTemplatePopularityResult([])` returns `[]`.
6. `getEventCountsResult(seededEvents())` includes all 10 `EVENT_NAMES` keys, `position_closed` present and 0, and every present count matches `countEventsByName(seededEvents())` for the events that did fire.
7. `getEventCountsResult([])` returns all 10 keys at 0.

Manual verification (recorded as evidence in the implementation report, not automated
per spec's stated scope decision):
```
npx @modelcontextprotocol/inspector npx tsx mcp/server.ts
```
Call all three tools through the inspector UI/CLI; confirm `get_funnel`'s counts match
the numbers above, confirm `get_template_popularity` output field is `template` (not
`templateId`), confirm `get_event_counts` includes all 10 events, and confirm calling
`get_template_popularity` with `limit: 0` and `limit: 1.5` both return `isError: true`
with a text message, not a crash or an uncaught exception in the server process.

## Notes from spec review (must implement)

1. `get_funnel`'s `counts` field must be `aggregateFunnel`'s output completely
   unchanged (no renamed keys, no restructuring); `percentOfChainViewed` is additive,
   not a replacement.
2. Do not write to stdout anywhere except through the SDK's own transport; use
   `console.error` for any diagnostic output during development, and remove it before
   the implementation report's manual verification step if it would appear during a
   normal tool call.
