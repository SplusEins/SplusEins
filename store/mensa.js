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
    let openDays = [];
    let weekdays = [];
    let result = [];

    try {
      const response = await this.$axios.get(`https://openmensa.org/api/v2/canteens/166/days`);
      openDays = response.data;
    } catch (error) {
        console.error('error during Mensa API call', error.message);
    }

    for(let i=0; i<3; i++) {
        weekdays.push(moment(openDays[i].date));
    }

    await Promise.all(weekdays.map(async (day) => {
        try {
            const response = await this.$axios.get(`https://openmensa.org/api/v2/canteens/166/days/${day.format('YYYY-MM-DD')}/meals`);
            result.push({id: day.month() + day.day(), date: day.format('YYYY-MM-DD'), data: {...response.data}});
        } catch (error) {
            console.error('error during Mensa API call', error.message);
        }
    }));

    result = result.sort((a,b) => a.id > b.id);

    commit('setWeekPlan', result);
  }
};