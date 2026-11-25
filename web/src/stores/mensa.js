import { defineStore } from 'pinia';
import dayjs from '../lib/dayjs';
import { apiGet } from '../lib/api';
import { relativeDay } from '../lib/mensa';
import { useAppStore } from './app';
import { useSplusStore } from './splus';

export const useMensaStore = defineStore('mensa', {
  state: () => ({
    /**
     * List of Mensa objects
     */
    plans: null,
    /**
     * key of the mensa chosen by the user, e.g. 'wf', or null to choose by faculty
     */
    chosenLocation: null,
    /**
     * meals to show: 'all', 'vegetarian' or 'vegan'
     */
    diet: 'all',
  }),
  getters: {
    /**
     * The chosen mensa, else the one of the first saved faculty, else the first one.
     */
    selectedPlan(state) {
      const faculty = useSplusStore().savedFaculties[0];
      return (
        state.plans?.find((plan) => plan.key === state.chosenLocation) ??
        state.plans?.find((plan) => plan.faculties?.includes(faculty)) ??
        state.plans?.[0]
      );
    },
    getNextAvailablePlan() {
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
    nextPlanDay() {
      const date = this.getNextAvailablePlan.date;
      return date ? relativeDay(date) : undefined;
    },
  },
  actions: {
    setLocation(location) {
      this.chosenLocation = location;
    },
    async load() {
      try {
        this.plans = await apiGet('/api/mensa');
      } catch (error) {
        useAppStore().reportLoadError('Mensaplan', error);
      }
    },
  },
});
