import { messagingApi, insight } from '@line/bot-sdk';

/**
 * LINE user profile returned by the Messaging API.
 */
export interface UserProfile {
  displayName: string;
  userId: string;
  pictureUrl?: string;
  statusMessage?: string;
  language?: string;
}

/**
 * LINE group summary returned by the Messaging API.
 */
export interface GroupSummary {
  groupId: string;
  groupName: string;
  pictureUrl?: string;
}

/**
 * Flex Message container — the top-level JSON structure
 * passed to LINE's Flex Message API (bubble or carousel).
 */
export interface FlexContainer {
  type: 'bubble' | 'carousel';
  [key: string]: unknown;
}

/**
 * Rich menu response returned by the LINE Messaging API.
 */
export interface RichMenuResponse {
  richMenuId: string;
  name: string;
  size: { width: number; height: number };
  chatBarText: string;
  selected: boolean;
  areas: Array<{ bounds: { x: number; y: number; width: number; height: number }; action: Record<string, unknown> }>;
}

/**
 * Bot information returned by the Messaging API.
 */
export interface BotInfo {
  userId: string;
  basicId: string;
  premiumId?: string;
  displayName: string;
  pictureUrl?: string;
  chatMode: string;
  markAsReadMode: string;
}

/**
 * Message quota information.
 */
export interface MessageQuota {
  type: string;
  value?: number;
}

/**
 * Message quota consumption for the current month.
 */
export interface MessageQuotaConsumption {
  totalUsage: number;
}

/**
 * Friend demographics data returned by the LINE Insight API.
 */
export interface FriendDemographics {
  available?: boolean;
  genders?: Array<{ gender?: string; percentage?: number }>;
  ages?: Array<{ age?: string; percentage?: number }>;
  areas?: Array<{ area?: string; percentage?: number }>;
  appTypes?: Array<{ appType?: string; percentage?: number }>;
  subscriptionPeriods?: Array<{ subscriptionPeriod?: string; percentage?: number }>;
}

/**
 * Insight data on the number of followers.
 */
export interface InsightFollowers {
  status: 'ready' | 'unready' | 'out_of_service';
  followers?: number;
  targetedReaches?: number;
  blocks?: number;
}

/**
 * Service interface for all LINE Messaging API operations.
 *
 * The `to` parameter in push methods accepts:
 *   - User ID  (prefix "U")
 *   - Group ID (prefix "C")
 *   - Room ID  (prefix "R")
 */
export interface LineService {
  pushTextMessage(to: string, text: string): Promise<void>;
  pushImageMessage(
    to: string,
    originalContentUrl: string,
    previewImageUrl: string,
  ): Promise<void>;
  pushStickerMessage(
    to: string,
    packageId: string,
    stickerId: string,
  ): Promise<void>;
  pushFlexMessage(
    to: string,
    altText: string,
    contents: FlexContainer,
  ): Promise<void>;
  pushVideoMessage(
    to: string,
    originalContentUrl: string,
    previewImageUrl: string,
  ): Promise<void>;
  pushAudioMessage(
    to: string,
    originalContentUrl: string,
    duration: number,
  ): Promise<void>;
  pushLocationMessage(
    to: string,
    title: string,
    address: string,
    latitude: number,
    longitude: number,
  ): Promise<void>;
  broadcastTextMessage(text: string): Promise<void>;
  broadcastFlexMessage(
    altText: string,
    contents: FlexContainer,
  ): Promise<void>;
  multicastTextMessage(userIds: string[], text: string): Promise<void>;
  multicastFlexMessage(
    userIds: string[],
    altText: string,
    contents: FlexContainer,
  ): Promise<void>;
  showLoadingIndicator(chatId: string): Promise<void>;
  getUserProfile(userId: string): Promise<UserProfile>;
  getGroupSummary(groupId: string): Promise<GroupSummary>;
  getGroupMemberCount(groupId: string): Promise<number>;
  getGroupMemberIds(groupId: string): Promise<string[]>;
  getGroupMemberProfile(groupId: string, userId: string): Promise<UserProfile>;
  leaveGroup(groupId: string): Promise<void>;
  getRoomMemberCount(roomId: string): Promise<number>;
  getRoomMemberIds(roomId: string): Promise<string[]>;
  getRoomMemberProfile(roomId: string, userId: string): Promise<UserProfile>;
  leaveRoom(roomId: string): Promise<void>;
  createRichMenu(richMenu: Record<string, unknown>): Promise<{ richMenuId: string }>;
  getRichMenuList(): Promise<RichMenuResponse[]>;
  getRichMenu(richMenuId: string): Promise<RichMenuResponse>;
  deleteRichMenu(richMenuId: string): Promise<void>;
  setDefaultRichMenu(richMenuId: string): Promise<void>;
  getDefaultRichMenuId(): Promise<string>;
  cancelDefaultRichMenu(): Promise<void>;
  linkRichMenuToUser(userId: string, richMenuId: string): Promise<void>;
  unlinkRichMenuFromUser(userId: string): Promise<void>;
  getBotInfo(): Promise<BotInfo>;
  getMessageQuota(): Promise<MessageQuota>;
  getMessageQuotaConsumption(): Promise<MessageQuotaConsumption>;
  getFollowerIds(start?: string): Promise<{ userIds: string[]; next?: string }>;
  getNumberOfFollowers(date: string): Promise<InsightFollowers>;
  getFriendDemographics(): Promise<FriendDemographics>;
  getNumberOfSentReplyMessages(date: string): Promise<unknown>;
  getNumberOfSentPushMessages(date: string): Promise<unknown>;
  getNumberOfSentMulticastMessages(date: string): Promise<unknown>;
  getNumberOfSentBroadcastMessages(date: string): Promise<unknown>;
  getNumberOfMessageDeliveries(date: string): Promise<unknown>;
  getMessageEvent(requestId: string): Promise<unknown>;
  getStatisticsPerUnit(customAggregationUnit: string, from: string, to: string): Promise<unknown>;
}

export class LineMessagingClient implements LineService {
  private client: messagingApi.MessagingApiClient;
  private insightClient: insight.InsightClient;

  constructor(channelAccessToken: string) {
    this.client = new messagingApi.MessagingApiClient({ channelAccessToken });
    this.insightClient = new insight.InsightClient({ channelAccessToken });
  }

  async pushTextMessage(to: string, text: string): Promise<void> {
    await this.client.pushMessage({
      to,
      messages: [{ type: 'text', text }],
    });
  }

  async pushImageMessage(
    to: string,
    originalContentUrl: string,
    previewImageUrl: string,
  ): Promise<void> {
    await this.client.pushMessage({
      to,
      messages: [{ type: 'image', originalContentUrl, previewImageUrl }],
    });
  }

  async pushStickerMessage(
    to: string,
    packageId: string,
    stickerId: string,
  ): Promise<void> {
    await this.client.pushMessage({
      to,
      messages: [{ type: 'sticker', packageId, stickerId }],
    });
  }

  async pushFlexMessage(
    to: string,
    altText: string,
    contents: FlexContainer,
  ): Promise<void> {
    await this.client.pushMessage({
      to,
      messages: [
        {
          type: 'flex',
          altText,
          contents: contents as messagingApi.FlexContainer,
        },
      ],
    });
  }

  async pushVideoMessage(
    to: string,
    originalContentUrl: string,
    previewImageUrl: string,
  ): Promise<void> {
    await this.client.pushMessage({
      to,
      messages: [{ type: 'video', originalContentUrl, previewImageUrl }],
    });
  }

  async pushAudioMessage(
    to: string,
    originalContentUrl: string,
    duration: number,
  ): Promise<void> {
    await this.client.pushMessage({
      to,
      messages: [{ type: 'audio', originalContentUrl, duration }],
    });
  }

  async pushLocationMessage(
    to: string,
    title: string,
    address: string,
    latitude: number,
    longitude: number,
  ): Promise<void> {
    await this.client.pushMessage({
      to,
      messages: [{ type: 'location', title, address, latitude, longitude }],
    });
  }

  async broadcastTextMessage(text: string): Promise<void> {
    await this.client.broadcast({
      messages: [{ type: 'text', text }],
    });
  }

  async multicastTextMessage(userIds: string[], text: string): Promise<void> {
    await this.client.multicast({
      to: userIds,
      messages: [{ type: 'text', text }],
    });
  }

  async broadcastFlexMessage(
    altText: string,
    contents: FlexContainer,
  ): Promise<void> {
    await this.client.broadcast({
      messages: [
        {
          type: 'flex',
          altText,
          contents: contents as messagingApi.FlexContainer,
        },
      ],
    });
  }

  async multicastFlexMessage(
    userIds: string[],
    altText: string,
    contents: FlexContainer,
  ): Promise<void> {
    await this.client.multicast({
      to: userIds,
      messages: [
        {
          type: 'flex',
          altText,
          contents: contents as messagingApi.FlexContainer,
        },
      ],
    });
  }

  async showLoadingIndicator(chatId: string): Promise<void> {
    await this.client.showLoadingAnimation({ chatId });
  }

  async getUserProfile(userId: string): Promise<UserProfile> {
    const profile = await this.client.getProfile(userId);
    return {
      displayName: profile.displayName,
      userId: profile.userId,
      pictureUrl: profile.pictureUrl,
      statusMessage: profile.statusMessage,
      language: profile.language,
    };
  }

  async getGroupSummary(groupId: string): Promise<GroupSummary> {
    const summary = await this.client.getGroupSummary(groupId);
    return {
      groupId: summary.groupId,
      groupName: summary.groupName,
      pictureUrl: summary.pictureUrl,
    };
  }

  async getGroupMemberCount(groupId: string): Promise<number> {
    const response = await this.client.getGroupMemberCount(groupId);
    return response.count;
  }

  async getGroupMemberIds(groupId: string): Promise<string[]> {
    const allMemberIds: string[] = [];
    let start: string | undefined;
    do {
      const response = await this.client.getGroupMembersIds(groupId, start);
      allMemberIds.push(...response.memberIds);
      start = response.next;
    } while (start);
    return allMemberIds;
  }

  async getGroupMemberProfile(groupId: string, userId: string): Promise<UserProfile> {
    const profile = await this.client.getGroupMemberProfile(groupId, userId);
    return {
      displayName: profile.displayName,
      userId: profile.userId,
      pictureUrl: profile.pictureUrl,
    };
  }

  async leaveGroup(groupId: string): Promise<void> {
    await this.client.leaveGroup(groupId);
  }

  async getRoomMemberCount(roomId: string): Promise<number> {
    const response = await this.client.getRoomMemberCount(roomId);
    return response.count;
  }

  async getRoomMemberIds(roomId: string): Promise<string[]> {
    const allMemberIds: string[] = [];
    let start: string | undefined;
    do {
      const response = await this.client.getRoomMembersIds(roomId, start);
      allMemberIds.push(...response.memberIds);
      start = response.next;
    } while (start);
    return allMemberIds;
  }

  async getRoomMemberProfile(roomId: string, userId: string): Promise<UserProfile> {
    const profile = await this.client.getRoomMemberProfile(roomId, userId);
    return {
      displayName: profile.displayName,
      userId: profile.userId,
      pictureUrl: profile.pictureUrl,
    };
  }

  async leaveRoom(roomId: string): Promise<void> {
    await this.client.leaveRoom(roomId);
  }

  async createRichMenu(richMenu: Record<string, unknown>): Promise<{ richMenuId: string }> {
    const result = await this.client.createRichMenu(richMenu as any);
    return { richMenuId: result.richMenuId };
  }

  async getRichMenuList(): Promise<RichMenuResponse[]> {
    const result = await this.client.getRichMenuList();
    return result.richmenus as RichMenuResponse[];
  }

  async getRichMenu(richMenuId: string): Promise<RichMenuResponse> {
    return await this.client.getRichMenu(richMenuId) as RichMenuResponse;
  }

  async deleteRichMenu(richMenuId: string): Promise<void> {
    await this.client.deleteRichMenu(richMenuId);
  }

  async setDefaultRichMenu(richMenuId: string): Promise<void> {
    await this.client.setDefaultRichMenu(richMenuId);
  }

  async getDefaultRichMenuId(): Promise<string> {
    const result = await this.client.getDefaultRichMenuId();
    return result.richMenuId;
  }

  async cancelDefaultRichMenu(): Promise<void> {
    await this.client.cancelDefaultRichMenu();
  }

  async linkRichMenuToUser(userId: string, richMenuId: string): Promise<void> {
    await this.client.linkRichMenuIdToUser(userId, richMenuId);
  }

  async unlinkRichMenuFromUser(userId: string): Promise<void> {
    await this.client.unlinkRichMenuIdFromUser(userId);
  }

  async getBotInfo(): Promise<BotInfo> {
    const info = await this.client.getBotInfo();
    return {
      userId: info.userId,
      basicId: info.basicId,
      premiumId: info.premiumId,
      displayName: info.displayName,
      pictureUrl: info.pictureUrl,
      chatMode: info.chatMode,
      markAsReadMode: info.markAsReadMode,
    };
  }

  async getMessageQuota(): Promise<MessageQuota> {
    const quota = await this.client.getMessageQuota();
    return {
      type: quota.type,
      value: quota.value,
    };
  }

  async getMessageQuotaConsumption(): Promise<MessageQuotaConsumption> {
    const consumption = await this.client.getMessageQuotaConsumption();
    return {
      totalUsage: consumption.totalUsage,
    };
  }

  async getFollowerIds(start?: string): Promise<{ userIds: string[]; next?: string }> {
    const response = await this.client.getFollowers(start);
    return {
      userIds: response.userIds,
      next: response.next,
    };
  }

  async getNumberOfFollowers(date: string): Promise<InsightFollowers> {
    const response = await this.insightClient.getNumberOfFollowers(date);
    return {
      status: response.status ?? 'unready',
      followers: response.followers,
      targetedReaches: response.targetedReaches,
      blocks: response.blocks,
    };
  }

  async getFriendDemographics(): Promise<FriendDemographics> {
    return await this.insightClient.getFriendsDemographics();
  }

  async getNumberOfSentReplyMessages(date: string): Promise<unknown> {
    return await this.client.getNumberOfSentReplyMessages(date);
  }

  async getNumberOfSentPushMessages(date: string): Promise<unknown> {
    return await this.client.getNumberOfSentPushMessages(date);
  }

  async getNumberOfSentMulticastMessages(date: string): Promise<unknown> {
    return await this.client.getNumberOfSentMulticastMessages(date);
  }

  async getNumberOfSentBroadcastMessages(date: string): Promise<unknown> {
    return await this.client.getNumberOfSentBroadcastMessages(date);
  }

  async getNumberOfMessageDeliveries(date: string): Promise<unknown> {
    return await this.insightClient.getNumberOfMessageDeliveries(date);
  }

  async getMessageEvent(requestId: string): Promise<unknown> {
    return await this.insightClient.getMessageEvent(requestId);
  }

  async getStatisticsPerUnit(customAggregationUnit: string, from: string, to: string): Promise<unknown> {
    return await this.insightClient.getStatisticsPerUnit(customAggregationUnit, from, to);
  }

}
