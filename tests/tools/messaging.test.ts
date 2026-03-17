import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { LineService } from '../../src/services/line.js';
import { registerMessagingTools } from '../../src/tools/messaging.js';
import { createMockLineService } from '../helpers/mock-line-service.js';

type ToolHandler = (args: Record<string, unknown>) => Promise<unknown>;

function registerAndCapture(lineService: LineService) {
  const handlers = new Map<string, ToolHandler>();
  const mockServer = {
    registerTool: vi.fn((name: string, _config: unknown, handler: ToolHandler) => {
      handlers.set(name, handler);
    }),
  };
  registerMessagingTools(mockServer as any, lineService);
  return { handlers, mockServer };
}

describe('messaging tools', () => {
  let lineService: LineService;
  let handlers: Map<string, ToolHandler>;

  beforeEach(() => {
    lineService = createMockLineService();
    ({ handlers } = registerAndCapture(lineService));
  });

  it('registers 12 tools', () => {
    expect(handlers.size).toBe(12);
  });

  describe('push_text_message', () => {
    it('sends text and returns success', async () => {
      const result: any = await handlers.get('push_text_message')!({ to: 'U123', text: 'Hi' });
      expect(lineService.pushTextMessage).toHaveBeenCalledWith('U123', 'Hi');
      expect(result.content[0].text).toContain('U123');
      expect(result.isError).toBeUndefined();
    });

    it('returns error on failure', async () => {
      vi.mocked(lineService.pushTextMessage).mockRejectedValue(new Error('network'));
      const result: any = await handlers.get('push_text_message')!({ to: 'U123', text: 'Hi' });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Failed');
    });

    it('returns LINE API status code on API error', async () => {
      const err = Object.assign(new Error('Bad Request'), { statusCode: 400 });
      vi.mocked(lineService.pushTextMessage).mockRejectedValue(err);
      const result: any = await handlers.get('push_text_message')!({ to: 'U123', text: 'Hi' });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('HTTP 400');
    });
  });

  describe('push_image_message', () => {
    it('sends image and returns success', async () => {
      const result: any = await handlers.get('push_image_message')!({
        to: 'C123',
        originalContentUrl: 'https://img.com/a.jpg',
        previewImageUrl: 'https://img.com/p.jpg',
      });
      expect(lineService.pushImageMessage).toHaveBeenCalledWith(
        'C123',
        'https://img.com/a.jpg',
        'https://img.com/p.jpg',
      );
      expect(result.isError).toBeUndefined();
    });

    it('returns error on failure', async () => {
      vi.mocked(lineService.pushImageMessage).mockRejectedValue(new Error('fail'));
      const result: any = await handlers.get('push_image_message')!({
        to: 'C123',
        originalContentUrl: 'https://img.com/a.jpg',
        previewImageUrl: 'https://img.com/p.jpg',
      });
      expect(result.isError).toBe(true);
    });
  });

  describe('push_sticker_message', () => {
    it('sends sticker and returns success', async () => {
      const result: any = await handlers.get('push_sticker_message')!({
        to: 'U123',
        packageId: '446',
        stickerId: '1988',
      });
      expect(lineService.pushStickerMessage).toHaveBeenCalledWith('U123', '446', '1988');
      expect(result.content[0].text).toContain('446/1988');
      expect(result.isError).toBeUndefined();
    });

    it('returns error on failure', async () => {
      vi.mocked(lineService.pushStickerMessage).mockRejectedValue(new Error('fail'));
      const result: any = await handlers.get('push_sticker_message')!({
        to: 'U123',
        packageId: '446',
        stickerId: '1988',
      });
      expect(result.isError).toBe(true);
    });
  });

  describe('push_flex_message', () => {
    const validFlex = JSON.stringify({ type: 'bubble', body: { type: 'box' } });

    it('sends valid flex message', async () => {
      const result: any = await handlers.get('push_flex_message')!({
        to: 'U123',
        altText: 'hello',
        contents: validFlex,
      });
      expect(lineService.pushFlexMessage).toHaveBeenCalledWith(
        'U123',
        'hello',
        { type: 'bubble', body: { type: 'box' } },
      );
      expect(result.isError).toBeUndefined();
    });

    it('returns error for invalid JSON', async () => {
      const result: any = await handlers.get('push_flex_message')!({
        to: 'U123',
        altText: 'hello',
        contents: 'not json{{{',
      });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('not valid JSON');
      expect(lineService.pushFlexMessage).not.toHaveBeenCalled();
    });

    it('returns error for non-object JSON (null)', async () => {
      const result: any = await handlers.get('push_flex_message')!({
        to: 'U123',
        altText: 'hello',
        contents: 'null',
      });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Invalid Flex container');
    });

    it('returns error for array JSON', async () => {
      const result: any = await handlers.get('push_flex_message')!({
        to: 'U123',
        altText: 'hello',
        contents: '[]',
      });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Invalid Flex container');
    });

    it('returns error for object without type field', async () => {
      const result: any = await handlers.get('push_flex_message')!({
        to: 'U123',
        altText: 'hello',
        contents: '{"body": {}}',
      });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Invalid Flex container');
    });

    it('returns error on LINE API failure', async () => {
      vi.mocked(lineService.pushFlexMessage).mockRejectedValue(new Error('fail'));
      const result: any = await handlers.get('push_flex_message')!({
        to: 'U123',
        altText: 'hello',
        contents: validFlex,
      });
      expect(result.isError).toBe(true);
    });
  });

  describe('broadcast_text_message', () => {
    it('broadcasts and returns success', async () => {
      const result: any = await handlers.get('broadcast_text_message')!({ text: 'Hello all' });
      expect(lineService.broadcastTextMessage).toHaveBeenCalledWith('Hello all');
      expect(result.isError).toBeUndefined();
    });

    it('returns error on failure', async () => {
      vi.mocked(lineService.broadcastTextMessage).mockRejectedValue(new Error('fail'));
      const result: any = await handlers.get('broadcast_text_message')!({ text: 'Hello all' });
      expect(result.isError).toBe(true);
    });
  });

  describe('multicast_text_message', () => {
    it('multicasts and returns success', async () => {
      const result: any = await handlers.get('multicast_text_message')!({
        userIds: ['U001', 'U002'],
        text: 'Hi',
      });
      expect(lineService.multicastTextMessage).toHaveBeenCalledWith(['U001', 'U002'], 'Hi');
      expect(result.content[0].text).toContain('2 users');
      expect(result.isError).toBeUndefined();
    });

    it('returns error on failure', async () => {
      vi.mocked(lineService.multicastTextMessage).mockRejectedValue(new Error('fail'));
      const result: any = await handlers.get('multicast_text_message')!({
        userIds: ['U001'],
        text: 'Hi',
      });
      expect(result.isError).toBe(true);
    });
  });

  describe('push_video_message', () => {
    it('sends video and returns success', async () => {
      const result: any = await handlers.get('push_video_message')!({
        to: 'U123',
        originalContentUrl: 'https://vid.com/a.mp4',
        previewImageUrl: 'https://img.com/p.jpg',
      });
      expect(lineService.pushVideoMessage).toHaveBeenCalledWith(
        'U123',
        'https://vid.com/a.mp4',
        'https://img.com/p.jpg',
      );
      expect(result.content[0].text).toContain('U123');
      expect(result.isError).toBeUndefined();
    });

    it('returns error on failure', async () => {
      vi.mocked(lineService.pushVideoMessage).mockRejectedValue(new Error('fail'));
      const result: any = await handlers.get('push_video_message')!({
        to: 'U123',
        originalContentUrl: 'https://vid.com/a.mp4',
        previewImageUrl: 'https://img.com/p.jpg',
      });
      expect(result.isError).toBe(true);
    });
  });

  describe('push_audio_message', () => {
    it('sends audio and returns success', async () => {
      const result: any = await handlers.get('push_audio_message')!({
        to: 'U123',
        originalContentUrl: 'https://audio.com/a.m4a',
        duration: 60000,
      });
      expect(lineService.pushAudioMessage).toHaveBeenCalledWith(
        'U123',
        'https://audio.com/a.m4a',
        60000,
      );
      expect(result.content[0].text).toContain('U123');
      expect(result.isError).toBeUndefined();
    });

    it('returns error on failure', async () => {
      vi.mocked(lineService.pushAudioMessage).mockRejectedValue(new Error('fail'));
      const result: any = await handlers.get('push_audio_message')!({
        to: 'U123',
        originalContentUrl: 'https://audio.com/a.m4a',
        duration: 60000,
      });
      expect(result.isError).toBe(true);
    });
  });

  describe('push_location_message', () => {
    it('sends location and returns success', async () => {
      const result: any = await handlers.get('push_location_message')!({
        to: 'U123',
        title: 'Office',
        address: '123 Main St',
        latitude: 35.6895,
        longitude: 139.6917,
      });
      expect(lineService.pushLocationMessage).toHaveBeenCalledWith(
        'U123',
        'Office',
        '123 Main St',
        35.6895,
        139.6917,
      );
      expect(result.content[0].text).toContain('U123');
      expect(result.isError).toBeUndefined();
    });

    it('returns error on failure', async () => {
      vi.mocked(lineService.pushLocationMessage).mockRejectedValue(new Error('fail'));
      const result: any = await handlers.get('push_location_message')!({
        to: 'U123',
        title: 'Office',
        address: '123 Main St',
        latitude: 35.6895,
        longitude: 139.6917,
      });
      expect(result.isError).toBe(true);
    });
  });

  describe('show_loading_indicator', () => {
    it('shows loading and returns success', async () => {
      const result: any = await handlers.get('show_loading_indicator')!({
        chatId: 'U123',
      });
      expect(lineService.showLoadingIndicator).toHaveBeenCalledWith('U123');
      expect(result.content[0].text).toContain('U123');
      expect(result.isError).toBeUndefined();
    });

    it('returns error on failure', async () => {
      vi.mocked(lineService.showLoadingIndicator).mockRejectedValue(new Error('fail'));
      const result: any = await handlers.get('show_loading_indicator')!({
        chatId: 'U123',
      });
      expect(result.isError).toBe(true);
    });
  });

  describe('broadcast_flex_message', () => {
    const validFlex = JSON.stringify({ type: 'bubble', body: { type: 'box' } });

    it('broadcasts valid flex message', async () => {
      const result: any = await handlers.get('broadcast_flex_message')!({
        altText: 'hello',
        contents: validFlex,
      });
      expect(lineService.broadcastFlexMessage).toHaveBeenCalledWith(
        'hello',
        { type: 'bubble', body: { type: 'box' } },
      );
      expect(result.isError).toBeUndefined();
    });

    it('returns error for invalid JSON', async () => {
      const result: any = await handlers.get('broadcast_flex_message')!({
        altText: 'hello',
        contents: 'not json{{{',
      });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('not valid JSON');
      expect(lineService.broadcastFlexMessage).not.toHaveBeenCalled();
    });

    it('returns error for invalid flex type', async () => {
      const result: any = await handlers.get('broadcast_flex_message')!({
        altText: 'hello',
        contents: '{"type": "invalid"}',
      });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Invalid Flex container');
    });

    it('returns error on LINE API failure', async () => {
      vi.mocked(lineService.broadcastFlexMessage).mockRejectedValue(new Error('fail'));
      const result: any = await handlers.get('broadcast_flex_message')!({
        altText: 'hello',
        contents: validFlex,
      });
      expect(result.isError).toBe(true);
    });
  });

  describe('multicast_flex_message', () => {
    const validFlex = JSON.stringify({ type: 'carousel', contents: [] });

    it('multicasts valid flex message', async () => {
      const result: any = await handlers.get('multicast_flex_message')!({
        userIds: ['U001', 'U002'],
        altText: 'hello',
        contents: validFlex,
      });
      expect(lineService.multicastFlexMessage).toHaveBeenCalledWith(
        ['U001', 'U002'],
        'hello',
        { type: 'carousel', contents: [] },
      );
      expect(result.content[0].text).toContain('2 users');
      expect(result.isError).toBeUndefined();
    });

    it('returns error for invalid JSON', async () => {
      const result: any = await handlers.get('multicast_flex_message')!({
        userIds: ['U001'],
        altText: 'hello',
        contents: 'bad json',
      });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('not valid JSON');
      expect(lineService.multicastFlexMessage).not.toHaveBeenCalled();
    });

    it('returns error for invalid flex type', async () => {
      const result: any = await handlers.get('multicast_flex_message')!({
        userIds: ['U001'],
        altText: 'hello',
        contents: '[]',
      });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Invalid Flex container');
    });

    it('returns error on LINE API failure', async () => {
      vi.mocked(lineService.multicastFlexMessage).mockRejectedValue(new Error('fail'));
      const result: any = await handlers.get('multicast_flex_message')!({
        userIds: ['U001'],
        altText: 'hello',
        contents: validFlex,
      });
      expect(result.isError).toBe(true);
    });
  });
});
