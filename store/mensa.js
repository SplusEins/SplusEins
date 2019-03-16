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
    if(state.weekPlan[0] != undefined && state.weekPlan[0].date == parseInt(moment().format('YYYYMMDD'))) {
        return; // if weekPlan is not empty and data is up-to-date don't fetch
    }
      
    let result = [];

    try {
      const response = await this.$axios.get(`/api/mensa`);
      result = response.data;
    } catch (error) {
        commit('enqueueError', 'Mensa: API-Verbindung fehlgeschlagen', {root:true});
        console.error('error during Mensa API call', error.message);
    }

    commit('setWeekPlan', result);
  }
};