import { NextRequest, NextResponse } from "next/server";
import type { Content } from "@google/genai";
import { runAssistantTurn } from "@/lib/assistant/assistantOrchestrator";

interface ChatMessage {
  role: "user" | "model";
  text: string;
}

interface RequestBody {
  message?: string;
  history?: ChatMessage[];
}

export async function POST(request: NextRequest) {
  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }
  if (message.length > 2000) {
    return NextResponse.json({ error: "message too long (max 2000 chars)" }, { status: 400 });
  }

  const history: ChatMessage[] = Array.isArray(body.history) ? body.history.slice(-10) : [];

  const contents: Content[] = [];

  for (const h of history) {
    if (h.role === "user" && typeof h.text === "string") {
      contents.push({ role: "user", parts: [{ text: h.text }] });
    } else if (h.role === "model" && typeof h.text === "string") {
      contents.push({ role: "model", parts: [{ text: h.text }] });
    }
  }
  contents.push({ role: "user", parts: [{ text: message }] });

  try {
    const text = await runAssistantTurn(contents);
    return NextResponse.json({ text });
  } catch (err) {
    console.error("assistant route error", err);
    const msg = err instanceof Error ? err.message : String(err);
    const lower = msg.toLowerCase();
    const isQuotaOrRateLimited =
      lower.includes("quota") ||
      lower.includes("rate") ||
      lower.includes("429") ||
      lower.includes("resource_exhausted") ||
      lower.includes("resource exhausted") ||
      lower.includes("maximum requests") ||
      lower.includes("exceeded your current quota") ||
      lower.includes("limit exceeded");
    const isHighDemand =
      lower.includes("high demand") ||
      lower.includes("overloaded") ||
      lower.includes("spikes in demand") ||
      lower.includes("currently experiencing") ||
      lower.includes("unavailable") ||
      lower.includes("503") ||
      lower.includes("try again later");

    if (msg.includes("MAX_TOOL_ROUNDS")) {
      return NextResponse.json({ error: "Assistant tool loop exceeded limit", detail: msg }, { status: 500 });
    }
    if (isQuotaOrRateLimited) {
      return NextResponse.json(
        { error: "LYST has hit its request limit — please try again in a minute.", detail: msg },
        { status: 429 }
      );
    }
    if (isHighDemand) {
      return NextResponse.json(
        {
          error: "This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.",
          detail: msg,
        },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "Assistant failed to respond", detail: msg }, { status: 500 });
  }
}
