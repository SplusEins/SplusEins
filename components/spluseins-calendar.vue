<template lang="html">
  <dayspan-custom-calendar
    :calendar="calendar"
    :types="types"
    :read-only="true"
    @change="calendarChanged">

    <template slot="actions">
      <span v-show="!isTinyMobile">
        <responsive-icon-button
          v-if="!isCustomSchedule"
          :breakpoint="$vuetify.breakpoint.xl"
          :icon="isFavorite ? 'favorite' : 'favorite_border'"
          :text="isFavorite ? 'Favorit entfernen' : 'Favorisieren'"
          @click="toggleFavorite" />
      </span>

      <!-- mobile action bar -->
      <v-menu
        v-show="isMobile"
        bottom
        left>
        <v-btn
          slot="activator"
          :small="$vuetify.breakpoint.xs"
          class="cursor-pointer"
          icon>
          <v-icon>more_vert</v-icon>
        </v-btn>

        <v-list>
          <v-list-tile
            v-show="isTinyMobile"
            v-if="!isCustomSchedule"
            @click="toggleFavorite">
            <v-list-tile-content>
              <v-list-tile-title v-if="!isFavorite">Favorisieren</v-list-tile-title>
              <v-list-tile-title v-else>Favorit entfernen</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile @click="share()">
            <v-list-tile-content>
              <v-list-tile-title>Teilen</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile
            @click="editTimetableDialogOpen = true; trackMatomoEvent('Calendar', isCustomSchedule ? 'clickEditCustomSchedule' : 'clickEditSchedule')">
            <v-list-tile-content>
              <v-list-tile-title v-if="isCustomSchedule">Bearbeiten</v-list-tile-title>
              <v-list-tile-title v-else>Personalisieren</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile
            v-if="isCustomSchedule"
            @click="deleteTimetableDialogOpen = true; trackMatomoEvent('Calendar', 'clickDeleteCustomSchedule')">
            <v-list-tile-title>Löschen</v-list-tile-title>
          </v-list-tile>
        </v-list>
      </v-menu>

      <!-- desktop action bar -->
      <span v-show="!isMobile">
        <responsive-icon-button
          :breakpoint="$vuetify.breakpoint.xl"
          icon="share"
          text="Teilen"
          @click="share" />
        <responsive-icon-button
          v-if="isCustomSchedule"
          :breakpoint="$vuetify.breakpoint.xl"
          icon="delete"
          text="Löschen"
          @click="deleteTimetableDialogOpen = true; trackMatomoEvent('Calendar', 'clickDeleteCustomSchedule')" />
        <responsive-icon-button
          :text="isCustomSchedule ? 'Bearbeiten' : 'Personalisieren'"
          :breakpoint="$vuetify.breakpoint.xl"
          icon="edit"
          @click="editTimetableDialogOpen = true; trackMatomoEvent('Calendar', isCustomSchedule ? 'clickEditCustomSchedule' : 'clickEditSchedule')" />
      </span>

      <custom-timetable-delete-dialog
        v-model="deleteTimetableDialogOpen"
        :custom-schedule="currentSchedule"
        @on-delete="routeToRoot()" />
      <custom-timetable-dialog
        v-model="editTimetableDialogOpen"
        :custom-schedule="currentAsCustomSchedule" />
      <copy-text-dialog
        v-model="shareDialogOpen"
        :text-to-copy="currentUrl" />
    </template>

    <template slot="containerInside">
      <span class="overlay">
        Quelle: splus.ostfalia.de
      </span>
    </template>

  </dayspan-custom-calendar>
</template>

<script lang="js">
import * as moment from 'moment';
import { Calendar, Day, Units } from 'dayspan';
import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';
import CopyTextDialog from './copy-text-dialog.vue';
import ResponsiveIconButton from './responsive-icon-button.vue';
import DayspanCustomCalendar from './dayspan-custom-calendar.vue';
import CustomTimetableDialog from './custom-timetable-dialog.vue';
import CustomTimetableDeleteDialog from './custom-timetable-delete-dialog.vue';

export default {
  name: 'SpluseinsCalendar',
  components: {
    CopyTextDialog,
    ResponsiveIconButton,
    DayspanCustomCalendar,
    CustomTimetableDialog,
    CustomTimetableDeleteDialog,
  },
  data() {
    const currentWeek = Day.fromMoment(moment().startOf('isoWeek'));
    const startOfWeek = moment().day() > 5 ? currentWeek.add(1, 'weeks') : currentWeek;
    const weeklyCalendar = {
      id: 'W',
      label: 'Woche',
      shortcut: 'W',
      type: Units.DAY,
      size: 7,
      around: startOfWeek,
      focus: 0,
      repeat: true,
      listTimes: true,
      updateRows: true,
      schedule: false
    };
    const calendar = Calendar.days(7, startOfWeek, 0);

    // computed properties are not available during client rendering yet, access the getter directly
    calendar.setEvents(this.$store.getters['splus/getLecturesAsEvents']);

    return {
      calendar,
      editTimetableDialogOpen: false,
      deleteTimetableDialogOpen: false,
      shareDialogOpen: false,
      types: [ weeklyCalendar ],
    };
  },
  computed: {
    isMobile() {
      return !this.$vuetify.breakpoint.mdAndUp;
    },
    isTinyMobile() {
      return this.$vuetify.breakpoint.width <= 400;
    },
    isFavorite() {
      return this.favoriteSchedules.filter(favorite => favorite.id == this.currentSchedule.id).length != 0;
    },
    currentAsCustomSchedule() {
      if (this.isCustomSchedule) {
        return this.currentSchedule;
      } else {
        // new custom schedule with the regular as its base
        return {
          label: '',
          id: [this.currentSchedule.id],
          whitelist: [],
        };
      }
    },
    currentUrl() {
      if (global.window) {
        return window.location.href;
      } else {
        return '';
      }
    },
    ...mapState({
      currentSchedule: (state) => state.splus.schedule,
      currentWeek: (state) => state.splus.week,
      lazyLoad: (state) => state.lazyLoad,
      favoriteSchedules: (state) => state.splus.favoriteSchedules,
    }),
    ...mapGetters({
      events: 'splus/getLecturesAsEvents',
      isCustomSchedule: 'splus/isCustomSchedule',
    }),
  },
  watch: {
    'events': function(events) {
      this.calendar.setEvents(events);
    },
    'currentWeek': 'loadLectures',
  },
  mounted() {
    if (this.lazyLoad) {
      // static build -> splus.week is possibly wrong and no lectures are in the store
      this.updateWeek();
      this.loadLectures();
    }
  },
  methods: {
    trackMatomoEvent(category, action) {
      this.$matomo.trackEvent(category, action);
    },
    calendarChanged({ calendar }) {
      this.setWeek(calendar.start.date.isoWeek());
    },
    routeToRoot() {
      this.$router.replace('/');
    },
    toggleFavorite() {
      if (this.isFavorite) {
        this.removeFavoriteSchedule(this.currentSchedule);
        this.trackMatomoEvent('Calendar', 'removeFavorites');
      } else {
        this.addFavoriteSchedule(this.currentSchedule);
        this.trackMatomoEvent('Calendar', 'addToFavorites');
      }
    },
    async share() {
      // https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share
      if (navigator.share) {
        await navigator.share({
          url: this.currentUrl,
        });
      } else {
        this.shareDialogOpen = true;
      }
    },
    ...mapMutations({
      setWeek: 'splus/setWeek',
      updateWeek: 'splus/updateWeek',
      addFavoriteSchedule: 'splus/addFavoriteSchedule',
      removeFavoriteSchedule: 'splus/removeFavoriteSchedule',
    }),
    ...mapActions({
      loadLectures: 'splus/loadPrefetching',
    }),
  },
};
</script>

<style scoped lang="scss">

.overlay {
  line-height: 100%;
  padding-top: 3px;
  display: flex;
  justify-content: flex-end;
  opacity: 0.5;
  font-size: 12px;
}

</style>
