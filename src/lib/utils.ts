import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const API_KEY_STORAGE_PREFIX = "llm_benchmark_apikey_";

export function saveApiKey(serviceName: string, apiKey: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(`${API_KEY_STORAGE_PREFIX}${serviceName.toUpperCase()}`, apiKey);
      console.log(`API Key for ${serviceName} saved.`);
    } catch (error) {
      console.error(`Error saving API key for ${serviceName} to local storage:`, error);
      // Optionally, notify the user if saving fails
    }
  } else {
    console.warn("Local storage is not available. API key not saved.");
  }
}

export function getApiKey(serviceName: string): string | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const key = localStorage.getItem(`${API_KEY_STORAGE_PREFIX}${serviceName.toUpperCase()}`);
      // console.log(`API Key for ${serviceName} retrieved: ${key ? 'found' : 'not found'}`);
      return key;
    } catch (error) {
      console.error(`Error retrieving API key for ${serviceName} from local storage:`, error);
      return null;
    }
  } else {
    console.warn("Local storage is not available. Cannot retrieve API key.");
    return null;
  }
}
