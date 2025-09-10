export const state = () => ({
  departures: null,
  lastUpdated: null
});

export const mutations = {
  setDepartures (state, data) {
    state.departures = data.departures;
    state.lastUpdated = data.lastUpdated;
  }
}

export const actions = {
  async load ({ commit }) {
    let departures = [];
    let lastUpdated = null;

    try {
      const response = await this.$axios.get('/api/bus');
      departures = response.data.departures;
      lastUpdated = response.data.lastUpdated;
    } catch (error) {
      const errorCode = error.response ? error.response.status : 'unknown error'
      commit('enqueueError', `Busplan konnte nicht geladen werden (${errorCode}).`, { root: true });
      console.error('error during Bus API call', error.message);
    }

    commit('setDepartures', { departures, lastUpdated });
  }
};
