/**
 * Safely format errors from LINE API calls.
 *
 * LINE SDK errors may contain HTTP response bodies that include
 * partial Authorization headers or other sensitive data.
 * This function extracts only the HTTP status code to avoid leaking secrets.
 */
export function formatLineError(error: unknown): string {
  if (!(error instanceof Error)) return 'Unknown error';

  const statusCode = (error as Error & { statusCode?: unknown }).statusCode;
  if (typeof statusCode === 'number') {
    return `LINE API error (HTTP ${statusCode})`;
  }

  return 'Unexpected error';
}
