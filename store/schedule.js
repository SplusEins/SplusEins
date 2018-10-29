export const state = () => ({
  schedule: {},
  hasLecturesOnWeekend: false, 
});


export const getters = {
  getHasLecturesOnWeekend: (state) => {
    return state.hasLecturesOnWeekend;
  },
};

export const mutations = {
  setSchedule(state, schedule) {
    state.schedule = schedule;
  },
  setHasLecturesOnWeekend(state, hasLectures){
    state.hasLecturesOnWeekend = hasLectures;
  }
};
