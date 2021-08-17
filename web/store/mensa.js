import dayjs from 'dayjs';
export const state = () => ({
  /**
   * List of MensaDayPlan objects
   */
  plans: null
});

export const mutations = {
  setPlans (state, data) {
    state.plans = data;
  }
}

export const getters = {
  getNextAvailablePlan: (state) => {
    if (!state.plans || state.plans.length === 0) {
      return { meals: [] };
    }

    // A plan is old if today is not friday, the mensa was open today and it's after 15 o'clock
    const isOld = dayjs().day() != 5 && dayjs().isSame(state.plans[0].date, 'day') && dayjs().hour() > 14

    return isOld ? state.plans[1] : state.plans[0];
  }
}

export const actions = {
  async load ({ state, commit }) {
    if (state.plans != null && state.plans.length > 0 && dayjs().isSame(state.plans[0].date, 'day')) {
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
