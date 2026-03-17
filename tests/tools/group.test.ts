import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { LineService } from '../../src/services/line.js';
import { registerGroupTools } from '../../src/tools/group.js';
import { createMockLineService } from '../helpers/mock-line-service.js';

type ToolHandler = (args: Record<string, unknown>) => Promise<unknown>;

function registerAndCapture(lineService: LineService) {
  const handlers = new Map<string, ToolHandler>();
  const mockServer = {
    registerTool: vi.fn((name: string, _config: unknown, handler: ToolHandler) => {
      handlers.set(name, handler);
    }),
  };
  registerGroupTools(mockServer as any, lineService);
  return { handlers, mockServer };
}

describe('group tools', () => {
  let lineService: LineService;
  let handlers: Map<string, ToolHandler>;

  beforeEach(() => {
    lineService = createMockLineService();
    ({ handlers } = registerAndCapture(lineService));
  });

  it('registers 8 tools', () => {
    expect(handlers.size).toBe(8);
  });

  describe('get_group_member_count', () => {
    it('returns member count as text', async () => {
      vi.mocked(lineService.getGroupMemberCount).mockResolvedValue(42);
      const result: any = await handlers.get('get_group_member_count')!({ groupId: 'C123' });
      expect(result.content[0].text).toContain('42');
      expect(result.isError).toBeUndefined();
    });

    it('returns error on failure', async () => {
      vi.mocked(lineService.getGroupMemberCount).mockRejectedValue(new Error('forbidden'));
      const result: any = await handlers.get('get_group_member_count')!({ groupId: 'C999' });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Failed');
    });

    it('returns LINE API status code on API error', async () => {
      const err = Object.assign(new Error('Forbidden'), { statusCode: 403 });
      vi.mocked(lineService.getGroupMemberCount).mockRejectedValue(err);
      const result: any = await handlers.get('get_group_member_count')!({ groupId: 'C999' });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('HTTP 403');
    });
  });

  describe('get_group_member_ids', () => {
    it('returns member IDs as JSON array', async () => {
      vi.mocked(lineService.getGroupMemberIds).mockResolvedValue(['U001', 'U002', 'U003']);
      const result: any = await handlers.get('get_group_member_ids')!({ groupId: 'C123' });
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed).toEqual(['U001', 'U002', 'U003']);
      expect(result.isError).toBeUndefined();
    });

    it('returns error on failure', async () => {
      vi.mocked(lineService.getGroupMemberIds).mockRejectedValue(new Error('forbidden'));
      const result: any = await handlers.get('get_group_member_ids')!({ groupId: 'C999' });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Failed');
    });

    it('returns LINE API status code on API error', async () => {
      const err = Object.assign(new Error('Forbidden'), { statusCode: 403 });
      vi.mocked(lineService.getGroupMemberIds).mockRejectedValue(err);
      const result: any = await handlers.get('get_group_member_ids')!({ groupId: 'C999' });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('HTTP 403');
    });
  });

  describe('get_group_member_profile', () => {
    it('returns profile JSON', async () => {
      vi.mocked(lineService.getGroupMemberProfile).mockResolvedValue({
        displayName: 'Alice',
        userId: 'U789',
        pictureUrl: 'https://pic.com/alice.jpg',
      });
      const result: any = await handlers.get('get_group_member_profile')!({
        groupId: 'C123',
        userId: 'U789',
      });
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.displayName).toBe('Alice');
      expect(parsed.userId).toBe('U789');
      expect(result.isError).toBeUndefined();
    });

    it('returns error on failure', async () => {
      vi.mocked(lineService.getGroupMemberProfile).mockRejectedValue(new Error('not found'));
      const result: any = await handlers.get('get_group_member_profile')!({
        groupId: 'C123',
        userId: 'U999',
      });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Failed');
    });

    it('returns LINE API status code on API error', async () => {
      const err = Object.assign(new Error('Not Found'), { statusCode: 404 });
      vi.mocked(lineService.getGroupMemberProfile).mockRejectedValue(err);
      const result: any = await handlers.get('get_group_member_profile')!({
        groupId: 'C123',
        userId: 'U999',
      });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('HTTP 404');
    });
  });

  describe('leave_group', () => {
    it('returns confirmation text', async () => {
      vi.mocked(lineService.leaveGroup).mockResolvedValue(undefined);
      const result: any = await handlers.get('leave_group')!({ groupId: 'C123' });
      expect(result.content[0].text).toContain('Successfully left group');
      expect(result.content[0].text).toContain('C123');
      expect(result.isError).toBeUndefined();
    });

    it('returns error on failure', async () => {
      vi.mocked(lineService.leaveGroup).mockRejectedValue(new Error('forbidden'));
      const result: any = await handlers.get('leave_group')!({ groupId: 'C999' });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Failed');
    });

    it('returns LINE API status code on API error', async () => {
      const err = Object.assign(new Error('Forbidden'), { statusCode: 403 });
      vi.mocked(lineService.leaveGroup).mockRejectedValue(err);
      const result: any = await handlers.get('leave_group')!({ groupId: 'C999' });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('HTTP 403');
    });
  });

  describe('get_room_member_ids', () => {
    it('returns member IDs as JSON array', async () => {
      vi.mocked(lineService.getRoomMemberIds).mockResolvedValue(['U001', 'U002']);
      const result: any = await handlers.get('get_room_member_ids')!({ roomId: 'R123' });
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed).toEqual(['U001', 'U002']);
      expect(result.isError).toBeUndefined();
    });

    it('returns error on failure', async () => {
      vi.mocked(lineService.getRoomMemberIds).mockRejectedValue(new Error('forbidden'));
      const result: any = await handlers.get('get_room_member_ids')!({ roomId: 'R999' });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Failed');
    });

    it('returns LINE API status code on API error', async () => {
      const err = Object.assign(new Error('Forbidden'), { statusCode: 403 });
      vi.mocked(lineService.getRoomMemberIds).mockRejectedValue(err);
      const result: any = await handlers.get('get_room_member_ids')!({ roomId: 'R999' });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('HTTP 403');
    });
  });

  describe('get_room_member_profile', () => {
    it('returns profile JSON', async () => {
      vi.mocked(lineService.getRoomMemberProfile).mockResolvedValue({
        displayName: 'Alice',
        userId: 'U789',
        pictureUrl: 'https://pic.com/alice.jpg',
      });
      const result: any = await handlers.get('get_room_member_profile')!({
        roomId: 'R123',
        userId: 'U789',
      });
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.displayName).toBe('Alice');
      expect(parsed.userId).toBe('U789');
      expect(result.isError).toBeUndefined();
    });

    it('returns error on failure', async () => {
      vi.mocked(lineService.getRoomMemberProfile).mockRejectedValue(new Error('not found'));
      const result: any = await handlers.get('get_room_member_profile')!({
        roomId: 'R123',
        userId: 'U999',
      });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Failed');
    });

    it('returns LINE API status code on API error', async () => {
      const err = Object.assign(new Error('Not Found'), { statusCode: 404 });
      vi.mocked(lineService.getRoomMemberProfile).mockRejectedValue(err);
      const result: any = await handlers.get('get_room_member_profile')!({
        roomId: 'R123',
        userId: 'U999',
      });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('HTTP 404');
    });
  });

  describe('get_room_member_count', () => {
    it('returns member count as text', async () => {
      vi.mocked(lineService.getRoomMemberCount).mockResolvedValue(5);
      const result: any = await handlers.get('get_room_member_count')!({ roomId: 'R123' });
      expect(result.content[0].text).toContain('5');
      expect(result.isError).toBeUndefined();
    });

    it('returns error on failure', async () => {
      vi.mocked(lineService.getRoomMemberCount).mockRejectedValue(new Error('forbidden'));
      const result: any = await handlers.get('get_room_member_count')!({ roomId: 'R999' });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Failed');
    });

    it('returns LINE API status code on API error', async () => {
      const err = Object.assign(new Error('Forbidden'), { statusCode: 403 });
      vi.mocked(lineService.getRoomMemberCount).mockRejectedValue(err);
      const result: any = await handlers.get('get_room_member_count')!({ roomId: 'R999' });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('HTTP 403');
    });
  });

  describe('leave_room', () => {
    it('returns confirmation text', async () => {
      vi.mocked(lineService.leaveRoom).mockResolvedValue(undefined);
      const result: any = await handlers.get('leave_room')!({ roomId: 'R123' });
      expect(result.content[0].text).toContain('Successfully left room');
      expect(result.content[0].text).toContain('R123');
      expect(result.isError).toBeUndefined();
    });

    it('returns error on failure', async () => {
      vi.mocked(lineService.leaveRoom).mockRejectedValue(new Error('forbidden'));
      const result: any = await handlers.get('leave_room')!({ roomId: 'R999' });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Failed');
    });

    it('returns LINE API status code on API error', async () => {
      const err = Object.assign(new Error('Forbidden'), { statusCode: 403 });
      vi.mocked(lineService.leaveRoom).mockRejectedValue(err);
      const result: any = await handlers.get('leave_room')!({ roomId: 'R999' });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('HTTP 403');
    });
  });

});
