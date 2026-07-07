import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { seededEvents } from '@/lib/analytics/seed';
import { getEventCountsResult, getFunnelResult, getTemplatePopularityResult } from './handlers';

// Read-only, local, stdio-transport MCP server over this repo's deterministic
// seeded analytics dataset (spec 004). No write tools, no network port, no
// console.log anywhere in this file or anything it imports at module scope:
// stdout is reserved for the SDK's own framed JSON-RPC stream.

const server = new McpServer({ name: 'spread-studio-analytics', version: '1.0.0' });

server.registerTool(
  'get_funnel',
  {
    title: 'Get activation funnel',
    description:
      'Returns the five-stage activation funnel (chain_viewed, strategy_built, strategy_analyzed, ' +
      'order_placed, position_closed) as session counts, computed by aggregateFunnel over this repo\'s ' +
      'deterministic seeded dataset (120 sessions). Also returns percentOfChainViewed per stage. ' +
      'Data source is a fixed local seed, not live browser sessions: this process has no access to a ' +
      'browser\'s localStorage.',
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  async () => {
    const result = getFunnelResult(seededEvents());
    return { content: [{ type: 'text', text: JSON.stringify(result) }], structuredContent: result };
  },
);

server.registerTool(
  'get_template_popularity',
  {
    title: 'Get template popularity',
    description:
      'Returns strategy template usage counts, sorted descending by count, computed by templatePopularity ' +
      'over this repo\'s deterministic seeded dataset. Optional limit truncates to the top N entries. ' +
      'Data source is a fixed local seed, not live browser sessions.',
    inputSchema: { limit: z.number().int().positive().optional() },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  async ({ limit }) => {
    if (limit !== undefined && !(Number.isInteger(limit) && limit > 0)) {
      return { content: [{ type: 'text', text: 'limit must be a positive integer' }], isError: true };
    }
    const result = getTemplatePopularityResult(seededEvents(), limit);
    return { content: [{ type: 'text', text: JSON.stringify(result) }], structuredContent: { templates: result } };
  },
);

server.registerTool(
  'get_event_counts',
  {
    title: 'Get event counts',
    description:
      'Returns a count for every tracked event name (the 10 names in EVENT_NAMES), zero-filled for names ' +
      'that never fired, computed by countEventsByName over this repo\'s deterministic seeded dataset. ' +
      'Data source is a fixed local seed, not live browser sessions.',
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  async () => {
    const result = getEventCountsResult(seededEvents());
    return { content: [{ type: 'text', text: JSON.stringify(result) }], structuredContent: result };
  },
);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

void main();
