import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { LineService } from '../../src/services/line.js';
import { registerInsightTools } from '../../src/tools/insight.js';
import { createMockLineService } from '../helpers/mock-line-service.js';

type ToolHandler = (args: Record<string, unknown>) => Promise<unknown>;

function registerAndCapture(lineService: LineService) {
  const handlers = new Map<string, ToolHandler>();
  const mockServer = {
    registerTool: vi.fn((name: string, _config: unknown, handler: ToolHandler) => {
      handlers.set(name, handler);
    }),
  };
  registerInsightTools(mockServer as any, lineService);
  return { handlers, mockServer };
}

describe('insight tools', () => {
  let lineService: LineService;
  let handlers: Map<string, ToolHandler>;

  beforeEach(() => {
    lineService = createMockLineService();
    ({ handlers } = registerAndCapture(lineService));
  });

  it('registers 6 tools', () => {
    expect(handlers.size).toBe(6);
  });

  describe('get_bot_info', () => {
    it('returns bot info JSON', async () => {
      vi.mocked(lineService.getBotInfo).mockResolvedValue({
        userId: 'U001',
        basicId: '@bot',
        displayName: 'Test Bot',
        chatMode: 'bot',
        markAsReadMode: 'auto',
      });
      const result: any = await handlers.get('get_bot_info')!({});
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.userId).toBe('U001');
      expect(parsed.displayName).toBe('Test Bot');
      expect(parsed.chatMode).toBe('bot');
      expect(result.isError).toBeUndefined();
    });

    it('returns error on failure', async () => {
      vi.mocked(lineService.getBotInfo).mockRejectedValue(new Error('unauthorized'));
      const result: any = await handlers.get('get_bot_info')!({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Failed to get bot info');
    });

    it('returns LINE API status code on API error', async () => {
      const err = Object.assign(new Error('Unauthorized'), { statusCode: 401 });
      vi.mocked(lineService.getBotInfo).mockRejectedValue(err);
      const result: any = await handlers.get('get_bot_info')!({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('HTTP 401');
    });
  });

  describe('get_message_quota', () => {
    it('returns quota JSON', async () => {
      vi.mocked(lineService.getMessageQuota).mockResolvedValue({
        type: 'limited',
        value: 1000,
      });
      const result: any = await handlers.get('get_message_quota')!({});
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.type).toBe('limited');
      expect(parsed.value).toBe(1000);
      expect(result.isError).toBeUndefined();
    });

    it('returns error on failure', async () => {
      vi.mocked(lineService.getMessageQuota).mockRejectedValue(new Error('fail'));
      const result: any = await handlers.get('get_message_quota')!({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Failed to get message quota');
    });
  });

  describe('get_message_quota_consumption', () => {
    it('returns consumption JSON', async () => {
      vi.mocked(lineService.getMessageQuotaConsumption).mockResolvedValue({
        totalUsage: 500,
      });
      const result: any = await handlers.get('get_message_quota_consumption')!({});
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.totalUsage).toBe(500);
      expect(result.isError).toBeUndefined();
    });

    it('returns error on failure', async () => {
      vi.mocked(lineService.getMessageQuotaConsumption).mockRejectedValue(new Error('fail'));
      const result: any = await handlers.get('get_message_quota_consumption')!({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Failed to get quota consumption');
    });
  });

  describe('get_follower_ids', () => {
    it('returns follower IDs with next token', async () => {
      vi.mocked(lineService.getFollowerIds).mockResolvedValue({
        userIds: ['U001', 'U002'],
        next: 'token123',
      });
      const result: any = await handlers.get('get_follower_ids')!({});
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.userIds).toEqual(['U001', 'U002']);
      expect(parsed.next).toBe('token123');
      expect(result.isError).toBeUndefined();
    });

    it('passes start token for pagination', async () => {
      vi.mocked(lineService.getFollowerIds).mockResolvedValue({
        userIds: ['U003'],
      });
      const result: any = await handlers.get('get_follower_ids')!({ start: 'token123' });
      expect(lineService.getFollowerIds).toHaveBeenCalledWith('token123');
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.userIds).toEqual(['U003']);
      expect(result.isError).toBeUndefined();
    });

    it('returns error on failure', async () => {
      vi.mocked(lineService.getFollowerIds).mockRejectedValue(new Error('fail'));
      const result: any = await handlers.get('get_follower_ids')!({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Failed to get follower IDs');
    });
  });

  describe('get_number_of_followers', () => {
    it('returns follower stats JSON', async () => {
      vi.mocked(lineService.getNumberOfFollowers).mockResolvedValue({
        status: 'ready',
        followers: 1000,
        targetedReaches: 800,
        blocks: 50,
      });
      const result: any = await handlers.get('get_number_of_followers')!({ date: '20240101' });
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.status).toBe('ready');
      expect(parsed.followers).toBe(1000);
      expect(parsed.targetedReaches).toBe(800);
      expect(parsed.blocks).toBe(50);
      expect(lineService.getNumberOfFollowers).toHaveBeenCalledWith('20240101');
      expect(result.isError).toBeUndefined();
    });

    it('returns error on failure', async () => {
      vi.mocked(lineService.getNumberOfFollowers).mockRejectedValue(new Error('fail'));
      const result: any = await handlers.get('get_number_of_followers')!({ date: '20240101' });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Failed to get number of followers');
    });

    it('returns LINE API status code on API error', async () => {
      const err = Object.assign(new Error('Bad Request'), { statusCode: 400 });
      vi.mocked(lineService.getNumberOfFollowers).mockRejectedValue(err);
      const result: any = await handlers.get('get_number_of_followers')!({ date: 'invalid' });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('HTTP 400');
    });
  });

  describe('get_friend_demographics', () => {
    it('returns demographics JSON', async () => {
      const demographics = {
        available: true,
        genders: [{ gender: 'male', percentage: 60 }],
        ages: [{ age: '20-29', percentage: 40 }],
      };
      vi.mocked(lineService.getFriendDemographics).mockResolvedValue(demographics);
      const result: any = await handlers.get('get_friend_demographics')!({});
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.available).toBe(true);
      expect(parsed.genders).toHaveLength(1);
      expect(result.isError).toBeUndefined();
    });

    it('returns error on failure', async () => {
      vi.mocked(lineService.getFriendDemographics).mockRejectedValue(new Error('fail'));
      const result: any = await handlers.get('get_friend_demographics')!({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Failed to get friend demographics');
    });
  });

});
