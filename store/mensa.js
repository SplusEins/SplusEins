import * as moment from 'moment';

export const state = () => ({
  weekPlan: [],
});

export const mutations = {
  setWeekPlan(state, data){
    state.weekPlan = data;
  },
}

export const actions = {
  async loadWeek({ state, commit }) {
    let result = [];

    try {
      const response = await this.$axios.get(`/api/splus/mensa`);
      result = response.data;
    } catch (error) {
        commit('setError', 'API-Verbindung fehlgeschlagen');
        console.error('error during Mensa API call', error.message);
    }

    commit('setWeekPlan', result);
  }
};