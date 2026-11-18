import { defineStore } from 'pinia';
import { errorCode } from '../lib/api';

export const useAppStore = defineStore('app', {
  state: () => ({
    /**
     * Error messages which are shown to the user one after another.
     */
    errorQueue: [],
  }),
  actions: {
    enqueueError(message) {
      this.errorQueue.push(message);
    },
    /**
     * @param what e.g. 'Mensaplan'
     * @param error thrown by apiGet
     */
    reportLoadError(what, error) {
      this.enqueueError(
        `${what} konnte nicht geladen werden (${errorCode(error)}).`,
      );
      console.error(`could not load ${what}`, error.message);
    },
    dequeueError() {
      this.errorQueue.shift();
    },
  },
});
