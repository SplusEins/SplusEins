import { mount } from '@vue/test-utils';
import * as Vue_ from 'vue';
import * as Vuetify_ from 'vuetify';
import SpluseinsImpressum from '../spluseins-impressum.vue';

const Vue: any = Vue_;
const Vuetify: any = Vuetify_;

Vue.use(Vuetify);

describe('Impressum Dialog', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(SpluseinsImpressum, {
      mocks: {
        $matomo: { trackEvent: jest.fn() },
      },
    });
  });

  it('should render no dialog by default', () => {
    expect(wrapper.contains('.v-dialog--active')).toBeFalsy();
  });

  it('should render a dialog after clicking the link', () => {
    wrapper.find('a').trigger('click');
    expect(wrapper.contains('.v-dialog--active')).toBeTruthy();
  });

  it('should render no dialog after dismissing it', () => {
    wrapper.find('a').trigger('click');
    wrapper.find('.v-btn').trigger('click');
    expect(wrapper.contains('.v-dialog--active')).toBeFalsy();
  });

  it('should contain a mail address', () => {
    wrapper.find('a').trigger('click');
    expect(wrapper.text()).toMatch('E-Mail:');
  });

  it('should contain real name placeholders', () => {
    wrapper.find('a').trigger('click');
    expect(wrapper.text()).toMatch('$Teammitglied1');
  });
});
