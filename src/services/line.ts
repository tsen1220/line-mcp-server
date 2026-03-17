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
  leaveRoom(roomId: string): Promise<void>;
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

  async leaveRoom(roomId: string): Promise<void> {
    await this.client.leaveRoom(roomId);
  }

}
