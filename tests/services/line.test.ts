import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockPushMessage = vi.fn().mockResolvedValue({});
const mockBroadcast = vi.fn().mockResolvedValue({});
const mockMulticast = vi.fn().mockResolvedValue({});
const mockGetProfile = vi.fn();
const mockGetGroupSummary = vi.fn();
vi.mock('@line/bot-sdk', () => ({
  messagingApi: {
    MessagingApiClient: class {
      pushMessage = mockPushMessage;
      broadcast = mockBroadcast;
      multicast = mockMulticast;
      getProfile = mockGetProfile;
      getGroupSummary = mockGetGroupSummary;
    },
  },
}));

import { LineMessagingClient } from '../../src/services/line.js';

describe('LineMessagingClient', () => {
  let service: LineMessagingClient;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new LineMessagingClient('test-token');
  });

  describe('pushTextMessage', () => {
    it('calls pushMessage with text', async () => {
      await service.pushTextMessage('U123', 'Hello');
      expect(mockPushMessage).toHaveBeenCalledWith({
        to: 'U123',
        messages: [{ type: 'text', text: 'Hello' }],
      });
    });
  });

  describe('pushImageMessage', () => {
    it('calls pushMessage with image URLs', async () => {
      await service.pushImageMessage('C123', 'https://img.com/a.jpg', 'https://img.com/p.jpg');
      expect(mockPushMessage).toHaveBeenCalledWith({
        to: 'C123',
        messages: [
          {
            type: 'image',
            originalContentUrl: 'https://img.com/a.jpg',
            previewImageUrl: 'https://img.com/p.jpg',
          },
        ],
      });
    });
  });

  describe('pushStickerMessage', () => {
    it('calls pushMessage with sticker', async () => {
      await service.pushStickerMessage('U123', '446', '1988');
      expect(mockPushMessage).toHaveBeenCalledWith({
        to: 'U123',
        messages: [{ type: 'sticker', packageId: '446', stickerId: '1988' }],
      });
    });
  });

  describe('pushFlexMessage', () => {
    it('calls pushMessage with flex container', async () => {
      const contents = { type: 'bubble' as const, body: { type: 'box' } };
      await service.pushFlexMessage('U123', 'alt text', contents);
      expect(mockPushMessage).toHaveBeenCalledWith({
        to: 'U123',
        messages: [{ type: 'flex', altText: 'alt text', contents }],
      });
    });
  });

  describe('broadcastTextMessage', () => {
    it('calls broadcast with text', async () => {
      await service.broadcastTextMessage('Hello everyone');
      expect(mockBroadcast).toHaveBeenCalledWith({
        messages: [{ type: 'text', text: 'Hello everyone' }],
      });
    });
  });

  describe('multicastTextMessage', () => {
    it('calls multicast with user IDs and text', async () => {
      await service.multicastTextMessage(['U001', 'U002'], 'Hi');
      expect(mockMulticast).toHaveBeenCalledWith({
        to: ['U001', 'U002'],
        messages: [{ type: 'text', text: 'Hi' }],
      });
    });
  });

  describe('getUserProfile', () => {
    it('returns mapped profile', async () => {
      mockGetProfile.mockResolvedValue({
        displayName: 'Kent',
        userId: 'U123',
        pictureUrl: 'https://pic.com/kent.jpg',
        statusMessage: 'Coding',
        language: 'zh-TW',
      });
      const profile = await service.getUserProfile('U123');
      expect(profile).toEqual({
        displayName: 'Kent',
        userId: 'U123',
        pictureUrl: 'https://pic.com/kent.jpg',
        statusMessage: 'Coding',
        language: 'zh-TW',
      });
      expect(mockGetProfile).toHaveBeenCalledWith('U123');
    });

    it('handles profile with only required fields', async () => {
      mockGetProfile.mockResolvedValue({
        displayName: 'Min',
        userId: 'U456',
      });
      const profile = await service.getUserProfile('U456');
      expect(profile).toEqual({
        displayName: 'Min',
        userId: 'U456',
        pictureUrl: undefined,
        statusMessage: undefined,
        language: undefined,
      });
    });

    it('propagates SDK errors', async () => {
      mockGetProfile.mockRejectedValue(new Error('SDK failure'));
      await expect(service.getUserProfile('U123')).rejects.toThrow('SDK failure');
    });
  });

  describe('getGroupSummary', () => {
    it('returns mapped group summary', async () => {
      mockGetGroupSummary.mockResolvedValue({
        groupId: 'C456',
        groupName: 'Dev Team',
        pictureUrl: 'https://pic.com/group.jpg',
      });
      const summary = await service.getGroupSummary('C456');
      expect(summary).toEqual({
        groupId: 'C456',
        groupName: 'Dev Team',
        pictureUrl: 'https://pic.com/group.jpg',
      });
      expect(mockGetGroupSummary).toHaveBeenCalledWith('C456');
    });

    it('handles group without pictureUrl', async () => {
      mockGetGroupSummary.mockResolvedValue({
        groupId: 'C789',
        groupName: 'No Pic Group',
      });
      const summary = await service.getGroupSummary('C789');
      expect(summary).toEqual({
        groupId: 'C789',
        groupName: 'No Pic Group',
        pictureUrl: undefined,
      });
    });

    it('propagates SDK errors', async () => {
      mockGetGroupSummary.mockRejectedValue(new Error('forbidden'));
      await expect(service.getGroupSummary('C456')).rejects.toThrow('forbidden');
    });
  });

  describe('pushTextMessage', () => {
    it('propagates SDK errors', async () => {
      mockPushMessage.mockRejectedValue(new Error('push failed'));
      await expect(service.pushTextMessage('U123', 'Hi')).rejects.toThrow('push failed');
    });
  });

});
