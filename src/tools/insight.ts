import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod/v4';
import type { LineService } from '../services/line.js';
import { formatLineError } from '../utils/error.js';

export function registerInsightTools(
  server: McpServer,
  lineService: LineService,
): void {
  server.registerTool(
    'get_bot_info',
    {
      title: 'Get Bot Info',
      description:
        'Get information about the LINE Official Account bot, including name, ID, chat mode, and mark-as-read mode.',
      inputSchema: z.object({}),
    },
    async () => {
      try {
        const info = await lineService.getBotInfo();
        return {
          content: [
            { type: 'text', text: JSON.stringify(info, null, 2) },
          ],
        };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Failed to get bot info: ${formatLineError(error)}` }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    'get_message_quota',
    {
      title: 'Get Message Quota',
      description:
        'Get the message quota for the LINE Official Account, including the quota type and limit.',
      inputSchema: z.object({}),
    },
    async () => {
      try {
        const quota = await lineService.getMessageQuota();
        return {
          content: [
            { type: 'text', text: JSON.stringify(quota, null, 2) },
          ],
        };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Failed to get message quota: ${formatLineError(error)}` }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    'get_message_quota_consumption',
    {
      title: 'Get Message Quota Consumption',
      description:
        'Get the number of messages sent this month for the LINE Official Account.',
      inputSchema: z.object({}),
    },
    async () => {
      try {
        const consumption = await lineService.getMessageQuotaConsumption();
        return {
          content: [
            { type: 'text', text: JSON.stringify(consumption, null, 2) },
          ],
        };
      } catch (error) {
        return {
          content: [
            { type: 'text', text: `Failed to get quota consumption: ${formatLineError(error)}` },
          ],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    'get_follower_ids',
    {
      title: 'Get Follower IDs',
      description:
        'Get a list of user IDs of users who have added the LINE Official Account as a friend. Supports pagination via the start token.',
      inputSchema: z.object({
        start: z.string().optional().describe('Pagination token from a previous response'),
      }),
    },
    async ({ start }) => {
      try {
        const result = await lineService.getFollowerIds(start);
        return {
          content: [
            { type: 'text', text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        return {
          content: [
            { type: 'text', text: `Failed to get follower IDs: ${formatLineError(error)}` },
          ],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    'get_number_of_followers',
    {
      title: 'Get Number of Followers',
      description:
        'Get the number of followers for the LINE Official Account on a specified date. Returns follower count, targeted reaches, and blocks.',
      inputSchema: z.object({
        date: z
          .string()
          .min(1)
          .describe('Date in yyyyMMdd format (e.g. 20240101). Timezone: UTC+9'),
      }),
    },
    async ({ date }) => {
      try {
        const result = await lineService.getNumberOfFollowers(date);
        return {
          content: [
            { type: 'text', text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        return {
          content: [
            { type: 'text', text: `Failed to get number of followers: ${formatLineError(error)}` },
          ],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    'get_friend_demographics',
    {
      title: 'Get Friend Demographics',
      description:
        'Get demographic information about the LINE Official Account\'s friends, including gender, age, and area breakdowns.',
      inputSchema: z.object({}),
    },
    async () => {
      try {
        const result = await lineService.getFriendDemographics();
        return {
          content: [
            { type: 'text', text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        return {
          content: [
            { type: 'text', text: `Failed to get friend demographics: ${formatLineError(error)}` },
          ],
          isError: true,
        };
      }
    },
  );

}
