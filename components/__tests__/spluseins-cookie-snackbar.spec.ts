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

  function mountWithState(allowAllCookies, allowNecessaryCookies) {
    const mutations = {
      setNecessaryCookiesAllowed: jest.fn(),
      setAllCookiesAllowed: jest.fn(),
      setAllCookiesDenied: jest.fn(),
    };

    store = new Vuex.Store({
      modules: {
        browserStateReady: true,
        privacy: {
          state: {
            allowAllCookies,
            allowNecessaryCookies,
          },
          mutations: PrivacyModule.mutations,
          namespaced: true,
        }
      }
    });

    return mount(SpluseinsCookieSnackbar, 
      { 
        store,  
        mocks: { $matomo: { 
                            rememberConsentGiven: jest.fn(), 
                            disableCookies: jest.fn(),
                            deleteCookies: jest.fn(),
                            setConsentGiven: jest.fn(),
                          },
               },
      }
    );
  }

  it('should render a snackbar by default', () => {
    const wrapper = mountWithState(undefined, undefined);
    expect(wrapper.contains('.v-snack')).toBeTruthy();
  });

  it('should not render a snackbar when consent was given or denied', () => {
    let wrapper = mountWithState(true, true);
    expect(wrapper.contains('.v-snack')).toBeFalsy();
    wrapper = mountWithState(false, false);
    expect(wrapper.contains('.v-snack')).toBeFalsy();
  });

  it('should mutate state after giving or denying consent', async () => {
    let wrapper = mountWithState(undefined, undefined);
    wrapper.find({ ref: 'btn-allow-all' }).trigger('click');
    expect(store.state.privacy.allowNecessaryCookies).toBe(true);
    expect(store.state.privacy.allowAllCookies).toBe(true);

    wrapper = mountWithState(undefined, undefined);
    wrapper.find({ ref: 'btn-allow-necessary' }).trigger('click');
    expect(store.state.privacy.allowNecessaryCookies).toBe(true);
    expect(store.state.privacy.allowAllCookies).toBe(false);

    wrapper = mountWithState(undefined, undefined);
    wrapper.find({ ref: 'btn-deny' }).trigger('click');
    expect(store.state.privacy.allowNecessaryCookies).toBe(false);
    expect(store.state.privacy.allowAllCookies).toBe(false);
  });
});
