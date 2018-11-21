<template lang="html">
  <v-navigation-drawer
    :clipped="true"
    v-model="drawerProp"
    fixed
    app
    width="350">
    <custom-timetables-list />
    <v-divider />
    <favorite-timetables-list />
    <v-divider />
    <general-timetables-list />
    <no-ssr>
      <install-button-list class="stick-bottom white--background" />
    </no-ssr>
  </v-navigation-drawer>
</template>

<script lang="js">
import GeneralTimetablesList from './general-timetables-list.vue';
import FavoriteTimetablesList from './favorite-timetables-list.vue';
import CustomTimetablesList from './custom-timetables-list.vue';
import InstallButtonList from './install-button-list.vue';

export default {
  name: 'SpluseinsSideNav',
  components: {
    GeneralTimetablesList,
    FavoriteTimetablesList,
    CustomTimetablesList,
    InstallButtonList,
  },
  props: {
    drawer: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    drawerProp: {
      get() { return this.drawer; },
      set(val) { this.$emit('update:drawer', val); }
    },
  },
};
</script>

<style lang="scss" scoped>
.stick-bottom {
  position: sticky;
  bottom: 0;
}

.white--background {
  background: #fff;
}
</style>