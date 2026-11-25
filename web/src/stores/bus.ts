import { defineStore } from 'pinia';
import { apiGet } from '../lib/api';
import { useAppStore } from './app';
import type { BusDepartures } from '../types';

export const useBusStore = defineStore('bus', {
  state: () => ({
    departures: null as BusDepartures['departures'] | null,
    lastUpdated: null as number | null,
  }),
  actions: {
    async load() {
      try {
        const data = await apiGet<BusDepartures>('/api/bus');
        this.departures = data?.departures ?? null;
        this.lastUpdated = data?.lastUpdated ?? null;
      } catch (error) {
        useAppStore().reportLoadError('Busplan', error);
        // keep departures which were loaded earlier
        this.departures ??= { exerToFh: [], fhToExer: [] };
      }
    },
  },
});
