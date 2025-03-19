// NOTE: This file was partially generated using AI assistance.
import { Configuration } from './configuration';
import { DefaultApi } from './api';

// Get the API URL from environment variables, defaulting to localhost:8000
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create a configuration instance with the base URL
const config = new Configuration({
  basePath: API_URL,
});

// Create and export a configured API client instance
export const api = new DefaultApi(config); 