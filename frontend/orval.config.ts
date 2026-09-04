import { defineConfig } from 'orval';

export default defineConfig({
  api: {
    input: 'http://localhost:8000/api/schema/',
    output: {
      client: 'react-query',
      httpClient: 'axios',
      mode: 'tags-split',
      target: './src/api/gen/endpoints',
      schemas: './src/api/gen/models',
      clean: true,
      formatter: 'prettier',
      override: {
        mutator: {
          path: './src/api/mutator/custom-instance.ts',
          name: 'customInstance',
        },
      },
    },
  },
  zod: {
    input: 'http://localhost:8000/api/schema/',
    output: {
      client: 'zod',
      mode: 'tags-split',
      target: 'src/api/gen/zod',
      clean: true,
      formatter: 'prettier',
    },
  },
});
