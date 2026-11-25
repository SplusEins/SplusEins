import { defineStore } from 'pinia';
import dayjs from '../lib/dayjs';
import { apiGet } from '../lib/api';
import { useAppStore } from './app';
import type { Mensa, MensaDayPlan, MensaMeal } from '../types';

/* a day plan, or no meals if there is none */
type NextPlan = Partial<MensaDayPlan> & { meals: MensaMeal[] };

export const useMensaStore = defineStore('mensa', {
  state: () => ({
    /**
     * List of Mensa objects
     */
    plans: null as Mensa[] | null,
    /**
     * key of the selected mensa, e.g. 'wf'
     */
    location: 'wf',
  }),
  getters: {
    /**
     * The selected mensa, or the first one if it is not available.
     */
    selectedPlan: (state) =>
      state.plans?.find((plan) => plan.key === state.location) ??
      state.plans?.[0],
    getNextAvailablePlan(): NextPlan {
      const plan = this.selectedPlan;
      if (!plan || plan.dayPlans.length === 0) {
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
    /**
     * 'Heute' or 'Morgen' if the next plan is for one of these days, otherwise undefined
     */
    nextPlanDay(): 'Heute' | 'Morgen' | undefined {
      const date = this.getNextAvailablePlan.date;
      if (!date) return undefined;
      if (dayjs().isSame(date, 'day')) return 'Heute';
      if (dayjs().add(1, 'day').isSame(date, 'day')) return 'Morgen';
      return undefined;
    },
  },
  actions: {
    setLocation(location: string) {
      this.location = location;
    },
    async load() {
      try {
        this.plans = await apiGet<Mensa[]>('/api/mensa');
      } catch (error) {
        useAppStore().reportLoadError('Mensaplan', error);
      }
    },
  },
});
