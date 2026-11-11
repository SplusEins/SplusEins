import { defineStore } from 'pinia';

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
    dequeueError() {
      this.errorQueue.shift();
    },
  },
});
