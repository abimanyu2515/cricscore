import { geminiClient } from "@/lib/assistant/gemini";
import { functionDeclarations, executeToolCall } from "@/lib/assistant/assistantTools";
import { ASSISTANT_SYSTEM_INSTRUCTION } from "@/lib/assistant/assistantSystemPrompt";
import { createToolCallTracker, handleFunctionCallsForRound } from "@/lib/duplicateCallDetect";
import { FunctionCallingConfigMode, type Content, type Part } from "@google/genai";
import { getPlayerRoster } from "@/lib/playerRoster";
import { pickLeastLoadedModel, enqueueModelCall } from "@/lib/assistant/modelQueue";

export const MAX_TOOL_ROUNDS = 4;

interface FunctionCallPart {
  functionCall: { name: string; args: Record<string, unknown> };
}

function extractFunctionCalls(parts: Part[]): FunctionCallPart[] {
  const calls: FunctionCallPart[] = [];
  for (const p of parts) {
    if (p.functionCall && typeof p.functionCall.name === "string") {
      calls.push({
        functionCall: {
          name: p.functionCall.name,
          args: (p.functionCall.args ?? {}) as Record<string, unknown>,
        },
      });
    }

  }
  return calls;
}

function extractText(parts: Part[]): string {
  return parts
    .map((p) => (typeof p.text === "string" ? p.text : ""))
    .join("")
    .trim();
}

/**
 * Looping tool-call handler for Gemini.
 * - Loops generateContent until no functionCall parts remain
 * - Handles parallel function calls in one turn
 * - Pushes full model Content as-is to preserve thoughtSignature metadata
 * - Capped at MAX_TOOL_ROUNDS
 */
export async function runAssistantTurn(initialContents: Content[]): Promise<string> {
  const contents: Content[] = [...initialContents];
  const tracker = createToolCallTracker();

  const roster = await getPlayerRoster();
  const rosterListing = roster.map((p) => `- ${p.name} (id: ${p.id})`).join("\n");

  const selectedModel = pickLeastLoadedModel();

  const systemInstructionWithRoster = `${ASSISTANT_SYSTEM_INSTRUCTION}
    
    KNOWN PLAYERS (name: id) — use this list to resolve a player's name to their id
    directly. DO NOT CALL query_team_data on the players table to look up an id;
    you already have the full roster below.
    
    ${rosterListing}
    
    NEVER PRINT or DISPLAY any players id in your response. player ids are sensitive information. If a name in the user's question matches more than one player above, or does
    not clearly match any player, do not guess — ask the user to clarify which
    player they mean before calling any other tool.`;

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const response = await enqueueModelCall(selectedModel, () =>
      geminiClient.models.generateContent({
        model: selectedModel,
        contents,
        config: {
          systemInstruction: systemInstructionWithRoster,
          tools: [{ functionDeclarations }],
          toolConfig: {
            functionCallingConfig: { mode: FunctionCallingConfigMode.AUTO },
          },
          temperature: 0,
        },
      })
    );

    const candidate = response.candidates?.[0];
    const parts: Part[] = (candidate?.content?.parts ?? []) as Part[];

    const functionCalls = extractFunctionCalls(parts);

    console.log(`[round ${round}]`, functionCalls.map(fc => ({
      name: fc.functionCall.name,
      args: fc.functionCall.args,
    })));

    // No tool calls — return natural language answer
    if (functionCalls.length === 0) {
      const responseText = response.text ?? extractText(parts);
      return responseText || "No response";
    }

    // Check cap before executing next round — if this is the last allowed round and model still wants tools, fail
    if (round === MAX_TOOL_ROUNDS - 1) {
      throw new Error(`MAX_TOOL_ROUNDS (${MAX_TOOL_ROUNDS}) exceeded — model still requesting tool calls. Aborting to prevent infinite loop.`);
    }

    // Preserve full model content as-is (includes thoughtSignature, thought parts)
    const modelContent = candidate?.content as Content | undefined;
    if (modelContent && modelContent.parts && modelContent.parts.length > 0) {
      contents.push(modelContent);
    } else {
      // Fallback should not happen — synthesize minimal but preserve rounds
      contents.push({
        role: "model",
        parts: functionCalls.map((fc) => ({
          functionCall: { name: fc.functionCall.name, args: fc.functionCall.args },
        })),
      });
    }

    // Deduplicate duplicate tool calls within this turn (order-insensitive args) and short-circuit retries
    const toolResponses = await handleFunctionCallsForRound(
      functionCalls,
      tracker,
      async (name, args) => {
        try {
          return (await executeToolCall(name, args)) as Record<string, unknown>;
        } catch (e) {
          console.log("TEMP SYSTEM ERROR: tool call failed", {
            name,
            args,
            timestamp: new Date().toISOString(),
            error: e instanceof Error ? e.message : e,
            // Supabase/PostgREST errors often carry more useful detail than
            // the generic Error message — code/details/hint if present
            code: (e as { code?: string })?.code,
            details: (e as { details?: string })?.details,
          });
          const message = e instanceof Error ? e.message : String(e);
          return { error: message } as Record<string, unknown>;
        }
      }
    );

    const functionResponseParts: Part[] = toolResponses.map((r) => ({
      functionResponse: {
        name: r.name,
        response: r.response as Record<string, unknown>,
      },
    }));

    contents.push({
      role: "user",
      parts: functionResponseParts,
    });

    // loop continues — next generateContent will see tool outputs
  }

  throw new Error(`MAX_TOOL_ROUNDS (${MAX_TOOL_ROUNDS}) exceeded — tool-calling loop did not converge.`);
}
