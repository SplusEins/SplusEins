import { ref } from 'vue';

/**
 * Number of requests which are currently running.
 * App.vue shows a loading bar while this is not 0.
 */
export const pendingRequests = ref(0);

/**
 * Load JSON data from the SplusEins API.
 * @param path e.g. '/api/mensa'
 * @returns the data, or null if the API has no data (204 No Content)
 * @throws Error with the HTTP status code as `status`, if there is one
 */
export async function apiGet(path) {
  pendingRequests.value++;
  try {
    const response = await fetch(path);
    if (!response.ok) {
      const error = new Error(`HTTP ${response.status} for ${path}`);
      error.status = response.status;
      throw error;
    }
    if (response.status === 204) {
      return null;
    }
    return await response.json();
  } finally {
    pendingRequests.value--;
  }
}

/**
 * @returns the HTTP status code of an error thrown by apiGet for error messages
 */
export function errorCode(error) {
  return error.status || 'keine Verbindung';
}
