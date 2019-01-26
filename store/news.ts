
export const state = () => ({
  generalNewsSource: 'Ostfalia',
  generalNews: [],
});

export const mutations = {
  setGeneralNews(state, data) {
    state.generalNews = data;
  },
  setGeneralNewsSource(state, source:string) {
      state.generalNewsSource = source;
  }
}

export const actions = {
  async loadGeneralNews({ state, commit }) {
    let result = [];
    try {
      const response = await this.$axios.get(`/api/news/${state.generalNewsSource}`);
      result = response.data;
    } catch (error) {
        commit('enqueueError', `News: API-Verbindung fehlgeschlagen (${state.generalNewsSource})`, {root:true});
        console.error(`error during News API call (${state.generalNewsSource})`, error.message);
    }

    commit('setGeneralNews', result);
  }
};