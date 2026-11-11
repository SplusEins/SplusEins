import { defineStore } from 'pinia';
import { apiGet, errorCode } from '../lib/api';
import { useAppStore } from './app';

export const useBusStore = defineStore('bus', {
  state: () => ({
    departures: null,
    lastUpdated: null,
  }),
  actions: {
    async load() {
      try {
        const data = await apiGet('/api/bus');
        this.departures = data.departures;
        this.lastUpdated = data.lastUpdated;
      } catch (error) {
        useAppStore().enqueueError(
          `Busplan konnte nicht geladen werden (${errorCode(error)}).`,
        );
        console.error('error during Bus API call', error.message);
        // keep departures which were loaded earlier
        this.departures = this.departures || [];
      }
    },
  },
});
