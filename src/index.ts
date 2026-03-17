#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { LineMessagingClient } from './services/line.js';
import { registerMessagingTools } from './tools/messaging.js';
import { registerProfileTools } from './tools/profile.js';
import { registerGroupTools } from './tools/group.js';
import { registerRichMenuTools } from './tools/richmenu.js';
import { registerInsightTools } from './tools/insight.js';

const channelAccessToken = process.env.CHANNEL_ACCESS_TOKEN;

if (!channelAccessToken) {
  console.error(
    'Error: CHANNEL_ACCESS_TOKEN environment variable is required.\n' +
      'Get it from https://developers.line.biz/console/',
  );
  process.exit(1);
}

const server = new McpServer({
  name: 'line-mcp-server',
  version: '1.0.0',
});

const lineService = new LineMessagingClient(channelAccessToken);

registerMessagingTools(server, lineService);
registerProfileTools(server, lineService);
registerGroupTools(server, lineService);
registerRichMenuTools(server, lineService);
registerInsightTools(server, lineService);

const transport = new StdioServerTransport();
try {
  await server.connect(transport);
} catch (err) {
  console.error('Failed to start MCP server:', err);
  process.exit(1);
}
