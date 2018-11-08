import { mount } from '@vue/test-utils';
import * as Vue_ from 'vue';
import * as Vuetify_ from 'vuetify';
import SpluseinsAbout from '../spluseins-about.vue';

const Vue: any = Vue_; // 🤷
const Vuetify: any = Vuetify_;

// TODO prefer createLocalVue, https://github.com/vuetifyjs/vuetify/issues/5096
Vue.use(Vuetify);

describe('About Dialog', () => {
  let wrapper;

  beforeEach(() => {
    // shallowMount is faster but doesn't render child components
    wrapper = mount(SpluseinsAbout);
  });

  it('should render no dialog by default', () => {
    expect(wrapper.contains('.v-dialog--active')).toBeFalsy();
  });

  it('should render a dialog after clicking the link', () => {
    wrapper.find('a').trigger('click');
    expect(wrapper.contains('.v-dialog--active')).toBeTruthy();
  });

  it('should contain a disclaimer', () => {
    wrapper.find('a').trigger('click');
    expect(wrapper.text()).toMatch('Für Vollständigkeit wird keine Haftung übernommen.');
  });
});