import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod/v4';
import type { LineService } from '../services/line.js';
import { formatLineError } from '../utils/error.js';

export function registerGroupTools(
  server: McpServer,
  lineService: LineService,
): void {
  server.registerTool(
    'get_group_member_count',
    {
      title: 'Get Group Member Count',
      description:
        'Get the number of members in a LINE group chat. The bot must be a member of the group.',
      inputSchema: z.object({
        groupId: z.string().min(1).describe('LINE Group ID (starts with "C")'),
      }),
    },
    async ({ groupId }) => {
      try {
        const count = await lineService.getGroupMemberCount(groupId);
        return {
          content: [{ type: 'text', text: `Group member count: ${count}` }],
        };
      } catch (error) {
        return {
          content: [
            { type: 'text', text: `Failed to get group member count: ${formatLineError(error)}` },
          ],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    'get_group_member_ids',
    {
      title: 'Get Group Member IDs',
      description:
        'Get the user IDs of all members in a LINE group chat. The bot must be a member of the group.',
      inputSchema: z.object({
        groupId: z.string().min(1).describe('LINE Group ID (starts with "C")'),
      }),
    },
    async ({ groupId }) => {
      try {
        const memberIds = await lineService.getGroupMemberIds(groupId);
        return {
          content: [
            { type: 'text', text: JSON.stringify(memberIds, null, 2) },
          ],
        };
      } catch (error) {
        return {
          content: [
            { type: 'text', text: `Failed to get group member IDs: ${formatLineError(error)}` },
          ],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    'get_group_member_profile',
    {
      title: 'Get Group Member Profile',
      description:
        "Get a member's profile in a LINE group chat. The bot must be a member of the group.",
      inputSchema: z.object({
        groupId: z.string().min(1).describe('LINE Group ID (starts with "C")'),
        userId: z.string().min(1).describe('LINE User ID (starts with "U")'),
      }),
    },
    async ({ groupId, userId }) => {
      try {
        const profile = await lineService.getGroupMemberProfile(groupId, userId);
        return {
          content: [
            { type: 'text', text: JSON.stringify(profile, null, 2) },
          ],
        };
      } catch (error) {
        return {
          content: [
            { type: 'text', text: `Failed to get group member profile: ${formatLineError(error)}` },
          ],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    'leave_group',
    {
      title: 'Leave Group',
      description:
        'Leave a LINE group chat. Bot will leave the group permanently.',
      inputSchema: z.object({
        groupId: z.string().min(1).describe('LINE Group ID (starts with "C")'),
      }),
    },
    async ({ groupId }) => {
      try {
        await lineService.leaveGroup(groupId);
        return {
          content: [{ type: 'text', text: `Successfully left group ${groupId}` }],
        };
      } catch (error) {
        return {
          content: [
            { type: 'text', text: `Failed to leave group: ${formatLineError(error)}` },
          ],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    'get_room_member_ids',
    {
      title: 'Get Room Member IDs',
      description:
        'Get the user IDs of all members in a LINE multi-person chat room. The bot must be a member of the room.',
      inputSchema: z.object({
        roomId: z.string().min(1).describe('LINE Room ID (starts with "R")'),
      }),
    },
    async ({ roomId }) => {
      try {
        const memberIds = await lineService.getRoomMemberIds(roomId);
        return {
          content: [
            { type: 'text', text: JSON.stringify(memberIds, null, 2) },
          ],
        };
      } catch (error) {
        return {
          content: [
            { type: 'text', text: `Failed to get room member IDs: ${formatLineError(error)}` },
          ],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    'get_room_member_profile',
    {
      title: 'Get Room Member Profile',
      description:
        "Get a member's profile in a LINE multi-person chat room. The bot must be a member of the room.",
      inputSchema: z.object({
        roomId: z.string().min(1).describe('LINE Room ID (starts with "R")'),
        userId: z.string().min(1).describe('LINE User ID (starts with "U")'),
      }),
    },
    async ({ roomId, userId }) => {
      try {
        const profile = await lineService.getRoomMemberProfile(roomId, userId);
        return {
          content: [
            { type: 'text', text: JSON.stringify(profile, null, 2) },
          ],
        };
      } catch (error) {
        return {
          content: [
            { type: 'text', text: `Failed to get room member profile: ${formatLineError(error)}` },
          ],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    'get_room_member_count',
    {
      title: 'Get Room Member Count',
      description:
        'Get the number of members in a LINE multi-person chat room. The bot must be a member of the room.',
      inputSchema: z.object({
        roomId: z.string().min(1).describe('LINE Room ID (starts with "R")'),
      }),
    },
    async ({ roomId }) => {
      try {
        const count = await lineService.getRoomMemberCount(roomId);
        return {
          content: [{ type: 'text', text: `Room member count: ${count}` }],
        };
      } catch (error) {
        return {
          content: [
            { type: 'text', text: `Failed to get room member count: ${formatLineError(error)}` },
          ],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    'leave_room',
    {
      title: 'Leave Room',
      description:
        'Leave a LINE multi-person chat room. Bot will leave the room permanently.',
      inputSchema: z.object({
        roomId: z.string().min(1).describe('LINE Room ID (starts with "R")'),
      }),
    },
    async ({ roomId }) => {
      try {
        await lineService.leaveRoom(roomId);
        return {
          content: [{ type: 'text', text: `Successfully left room ${roomId}` }],
        };
      } catch (error) {
        return {
          content: [
            { type: 'text', text: `Failed to leave room: ${formatLineError(error)}` },
          ],
          isError: true,
        };
      }
    },
  );

}
