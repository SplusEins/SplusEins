<template lang="html">
  <v-navigation-drawer
    :clipped="true"
    v-model="drawerProp"
    fixed
    app
    width="350">
    <home-button-list />
    <v-divider />
    <custom-timetables-list />
    <v-divider v-if="favoriteSchedules.length != 0"/>
    <favorite-timetables-list v-if="favoriteSchedules.length != 0"/>
    <v-divider />
    <general-timetables-list />
    <no-ssr>
      <install-button-list class="stick-bottom white--background" />
    </no-ssr>
  </v-navigation-drawer>
</template>

<script lang="js">
import { mapState } from 'vuex';
import GeneralTimetablesList from './general-timetables-list.vue';
import FavoriteTimetablesList from './favorite-timetables-list.vue';
import CustomTimetablesList from './custom-timetables-list.vue';
import InstallButtonList from './install-button-list.vue';
import HomeButtonList from './home-button-list.vue';

export default {
  name: 'SpluseinsSideNav',
  components: {
    GeneralTimetablesList,
    FavoriteTimetablesList,
    CustomTimetablesList,
    InstallButtonList,
    HomeButtonList,
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
    ...mapState({
      favoriteSchedules: (state) => state.splus.favoriteSchedules,
    }),
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