export const state = () => ({
  departures: null
});

export const mutations = {
  setDepartures (state, data) {
    state.departures = data;
  }
}

export const actions = {
  async load ({ commit }) {
    let result = [];

    try {
      const response = await this.$axios.get('/api/bus');
      result = response.data;
    } catch (error) {
      const errorCode = error.response ? error.response.status : 'unknown error'
      commit('enqueueError', `Busplan konnte nicht geladen werden (${errorCode}).`, { root: true });
      console.error('error during Bus API call', error.message);
    }

    commit('setDepartures', result);
  }
};
