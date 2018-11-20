<template lang="html">
  <dayspan-custom-calendar
    :calendar="calendar"
    :types="types"
    :read-only="true"
    @change="calendarChanged">
    <template
      v-if="isCustomSchedule"
      slot="actions">
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
          <v-list-tile @click="editTimetableDialogOpen = true">
            <v-list-tile-content>
              <v-list-tile-title>Bearbeiten</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile @click="deleteTimetableDialogOpen = true">
            <v-list-tile-title>Löschen</v-list-tile-title>
          </v-list-tile>
        </v-list>
      </v-menu>

      <v-btn
        v-show="!isMobile"
        outline
        @click="deleteTimetableDialogOpen = true">
        <v-icon>delete</v-icon>
        Löschen
      </v-btn>
      <v-btn
        v-show="!isMobile"
        outline
        @click="editTimetableDialogOpen = true">
        <v-icon>edit</v-icon>
        Bearbeiten
      </v-btn>

      <custom-timetable-dialog
        v-model="editTimetableDialogOpen"
        :custom-schedule="currentSchedule" />
      <custom-timetable-delete-dialog
        v-model="deleteTimetableDialogOpen"
        :custom-schedule="currentSchedule"
        @on-delete="routeToRoot()" />
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
import DayspanCustomCalendar from './dayspan-custom-calendar.vue';
import CustomTimetableDialog from './custom-timetable-dialog.vue';
import CustomTimetableDeleteDialog from './custom-timetable-delete-dialog.vue';

export default {
  name: 'SpluseinsCalendar',
  components: {
    DayspanCustomCalendar,
    CustomTimetableDialog,
    CustomTimetableDeleteDialog,
  },
  data() {
    const startOfWeek = Day.fromMoment(moment().startOf('isoWeek'));
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
      types: [ weeklyCalendar ]
    };
  },
  computed: {
    isMobile() {
      return !this.$vuetify.breakpoint.mdAndUp;
    },
    ...mapState({
      currentSchedule: (state) => state.splus.schedule,
      currentWeek: (state) => state.splus.week,
      lazyLoad: (state) => state.splus.lazyLoad,
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
      // static build -> no lectures are in the store
      this.loadLectures();
    }
  },
  methods: {
    calendarChanged({ calendar }) {
      this.setWeek(calendar.start.date.isoWeek());
    },
    routeToRoot() {
      this.$router.replace('/');
    },
    ...mapMutations({
      setWeek: 'splus/setWeek',
    }),
    ...mapActions({
      loadLectures: 'splus/load',
    }),
  },
};
</script>

<style scoped lang="scss">

.overlay {
  display: flex;
  justify-content: flex-end;
  opacity: 0.5;
  font-size: 12px;
}

</style>
