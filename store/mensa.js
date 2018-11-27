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

<<<<<<< HEAD
=======
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

>>>>>>> 9074a3acd12392595caa7aaf1f6ad4c5cea0e2be
    commit('setWeekPlan', result);
  }
};