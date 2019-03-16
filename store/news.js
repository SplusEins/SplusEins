
export const state = () => ({
  loadingGeneral: false,
  loadingSpecific: false,
  generalNewsSource: 'Ostfalia',
  specificNewsSource: 'Ostfalia/wf',
  generalNews: [],
  specificNews: [],
});

export const mutations = {
  setNews(state, { data, generalNews }) {
    generalNews? state.generalNews = data: state.specificNews = data;
  },
  setNewsSource(state, {source, generalNews }) {
    generalNews? state.generalNewsSource = source : state.specificNewsSource = source;
  },
  setLoading(state, { loading, generalNews }) {
    generalNews? state.loadingGeneral = loading : state.loadingSpecific = loading;
  },
}

export const actions = {
  async loadNews({ state, commit }, generalNews) {
    let source;
    let result = [];

    if(generalNews) {
      source = state.generalNewsSource;
      commit('setLoading', { loading: true, generalNews: true });
    } else {
      source = state.specificNewsSource;
      commit('setLoading', { loading: true, generalNews: false });
    }

    try {
      const response = await this.$axios.get(`/api/news/${source}`);
      result = response.data.length != 0? response.data : [{text: 'Keine Daten verfügbar!'}];
    } catch (error) {
      commit('enqueueError', `News: API-Verbindung fehlgeschlagen (${source})`, {root:true});
      console.error(`error during News API call (${source})`, error.message);
    }

    if(generalNews) {
      commit('setNews', { data: result, generalNews: true });
      commit('setLoading', { loading: false, generalNews: true });
    } else {
      commit('setNews', { data: result, generalNews: false });
      commit('setLoading', { loading: false, generalNews: false });
    }
  },
};
