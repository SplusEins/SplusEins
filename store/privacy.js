export const state = () => ({
  /**
   * May store cookies.
   * 3 state boolean™.
   */
  allowCookies: undefined,
});

export const mutations = {
  setCookiesAllowed(state) {
    state.allowCookies = true;
  },
  setCookiesDenied(state) {
    state.allowCookies = false;
  },
};
