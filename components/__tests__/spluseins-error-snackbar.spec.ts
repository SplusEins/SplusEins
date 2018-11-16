import { mount } from '@vue/test-utils';
import * as Vue_ from 'vue';
import * as Vuetify_ from 'vuetify';
import * as Vuex_ from 'vuex';
import SpluseinsErrorSnackbar from '../spluseins-error-snackbar.vue';

const Vue: any = Vue_;
const Vuetify: any = Vuetify_;
const Vuex: any = Vuex_;

Vue.use(Vuetify);
Vue.use(Vuex);

describe('Error snackbar', () => {
  function mountWithState(state) {
    const store = new Vuex.Store({
      modules: { splus: { state } }
    });
    return mount(SpluseinsErrorSnackbar, { store });
  }

  it('should render no snackbar by default', () => {
    const wrapper = mountWithState({ error: undefined });
    expect(wrapper.contains('.v-snack')).toBeFalsy();
  });

  it('should render a snackbar with an error', () => {
    const wrapper = mountWithState({ error: 'Error' });
    expect(wrapper.contains('.v-snack')).toBeTruthy();
    expect(wrapper.text()).toMatch('Error');
  });
});
