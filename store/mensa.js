import * as moment from 'moment';

export const state = () => ({
  weekPlan: [],
});

export const mutations = {
  setWeekPlan(state, data){
    state.weekPlan = data;
  }
}

export const actions = {
  async loadWeek({ state, commit }) {
    let weekdays = [];
    let result = [];

    for(let i = 0; i<5; i++) {
        weekdays.push(moment().startOf('isoWeek').add(i,'days'));
    }
    await Promise.all(weekdays.map(async (day) => {
        try {
            const response = await this.$axios.get(`https://openmensa.org/api/v2/canteens/166/days/${day.format('YYYY-MM-DD')}/meals`);
            result[day.day()-1] = {date: day, data: {...response.data}};
        } catch (error) {
            console.error('error during Mensa API call', error.message);
        }
    }));

    commit('setWeekPlan', result);
  }
};