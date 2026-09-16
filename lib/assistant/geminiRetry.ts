/**
 * Reference pattern for handling Gemini 429s in lib/assistantOrchestrator.ts.
 * Wrap whatever function currently calls the Gemini API (generateContent /
 * the function-calling loop step) with this before returning to the route handler.
 *
 * Adjust the actual Gemini call signature to match your existing lib/gemini.ts client.
 */

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 2000; // Gemini free tier resets roughly per-minute; start conservative

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Wraps a Gemini call with exponential backoff on 429s.
 * geminiCallFn should be the function that actually hits the API and throws
 * on non-OK responses (or returns a status you check here — adjust to match
 * your lib/gemini.ts client's error shape).
 */
export async function callGeminiWithBackoff<T>(
  geminiCallFn: () => Promise<T>,
  attempt = 0
): Promise<T> {
  try {
    return await geminiCallFn();
  } catch (err: unknown) {
    const isRateLimit =
      err instanceof Error &&
      (err.message.includes("429") || err.message.toLowerCase().includes("rate limit"));

    if (isRateLimit && attempt < MAX_RETRIES) {
      const delay = BASE_DELAY_MS * Math.pow(2, attempt); // 2s, 4s, 8s
      await sleep(delay);
      return callGeminiWithBackoff(geminiCallFn, attempt + 1);
    }

    // Out of retries or a different error — let the orchestrator's existing
    // error handling / route handler decide what the user sees.
    throw err;
  }
}

/**
 * If you'd rather queue requests than retry them (better for concurrent users
 * sharing one 15 RPM budget), a simple in-memory queue in the same module
 * ensures only one Gemini call is in flight at a time, spaced out to stay
 * under quota. This is process-local, so it only works for a single Vercel
 * function instance — fine for a small single-team app, not a distributed guarantee.
 */
let queue: Promise<unknown> = Promise.resolve();
const MIN_GAP_MS = 4200; // ~14 RPM to stay safely under the 15 RPM ceiling

export function enqueueGeminiCall<T>(geminiCallFn: () => Promise<T>): Promise<T> {
  const result = queue.then(async () => {
    const value = await callGeminiWithBackoff(geminiCallFn);
    await sleep(MIN_GAP_MS);
    return value;
  });
  // Swallow errors in the queue chain itself so one failure doesn't wedge
  // every request behind it; the caller still gets the real rejection via `result`.
  queue = result.catch(() => undefined);
  return result;
}