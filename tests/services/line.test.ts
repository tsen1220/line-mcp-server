import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockPushMessage = vi.fn().mockResolvedValue({});
const mockBroadcast = vi.fn().mockResolvedValue({});
const mockMulticast = vi.fn().mockResolvedValue({});
const mockGetProfile = vi.fn();
const mockGetGroupSummary = vi.fn();
const mockShowLoadingAnimation = vi.fn().mockResolvedValue({});
const mockGetGroupMemberCount = vi.fn();
const mockGetGroupMembersIds = vi.fn();
const mockGetGroupMemberProfile = vi.fn();
const mockLeaveGroup = vi.fn().mockResolvedValue({});
const mockGetRoomMemberCount = vi.fn();
const mockLeaveRoom = vi.fn().mockResolvedValue({});
const mockCreateRichMenu = vi.fn();
const mockGetRichMenuList = vi.fn();
const mockGetRichMenu = vi.fn();
const mockDeleteRichMenu = vi.fn().mockResolvedValue({});
const mockSetDefaultRichMenu = vi.fn().mockResolvedValue({});
const mockGetDefaultRichMenuId = vi.fn();
const mockCancelDefaultRichMenu = vi.fn().mockResolvedValue({});
const mockLinkRichMenuIdToUser = vi.fn().mockResolvedValue({});
const mockUnlinkRichMenuIdFromUser = vi.fn().mockResolvedValue({});
const mockGetBotInfo = vi.fn();
const mockGetMessageQuota = vi.fn();
const mockGetMessageQuotaConsumption = vi.fn();
const mockGetFollowers = vi.fn();
const mockGetNumberOfFollowers = vi.fn();
const mockGetFriendsDemographics = vi.fn();
const mockGetRoomMembersIds = vi.fn();
const mockGetRoomMemberProfile = vi.fn();
const mockGetNumberOfSentReplyMessages = vi.fn();
const mockGetNumberOfSentPushMessages = vi.fn();
const mockGetNumberOfSentMulticastMessages = vi.fn();
const mockGetNumberOfSentBroadcastMessages = vi.fn();
const mockGetNumberOfMessageDeliveries = vi.fn();
const mockGetMessageEvent = vi.fn();
const mockGetStatisticsPerUnit = vi.fn();
vi.mock('@line/bot-sdk', () => ({
  messagingApi: {
    MessagingApiClient: class {
      pushMessage = mockPushMessage;
      broadcast = mockBroadcast;
      multicast = mockMulticast;
      getProfile = mockGetProfile;
      getGroupSummary = mockGetGroupSummary;
      showLoadingAnimation = mockShowLoadingAnimation;
      getGroupMemberCount = mockGetGroupMemberCount;
      getGroupMembersIds = mockGetGroupMembersIds;
      getGroupMemberProfile = mockGetGroupMemberProfile;
      leaveGroup = mockLeaveGroup;
      getRoomMemberCount = mockGetRoomMemberCount;
      getRoomMembersIds = mockGetRoomMembersIds;
      getRoomMemberProfile = mockGetRoomMemberProfile;
      leaveRoom = mockLeaveRoom;
      createRichMenu = mockCreateRichMenu;
      getRichMenuList = mockGetRichMenuList;
      getRichMenu = mockGetRichMenu;
      deleteRichMenu = mockDeleteRichMenu;
      setDefaultRichMenu = mockSetDefaultRichMenu;
      getDefaultRichMenuId = mockGetDefaultRichMenuId;
      cancelDefaultRichMenu = mockCancelDefaultRichMenu;
      linkRichMenuIdToUser = mockLinkRichMenuIdToUser;
      unlinkRichMenuIdFromUser = mockUnlinkRichMenuIdFromUser;
      getBotInfo = mockGetBotInfo;
      getMessageQuota = mockGetMessageQuota;
      getMessageQuotaConsumption = mockGetMessageQuotaConsumption;
      getFollowers = mockGetFollowers;
      getNumberOfSentReplyMessages = mockGetNumberOfSentReplyMessages;
      getNumberOfSentPushMessages = mockGetNumberOfSentPushMessages;
      getNumberOfSentMulticastMessages = mockGetNumberOfSentMulticastMessages;
      getNumberOfSentBroadcastMessages = mockGetNumberOfSentBroadcastMessages;
    },
  },
  insight: {
    InsightClient: class {
      getNumberOfFollowers = mockGetNumberOfFollowers;
      getFriendsDemographics = mockGetFriendsDemographics;
      getNumberOfMessageDeliveries = mockGetNumberOfMessageDeliveries;
      getMessageEvent = mockGetMessageEvent;
      getStatisticsPerUnit = mockGetStatisticsPerUnit;
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

  describe('pushVideoMessage', () => {
    it('calls pushMessage with video', async () => {
      await service.pushVideoMessage('U123', 'https://vid.com/a.mp4', 'https://img.com/p.jpg');
      expect(mockPushMessage).toHaveBeenCalledWith({
        to: 'U123',
        messages: [
          {
            type: 'video',
            originalContentUrl: 'https://vid.com/a.mp4',
            previewImageUrl: 'https://img.com/p.jpg',
          },
        ],
      });
    });
  });

  describe('pushAudioMessage', () => {
    it('calls pushMessage with audio', async () => {
      await service.pushAudioMessage('U123', 'https://audio.com/a.m4a', 60000);
      expect(mockPushMessage).toHaveBeenCalledWith({
        to: 'U123',
        messages: [
          {
            type: 'audio',
            originalContentUrl: 'https://audio.com/a.m4a',
            duration: 60000,
          },
        ],
      });
    });
  });

  describe('pushLocationMessage', () => {
    it('calls pushMessage with location', async () => {
      await service.pushLocationMessage('U123', 'Office', '123 Main St', 35.6895, 139.6917);
      expect(mockPushMessage).toHaveBeenCalledWith({
        to: 'U123',
        messages: [
          {
            type: 'location',
            title: 'Office',
            address: '123 Main St',
            latitude: 35.6895,
            longitude: 139.6917,
          },
        ],
      });
    });
  });

  describe('broadcastFlexMessage', () => {
    it('calls broadcast with flex container', async () => {
      const contents = { type: 'bubble' as const, body: { type: 'box' } };
      await service.broadcastFlexMessage('alt text', contents);
      expect(mockBroadcast).toHaveBeenCalledWith({
        messages: [{ type: 'flex', altText: 'alt text', contents }],
      });
    });
  });

  describe('multicastFlexMessage', () => {
    it('calls multicast with flex container', async () => {
      const contents = { type: 'carousel' as const, contents: [] };
      await service.multicastFlexMessage(['U001', 'U002'], 'alt text', contents);
      expect(mockMulticast).toHaveBeenCalledWith({
        to: ['U001', 'U002'],
        messages: [{ type: 'flex', altText: 'alt text', contents }],
      });
    });
  });

  describe('showLoadingIndicator', () => {
    it('calls showLoadingAnimation with chatId', async () => {
      await service.showLoadingIndicator('U123');
      expect(mockShowLoadingAnimation).toHaveBeenCalledWith({ chatId: 'U123' });
    });

    it('propagates SDK errors', async () => {
      mockShowLoadingAnimation.mockRejectedValue(new Error('loading failed'));
      await expect(service.showLoadingIndicator('U123')).rejects.toThrow('loading failed');
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
      mockGetBotInfo.mockRejectedValue(new Error('bot info failed'));
      await expect(service.getBotInfo()).rejects.toThrow('bot info failed');
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

  describe('createRichMenu', () => {
    it('calls createRichMenu and returns richMenuId', async () => {
      mockCreateRichMenu.mockResolvedValue({ richMenuId: 'richmenu-123' });
      const result = await service.createRichMenu({ name: 'Test Menu' });
      expect(result).toEqual({ richMenuId: 'richmenu-123' });
      expect(mockCreateRichMenu).toHaveBeenCalledWith({ name: 'Test Menu' });
    });

    it('propagates SDK errors', async () => {
      mockCreateRichMenu.mockRejectedValue(new Error('create failed'));
      await expect(service.createRichMenu({})).rejects.toThrow('create failed');
    });
  });

  describe('getRichMenuList', () => {
    it('returns richmenus array', async () => {
      const menus = [{ richMenuId: 'richmenu-1', name: 'Menu 1' }];
      mockGetRichMenuList.mockResolvedValue({ richmenus: menus });
      const result = await service.getRichMenuList();
      expect(result).toEqual(menus);
    });

    it('propagates SDK errors', async () => {
      mockGetRichMenuList.mockRejectedValue(new Error('list failed'));
      await expect(service.getRichMenuList()).rejects.toThrow('list failed');
    });
  });

  describe('getRichMenu', () => {
    it('returns rich menu by ID', async () => {
      const menu = { richMenuId: 'richmenu-1', name: 'Menu 1' };
      mockGetRichMenu.mockResolvedValue(menu);
      const result = await service.getRichMenu('richmenu-1');
      expect(result).toEqual(menu);
      expect(mockGetRichMenu).toHaveBeenCalledWith('richmenu-1');
    });

    it('propagates SDK errors', async () => {
      mockGetRichMenu.mockRejectedValue(new Error('not found'));
      await expect(service.getRichMenu('richmenu-bad')).rejects.toThrow('not found');
    });
  });

  describe('deleteRichMenu', () => {
    it('calls deleteRichMenu', async () => {
      await service.deleteRichMenu('richmenu-1');
      expect(mockDeleteRichMenu).toHaveBeenCalledWith('richmenu-1');
    });

    it('propagates SDK errors', async () => {
      mockDeleteRichMenu.mockRejectedValue(new Error('delete failed'));
      await expect(service.deleteRichMenu('richmenu-1')).rejects.toThrow('delete failed');
    });
  });

  describe('setDefaultRichMenu', () => {
    it('calls setDefaultRichMenu', async () => {
      await service.setDefaultRichMenu('richmenu-1');
      expect(mockSetDefaultRichMenu).toHaveBeenCalledWith('richmenu-1');
    });

    it('propagates SDK errors', async () => {
      mockSetDefaultRichMenu.mockRejectedValue(new Error('set failed'));
      await expect(service.setDefaultRichMenu('richmenu-1')).rejects.toThrow('set failed');
    });
  });

  describe('getDefaultRichMenuId', () => {
    it('returns richMenuId', async () => {
      mockGetDefaultRichMenuId.mockResolvedValue({ richMenuId: 'richmenu-default' });
      const result = await service.getDefaultRichMenuId();
      expect(result).toBe('richmenu-default');
    });

    it('propagates SDK errors', async () => {
      mockGetDefaultRichMenuId.mockRejectedValue(new Error('no default'));
      await expect(service.getDefaultRichMenuId()).rejects.toThrow('no default');
    });
  });

  describe('cancelDefaultRichMenu', () => {
    it('calls cancelDefaultRichMenu', async () => {
      await service.cancelDefaultRichMenu();
      expect(mockCancelDefaultRichMenu).toHaveBeenCalled();
    });

    it('propagates SDK errors', async () => {
      mockCancelDefaultRichMenu.mockRejectedValue(new Error('cancel failed'));
      await expect(service.cancelDefaultRichMenu()).rejects.toThrow('cancel failed');
    });
  });

  describe('linkRichMenuToUser', () => {
    it('calls linkRichMenuIdToUser', async () => {
      await service.linkRichMenuToUser('U123', 'richmenu-1');
      expect(mockLinkRichMenuIdToUser).toHaveBeenCalledWith('U123', 'richmenu-1');
    });

    it('propagates SDK errors', async () => {
      mockLinkRichMenuIdToUser.mockRejectedValue(new Error('link failed'));
      await expect(service.linkRichMenuToUser('U123', 'richmenu-1')).rejects.toThrow('link failed');
    });
  });

  describe('unlinkRichMenuFromUser', () => {
    it('calls unlinkRichMenuIdFromUser', async () => {
      await service.unlinkRichMenuFromUser('U123');
      expect(mockUnlinkRichMenuIdFromUser).toHaveBeenCalledWith('U123');
    });

    it('propagates SDK errors', async () => {
      mockUnlinkRichMenuIdFromUser.mockRejectedValue(new Error('unlink failed'));
      await expect(service.unlinkRichMenuFromUser('U123')).rejects.toThrow('unlink failed');
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

  describe('getRoomMemberIds', () => {
    it('returns all member IDs from a single page', async () => {
      mockGetRoomMembersIds.mockResolvedValue({
        memberIds: ['U001', 'U002'],
      });
      const ids = await service.getRoomMemberIds('R123');
      expect(ids).toEqual(['U001', 'U002']);
      expect(mockGetRoomMembersIds).toHaveBeenCalledWith('R123', undefined);
    });

    it('paginates through multiple pages', async () => {
      mockGetRoomMembersIds
        .mockResolvedValueOnce({ memberIds: ['U001', 'U002'], next: 'token1' })
        .mockResolvedValueOnce({ memberIds: ['U003'], next: 'token2' })
        .mockResolvedValueOnce({ memberIds: ['U004'] });
      const ids = await service.getRoomMemberIds('R123');
      expect(ids).toEqual(['U001', 'U002', 'U003', 'U004']);
      expect(mockGetRoomMembersIds).toHaveBeenCalledTimes(3);
      expect(mockGetRoomMembersIds).toHaveBeenNthCalledWith(1, 'R123', undefined);
      expect(mockGetRoomMembersIds).toHaveBeenNthCalledWith(2, 'R123', 'token1');
      expect(mockGetRoomMembersIds).toHaveBeenNthCalledWith(3, 'R123', 'token2');
    });

    it('propagates SDK errors', async () => {
      mockGetRoomMembersIds.mockRejectedValue(new Error('forbidden'));
      await expect(service.getRoomMemberIds('R123')).rejects.toThrow('forbidden');
    });
  });

  describe('getRoomMemberProfile', () => {
    it('returns mapped profile', async () => {
      mockGetRoomMemberProfile.mockResolvedValue({
        displayName: 'Alice',
        userId: 'U789',
        pictureUrl: 'https://pic.com/alice.jpg',
      });
      const profile = await service.getRoomMemberProfile('R123', 'U789');
      expect(profile).toEqual({
        displayName: 'Alice',
        userId: 'U789',
        pictureUrl: 'https://pic.com/alice.jpg',
      });
      expect(mockGetRoomMemberProfile).toHaveBeenCalledWith('R123', 'U789');
    });

    it('handles profile without pictureUrl', async () => {
      mockGetRoomMemberProfile.mockResolvedValue({
        displayName: 'Bob',
        userId: 'U456',
      });
      const profile = await service.getRoomMemberProfile('R123', 'U456');
      expect(profile).toEqual({
        displayName: 'Bob',
        userId: 'U456',
        pictureUrl: undefined,
      });
    });

    it('propagates SDK errors', async () => {
      mockGetRoomMemberProfile.mockRejectedValue(new Error('not found'));
      await expect(service.getRoomMemberProfile('R123', 'U789')).rejects.toThrow('not found');
    });
  });

  describe('getNumberOfSentReplyMessages', () => {
    it('returns sent reply message stats', async () => {
      const response = { status: 'ready', success: 100 };
      mockGetNumberOfSentReplyMessages.mockResolvedValue(response);
      const result = await service.getNumberOfSentReplyMessages('20240101');
      expect(result).toEqual(response);
      expect(mockGetNumberOfSentReplyMessages).toHaveBeenCalledWith('20240101');
    });

    it('propagates SDK errors', async () => {
      mockGetNumberOfSentReplyMessages.mockRejectedValue(new Error('fail'));
      await expect(service.getNumberOfSentReplyMessages('20240101')).rejects.toThrow('fail');
    });
  });

  describe('getNumberOfSentPushMessages', () => {
    it('returns sent push message stats', async () => {
      const response = { status: 'ready', success: 200 };
      mockGetNumberOfSentPushMessages.mockResolvedValue(response);
      const result = await service.getNumberOfSentPushMessages('20240101');
      expect(result).toEqual(response);
      expect(mockGetNumberOfSentPushMessages).toHaveBeenCalledWith('20240101');
    });

    it('propagates SDK errors', async () => {
      mockGetNumberOfSentPushMessages.mockRejectedValue(new Error('fail'));
      await expect(service.getNumberOfSentPushMessages('20240101')).rejects.toThrow('fail');
    });
  });

  describe('getNumberOfSentMulticastMessages', () => {
    it('returns sent multicast message stats', async () => {
      const response = { status: 'ready', success: 50 };
      mockGetNumberOfSentMulticastMessages.mockResolvedValue(response);
      const result = await service.getNumberOfSentMulticastMessages('20240101');
      expect(result).toEqual(response);
      expect(mockGetNumberOfSentMulticastMessages).toHaveBeenCalledWith('20240101');
    });

    it('propagates SDK errors', async () => {
      mockGetNumberOfSentMulticastMessages.mockRejectedValue(new Error('fail'));
      await expect(service.getNumberOfSentMulticastMessages('20240101')).rejects.toThrow('fail');
    });
  });

  describe('getNumberOfSentBroadcastMessages', () => {
    it('returns sent broadcast message stats', async () => {
      const response = { status: 'ready', success: 300 };
      mockGetNumberOfSentBroadcastMessages.mockResolvedValue(response);
      const result = await service.getNumberOfSentBroadcastMessages('20240101');
      expect(result).toEqual(response);
      expect(mockGetNumberOfSentBroadcastMessages).toHaveBeenCalledWith('20240101');
    });

    it('propagates SDK errors', async () => {
      mockGetNumberOfSentBroadcastMessages.mockRejectedValue(new Error('fail'));
      await expect(service.getNumberOfSentBroadcastMessages('20240101')).rejects.toThrow('fail');
    });
  });

  describe('getNumberOfMessageDeliveries', () => {
    it('returns message delivery stats', async () => {
      const response = { status: 'ready', broadcast: 100, targeting: 200 };
      mockGetNumberOfMessageDeliveries.mockResolvedValue(response);
      const result = await service.getNumberOfMessageDeliveries('20240101');
      expect(result).toEqual(response);
      expect(mockGetNumberOfMessageDeliveries).toHaveBeenCalledWith('20240101');
    });

    it('propagates SDK errors', async () => {
      mockGetNumberOfMessageDeliveries.mockRejectedValue(new Error('fail'));
      await expect(service.getNumberOfMessageDeliveries('20240101')).rejects.toThrow('fail');
    });
  });

  describe('getMessageEvent', () => {
    it('returns message event stats', async () => {
      const response = { overview: { requestId: 'req-001' }, messages: [], clicks: [] };
      mockGetMessageEvent.mockResolvedValue(response);
      const result = await service.getMessageEvent('req-001');
      expect(result).toEqual(response);
      expect(mockGetMessageEvent).toHaveBeenCalledWith('req-001');
    });

    it('propagates SDK errors', async () => {
      mockGetMessageEvent.mockRejectedValue(new Error('fail'));
      await expect(service.getMessageEvent('req-001')).rejects.toThrow('fail');
    });
  });

  describe('getStatisticsPerUnit', () => {
    it('returns statistics per unit', async () => {
      const response = { overview: { uniqueImpression: 100 }, messages: [], clicks: [] };
      mockGetStatisticsPerUnit.mockResolvedValue(response);
      const result = await service.getStatisticsPerUnit('promotion_a', '20240101', '20240131');
      expect(result).toEqual(response);
      expect(mockGetStatisticsPerUnit).toHaveBeenCalledWith('promotion_a', '20240101', '20240131');
    });

    it('propagates SDK errors', async () => {
      mockGetStatisticsPerUnit.mockRejectedValue(new Error('fail'));
      await expect(service.getStatisticsPerUnit('unit', '20240101', '20240131')).rejects.toThrow('fail');
    });
  });

});
