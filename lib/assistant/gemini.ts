import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set — assistant route will fail until it is configured.");
}

export const geminiClient = new GoogleGenAI({
  apiKey: apiKey ?? "",
});
