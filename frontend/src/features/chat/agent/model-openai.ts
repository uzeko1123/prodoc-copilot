import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { useChatStore } from '../stores';

export type OpenAICompatibleModel = {
  baseUrl: string;
  apiKey: string;
  modelId: string;
};

export function getModel() {
  const openAICompatibleModel = useChatStore.getState().openAICompatibleModel;
  return createOpenAICompatible({
    baseURL: openAICompatibleModel.baseUrl,
    name: 'OpenAI Compatible',
    apiKey: openAICompatibleModel.apiKey,
    includeUsage: true,
  }).chatModel(openAICompatibleModel.modelId);
}
