# Tasks: Analytics MCP Server

**Input**: spec.md (approved in PR #4) and plan.md in this directory.
**Tests**: Required per constitution. TDD for mcp/handlers.ts; manual inspector
verification for the transport layer (per plan.md's stated scope decision).

## Phase 1: Dependencies and pure handlers (TDD)

- [x] T201 Add `@modelcontextprotocol/sdk`, `zod` (dependencies) and `tsx` (devDependency) to `package.json`; add `"mcp": "tsx mcp/server.ts"` script; `npm install`
- [x] T202 [TDD] Write failing tests 1-7 from plan.md in `tests/unit/mcp-handlers.test.ts`, then implement `mcp/handlers.ts` (getFunnelResult, getTemplatePopularityResult, getEventCountsResult) until green

## Phase 2: Server entry point

- [ ] T203 Implement `mcp/server.ts` per plan.md: McpServer, three registerTool calls (get_funnel, get_template_popularity with explicit limit validation returning isError, get_event_counts), StdioServerTransport, no stdout writes outside the SDK
- [ ] T204 Boot smoke check: run `npx tsx mcp/server.ts` from repo root, confirm it starts without a module resolution error and without crashing (Ctrl+C to stop); this is the FR-005 risk check plan.md named

## Phase 3: Verification and docs

- [ ] T205 Manual verification with `npx @modelcontextprotocol/inspector npx tsx mcp/server.ts` per plan.md's exact checklist (counts match reference numbers, template field name, all 10 events present, limit 0 and limit 1.5 both return isError). Record the actual output in the implementation report.
- [ ] T206 Create `docs/mcp/claude-config-example.json` per plan.md
- [ ] T207 Add the "MCP server" section to `README.md`: what it exposes, the config snippet, the inspector verification command
- [ ] T208 Full local suite green: `npm run test`, `npm run build` (confirm the new mcp/ directory and deps don't break the Next.js build), `npx playwright test`
- [ ] T209 Open implementation PR; independent review; address findings
- [ ] T210 Merge; no deploy step needed (the MCP server is not part of the Vercel-deployed app); update roadmap status
