import { vi } from 'vitest';
import type { LineService } from '../../src/services/line.js';

/**
 * Creates a fully-mocked LineService with all 44 methods stubbed.
 * Void methods resolve to `undefined`; data-returning methods provide sensible defaults.
 *
 * Tests can override individual mocks as needed via:
 *   `vi.mocked(service.someMethod).mockResolvedValue(...)`
 */
export function createMockLineService(): LineService {
  return {
    // Messaging (12)
    pushTextMessage: vi.fn().mockResolvedValue(undefined),
    pushImageMessage: vi.fn().mockResolvedValue(undefined),
    pushStickerMessage: vi.fn().mockResolvedValue(undefined),
    pushFlexMessage: vi.fn().mockResolvedValue(undefined),
    pushVideoMessage: vi.fn().mockResolvedValue(undefined),
    pushAudioMessage: vi.fn().mockResolvedValue(undefined),
    pushLocationMessage: vi.fn().mockResolvedValue(undefined),
    broadcastTextMessage: vi.fn().mockResolvedValue(undefined),
    broadcastFlexMessage: vi.fn().mockResolvedValue(undefined),
    multicastTextMessage: vi.fn().mockResolvedValue(undefined),
    multicastFlexMessage: vi.fn().mockResolvedValue(undefined),
    showLoadingIndicator: vi.fn().mockResolvedValue(undefined),

    // Profile (2)
    getUserProfile: vi.fn().mockResolvedValue({
      displayName: 'Test User',
      userId: 'U001',
      pictureUrl: 'https://pic.com/test.jpg',
      statusMessage: 'Hello',
      language: 'en',
    }),
    getGroupSummary: vi.fn().mockResolvedValue({
      groupId: 'C001',
      groupName: 'Test Group',
      pictureUrl: 'https://pic.com/group.jpg',
    }),

    // Group (8)
    getGroupMemberCount: vi.fn().mockResolvedValue(42),
    getGroupMemberIds: vi.fn().mockResolvedValue(['U001', 'U002', 'U003']),
    getGroupMemberProfile: vi.fn().mockResolvedValue({
      displayName: 'Member',
      userId: 'U001',
      pictureUrl: 'https://pic.com/member.jpg',
    }),
    leaveGroup: vi.fn().mockResolvedValue(undefined),
    getRoomMemberCount: vi.fn().mockResolvedValue(5),
    getRoomMemberIds: vi.fn().mockResolvedValue(['U001', 'U002']),
    getRoomMemberProfile: vi.fn().mockResolvedValue({
      displayName: 'Room Member',
      userId: 'U001',
      pictureUrl: 'https://pic.com/room-member.jpg',
    }),
    leaveRoom: vi.fn().mockResolvedValue(undefined),

    // Rich Menu (9)
    createRichMenu: vi.fn().mockResolvedValue({ richMenuId: 'richmenu-001' }),
    getRichMenuList: vi.fn().mockResolvedValue([
      { richMenuId: 'richmenu-001', name: 'Menu 1' },
    ]),
    getRichMenu: vi.fn().mockResolvedValue({
      richMenuId: 'richmenu-001',
      name: 'Menu 1',
    }),
    deleteRichMenu: vi.fn().mockResolvedValue(undefined),
    setDefaultRichMenu: vi.fn().mockResolvedValue(undefined),
    getDefaultRichMenuId: vi.fn().mockResolvedValue('richmenu-default'),
    cancelDefaultRichMenu: vi.fn().mockResolvedValue(undefined),
    linkRichMenuToUser: vi.fn().mockResolvedValue(undefined),
    unlinkRichMenuFromUser: vi.fn().mockResolvedValue(undefined),

    // Insight (13)
    getBotInfo: vi.fn().mockResolvedValue({
      userId: 'U-bot',
      basicId: '@bot',
      displayName: 'Test Bot',
      chatMode: 'bot',
      markAsReadMode: 'auto',
    }),
    getMessageQuota: vi.fn().mockResolvedValue({ type: 'limited', value: 1000 }),
    getMessageQuotaConsumption: vi.fn().mockResolvedValue({ totalUsage: 250 }),
    getFollowerIds: vi.fn().mockResolvedValue({
      userIds: ['U001', 'U002'],
      next: undefined,
    }),
    getNumberOfFollowers: vi.fn().mockResolvedValue({
      status: 'ready',
      followers: 1000,
      targetedReaches: 800,
      blocks: 50,
    }),
    getFriendDemographics: vi.fn().mockResolvedValue({
      available: true,
      genders: [{ gender: 'male', percentage: 60 }],
    }),
    getNumberOfSentReplyMessages: vi.fn().mockResolvedValue({
      status: 'ready',
      success: 100,
    }),
    getNumberOfSentPushMessages: vi.fn().mockResolvedValue({
      status: 'ready',
      success: 200,
    }),
    getNumberOfSentMulticastMessages: vi.fn().mockResolvedValue({
      status: 'ready',
      success: 50,
    }),
    getNumberOfSentBroadcastMessages: vi.fn().mockResolvedValue({
      status: 'ready',
      success: 300,
    }),
    getNumberOfMessageDeliveries: vi.fn().mockResolvedValue({
      status: 'ready',
      broadcast: 100,
      targeting: 200,
    }),
    getMessageEvent: vi.fn().mockResolvedValue({
      overview: { requestId: 'req-001', timestamp: 1234567890 },
      messages: [],
      clicks: [],
    }),
    getStatisticsPerUnit: vi.fn().mockResolvedValue({
      overview: { uniqueImpression: 100, uniqueClick: 50 },
      messages: [],
      clicks: [],
    }),
  };
}
