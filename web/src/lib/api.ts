import { ref } from 'vue';

/**
 * Number of requests which are currently running.
 * App.vue shows a loading bar while this is not 0.
 */
export const pendingRequests = ref(0);

/* thrown by apiGet */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Load JSON data from the SplusEins API.
 * @param path e.g. '/api/mensa'
 * @returns the data, or null if the API has no data (204 No Content)
 * @throws ApiError with the HTTP status code, or a TypeError without connection
 */
export async function apiGet<T>(path: string): Promise<T | null> {
  pendingRequests.value++;
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new ApiError(
        `HTTP ${response.status} for ${path}`,
        response.status,
      );
    }
    if (response.status === 204) {
      return null;
    }
    return (await response.json()) as T;
  } finally {
    pendingRequests.value--;
  }
}

/**
 * @returns the HTTP status code of an error thrown by apiGet for error messages
 */
export function errorCode(error: unknown): number | string {
  return (error instanceof ApiError && error.status) || 'keine Verbindung';
}
