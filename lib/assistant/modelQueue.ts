/**
 * Replaces lib/geminiRetry.ts's single-queue enqueueGeminiCall with two
 * independent per-model queues, each tracking live pending load, plus a
 * router that picks whichever model currently has less backlog.
 *
 * Both models share identical published limits (confirmed: 15 RPM each),
 * so MIN_GAP_MS is the same for both — adjust independently if that changes.
 */

const MODEL_NAMES = ["gemini-3.1-flash-lite", "gemini-3.5-flash-lite"] as const;
export type ModelName = (typeof MODEL_NAMES)[number];

const MIN_GAP_MS = 4200; // ~14 RPM per model, safety margin under the 15 RPM ceiling
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 2000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface ModelQueueState {
  queue: Promise<unknown>;
  pending: number; // calls currently queued or in-flight for this model
}

const modelStates: Record<ModelName, ModelQueueState> = {
  "gemini-3.1-flash-lite": { queue: Promise.resolve(), pending: 0 },
  "gemini-3.5-flash-lite": { queue: Promise.resolve(), pending: 0 },
};

function isTransientGeminiError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const lower = err.message.toLowerCase();
  return (
    err.message.includes("429") ||
    err.message.includes("503") ||
    lower.includes("rate limit") ||
    lower.includes("quota") ||
    lower.includes("resource_exhausted") ||
    lower.includes("resource exhausted") ||
    lower.includes("overloaded") ||
    lower.includes("high demand") ||
    lower.includes("unavailable") ||
    lower.includes("try again later")
  );
}

async function callWithBackoff<T>(fn: () => Promise<T>, attempt = 0): Promise<T> {
  try {
    return await fn();
  } catch (err: unknown) {
    if (isTransientGeminiError(err) && attempt < MAX_RETRIES) {
      await sleep(BASE_DELAY_MS * Math.pow(2, attempt));
      return callWithBackoff(fn, attempt + 1);
    }
    throw err;
  }
}

/**
 * Call this ONCE when a new conversation starts (not per round, not per
 * message within an existing conversation) — see integration note below
 * on where "once per conversation" actually needs to live.
 */
export function pickLeastLoadedModel(): ModelName {
  const [best] = MODEL_NAMES.map((name) => [name, modelStates[name].pending] as const).sort(
    (a, b) => a[1] - b[1]
  );
  return best[0];
}

/**
 * Enqueues a call on the specified model's independent queue.
 * Pending count increments immediately (reflects queued + in-flight load)
 * and decrements once the call and its spacing delay both complete.
 */
export function enqueueModelCall<T>(model: ModelName, fn: () => Promise<T>): Promise<T> {
  const state = modelStates[model];
  state.pending += 1;

  const result = state.queue.then(async () => {
    const value = await callWithBackoff(fn);
    await sleep(MIN_GAP_MS);
    return value;
  });

  state.queue = result.catch(() => undefined);
  result.finally(() => {
    state.pending -= 1;
  });

  return result;
}