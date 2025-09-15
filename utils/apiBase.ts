const LOCAL_API = "http://localhost:8080";
const PROD_API = "https://goodforyou-1016624736788.europe-west1.run.app";

// Determine API base at build time
const IS_PRODUCTION = process.env.NODE_ENV === 'production' || process.env.EXPO_PUBLIC_API_BASE === PROD_API;

export function apiBase(): string {
  // If we determined this is a production build, always use production API
  if (IS_PRODUCTION) {
    return PROD_API;
  }

  // Check for explicit environment variable
  if (process.env.EXPO_PUBLIC_API_BASE) {
    return process.env.EXPO_PUBLIC_API_BASE;
  }

  // In web, check window.location
  if (typeof window !== "undefined" && window.location) {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return LOCAL_API;
    }
    // If we're running on a deployed domain, use production
    return PROD_API;
  }

  // In React Native dev builds, use local API
  if (typeof __DEV__ !== "undefined" && __DEV__) {
    return LOCAL_API;
  }

  // Default to production
  return PROD_API;
}
