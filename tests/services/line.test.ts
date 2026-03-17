import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockPushMessage = vi.fn().mockResolvedValue({});
const mockBroadcast = vi.fn().mockResolvedValue({});
const mockMulticast = vi.fn().mockResolvedValue({});
const mockGetProfile = vi.fn();
const mockGetGroupSummary = vi.fn();
const mockGetGroupMemberCount = vi.fn();
const mockGetGroupMembersIds = vi.fn();
const mockGetGroupMemberProfile = vi.fn();
const mockLeaveGroup = vi.fn().mockResolvedValue({});
const mockGetRoomMemberCount = vi.fn();
const mockLeaveRoom = vi.fn().mockResolvedValue({});
vi.mock('@line/bot-sdk', () => ({
  messagingApi: {
    MessagingApiClient: class {
      pushMessage = mockPushMessage;
      broadcast = mockBroadcast;
      multicast = mockMulticast;
      getProfile = mockGetProfile;
      getGroupSummary = mockGetGroupSummary;
      getGroupMemberCount = mockGetGroupMemberCount;
      getGroupMembersIds = mockGetGroupMembersIds;
      getGroupMemberProfile = mockGetGroupMemberProfile;
      leaveGroup = mockLeaveGroup;
      getRoomMemberCount = mockGetRoomMemberCount;
      leaveRoom = mockLeaveRoom;
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

  describe('getGroupMemberCount', () => {
    it('returns the count', async () => {
      mockGetGroupMemberCount.mockResolvedValue({ count: 42 });
      const count = await service.getGroupMemberCount('C123');
      expect(count).toBe(42);
      expect(mockGetGroupMemberCount).toHaveBeenCalledWith('C123');
    });

    it('propagates SDK errors', async () => {
      mockGetGroupMemberCount.mockRejectedValue(new Error('forbidden'));
      await expect(service.getGroupMemberCount('C123')).rejects.toThrow('forbidden');
    });
  });

  describe('getGroupMemberIds', () => {
    it('returns all member IDs from a single page', async () => {
      mockGetGroupMembersIds.mockResolvedValue({
        memberIds: ['U001', 'U002'],
      });
      const ids = await service.getGroupMemberIds('C123');
      expect(ids).toEqual(['U001', 'U002']);
      expect(mockGetGroupMembersIds).toHaveBeenCalledWith('C123', undefined);
    });

    it('paginates through multiple pages', async () => {
      mockGetGroupMembersIds
        .mockResolvedValueOnce({ memberIds: ['U001', 'U002'], next: 'token1' })
        .mockResolvedValueOnce({ memberIds: ['U003'], next: 'token2' })
        .mockResolvedValueOnce({ memberIds: ['U004'] });
      const ids = await service.getGroupMemberIds('C123');
      expect(ids).toEqual(['U001', 'U002', 'U003', 'U004']);
      expect(mockGetGroupMembersIds).toHaveBeenCalledTimes(3);
      expect(mockGetGroupMembersIds).toHaveBeenNthCalledWith(1, 'C123', undefined);
      expect(mockGetGroupMembersIds).toHaveBeenNthCalledWith(2, 'C123', 'token1');
      expect(mockGetGroupMembersIds).toHaveBeenNthCalledWith(3, 'C123', 'token2');
    });

    it('propagates SDK errors', async () => {
      mockGetGroupMembersIds.mockRejectedValue(new Error('forbidden'));
      await expect(service.getGroupMemberIds('C123')).rejects.toThrow('forbidden');
    });
  });

  describe('getGroupMemberProfile', () => {
    it('returns mapped profile', async () => {
      mockGetGroupMemberProfile.mockResolvedValue({
        displayName: 'Alice',
        userId: 'U789',
        pictureUrl: 'https://pic.com/alice.jpg',
      });
      const profile = await service.getGroupMemberProfile('C123', 'U789');
      expect(profile).toEqual({
        displayName: 'Alice',
        userId: 'U789',
        pictureUrl: 'https://pic.com/alice.jpg',
      });
      expect(mockGetGroupMemberProfile).toHaveBeenCalledWith('C123', 'U789');
    });

    it('handles profile without pictureUrl', async () => {
      mockGetGroupMemberProfile.mockResolvedValue({
        displayName: 'Bob',
        userId: 'U456',
      });
      const profile = await service.getGroupMemberProfile('C123', 'U456');
      expect(profile).toEqual({
        displayName: 'Bob',
        userId: 'U456',
        pictureUrl: undefined,
      });
    });

    it('propagates SDK errors', async () => {
      mockGetGroupMemberProfile.mockRejectedValue(new Error('not found'));
      await expect(service.getGroupMemberProfile('C123', 'U789')).rejects.toThrow('not found');
    });
  });

  describe('leaveGroup', () => {
    it('calls leaveGroup on the SDK', async () => {
      await service.leaveGroup('C123');
      expect(mockLeaveGroup).toHaveBeenCalledWith('C123');
    });

    it('propagates SDK errors', async () => {
      mockLeaveGroup.mockRejectedValue(new Error('forbidden'));
      await expect(service.leaveGroup('C123')).rejects.toThrow('forbidden');
    });
  });

  describe('getRoomMemberCount', () => {
    it('returns the count', async () => {
      mockGetRoomMemberCount.mockResolvedValue({ count: 5 });
      const count = await service.getRoomMemberCount('R123');
      expect(count).toBe(5);
      expect(mockGetRoomMemberCount).toHaveBeenCalledWith('R123');
    });

    it('propagates SDK errors', async () => {
      mockGetRoomMemberCount.mockRejectedValue(new Error('forbidden'));
      await expect(service.getRoomMemberCount('R123')).rejects.toThrow('forbidden');
    });
  });

  describe('leaveRoom', () => {
    it('calls leaveRoom on the SDK', async () => {
      await service.leaveRoom('R123');
      expect(mockLeaveRoom).toHaveBeenCalledWith('R123');
    });

    it('propagates SDK errors', async () => {
      mockLeaveRoom.mockRejectedValue(new Error('forbidden'));
      await expect(service.leaveRoom('R123')).rejects.toThrow('forbidden');
    });
  });

});
