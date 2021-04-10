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
  async loadFacultyNews ({ commit, state }) {
    try {
      const news = await this.$axios.$get(`/api/news/${state.faculty}`, { params: { limit: 2 } });
      commit('setFacultyNews', news);
    } catch (error) {
      const errorCode = error.response ? error.response.status : 'unknown error'
      commit('enqueueError', `Fakultät-News konnten nicht geladen werden (${errorCode}).`, { root: true });
      console.error('error during News API call (Fakultät-News)', error.message);
    }
  },
  async loadCampusNews ({ commit }) {
    const campusSelectors = ['campus', 'campus38'];
    try {
      const campusNews = await this.$axios.$get(`/api/news/${campusSelectors.join(',')}`, { params: { limit: 5 } });
      commit('setCampusNews', campusNews);
    } catch (error) {
      const errorCode = error.response ? error.response.status : 'unknown error'
      commit('enqueueError', `Campus-News konnten nicht geladen werden (${errorCode}).`, { root: true });
      console.error('error during News API call (Ostfalia-News)', error.message);
    }
  }
};
