import { defineStore } from 'pinia';
import { apiGet } from '../lib/api';

export const useBusStore = defineStore('bus', {
  state: () => ({
    departures: null,
    lastUpdated: null,
    failed: false,
  }),
  actions: {
    async load() {
      try {
        const data = await apiGet('/api/bus');
        this.departures = data.departures;
        this.lastUpdated = data.lastUpdated;
        this.failed = false;
      } catch (error) {
        // keep departures which were loaded earlier, they show when they were updated
        console.error('could not load Busplan', error.message);
        this.failed = true;
      }
    },
  },
});
