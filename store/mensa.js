import * as moment from 'moment';

export const state = () => ({
  weekPlan: [],
});

export const mutations = {
  setWeekPlan(state, data){
    state.weekPlan = data;
  },
}

export const getters = {
  getNextAvailablePlan: (state) => {
    if(state.weekPlan.length == 0){
      return {};
    }

    // a plan is old if today is not friday, the mensa was open today and it's after 15 o'clock
    const isOld = moment().day() != 5 && moment().isSame(state.weekPlan[0].date, 'day') && moment().hour() > 14

    return isOld ? state.weekPlan[1] : state.weekPlan[0];
  },
}

export const actions = {
  async loadWeek({ state, commit }) {
    if(state.weekPlan[0] != undefined && moment().isSame(state.weekPlan[0].date, 'day')) {
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