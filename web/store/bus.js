export const state = () => ({
  departures: []
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
      commit('enqueueError', 'Bus: API-Verbindung fehlgeschlagen', { root: true });
      console.error('error during Bus API call', error.message);
    }

    commit('setDepartures', result);
  }
};
