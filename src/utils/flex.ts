import type { FlexContainer } from '../services/line.js';

/**
 * Parse and validate a Flex Message container JSON string.
 *
 * Returns a discriminated-union result:
 * - `{ ok: true, container }` when the string is valid JSON with
 *   `"type"` set to `"bubble"` or `"carousel"`.
 * - `{ ok: false, error }` with a human-readable reason otherwise.
 */
export function parseFlexContainer(
  contents: string,
):
  | { ok: true; container: FlexContainer }
  | { ok: false; error: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(contents);
  } catch {
    return { ok: false, error: 'Invalid Flex container: contents is not valid JSON' };
  }

  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    Array.isArray(parsed) ||
    ((parsed as Record<string, unknown>).type !== 'bubble' &&
      (parsed as Record<string, unknown>).type !== 'carousel')
  ) {
    return {
      ok: false,
      error:
        'Invalid Flex container: must be a JSON object with "type" set to "bubble" or "carousel"',
    };
  }

  return { ok: true, container: parsed as FlexContainer };
}
