import { createGoogleGenerativeAI } from "@ai-sdk/google";

/**
 * Google Gemini client.
 *
 * Uses the free tier of `gemini-2.0-flash` — 15 RPM / 1,500 RPD as of writing.
 * Set GOOGLE_GENERATIVE_AI_API_KEY in .env.local.
 *
 * Get a key: https://aistudio.google.com/apikey
 */
export const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

/** Fast, free-tier model good for short prompts and structured outputs. */
export const flashModel = google("gemini-2.0-flash");
