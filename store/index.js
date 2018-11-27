export const state = () => ({
  /**
   * State schema version.
   * Should be incremented if the store schema changes and local browser data
   * needs to be migrated.
   */
  version: 1,
  /**
   * Set to true by vuex-persist during restoration.
   */
  browserStateReady: false,
    /**
   * If true, do not load lectures on the server.
   * true if frontend is a static build.
   */
  lazyLoad: false,
});


export const mutations = {
  enableLazyLoad(state) {
    state.lazyLoad = true;
  },
}
