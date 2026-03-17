import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import type { LineService } from '../../src/services/line.js';
import { registerMessagingTools } from '../../src/tools/messaging.js';
import { registerProfileTools } from '../../src/tools/profile.js';
import { registerGroupTools } from '../../src/tools/group.js';
import { registerRichMenuTools } from '../../src/tools/richmenu.js';
import { registerInsightTools } from '../../src/tools/insight.js';
import { createMockLineService } from '../helpers/mock-line-service.js';

// --- All tools and their test arguments ---
const TOOL_CALLS: Record<string, Record<string, unknown>> = {
  // Messaging
  push_text_message: { to: 'U001', text: 'Hello' },
  push_image_message: {
    to: 'U001',
    originalContentUrl: 'https://img.com/a.jpg',
    previewImageUrl: 'https://img.com/p.jpg',
  },
  push_sticker_message: { to: 'U001', packageId: '446', stickerId: '1988' },
  push_flex_message: {
    to: 'U001',
    altText: 'Flex test',
    contents: JSON.stringify({ type: 'bubble', body: { type: 'box' } }),
  },
  push_video_message: {
    to: 'U001',
    originalContentUrl: 'https://vid.com/a.mp4',
    previewImageUrl: 'https://img.com/p.jpg',
  },
  push_audio_message: {
    to: 'U001',
    originalContentUrl: 'https://audio.com/a.m4a',
    duration: 60000,
  },
  push_location_message: {
    to: 'U001',
    title: 'Office',
    address: '123 Main St',
    latitude: 35.6895,
    longitude: 139.6917,
  },
  show_loading_indicator: { chatId: 'U001' },
  broadcast_text_message: { text: 'Hello everyone' },
  broadcast_flex_message: {
    altText: 'Broadcast flex',
    contents: JSON.stringify({ type: 'bubble', body: { type: 'box' } }),
  },
  multicast_text_message: { userIds: ['U001', 'U002'], text: 'Hi' },
  multicast_flex_message: {
    userIds: ['U001', 'U002'],
    altText: 'Multicast flex',
    contents: JSON.stringify({ type: 'carousel', contents: [] }),
  },

  // Profile
  get_user_profile: { userId: 'U001' },
  get_group_summary: { groupId: 'C001' },

  // Group
  get_group_member_count: { groupId: 'C001' },
  get_group_member_ids: { groupId: 'C001' },
  get_group_member_profile: { groupId: 'C001', userId: 'U001' },
  leave_group: { groupId: 'C001' },
  get_room_member_count: { roomId: 'R001' },
  get_room_member_ids: { roomId: 'R001' },
  get_room_member_profile: { roomId: 'R001', userId: 'U001' },
  leave_room: { roomId: 'R001' },

  // Rich Menu
  create_rich_menu: {
    richMenu: JSON.stringify({
      size: { width: 2500, height: 1686 },
      selected: false,
      name: 'Test',
      chatBarText: 'Menu',
      areas: [],
    }),
  },
  list_rich_menus: {},
  get_rich_menu: { richMenuId: 'richmenu-001' },
  delete_rich_menu: { richMenuId: 'richmenu-001' },
  set_default_rich_menu: { richMenuId: 'richmenu-001' },
  get_default_rich_menu: {},
  cancel_default_rich_menu: {},
  link_rich_menu_to_user: { userId: 'U001', richMenuId: 'richmenu-001' },
  unlink_rich_menu_from_user: { userId: 'U001' },

  // Insight
  get_bot_info: {},
  get_message_quota: {},
  get_message_quota_consumption: {},
  get_follower_ids: {},
  get_number_of_followers: { date: '20240101' },
  get_friend_demographics: {},
  get_sent_reply_count: { date: '20240101' },
  get_sent_push_count: { date: '20240101' },
  get_sent_multicast_count: { date: '20240101' },
  get_sent_broadcast_count: { date: '20240101' },
  get_message_deliveries: { date: '20240101' },
  get_message_event: { requestId: 'req-001' },
  get_statistics_per_unit: { customAggregationUnit: 'promotion_a', from: '20240101', to: '20240131' },
};

describe('MCP Server Integration', () => {
  let client: Client;
  let server: McpServer;
  let mockService: LineService;

  beforeAll(async () => {
    server = new McpServer({ name: 'line-mcp-server-test', version: '1.0.0' });
    mockService = createMockLineService();

    registerMessagingTools(server, mockService);
    registerProfileTools(server, mockService);
    registerGroupTools(server, mockService);
    registerRichMenuTools(server, mockService);
    registerInsightTools(server, mockService);

    client = new Client({ name: 'test-client', version: '1.0.0' });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await Promise.all([
      client.connect(clientTransport),
      server.connect(serverTransport),
    ]);
  });

  afterAll(async () => {
    await client.close();
    await server.close();
  });

  it('registers all expected tools', async () => {
    const { tools } = await client.listTools();
    const toolNames = tools.map((t) => t.name).sort();
    const expectedNames = Object.keys(TOOL_CALLS).sort();
    expect(toolNames).toEqual(expectedNames);
  });

  it('every tool has a non-empty description and valid inputSchema', async () => {
    const { tools } = await client.listTools();
    for (const tool of tools) {
      expect(tool.description, `${tool.name} should have a description`).toBeTruthy();
      expect(tool.inputSchema, `${tool.name} should have an inputSchema`).toBeDefined();
      expect(tool.inputSchema.type).toBe('object');
    }
  });

  // Generate a test case for each tool
  for (const [toolName, args] of Object.entries(TOOL_CALLS)) {
    it(`${toolName} — succeeds with valid args`, async () => {
      const result = await client.callTool({ name: toolName, arguments: args });
      expect(result.isError).toBeFalsy();
      expect(result.content).toBeDefined();
      expect(Array.isArray(result.content)).toBe(true);
      expect((result.content as Array<{ type: string }>).length).toBeGreaterThan(0);
      expect((result.content as Array<{ type: string }>)[0].type).toBe('text');
    });
  }

  it('returns isError for a failing tool call', async () => {
    // Make one service method throw
    (mockService.pushTextMessage as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      Object.assign(new Error('API error'), { statusCode: 400 }),
    );
    const result = await client.callTool({
      name: 'push_text_message',
      arguments: { to: 'U001', text: 'fail' },
    });
    expect(result.isError).toBe(true);
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain('400');
  });
});
