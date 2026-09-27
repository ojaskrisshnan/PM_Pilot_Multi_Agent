export type LLMProviderMode = 'preset' | 'ollama' | 'cloud_api' | 'hybrid';

export type CloudApiVendor = 'gemini' | 'openai' | 'groq' | 'openrouter';

export interface LLMConfig {
  mode: LLMProviderMode;
  ollamaEndpoint: string; // default: http://localhost:11434
  ollamaModel: string; // default: llama3.2
  cloudVendor: CloudApiVendor;
  apiKey: string;
  cloudModel: string; // default: gemini-1.5-flash or gpt-4o-mini
  temperature: number;
  maxTokens: number;
}

export interface OllamaModelInfo {
  name: string;
  size: number;
  digest: string;
  modified_at: string;
}

export interface LLMTestResult {
  success: boolean;
  message: string;
  latencyMs?: number;
  availableModels?: string[];
}
