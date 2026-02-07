import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import type { LanguageModel } from 'ai';

// Provider factory
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

// Model registry
const MODEL_MAP: Record<string, () => LanguageModel> = {
  // OpenAI
  'gpt-4o-mini': () => openai('gpt-4o-mini'),
  'gpt-4o': () => openai('gpt-4o'),
  'gpt-4.1': () => openai('gpt-4.1'),
  'gpt-4.1-mini': () => openai('gpt-4.1-mini'),

  // Anthropic
  'claude-sonnet-4-20250514': () => anthropic('claude-sonnet-4-20250514'),
  'claude-haiku-4-20250414': () => anthropic('claude-haiku-4-20250414'),

  // Google
  'gemini-2.5-flash': () => google('gemini-2.5-flash-preview-04-17'),
  'gemini-2.5-pro': () => google('gemini-2.5-pro-preview-05-06'),
};

export type AIProvider = 'openai' | 'anthropic' | 'google';

export type ModelConfig = {
  provider: AIProvider;
  model: string;
};

// Get model for chat (high volume, cost-optimized)
export function getChatModel(): LanguageModel {
  const modelName = process.env.AI_CHAT_MODEL ?? 'gpt-4o-mini';
  const factory = MODEL_MAP[modelName];

  if (!factory) {
    throw new Error(
      `Unknown chat model: ${modelName}. Available: ${Object.keys(MODEL_MAP).join(', ')}`
    );
  }

  return factory();
}

// Get model for quality tasks (Motivationsschreiben, Sprach-Bridge)
export function getQualityModel(): LanguageModel {
  const modelName = process.env.AI_QUALITY_MODEL ?? 'claude-sonnet-4-20250514';
  const factory = MODEL_MAP[modelName];

  if (!factory) {
    throw new Error(
      `Unknown quality model: ${modelName}. Available: ${Object.keys(MODEL_MAP).join(', ')}`
    );
  }

  return factory();
}

// Get any specific model by name
export function getModel(modelName: string): LanguageModel {
  const factory = MODEL_MAP[modelName];
  if (!factory) {
    throw new Error(`Unknown model: ${modelName}`);
  }
  return factory();
}

// List available models
export function getAvailableModels(): string[] {
  return Object.keys(MODEL_MAP);
}
