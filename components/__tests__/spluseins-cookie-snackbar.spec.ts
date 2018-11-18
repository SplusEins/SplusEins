import { mount } from '@vue/test-utils';
import * as Vue_ from 'vue';
import * as Vuetify_ from 'vuetify';
import * as Vuex_ from 'vuex';
import SpluseinsCookieSnackbar from '../spluseins-cookie-snackbar.vue';
import * as PrivacyModule from '../../store/privacy';

const Vue: any = Vue_;
const Vuetify: any = Vuetify_;
const Vuex: any = Vuex_;

Vue.use(Vuetify);
Vue.use(Vuex);

describe('Cookie snackbar', () => {
  let store;

  function mountWithState(allowCookies) {
    const mutations = {
      setCookiesAllowed: jest.fn(),
      setCookiesDenied: jest.fn(),
    };

    store = new Vuex.Store({
      modules: {
        browserStateReady: true,
        privacy: {
          state: { allowCookies, },
          mutations: PrivacyModule.mutations,
          namespaced: true,
        }
      }
    });

    return mount(SpluseinsCookieSnackbar, { store });
  }

  it('should render a snackbar by default', () => {
    const wrapper = mountWithState(undefined);
    expect(wrapper.contains('.v-snack')).toBeTruthy();
  });

  it('should not render a snackbar when consent was given or denied', () => {
    let wrapper = mountWithState(true);
    expect(wrapper.contains('.v-snack')).toBeFalsy();
    wrapper = mountWithState(false);
    expect(wrapper.contains('.v-snack')).toBeFalsy();
  });

  it('should mutate state after giving or denying consent', async () => {
    let wrapper = mountWithState(undefined);
    wrapper.find({ ref: 'btn-allow' }).trigger('click');
    expect(store.state.privacy.allowCookies).toBe(true);

    wrapper = mountWithState(undefined);
    wrapper.find({ ref: 'btn-deny' }).trigger('click');
    expect(store.state.privacy.allowCookies).toBe(false);
  });
});
