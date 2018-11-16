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
});