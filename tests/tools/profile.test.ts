import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { LineService } from '../../src/services/line.js';
import { registerProfileTools } from '../../src/tools/profile.js';
import { createMockLineService } from '../helpers/mock-line-service.js';

type ToolHandler = (args: Record<string, unknown>) => Promise<unknown>;

function registerAndCapture(lineService: LineService) {
  const handlers = new Map<string, ToolHandler>();
  const mockServer = {
    registerTool: vi.fn((name: string, _config: unknown, handler: ToolHandler) => {
      handlers.set(name, handler);
    }),
  };
  registerProfileTools(mockServer as any, lineService);
  return { handlers, mockServer };
}

describe('profile tools', () => {
  let lineService: LineService;
  let handlers: Map<string, ToolHandler>;

  beforeEach(() => {
    lineService = createMockLineService();
    ({ handlers } = registerAndCapture(lineService));
  });

  it('registers 2 tools', () => {
    expect(handlers.size).toBe(2);
  });

  describe('get_user_profile', () => {
    it('returns profile JSON', async () => {
      vi.mocked(lineService.getUserProfile).mockResolvedValue({
        displayName: 'Kent',
        userId: 'U123',
        pictureUrl: 'https://pic.com/kent.jpg',
        statusMessage: 'Hi',
        language: 'zh-TW',
      });
      const result: any = await handlers.get('get_user_profile')!({ userId: 'U123' });
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.displayName).toBe('Kent');
      expect(parsed.userId).toBe('U123');
      expect(result.isError).toBeUndefined();
    });

    it('returns error on failure', async () => {
      vi.mocked(lineService.getUserProfile).mockRejectedValue(new Error('not found'));
      const result: any = await handlers.get('get_user_profile')!({ userId: 'U999' });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Failed');
    });

    it('returns LINE API status code on API error', async () => {
      const err = Object.assign(new Error('Not Found'), { statusCode: 404 });
      vi.mocked(lineService.getUserProfile).mockRejectedValue(err);
      const result: any = await handlers.get('get_user_profile')!({ userId: 'U999' });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('HTTP 404');
    });
  });

  describe('get_group_summary', () => {
    it('returns group summary JSON', async () => {
      vi.mocked(lineService.getGroupSummary).mockResolvedValue({
        groupId: 'C456',
        groupName: 'Dev Team',
        pictureUrl: 'https://pic.com/group.jpg',
      });
      const result: any = await handlers.get('get_group_summary')!({ groupId: 'C456' });
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.groupName).toBe('Dev Team');
      expect(result.isError).toBeUndefined();
    });

    it('returns error on failure', async () => {
      vi.mocked(lineService.getGroupSummary).mockRejectedValue(new Error('forbidden'));
      const result: any = await handlers.get('get_group_summary')!({ groupId: 'C999' });
      expect(result.isError).toBe(true);
    });
  });

});
