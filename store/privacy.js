export const state = () => ({
  /**
   * May store cookies.
   * 3 state boolean™.
   */
  allowAllCookies: undefined,
  allowNecessaryCookies: undefined,
});

export const mutations = {
  setAllCookiesAllowed(state) {
    state.allowAllCookies = true;
    state.allowNecessaryCookies = true;
  },
  setNecessaryCookiesAllowed(state) {
    state.allowAllCookies = false;
    state.allowNecessaryCookies = true;
  },
  setAllCookiesDenied(state) {
    state.allowAllCookies = false;
    state.allowNecessaryCookies = false;
  },
};
