import dayjs from 'dayjs';
import { locationMap } from '~/lib/mensa-location-map.js';

export const state = () => ({
  /**
   * List of Mensa objects
   */
  plans: null,
  location: 'wf'
});

export const mutations = {
  setPlans (state, data) {
    state.plans = data;
  },
  setLocation (state, location) {
    state.location = location;
  }
}

export const getters = {
  getNextAvailablePlan: (state) => {
    if (!state.plans || state.plans.length === 0) {
      return { meals: [] };
    }
    const mappedName = locationMap[state.location] || locationMap.wf;
    const plan = state.plans.find(p => p.name === mappedName);
    if (!plan || !plan.dayPlans || plan.dayPlans.length === 0) {
      return { meals: [] };
    }

    const today = dayjs().format('YYYY-MM-DD');
    const todayIdx = plan.dayPlans.findIndex(dp => dp.date === today);
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
  location: (state) => state.location
}

export const actions = {
  async load ({ state, commit }) {
    if (state.plans != null && state.plans[0].length > 0 && dayjs().isSame(state.plans[0].dayPlan[0].date, 'day')) {
      return; // If weekPlan is not empty and data is up-to-date don't fetch
    }

    let result = [];

    try {
      const response = await this.$axios.get('/api/mensa');
      result = response.data;
    } catch (error) {
      const errorCode = error.response ? error.response.status : 'unknown error'
      commit('enqueueError', `Mensaplan konnte nicht geladen werden (${errorCode}).`, { root: true });
      console.error('error during Mensa API call', error.message);
      return
    }

    commit('setPlans', result);
  }
};
