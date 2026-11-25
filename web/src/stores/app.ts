import { defineStore } from 'pinia';
import { errorCode } from '../lib/api';

export const useAppStore = defineStore('app', {
  state: () => ({
    /**
     * Error messages which are shown to the user one after another.
     */
    errorQueue: [] as string[],
  }),
  actions: {
    enqueueError(message: string) {
      this.errorQueue.push(message);
    },
    /**
     * @param what e.g. 'Mensaplan'
     * @param error thrown by apiGet
     */
    reportLoadError(what: string, error: unknown) {
      this.enqueueError(
        `${what} konnte nicht geladen werden (${errorCode(error)}).`,
      );
      console.error(
        `could not load ${what}`,
        error instanceof Error ? error.message : error,
      );
    },
    dequeueError() {
      this.errorQueue.shift();
    },
  },
});
