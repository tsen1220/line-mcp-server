import { messagingApi } from '@line/bot-sdk';

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
  createRichMenu(richMenu: object): Promise<{ richMenuId: string }>;
  getRichMenuList(): Promise<RichMenuResponse[]>;
  getRichMenu(richMenuId: string): Promise<RichMenuResponse>;
  deleteRichMenu(richMenuId: string): Promise<void>;
  setDefaultRichMenu(richMenuId: string): Promise<void>;
  getDefaultRichMenuId(): Promise<string>;
  cancelDefaultRichMenu(): Promise<void>;
  linkRichMenuToUser(userId: string, richMenuId: string): Promise<void>;
  unlinkRichMenuFromUser(userId: string): Promise<void>;
}

export class LineMessagingClient implements LineService {
  private client: messagingApi.MessagingApiClient;

  constructor(channelAccessToken: string) {
    this.client = new messagingApi.MessagingApiClient({ channelAccessToken });
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

  async createRichMenu(richMenu: object): Promise<{ richMenuId: string }> {
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

}
