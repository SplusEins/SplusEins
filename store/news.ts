
export const state = () => ({
  generalNewsSource: 'Ostfalia',
  specificNewsSource: 'Ostfalia/wf',
  generalNews: [],
  specificNews: [],
});

export const mutations = {
  setNews(state, { data, generalNews }) {
    console.log('set news', generalNews)
    generalNews? state.generalNews = data: state.specificNews = data;
  },
  setNewsSource(state, {source, generalNews }) {
    generalNews? state.generalNewsSource = source : state.specificNewsSource = source;
  }
}

export const actions = {
  async loadNews({ state, commit }, generalNews: Boolean) {
    let result = [];
    const source = generalNews? state.generalNewsSource : state.specificNewsSource;
    try {
      const response = await this.$axios.get(`/api/news/${source}`);
      result = response.data;
    } catch (error) {
      commit('enqueueError', `News: API-Verbindung fehlgeschlagen (${source})`, {root:true});
      console.error(`error during News API call (${source})`, error.message);
    }

    generalNews? commit('setNews', { data: result, generalNews: true }) : commit('setNews', { data: result, generalNews: false });
  },
};