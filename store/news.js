import { flatten } from "../lib/util";

export const state = () => ({
  faculty: 'wf',
  campusNews: [],
  facultyNews: {},
});

export const mutations = {
  setCampusNews(state, data) {
    state.campusNews = data;
  },
  setFacultyNews(state, data) {
    state.facultyNews = data;
  },
  setFaculty(state, faculty) {
    state.faculty = faculty;
  },
}

export const actions = {
  async loadFacultyNews({ state, commit }) {
    const faculties = ['i', 'e', 'r', 'wf', 'wob', 'sz', 'sud'];
    try {
      const news = await Promise.all(
        faculties.map(async (faculty) => ({
          faculty,
          articles: (await this.$axios.$get('/api/news/ostfalia/' + faculty)),
        }))
      );
      const newsMap = {};
      news.forEach(({ faculty, articles }) => newsMap[faculty] = articles);

      commit('setFacultyNews', newsMap);
    } catch (error) {
      commit('enqueueError', `News: API-Verbindung fehlgeschlagen (Fakultät-News)`, {root:true});
      console.error(`error during News API call (Fakultät-News)`, error.message);
    }
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

      commit('setCampusNews', articles);
    } catch (error) {
      commit('enqueueError', `News: API-Verbindung fehlgeschlagen (Ostfalia-News)`, {root: true});
      console.error(`error during News API call (Ostfalia-News)`, error.message);
    }
  },
};
