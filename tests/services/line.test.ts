import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockPushMessage = vi.fn().mockResolvedValue({});
const mockBroadcast = vi.fn().mockResolvedValue({});
const mockMulticast = vi.fn().mockResolvedValue({});
const mockGetProfile = vi.fn();
const mockGetGroupSummary = vi.fn();
const mockGetBotInfo = vi.fn();
const mockGetMessageQuota = vi.fn();
const mockGetMessageQuotaConsumption = vi.fn();
const mockGetFollowers = vi.fn();
const mockGetNumberOfFollowers = vi.fn();
const mockGetFriendsDemographics = vi.fn();
vi.mock('@line/bot-sdk', () => ({
  messagingApi: {
    MessagingApiClient: class {
      pushMessage = mockPushMessage;
      broadcast = mockBroadcast;
      multicast = mockMulticast;
      getProfile = mockGetProfile;
      getGroupSummary = mockGetGroupSummary;
      getBotInfo = mockGetBotInfo;
      getMessageQuota = mockGetMessageQuota;
      getMessageQuotaConsumption = mockGetMessageQuotaConsumption;
      getFollowers = mockGetFollowers;
    },
  },
  insight: {
    InsightClient: class {
      getNumberOfFollowers = mockGetNumberOfFollowers;
      getFriendsDemographics = mockGetFriendsDemographics;
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

  describe('getBotInfo', () => {
    it('returns mapped bot info', async () => {
      mockGetBotInfo.mockResolvedValue({
        userId: 'U001',
        basicId: '@bot',
        premiumId: '@premium',
        displayName: 'Test Bot',
        pictureUrl: 'https://pic.com/bot.jpg',
        chatMode: 'bot',
        markAsReadMode: 'auto',
      });
      const info = await service.getBotInfo();
      expect(info).toEqual({
        userId: 'U001',
        basicId: '@bot',
        premiumId: '@premium',
        displayName: 'Test Bot',
        pictureUrl: 'https://pic.com/bot.jpg',
        chatMode: 'bot',
        markAsReadMode: 'auto',
      });
    });

    it('handles bot info without optional fields', async () => {
      mockGetBotInfo.mockResolvedValue({
        userId: 'U001',
        basicId: '@bot',
        displayName: 'Test Bot',
        chatMode: 'chat',
        markAsReadMode: 'manual',
      });
      const info = await service.getBotInfo();
      expect(info).toEqual({
        userId: 'U001',
        basicId: '@bot',
        premiumId: undefined,
        displayName: 'Test Bot',
        pictureUrl: undefined,
        chatMode: 'chat',
        markAsReadMode: 'manual',
      });
    });

    it('propagates SDK errors', async () => {
      mockGetBotInfo.mockRejectedValue(new Error('unauthorized'));
      await expect(service.getBotInfo()).rejects.toThrow('unauthorized');
    });
  });

  describe('getMessageQuota', () => {
    it('returns mapped quota', async () => {
      mockGetMessageQuota.mockResolvedValue({
        type: 'limited',
        value: 1000,
      });
      const quota = await service.getMessageQuota();
      expect(quota).toEqual({ type: 'limited', value: 1000 });
    });

    it('handles quota without value', async () => {
      mockGetMessageQuota.mockResolvedValue({
        type: 'none',
      });
      const quota = await service.getMessageQuota();
      expect(quota).toEqual({ type: 'none', value: undefined });
    });

    it('propagates SDK errors', async () => {
      mockGetMessageQuota.mockRejectedValue(new Error('fail'));
      await expect(service.getMessageQuota()).rejects.toThrow('fail');
    });
  });

  describe('getMessageQuotaConsumption', () => {
    it('returns mapped consumption', async () => {
      mockGetMessageQuotaConsumption.mockResolvedValue({
        totalUsage: 500,
      });
      const consumption = await service.getMessageQuotaConsumption();
      expect(consumption).toEqual({ totalUsage: 500 });
    });

    it('propagates SDK errors', async () => {
      mockGetMessageQuotaConsumption.mockRejectedValue(new Error('fail'));
      await expect(service.getMessageQuotaConsumption()).rejects.toThrow('fail');
    });
  });

  describe('getFollowerIds', () => {
    it('returns follower IDs with next token', async () => {
      mockGetFollowers.mockResolvedValue({
        userIds: ['U001', 'U002'],
        next: 'token123',
      });
      const result = await service.getFollowerIds();
      expect(result).toEqual({
        userIds: ['U001', 'U002'],
        next: 'token123',
      });
      expect(mockGetFollowers).toHaveBeenCalledWith(undefined);
    });

    it('passes start token for pagination', async () => {
      mockGetFollowers.mockResolvedValue({
        userIds: ['U003'],
      });
      const result = await service.getFollowerIds('token123');
      expect(result).toEqual({
        userIds: ['U003'],
        next: undefined,
      });
      expect(mockGetFollowers).toHaveBeenCalledWith('token123');
    });

    it('propagates SDK errors', async () => {
      mockGetFollowers.mockRejectedValue(new Error('fail'));
      await expect(service.getFollowerIds()).rejects.toThrow('fail');
    });
  });

  describe('getNumberOfFollowers', () => {
    it('returns mapped follower stats', async () => {
      mockGetNumberOfFollowers.mockResolvedValue({
        status: 'ready',
        followers: 1000,
        targetedReaches: 800,
        blocks: 50,
      });
      const result = await service.getNumberOfFollowers('20240101');
      expect(result).toEqual({
        status: 'ready',
        followers: 1000,
        targetedReaches: 800,
        blocks: 50,
      });
      expect(mockGetNumberOfFollowers).toHaveBeenCalledWith('20240101');
    });

    it('defaults status to unready when undefined', async () => {
      mockGetNumberOfFollowers.mockResolvedValue({});
      const result = await service.getNumberOfFollowers('20240101');
      expect(result.status).toBe('unready');
    });

    it('propagates SDK errors', async () => {
      mockGetNumberOfFollowers.mockRejectedValue(new Error('fail'));
      await expect(service.getNumberOfFollowers('20240101')).rejects.toThrow('fail');
    });
  });

  describe('getFriendDemographics', () => {
    it('returns raw demographics response', async () => {
      const demographics = {
        available: true,
        genders: [{ gender: 'male', percentage: 60 }],
      };
      mockGetFriendsDemographics.mockResolvedValue(demographics);
      const result = await service.getFriendDemographics();
      expect(result).toEqual(demographics);
    });

    it('propagates SDK errors', async () => {
      mockGetFriendsDemographics.mockRejectedValue(new Error('fail'));
      await expect(service.getFriendDemographics()).rejects.toThrow('fail');
    });
  });

});
