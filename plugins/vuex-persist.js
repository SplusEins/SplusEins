import VuexPersistence from 'vuex-persist';

export default ({ store }) => {
  window.onNuxtReady(() => new VuexPersistence({
    key: 'spluseins',
    saveState: (key, state, storage) => !state.privacy.allowCookies ? undefined:
      // pass through (https://github.com/championswimmer/vuex-persist/blob/master/src/index.ts#L211)
      storage.setItem(key, JSON.stringify(state)),
    restoreState: (key, storage) => {
      // pass through (https://github.com/championswimmer/vuex-persist/blob/master/src/index.ts#L189)
      const value = (storage).getItem(key);
      return {
        ...typeof value === 'string' ? JSON.parse(value || '{}') : (value || {}),
        browserStateReady: true,
      };
    },
    reducer: (state) => ({
      /* select items to be persisted - must not change the structure! */
      version: state.version,
      theme: state.theme,
      splus: {
        customSchedules: state.splus.customSchedules,
      },
      privacy: {
        allowCookies: state.privacy.allowCookies,
      },
    }),
  }).plugin(store));
};