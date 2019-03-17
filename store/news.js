
export const state = () => ({
  loadingSpecific: false,
  specificNewsSource: 'Ostfalia/wf',
  campusNews: [],
  specificNews: [],
});

export const mutations = {
  setCampusNews(state, { data }) {
    state.campusNews = data;
  },
  setSpecificNews(state, { data }) {
    state.specificNews = data;
  },
  setNewsSource(state, { source }) {
    state.specificNewsSource = source;
  },
  setLoading(state, { loading }) {
    state.loadingSpecific = loading;
  },
}

export const actions = {
  async loadSpecificNews({ state, commit }) {
    let result = [];

    const source = state.specificNewsSource;
    commit('setLoading', { loading: true });

    try {
      const response = await this.$axios.get(`/api/news/${source}`);
      result = response.data.length != 0? response.data : [{text: 'Keine Daten verfügbar!'}];
    } catch (error) {
      commit('enqueueError', `News: API-Verbindung fehlgeschlagen (${source})`, {root:true});
      console.error(`error during News API call (${source})`, error.message);
    }

    commit('setSpecificNews', { data: result });
    commit('setLoading', { loading: false });
  },
  async loadCampusNews({ state, commit }) {
    try {
      const ostfaliaNews = await this.$axios.$get('/api/news/ostfalia');
      const campus38News = await this.$axios.$get('/api/news/campus38');

      const truncateArticle = (article) => {
        const sentences = article.text.split('.');
        const text = sentences.reduce((text, sentence) => text.length < 50 ? text + sentence + '.' : text, '');
        return {
          ...article,
          text,
        };
      };

      const articles = [].concat(
        ostfaliaNews.map((article) => ({ ...article, source: 'Ostfalia' })),
        campus38News.map((article) => ({ ...article, source: 'Campus 38' }))
      ).map(truncateArticle);

      const scoreArticle = (article) => {
        const date = new Date(article.date).getTime();
        const now = new Date().getTime();
        const age = now - date;
        const boost = article.source == 'Ostfalia' ? 3.0 : 1.0;
        return age / boost;
      };

      articles.sort((a1, a2) => scoreArticle(a1) - scoreArticle(a2));

      commit('setCampusNews', { data: articles });
    } catch (error) {
      commit('enqueueError', `News: API-Verbindung fehlgeschlagen (Ostfalia-News)`, {root: true});
      console.error(`error during News API call (Ostfalia-News)`, error.message);
    }
  },
};
