import VuexPersistence from 'vuex-persist';

export default ({ store }) => {
  window.onNuxtReady(() => new VuexPersistence({
    key: 'spluseins',
    // pass through (https://github.com/championswimmer/vuex-persist/blob/master/src/index.ts#L211)
    saveState: (key, state, storage) => storage.setItem(key, JSON.stringify(state)),
    restoreState: (key, storage) => {
      // pass through (https://github.com/championswimmer/vuex-persist/blob/master/src/index.ts#L189)
      let value = (storage).getItem(key);
      value = typeof value === 'string' ? JSON.parse(value || '{}') : (value || {});

      // version migration
      if (value.version) {
        if (value.version < 13) { // TODO Semesterwechsel increment this
          value.splus.customSchedules = {};
          value.splus.favoriteSchedules = [];
          value.splus.subscribedTimetable = {};
          value.version = 13; // TODO Semesterwechsel increment this
        }
      }

      return {
        ...value,
        browserStateReady: true
      };
    },
    reducer: (state) => ({
      /* select items to be persisted - must not change the structure! */
      version: state.version,
      ui: {
        isDark: state.ui.isDark
      },
      splus: {
        customSchedules: state.splus.customSchedules,
        favoriteSchedules: state.splus.favoriteSchedules,
        subscribedTimetable: state.splus.subscribedTimetable
      },
      news: {
        faculty: state.news.faculty
      }
    })
  }).plugin(store));
};
