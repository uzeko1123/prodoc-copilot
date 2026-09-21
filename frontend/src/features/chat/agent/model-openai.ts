import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

const BASE_URL = 'https://open.bigmodel.cn/api/paas/v4';

const API_KEY = '26073da819274bb983f3738aa40e7d41.KFJFuEAQU2nPmdxf';

const MODEL = 'glm-5.3';

export const model = createOpenAICompatible({
  baseURL: BASE_URL,
  name: '',
  apiKey: API_KEY,
  includeUsage: true,
}).chatModel(MODEL);
