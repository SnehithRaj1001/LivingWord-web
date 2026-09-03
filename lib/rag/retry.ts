/**
 * Retries an async operation with exponential backoff.
 * Handles 503 / "overloaded" Gemini API errors gracefully.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 4,
  baseDelayMs = 1000
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const message: string = err?.message || String(err);
      const isOverloaded =
        message.includes("overloaded") ||
        message.includes("503") ||
        message.includes("rate limit") ||
        message.includes("quota");

      if (!isOverloaded || attempt === maxAttempts) {
        throw err;
      }

      const delay = baseDelayMs * 2 ** (attempt - 1); // 1s, 2s, 4s …
      console.warn(`Gemini API overloaded – retry ${attempt}/${maxAttempts} after ${delay}ms`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw lastError;
}
