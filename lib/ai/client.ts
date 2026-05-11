import { createGroq } from "@ai-sdk/groq";

/**
 * Groq client — generous free tier (30 RPM, 14,400 RPD) and globally available.
 * Get a key: https://console.groq.com/keys
 *
 * Env: GROQ_API_KEY
 */
const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Default model for Fleent's AI features.
 * Llama 3.3 70B — fast, smart enough for prioritisation + task breakdown.
 */
export const aiModel = groq("llama-3.3-70b-versatile");
