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
 * Insight data on the number of followers.
 */
export interface InsightFollowers {
  status: string;
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
  broadcastTextMessage(text: string): Promise<void>;
  multicastTextMessage(userIds: string[], text: string): Promise<void>;
  getUserProfile(userId: string): Promise<UserProfile>;
  getGroupSummary(groupId: string): Promise<GroupSummary>;
  getBotInfo(): Promise<BotInfo>;
  getMessageQuota(): Promise<MessageQuota>;
  getMessageQuotaConsumption(): Promise<MessageQuotaConsumption>;
  getFollowerIds(start?: string): Promise<{ userIds: string[]; next?: string }>;
  getNumberOfFollowers(date: string): Promise<InsightFollowers>;
  getFriendDemographics(): Promise<unknown>;
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

  async getFriendDemographics(): Promise<unknown> {
    return await this.insightClient.getFriendsDemographics();
  }

}
