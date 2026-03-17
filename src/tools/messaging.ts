import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod/v4';
import type { LineService } from '../services/line.js';
import { formatLineError } from '../utils/error.js';
import { parseFlexContainer } from '../utils/flex.js';

const targetId = z
  .string()
  .regex(/^[UCR]/, 'Target ID must start with "U", "C", or "R"')
  .describe('Target ID — User ID (U…), Group ID (C…), or Room ID (R…)');

export function registerMessagingTools(
  server: McpServer,
  lineService: LineService,
): void {
  server.registerTool(
    'push_text_message',
    {
      title: 'Push Text Message',
      description:
        'Send a text message to a LINE user, group, or room. ' +
        'Target ID prefixes: User="U", Group="C", Room="R".',
      inputSchema: z.object({
        to: targetId,
        text: z.string().min(1).max(5000).describe('Message text to send'),
      }),
    },
    async ({ to, text }) => {
      try {
        await lineService.pushTextMessage(to, text);
        return {
          content: [{ type: 'text', text: `Text message sent to ${to}` }],
        };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Failed to send: ${formatLineError(error)}` }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    'push_image_message',
    {
      title: 'Push Image Message',
      description: 'Send an image to a LINE user, group, or room.',
      inputSchema: z.object({
        to: targetId,
        originalContentUrl: z
          .string()
          .url()
          .refine((url) => url.startsWith('https://'), {
            message: 'Image URL must use HTTPS',
          })
          .describe('Image URL (HTTPS, JPEG/PNG, max 10 MB)'),
        previewImageUrl: z
          .string()
          .url()
          .refine((url) => url.startsWith('https://'), {
            message: 'Preview URL must use HTTPS',
          })
          .describe('Preview image URL (HTTPS, JPEG/PNG, max 1 MB)'),
      }),
    },
    async ({
      to,
      originalContentUrl,
      previewImageUrl,
    }) => {
      try {
        await lineService.pushImageMessage(to, originalContentUrl, previewImageUrl);
        return {
          content: [{ type: 'text', text: `Image sent to ${to}` }],
        };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Failed to send image: ${formatLineError(error)}` }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    'push_sticker_message',
    {
      title: 'Push Sticker Message',
      description:
        'Send a LINE sticker. See LINE sticker list for valid packageId/stickerId.',
      inputSchema: z.object({
        to: targetId,
        packageId: z.string().min(1).describe('Sticker package ID'),
        stickerId: z.string().min(1).describe('Sticker ID'),
      }),
    },
    async ({ to, packageId, stickerId }) => {
      try {
        await lineService.pushStickerMessage(to, packageId, stickerId);
        return {
          content: [
            {
              type: 'text',
              text: `Sticker (${packageId}/${stickerId}) sent to ${to}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Failed to send sticker: ${formatLineError(error)}` }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    'push_flex_message',
    {
      title: 'Push Flex Message',
      description:
        'Send a Flex Message (rich layout) to a LINE user, group, or room. ' +
        'Pass the Flex container as a JSON string.',
      inputSchema: z.object({
        to: targetId,
        altText: z
          .string()
          .min(1)
          .max(400)
          .describe('Alternative text shown in push notifications (max 400 chars)'),
        contents: z
          .string()
          .min(1)
          .describe('Flex Message container JSON string (bubble or carousel)'),
      }),
    },
    async ({ to, altText, contents }) => {
      const result = parseFlexContainer(contents);
      if (!result.ok) {
        return {
          content: [{ type: 'text', text: result.error }],
          isError: true,
        };
      }

      try {
        await lineService.pushFlexMessage(to, altText, result.container);
        return {
          content: [{ type: 'text', text: `Flex message sent to ${to}` }],
        };
      } catch (error) {
        return {
          content: [
            { type: 'text', text: `Failed to send flex message: ${formatLineError(error)}` },
          ],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    'push_video_message',
    {
      title: 'Push Video Message',
      description: 'Send a video to a LINE user, group, or room.',
      inputSchema: z.object({
        to: targetId,
        originalContentUrl: z
          .string()
          .url()
          .refine((url) => url.startsWith('https://'), {
            message: 'Video URL must use HTTPS',
          })
          .describe('Video URL (HTTPS, MP4)'),
        previewImageUrl: z
          .string()
          .url()
          .refine((url) => url.startsWith('https://'), {
            message: 'Preview URL must use HTTPS',
          })
          .describe('Preview image URL (HTTPS, JPEG/PNG)'),
      }),
    },
    async ({ to, originalContentUrl, previewImageUrl }) => {
      try {
        await lineService.pushVideoMessage(to, originalContentUrl, previewImageUrl);
        return {
          content: [{ type: 'text', text: `Video sent to ${to}` }],
        };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Failed to send video: ${formatLineError(error)}` }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    'push_audio_message',
    {
      title: 'Push Audio Message',
      description: 'Send an audio message to a LINE user, group, or room.',
      inputSchema: z.object({
        to: targetId,
        originalContentUrl: z
          .string()
          .url()
          .refine((url) => url.startsWith('https://'), {
            message: 'Audio URL must use HTTPS',
          })
          .describe('Audio URL (HTTPS, M4A)'),
        duration: z
          .number()
          .int()
          .positive()
          .describe('Audio duration in milliseconds'),
      }),
    },
    async ({ to, originalContentUrl, duration }) => {
      try {
        await lineService.pushAudioMessage(to, originalContentUrl, duration);
        return {
          content: [{ type: 'text', text: `Audio sent to ${to}` }],
        };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Failed to send audio: ${formatLineError(error)}` }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    'push_location_message',
    {
      title: 'Push Location Message',
      description: 'Send a location message to a LINE user, group, or room.',
      inputSchema: z.object({
        to: targetId,
        title: z.string().min(1).max(100).describe('Location title'),
        address: z.string().min(1).max(300).describe('Location address'),
        latitude: z.number().describe('Latitude'),
        longitude: z.number().describe('Longitude'),
      }),
    },
    async ({ to, title, address, latitude, longitude }) => {
      try {
        await lineService.pushLocationMessage(to, title, address, latitude, longitude);
        return {
          content: [{ type: 'text', text: `Location sent to ${to}` }],
        };
      } catch (error) {
        return {
          content: [
            { type: 'text', text: `Failed to send location: ${formatLineError(error)}` },
          ],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    'show_loading_indicator',
    {
      title: 'Show Loading Indicator',
      description:
        'Display a loading animation in the LINE chat to indicate processing.',
      inputSchema: z.object({
        chatId: z.string().min(1).describe('User ID to show the loading animation to'),
      }),
    },
    async ({ chatId }) => {
      try {
        await lineService.showLoadingIndicator(chatId);
        return {
          content: [{ type: 'text', text: `Loading indicator shown for ${chatId}` }],
        };
      } catch (error) {
        return {
          content: [
            { type: 'text', text: `Failed to show loading indicator: ${formatLineError(error)}` },
          ],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    'broadcast_text_message',
    {
      title: 'Broadcast Text Message',
      description:
        'Broadcast a text message to ALL followers of the LINE Official Account. Use with caution.',
      inputSchema: z.object({
        text: z.string().min(1).max(5000).describe('Message text to broadcast'),
      }),
    },
    async ({ text }) => {
      try {
        await lineService.broadcastTextMessage(text);
        return {
          content: [
            { type: 'text', text: 'Broadcast sent to all followers' },
          ],
        };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Failed to broadcast: ${formatLineError(error)}` }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    'multicast_text_message',
    {
      title: 'Multicast Text Message',
      description:
        'Send a text message to multiple LINE users at once (max 500 user IDs).',
      inputSchema: z.object({
        userIds: z
          .array(z.string().min(1))
          .min(1)
          .max(500)
          .describe('Array of User IDs to send to (1–500)'),
        text: z.string().min(1).max(5000).describe('Message text to send'),
      }),
    },
    async ({ userIds, text }) => {
      try {
        await lineService.multicastTextMessage(userIds, text);
        return {
          content: [
            {
              type: 'text',
              text: `Multicast sent to ${userIds.length} users`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Failed to multicast: ${formatLineError(error)}` }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    'broadcast_flex_message',
    {
      title: 'Broadcast Flex Message',
      description:
        'Broadcast a Flex Message (rich layout) to ALL followers of the LINE Official Account. Use with caution.',
      inputSchema: z.object({
        altText: z
          .string()
          .min(1)
          .max(400)
          .describe('Alternative text shown in push notifications (max 400 chars)'),
        contents: z
          .string()
          .min(1)
          .describe('Flex Message container JSON string (bubble or carousel)'),
      }),
    },
    async ({ altText, contents }) => {
      const result = parseFlexContainer(contents);
      if (!result.ok) {
        return {
          content: [{ type: 'text', text: result.error }],
          isError: true,
        };
      }

      try {
        await lineService.broadcastFlexMessage(altText, result.container);
        return {
          content: [{ type: 'text', text: 'Flex message broadcast to all followers' }],
        };
      } catch (error) {
        return {
          content: [
            { type: 'text', text: `Failed to broadcast flex message: ${formatLineError(error)}` },
          ],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    'multicast_flex_message',
    {
      title: 'Multicast Flex Message',
      description:
        'Send a Flex Message (rich layout) to multiple LINE users at once (max 500 user IDs).',
      inputSchema: z.object({
        userIds: z
          .array(z.string().min(1))
          .min(1)
          .max(500)
          .describe('Array of User IDs to send to (1–500)'),
        altText: z
          .string()
          .min(1)
          .max(400)
          .describe('Alternative text shown in push notifications (max 400 chars)'),
        contents: z
          .string()
          .min(1)
          .describe('Flex Message container JSON string (bubble or carousel)'),
      }),
    },
    async ({ userIds, altText, contents }) => {
      const result = parseFlexContainer(contents);
      if (!result.ok) {
        return {
          content: [{ type: 'text', text: result.error }],
          isError: true,
        };
      }

      try {
        await lineService.multicastFlexMessage(userIds, altText, result.container);
        return {
          content: [
            {
              type: 'text',
              text: `Flex message multicast to ${userIds.length} users`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            { type: 'text', text: `Failed to multicast flex message: ${formatLineError(error)}` },
          ],
          isError: true,
        };
      }
    },
  );
}
