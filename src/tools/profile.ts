import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod/v4';
import type { LineService } from '../services/line.js';
import { formatLineError } from '../utils/error.js';

export function registerProfileTools(
  server: McpServer,
  lineService: LineService,
): void {
  server.registerTool(
    'get_user_profile',
    {
      title: 'Get User Profile',
      description:
        "Get a LINE user's display name, picture URL, status message, and language.",
      inputSchema: z.object({
        userId: z.string().min(1).describe('LINE User ID (starts with "U")'),
      }),
    },
    async ({ userId }) => {
      try {
        const profile = await lineService.getUserProfile(userId);
        return {
          content: [
            { type: 'text', text: JSON.stringify(profile, null, 2) },
          ],
        };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Failed to get profile: ${formatLineError(error)}` }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    'get_group_summary',
    {
      title: 'Get Group Summary',
      description:
        "Get a LINE group's name and picture URL. The bot must be a member of the group.",
      inputSchema: z.object({
        groupId: z.string().min(1).describe('LINE Group ID (starts with "C")'),
      }),
    },
    async ({ groupId }) => {
      try {
        const summary = await lineService.getGroupSummary(groupId);
        return {
          content: [
            { type: 'text', text: JSON.stringify(summary, null, 2) },
          ],
        };
      } catch (error) {
        return {
          content: [
            { type: 'text', text: `Failed to get group summary: ${formatLineError(error)}` },
          ],
          isError: true,
        };
      }
    },
  );

}
