import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: './lib/openapi.json',
  output: './lib/api',
  plugins: ['@hey-api/client-fetch'],
});