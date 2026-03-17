import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockPushMessage = vi.fn().mockResolvedValue({});
const mockBroadcast = vi.fn().mockResolvedValue({});
const mockMulticast = vi.fn().mockResolvedValue({});
const mockGetProfile = vi.fn();
const mockGetGroupSummary = vi.fn();
const mockCreateRichMenu = vi.fn();
const mockGetRichMenuList = vi.fn();
const mockGetRichMenu = vi.fn();
const mockDeleteRichMenu = vi.fn().mockResolvedValue({});
const mockSetDefaultRichMenu = vi.fn().mockResolvedValue({});
const mockGetDefaultRichMenuId = vi.fn();
const mockCancelDefaultRichMenu = vi.fn().mockResolvedValue({});
const mockLinkRichMenuIdToUser = vi.fn().mockResolvedValue({});
const mockUnlinkRichMenuIdFromUser = vi.fn().mockResolvedValue({});
vi.mock('@line/bot-sdk', () => ({
  messagingApi: {
    MessagingApiClient: class {
      pushMessage = mockPushMessage;
      broadcast = mockBroadcast;
      multicast = mockMulticast;
      getProfile = mockGetProfile;
      getGroupSummary = mockGetGroupSummary;
      createRichMenu = mockCreateRichMenu;
      getRichMenuList = mockGetRichMenuList;
      getRichMenu = mockGetRichMenu;
      deleteRichMenu = mockDeleteRichMenu;
      setDefaultRichMenu = mockSetDefaultRichMenu;
      getDefaultRichMenuId = mockGetDefaultRichMenuId;
      cancelDefaultRichMenu = mockCancelDefaultRichMenu;
      linkRichMenuIdToUser = mockLinkRichMenuIdToUser;
      unlinkRichMenuIdFromUser = mockUnlinkRichMenuIdFromUser;
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

});
