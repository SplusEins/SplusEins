<template>
  <v-container
    fluid
    class="pa-0 pa-md-3"
    v-touch="{
      right: () => prev(),
      left: () => next()
    }"
  >
    <v-row
      class="fill-height"
      no-gutters
    >
      <v-col
        cols=12
        class="mb-2 mb-md-4"
      >
        <v-toolbar
          flat
          class="inherit-background-color"
        >
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
          class="inherit-background-color"
          type="custom-daily"
          :events="events"
          :start="firstDate"
          :end="lastDate"
          interval-width="50"
          :interval-format="formatInterval"
          first-time="07:00"
          interval-count="13"
          :interval-height="$vuetify.breakpoint.mobile ? 45 : 50"
          event-overlap-mode="column"
          locale="de"
          locale-first-day-of-year=4
          @click:event="showEvent"
        >
          <template #day-label-header="{day, present}">
            <span
              :class="['text-h5', present ? 'font-weight-bold':'']"
            >
              {{ day }}
            </span>
          </template>
        </v-calendar>
        <v-menu
          v-model="selectedOpen"
          :close-on-content-click="false"
          :activator="selectedElement"
          offset-x
          :max-width="$vuetify.breakpoint.mobile ? undefined : '30%'"
        >
          <calendar-event-popover
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
    formatInterval (intervalObject) {
      return intervalObject.time
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
.inherit-background-color {
  background: inherit !important;
}

.v-calendar-daily_head-day-label {
  cursor: auto;
}

.v-calendar-daily__scroll-area {
  overflow-y: hidden;
}
.v-calendar-daily {
  border-left: none !important;
  border-top: none !important;
}
.v-event-timed {
  white-space: normal !important;
  word-wrap: break-word;
  line-height: normal;
  padding-top: 2px;
  padding-bottom: 2px;
}

</style>
