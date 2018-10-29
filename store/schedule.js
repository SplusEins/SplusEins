export const state = () => ({
  schedule: {},
  hasLecturesOnWeekend: false, 
});

export const mutations = {
  setSchedule(state, schedule) {
    state.schedule = schedule;
  },
  setHasLecturesOnWeekend(state, hasLectures){
    state.hasLecturesOnWeekend = hasLectures;
  }
};
