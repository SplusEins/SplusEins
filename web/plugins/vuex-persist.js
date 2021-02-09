import VuexPersistence from 'vuex-persist';

export default ({ store }) => {
  window.onNuxtReady(() => new VuexPersistence({
    key: 'spluseins',
    saveState: (key, state, storage) => !state.privacy.allowNecessaryCookies ? undefined
      // pass through (https://github.com/championswimmer/vuex-persist/blob/master/src/index.ts#L211)
      : storage.setItem(key, JSON.stringify(state)),
    restoreState: (key, storage) => {
      // pass through (https://github.com/championswimmer/vuex-persist/blob/master/src/index.ts#L189)
      let value = (storage).getItem(key);
      value = typeof value === 'string' ? JSON.parse(value || '{}') : (value || {});

      // version migration
      if (value.version) {
        // version 2: new semester -> new timetable ids + theme property -> ui property
        if (value.version < 2) {
          value.splus.customSchedules = {};
          value.splus.favoriteSchedules = [];
          value.splus.subscribedTimetable = {};
          if (Object.getOwnPropertyDescriptor(value, 'theme') != undefined) {
            Object.defineProperty(value, 'ui', Object.getOwnPropertyDescriptor(value, 'theme'));
            delete value.theme;
          } else {
            Object.defineProperty(value, 'ui', { isDark: false });
          }
          value.version = 2;
        }

        // version 3: new semester -> new timetables ids
        // version 4: timetable hash ids
        if (value.version < 4) {
          value.splus.customSchedules = {};
          value.splus.favoriteSchedules = [];
          value.splus.subscribedTimetable = {};
          value.version = 4;
        }

        // version 5: new semester
        if (value.version < 5) {
          value.splus.customSchedules = {};
          value.splus.favoriteSchedules = [];
          value.splus.subscribedTimetable = {};
          value.version = 5;
        }

        // version 6: new semester
        if (value.version < 6) {
          value.splus.customSchedules = {};
          value.splus.favoriteSchedules = [];
          value.splus.subscribedTimetable = {};
          value.version = 6;
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
      },
      privacy: {
        allowAllCookies: state.privacy.allowAllCookies,
        allowNecessaryCookies: state.privacy.allowNecessaryCookies
      }
    })
  }).plugin(store));
};
