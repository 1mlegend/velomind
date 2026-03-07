import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { config } from "../config";

const openai = new OpenAI({ apiKey: config.openaiKey });
const anthropic = new Anthropic({ apiKey: config.anthropicKey });

const MODEL_MAP: Record<string, { provider: "openai" | "anthropic"; model: string }> = {
  "GPT-4 Private": { provider: "openai", model: "gpt-4o-mini" },
  "LLaMA-70B Encrypted": { provider: "openai", model: "gpt-3.5-turbo" },
  "Mistral-7B Secure": { provider: "openai", model: "gpt-3.5-turbo" },
  "Claude-3 Private": { provider: "anthropic", model: "claude-haiku-4-5-20251001" },
};

export async function runInference(prompt: string, modelName: string): Promise<string> {
  const mapping = MODEL_MAP[modelName];
  if (!mapping) throw new Error(`Unknown model: ${modelName}`);

  if (mapping.provider === "openai") {
    const response = await openai.chat.completions.create({
      model: mapping.model,
      messages: [
        { role: "system", content: "You are a private AI assistant running on VeloMind's decentralized compute network. Provide helpful, concise responses." },
        { role: "user", content: prompt },
      ],
      max_tokens: 1024,
    });
    return response.choices[0]?.message?.content || "No response generated.";
  }

  const response = await anthropic.messages.create({
    model: mapping.model,
    max_tokens: 1024,
    system: "You are a private AI assistant running on VeloMind's decentralized compute network. Provide helpful, concise responses.",
    messages: [{ role: "user", content: prompt }],
  });
  const block = response.content[0];
  return block.type === "text" ? block.text : "No response generated.";
}
