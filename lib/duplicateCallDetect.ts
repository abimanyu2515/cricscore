/**
 * Concrete duplicate-call detection for lib/assistantOrchestrator.ts.
 * Drop this in and wire it into the per-round function-call handling loop.
 */

interface ToolCallResult {
  name: string;
  response: unknown;
}

interface FunctionCall {
  functionCall: { name: string; args: Record<string, unknown> };
}


/**
 * Produces a stable key for a tool call regardless of argument key order.
 * { playerId: "1", metric: "runs" } and { metric: "runs", playerId: "1" }
 * must hash identically — this is the part JSON.stringify alone won't do.
 */
function canonicalToolCallKey(name: string, args: Record<string, unknown>): string {
  const sortedArgs = Object.keys(args)
    .sort()
    .reduce<Record<string, unknown>>((acc, key) => {
      acc[key] = args[key];
      return acc;
    }, {});
  return `${name}:${JSON.stringify(sortedArgs)}`;
}
 
export function createToolCallTracker() {
  const seen = new Map<string, unknown>();
  return {
    getCached: (name: string, args: Record<string, unknown>) =>
      seen.get(canonicalToolCallKey(name, args)),
    record: (name: string, args: Record<string, unknown>, result: unknown) =>
      seen.set(canonicalToolCallKey(name, args), result),
  };
}
 
export async function handleFunctionCallsForRound(
  functionCalls: FunctionCall[],
  tracker: ReturnType<typeof createToolCallTracker>,
  executeTool: (name: string, args: Record<string, unknown>) => Promise<unknown>
): Promise<ToolCallResult[]> {
  // Execute genuinely-new calls in parallel; short-circuit duplicates.
  return Promise.all(
    functionCalls.map(async (call) => {
      const cached = tracker.getCached(call.functionCall.name, call.functionCall.args);
      if (cached !== undefined) {
        return {
          name: call.functionCall.name,
          response: {
            note: "You already called this exact tool with these exact arguments earlier in this turn. Do not call it again — use this result to answer now.",
            result: cached,
          },
        };
      }
      const result = await executeTool(call.functionCall.name, call.functionCall.args);
      tracker.record(call.functionCall.name, call.functionCall.args, result);
      return { name: call.functionCall.name, response: result };
    })
  );
}