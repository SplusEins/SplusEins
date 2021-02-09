export const state = () => ({
  faculty: 'wf',
  campusNews: [],
  facultyNews: {}
});

export const mutations = {
  setCampusNews (state, data) {
    state.campusNews = data;
  },
  setFacultyNews (state, data) {
    state.facultyNews = data;
  },
  setFaculty (state, faculty) {
    state.faculty = faculty;
  }
}

export const actions = {
  async loadFacultyNews ({ commit }) {
    const faculties = ['i', 'r', 'e', 'wf', 'wob', 'sud'];
    try {
      const news = await this.$axios.$get('/api/news/faculty');

      const newsMap = {};
      faculties.forEach((faculty) => { newsMap[faculty] = news.filter((article) => article.source == faculty) });

      commit('setFacultyNews', newsMap);
    } catch (error) {
      commit('enqueueError', 'News: API-Verbindung fehlgeschlagen (Fakultät-News)', { root: true });
      console.error('error during News API call (Fakultät-News)', error.message);
    }
  },
  async loadCampusNews ({ commit }) {
    try {
      const campusNews = await this.$axios.$get('/api/news/campus');

      commit('setCampusNews', campusNews);
    } catch (error) {
      commit('enqueueError', 'News: API-Verbindung fehlgeschlagen (Ostfalia-News)', { root: true });
      console.error('error during News API call (Ostfalia-News)', error.message);
    }
  }
};
