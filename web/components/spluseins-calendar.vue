<template>
  <v-container
    fluid
  >
    <v-row
      class="fill-height"
      no-gutters
    >
      <v-col cols=12>
        <v-toolbar>
          <v-btn
            :outlined="!$vuetify.breakpoint.mobile"
            :small="$vuetify.breakpoint.mobile"
            @click="setToday"
          >
            <span v-show="!$vuetify.breakpoint.mobile">Heute</span>
            <v-icon v-show="$vuetify.breakpoint.mobile">
              {{ mdiCalendarToday }}
            </v-icon>
          </v-btn>

          <v-btn
            :small="$vuetify.breakpoint.xs"
            icon
            depressed
            @click="prev"
          >
            <v-icon>{{ mdiChevronLeft }}</v-icon>
          </v-btn>

          <v-btn
            icon
            depressed
            :small="$vuetify.breakpoint.xs"
            @click="next"
          >
            <v-icon>{{ mdiChevronRight }}</v-icon>
          </v-btn>

          <v-toolbar-title>
            {{ $vuetify.breakpoint.mobile ? shortSummary : longSummary }}
          </v-toolbar-title>
          <v-spacer />

          <calendar-action-bar />
        </v-toolbar>
      </v-col>
      <v-col cols=12>
        <v-calendar
          ref="calendar"
          :events="events"
          type="custom-daily"
          :start="firstDate"
          :end="lastDate"
          interval-width="40"
          event-overlap-mode="column"
          locale="de"
          locale-first-day-of-year=4
          first-time="07:00"
          interval-count="13"
          interval-height="50"
          class="pb-2"
          @click:event="showEvent"
        />
        <v-menu
          v-model="selectedOpen"
          :close-on-content-click="false"
          :activator="selectedElement"
          offset-x
        >
          <dayspan-custom-event-popover
            v-bind="{selectedEvent, selectedOpen}"
            @close="selectedOpen = false"
          />
        </v-menu>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';
import { mdiChevronLeft, mdiChevronRight, mdiCalendarToday } from '@mdi/js'

export default {
  name: 'SpluseinsCalendar',
  data () {
    return {
      mdiChevronLeft,
      mdiChevronRight,
      mdiCalendarToday,
      selectedEvent: {},
      selectedElement: null,
      selectedOpen: false
    }
  },
  computed: {
    ...mapState({
      currentWeek: (state) => state.splus.week,
      lazyLoad: (state) => state.lazyLoad,
      schedule: (state) => state.splus.schedule
    }),
    ...mapGetters({
      events: 'splus/getCalendarEvents',
      weekOrDefault: 'splus/weekOrDefault',
      hasEventsOnWeekend: 'splus/getHasEventsOnWeekend'
    }),
    nextLabel () {
      return 'Nächste Woche';
    },
    prevLabel () {
      return 'Vorherige Woche';
    },
    firstDate () {
      return this.$dayjs()
        .isoWeek(this.weekOrDefault)
        .startOf('isoweek').toDate();
    },
    lastDate () {
      return this.$dayjs(this.firstDate).add(this.hasEventsOnWeekend ? 5 : 4, 'days').toDate();
    },
    longSummary () {
      return this.$dayjs(this.firstDate).format('DD. MMMM') + ' – ' + this.$dayjs(this.lastDate).format('DD. MMMM YYYY');
    },
    shortSummary () {
      return this.$dayjs(this.firstDate).format('MMMM YYYY');
    }
  },
  mounted () {
  },
  methods: {
    ...mapMutations({
      setWeek: 'splus/setWeek',
      resetWeek: 'splus/resetWeek'
    }),
    ...mapActions({
      load: 'splus/load'
    }),
    setToday () {
      this.resetWeek(true);
      this.refresh();
    },
    prev () {
      this.setWeek(this.$dayjs(this.firstDate).subtract('1', 'week').isoWeek());
      this.refresh();
    },
    next () {
      this.setWeek(this.$dayjs(this.firstDate).add('1', 'week').isoWeek());
      this.refresh();
    },
    async refresh () {
      // Load the data and store the events in the calendar
      this.load();
    },
    showEvent (event) {
      const open = () => {
        this.selectedEvent = event
        this.selectedElement = event.nativeEvent.target
        setTimeout(() => {
          this.selectedOpen = true
        }, 10)
      }

      if (this.selectedOpen) {
        this.selectedOpen = false
        setTimeout(open, 10)
      } else {
        open()
      }

      event.nativeEvent.stopPropagation()
    }
  }
};
</script>

<style lang="scss">
.v-calendar-daily__scroll-area {
  overflow-y: hidden;
}
</style>
