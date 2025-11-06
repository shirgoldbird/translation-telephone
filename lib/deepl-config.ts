// DeepL API server URLs - shared constants
export const DEEPL_FREE_API_URL = 'https://api-free.deepl.com';
export const DEEPL_PRO_API_URL = 'https://api.deepl.com';

// Helper function to get the appropriate server URL based on API type
export function getDeepLServerUrl(isFree: boolean): string {
  return isFree ? DEEPL_FREE_API_URL : DEEPL_PRO_API_URL;
}
