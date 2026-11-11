import { defineStore } from 'pinia';
import dayjs from '../lib/dayjs';
import { apiGet, errorCode } from '../lib/api';
import { locationMap } from '../lib/mensa-location-map.js';
import { useAppStore } from './app';

export const useMensaStore = defineStore('mensa', {
  state: () => ({
    /**
     * List of Mensa objects
     */
    plans: null,
    location: 'wf',
  }),
  getters: {
    getNextAvailablePlan: (state) => {
      if (!state.plans || state.plans.length === 0) {
        return { meals: [] };
      }
      const mappedName = locationMap[state.location] || locationMap.wf;
      const plan = state.plans.find((p) => p.name === mappedName);
      if (!plan || !plan.dayPlans || plan.dayPlans.length === 0) {
        return { meals: [] };
      }

      const today = dayjs().format('YYYY-MM-DD');
      const todayIdx = plan.dayPlans.findIndex((dp) => dp.date === today);
      let dayPlan = plan.dayPlans[todayIdx];

      // A plan is old if today is not friday, the mensa was open today and it's after 15 o'clock
      const now = dayjs();
      const isOld =
        todayIdx !== -1 &&
        now.day() !== 5 && // 5 = friday
        now.hour() > 14;

      // show the next day's plan, IF the current is old and there is another dayPlan
      if (isOld && plan.dayPlans.length > todayIdx + 1) {
        dayPlan = plan.dayPlans[todayIdx + 1];
      }

      // if no plan for today or tomorrow is available, show the next available plan
      if (!dayPlan) {
        dayPlan = plan.dayPlans[0];
      }

      return dayPlan || { meals: [] };
    },
  },
  actions: {
    setLocation(location) {
      this.location = location;
    },
    async load() {
      try {
        this.plans = await apiGet('/api/mensa');
      } catch (error) {
        useAppStore().enqueueError(
          `Mensaplan konnte nicht geladen werden (${errorCode(error)}).`,
        );
        console.error('error during Mensa API call', error.message);
      }
    },
  },
});
