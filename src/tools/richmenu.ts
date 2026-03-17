import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod/v4';
import type { LineService } from '../services/line.js';
import { formatLineError } from '../utils/error.js';

export function registerRichMenuTools(
  server: McpServer,
  lineService: LineService,
): void {
  server.registerTool(
    'create_rich_menu',
    {
      title: 'Create Rich Menu',
      description:
        'Create a new rich menu. Pass the rich menu object as a JSON string.',
      inputSchema: z.object({
        richMenu: z
          .string()
          .min(1)
          .describe('Rich menu object as a JSON string'),
      }),
    },
    async ({ richMenu }) => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(richMenu);
      } catch {
        return {
          content: [
            { type: 'text', text: 'Invalid rich menu: input is not valid JSON' },
          ],
          isError: true,
        };
      }

      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        return {
          content: [
            { type: 'text', text: 'Invalid rich menu: must be a JSON object' },
          ],
          isError: true,
        };
      }

      try {
        const result = await lineService.createRichMenu(parsed as Record<string, unknown>);
        return {
          content: [
            { type: 'text', text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        return {
          content: [
            { type: 'text', text: `Failed to create rich menu: ${formatLineError(error)}` },
          ],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    'list_rich_menus',
    {
      title: 'List Rich Menus',
      description: 'List all rich menus for the LINE Official Account.',
      inputSchema: z.object({}),
    },
    async () => {
      try {
        const menus = await lineService.getRichMenuList();
        return {
          content: [
            { type: 'text', text: JSON.stringify(menus, null, 2) },
          ],
        };
      } catch (error) {
        return {
          content: [
            { type: 'text', text: `Failed to list rich menus: ${formatLineError(error)}` },
          ],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    'get_rich_menu',
    {
      title: 'Get Rich Menu',
      description: 'Get a rich menu by its ID.',
      inputSchema: z.object({
        richMenuId: z.string().min(1).describe('Rich menu ID'),
      }),
    },
    async ({ richMenuId }) => {
      try {
        const menu = await lineService.getRichMenu(richMenuId);
        return {
          content: [
            { type: 'text', text: JSON.stringify(menu, null, 2) },
          ],
        };
      } catch (error) {
        return {
          content: [
            { type: 'text', text: `Failed to get rich menu: ${formatLineError(error)}` },
          ],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    'delete_rich_menu',
    {
      title: 'Delete Rich Menu',
      description: 'Delete a rich menu by its ID.',
      inputSchema: z.object({
        richMenuId: z.string().min(1).describe('Rich menu ID'),
      }),
    },
    async ({ richMenuId }) => {
      try {
        await lineService.deleteRichMenu(richMenuId);
        return {
          content: [
            { type: 'text', text: `Rich menu ${richMenuId} deleted` },
          ],
        };
      } catch (error) {
        return {
          content: [
            { type: 'text', text: `Failed to delete rich menu: ${formatLineError(error)}` },
          ],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    'set_default_rich_menu',
    {
      title: 'Set Default Rich Menu',
      description: 'Set a rich menu as the default for all users.',
      inputSchema: z.object({
        richMenuId: z.string().min(1).describe('Rich menu ID to set as default'),
      }),
    },
    async ({ richMenuId }) => {
      try {
        await lineService.setDefaultRichMenu(richMenuId);
        return {
          content: [
            { type: 'text', text: `Default rich menu set to ${richMenuId}` },
          ],
        };
      } catch (error) {
        return {
          content: [
            { type: 'text', text: `Failed to set default rich menu: ${formatLineError(error)}` },
          ],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    'get_default_rich_menu',
    {
      title: 'Get Default Rich Menu',
      description: 'Get the ID of the default rich menu.',
      inputSchema: z.object({}),
    },
    async () => {
      try {
        const richMenuId = await lineService.getDefaultRichMenuId();
        return {
          content: [
            { type: 'text', text: JSON.stringify({ richMenuId }, null, 2) },
          ],
        };
      } catch (error) {
        return {
          content: [
            { type: 'text', text: `Failed to get default rich menu: ${formatLineError(error)}` },
          ],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    'cancel_default_rich_menu',
    {
      title: 'Cancel Default Rich Menu',
      description: 'Cancel the default rich menu.',
      inputSchema: z.object({}),
    },
    async () => {
      try {
        await lineService.cancelDefaultRichMenu();
        return {
          content: [
            { type: 'text', text: 'Default rich menu canceled' },
          ],
        };
      } catch (error) {
        return {
          content: [
            { type: 'text', text: `Failed to cancel default rich menu: ${formatLineError(error)}` },
          ],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    'link_rich_menu_to_user',
    {
      title: 'Link Rich Menu to User',
      description: 'Link a rich menu to a specific user.',
      inputSchema: z.object({
        userId: z.string().min(1).describe('LINE User ID'),
        richMenuId: z.string().min(1).describe('Rich menu ID'),
      }),
    },
    async ({ userId, richMenuId }) => {
      try {
        await lineService.linkRichMenuToUser(userId, richMenuId);
        return {
          content: [
            { type: 'text', text: `Rich menu ${richMenuId} linked to user ${userId}` },
          ],
        };
      } catch (error) {
        return {
          content: [
            { type: 'text', text: `Failed to link rich menu: ${formatLineError(error)}` },
          ],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    'unlink_rich_menu_from_user',
    {
      title: 'Unlink Rich Menu from User',
      description: 'Unlink the rich menu from a specific user.',
      inputSchema: z.object({
        userId: z.string().min(1).describe('LINE User ID'),
      }),
    },
    async ({ userId }) => {
      try {
        await lineService.unlinkRichMenuFromUser(userId);
        return {
          content: [
            { type: 'text', text: `Rich menu unlinked from user ${userId}` },
          ],
        };
      } catch (error) {
        return {
          content: [
            { type: 'text', text: `Failed to unlink rich menu: ${formatLineError(error)}` },
          ],
          isError: true,
        };
      }
    },
  );
}
