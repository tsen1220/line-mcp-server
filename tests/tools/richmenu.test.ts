import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { LineService } from '../../src/services/line.js';
import { registerRichMenuTools } from '../../src/tools/richmenu.js';
import { createMockLineService } from '../helpers/mock-line-service.js';

type ToolHandler = (args: Record<string, unknown>) => Promise<unknown>;

function registerAndCapture(lineService: LineService) {
  const handlers = new Map<string, ToolHandler>();
  const mockServer = {
    registerTool: vi.fn((name: string, _config: unknown, handler: ToolHandler) => {
      handlers.set(name, handler);
    }),
  };
  registerRichMenuTools(mockServer as any, lineService);
  return { handlers, mockServer };
}

describe('rich menu tools', () => {
  let lineService: LineService;
  let handlers: Map<string, ToolHandler>;

  beforeEach(() => {
    lineService = createMockLineService();
    ({ handlers } = registerAndCapture(lineService));
  });

  it('registers 9 tools', () => {
    expect(handlers.size).toBe(9);
  });

  describe('create_rich_menu', () => {
    const validMenu = JSON.stringify({ name: 'Test', size: { width: 2500, height: 1686 } });

    it('creates rich menu and returns richMenuId', async () => {
      vi.mocked(lineService.createRichMenu).mockResolvedValue({ richMenuId: 'richmenu-123' });
      const result: any = await handlers.get('create_rich_menu')!({ richMenu: validMenu });
      expect(lineService.createRichMenu).toHaveBeenCalledWith({
        name: 'Test',
        size: { width: 2500, height: 1686 },
      });
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.richMenuId).toBe('richmenu-123');
      expect(result.isError).toBeUndefined();
    });

    it('returns error for invalid JSON', async () => {
      const result: any = await handlers.get('create_rich_menu')!({ richMenu: 'not json{{{' });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('not valid JSON');
      expect(lineService.createRichMenu).not.toHaveBeenCalled();
    });

    it('returns error for non-object JSON (null)', async () => {
      const result: any = await handlers.get('create_rich_menu')!({ richMenu: 'null' });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('must be a JSON object');
    });

    it('returns error for array JSON', async () => {
      const result: any = await handlers.get('create_rich_menu')!({ richMenu: '[]' });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('must be a JSON object');
    });

    it('returns error on LINE API failure', async () => {
      vi.mocked(lineService.createRichMenu).mockRejectedValue(new Error('fail'));
      const result: any = await handlers.get('create_rich_menu')!({ richMenu: validMenu });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Failed');
    });

    it('returns LINE API status code on API error', async () => {
      const err = Object.assign(new Error('Bad Request'), { statusCode: 400 });
      vi.mocked(lineService.createRichMenu).mockRejectedValue(err);
      const result: any = await handlers.get('create_rich_menu')!({ richMenu: validMenu });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('HTTP 400');
    });
  });

  describe('list_rich_menus', () => {
    it('returns list of rich menus', async () => {
      const menus = [{ richMenuId: 'richmenu-1', name: 'Menu 1' }];
      vi.mocked(lineService.getRichMenuList).mockResolvedValue(menus as any);
      const result: any = await handlers.get('list_rich_menus')!({});
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed).toEqual(menus);
      expect(result.isError).toBeUndefined();
    });

    it('returns error on failure', async () => {
      vi.mocked(lineService.getRichMenuList).mockRejectedValue(new Error('fail'));
      const result: any = await handlers.get('list_rich_menus')!({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Failed');
    });
  });

  describe('get_rich_menu', () => {
    it('returns rich menu JSON', async () => {
      const menu = { richMenuId: 'richmenu-1', name: 'Menu 1' };
      vi.mocked(lineService.getRichMenu).mockResolvedValue(menu as any);
      const result: any = await handlers.get('get_rich_menu')!({ richMenuId: 'richmenu-1' });
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.richMenuId).toBe('richmenu-1');
      expect(result.isError).toBeUndefined();
    });

    it('returns error on failure', async () => {
      vi.mocked(lineService.getRichMenu).mockRejectedValue(new Error('not found'));
      const result: any = await handlers.get('get_rich_menu')!({ richMenuId: 'richmenu-bad' });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Failed');
    });
  });

  describe('delete_rich_menu', () => {
    it('deletes rich menu and returns confirmation', async () => {
      vi.mocked(lineService.deleteRichMenu).mockResolvedValue(undefined);
      const result: any = await handlers.get('delete_rich_menu')!({ richMenuId: 'richmenu-1' });
      expect(lineService.deleteRichMenu).toHaveBeenCalledWith('richmenu-1');
      expect(result.content[0].text).toContain('richmenu-1');
      expect(result.content[0].text).toContain('deleted');
      expect(result.isError).toBeUndefined();
    });

    it('returns error on failure', async () => {
      vi.mocked(lineService.deleteRichMenu).mockRejectedValue(new Error('fail'));
      const result: any = await handlers.get('delete_rich_menu')!({ richMenuId: 'richmenu-1' });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Failed');
    });
  });

  describe('set_default_rich_menu', () => {
    it('sets default rich menu and returns confirmation', async () => {
      vi.mocked(lineService.setDefaultRichMenu).mockResolvedValue(undefined);
      const result: any = await handlers.get('set_default_rich_menu')!({ richMenuId: 'richmenu-1' });
      expect(lineService.setDefaultRichMenu).toHaveBeenCalledWith('richmenu-1');
      expect(result.content[0].text).toContain('richmenu-1');
      expect(result.isError).toBeUndefined();
    });

    it('returns error on failure', async () => {
      vi.mocked(lineService.setDefaultRichMenu).mockRejectedValue(new Error('fail'));
      const result: any = await handlers.get('set_default_rich_menu')!({ richMenuId: 'richmenu-1' });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Failed');
    });
  });

  describe('get_default_rich_menu', () => {
    it('returns default rich menu ID', async () => {
      vi.mocked(lineService.getDefaultRichMenuId).mockResolvedValue('richmenu-default');
      const result: any = await handlers.get('get_default_rich_menu')!({});
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.richMenuId).toBe('richmenu-default');
      expect(result.isError).toBeUndefined();
    });

    it('returns error on failure', async () => {
      vi.mocked(lineService.getDefaultRichMenuId).mockRejectedValue(new Error('fail'));
      const result: any = await handlers.get('get_default_rich_menu')!({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Failed');
    });
  });

  describe('cancel_default_rich_menu', () => {
    it('cancels default rich menu and returns confirmation', async () => {
      vi.mocked(lineService.cancelDefaultRichMenu).mockResolvedValue(undefined);
      const result: any = await handlers.get('cancel_default_rich_menu')!({});
      expect(lineService.cancelDefaultRichMenu).toHaveBeenCalled();
      expect(result.content[0].text).toContain('canceled');
      expect(result.isError).toBeUndefined();
    });

    it('returns error on failure', async () => {
      vi.mocked(lineService.cancelDefaultRichMenu).mockRejectedValue(new Error('fail'));
      const result: any = await handlers.get('cancel_default_rich_menu')!({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Failed');
    });
  });

  describe('link_rich_menu_to_user', () => {
    it('links rich menu to user and returns confirmation', async () => {
      vi.mocked(lineService.linkRichMenuToUser).mockResolvedValue(undefined);
      const result: any = await handlers.get('link_rich_menu_to_user')!({
        userId: 'U123',
        richMenuId: 'richmenu-1',
      });
      expect(lineService.linkRichMenuToUser).toHaveBeenCalledWith('U123', 'richmenu-1');
      expect(result.content[0].text).toContain('richmenu-1');
      expect(result.content[0].text).toContain('U123');
      expect(result.isError).toBeUndefined();
    });

    it('returns error on failure', async () => {
      vi.mocked(lineService.linkRichMenuToUser).mockRejectedValue(new Error('fail'));
      const result: any = await handlers.get('link_rich_menu_to_user')!({
        userId: 'U123',
        richMenuId: 'richmenu-1',
      });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Failed');
    });
  });

  describe('unlink_rich_menu_from_user', () => {
    it('unlinks rich menu from user and returns confirmation', async () => {
      vi.mocked(lineService.unlinkRichMenuFromUser).mockResolvedValue(undefined);
      const result: any = await handlers.get('unlink_rich_menu_from_user')!({ userId: 'U123' });
      expect(lineService.unlinkRichMenuFromUser).toHaveBeenCalledWith('U123');
      expect(result.content[0].text).toContain('U123');
      expect(result.isError).toBeUndefined();
    });

    it('returns error on failure', async () => {
      vi.mocked(lineService.unlinkRichMenuFromUser).mockRejectedValue(new Error('fail'));
      const result: any = await handlers.get('unlink_rich_menu_from_user')!({ userId: 'U123' });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Failed');
    });
  });
});
