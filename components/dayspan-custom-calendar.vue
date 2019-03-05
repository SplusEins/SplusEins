<template>
  <v-layout column>
    <v-flex
      fluid
      pb-3>
      <v-layout
        justify-space-between
        row>
        <v-flex shrink>
          <v-tooltip
            v-bind="{setToday, todayDate, calendar}"
            name="today"
            bottom>
            <v-btn
              slot="activator"
              :small="$vuetify.breakpoint.xs"
              :icon="$vuetify.breakpoint.xs"
              :outline="!$vuetify.breakpoint.xs"
              depressed
              @click="setToday(); trackMatomoEvent('Calendar', 'setToday')">
              <span v-show="$vuetify.breakpoint.smAndUp">{{ labels.today }}</span>
              <v-icon v-show="!$vuetify.breakpoint.smAndUp">{{ labels.todayIcon }}</v-icon>
            </v-btn>
            <span>{{ todayDate }}</span>
          </v-tooltip>

          <v-tooltip
            v-bind="{setToday, todayDate, calendar}"
            name="today"
            bottom>
            <v-btn
              slot="activator"
              :small="$vuetify.breakpoint.xs"
              icon
              depressed
              @click="prev(); trackMatomoEvent('Calendar', 'prevWeek', 'clicked')" >
              <v-icon>mdi-chevron-left</v-icon>
            </v-btn>
            <span>{{ prevLabel }}</span>
          </v-tooltip>

          <v-tooltip
            v-bind="{next, nextLabel, calendar}"
            name="next"
            bottom>
            <v-btn
              slot="activator"
              :small="$vuetify.breakpoint.xs"
              icon
              depressed
              @click="next(); trackMatomoEvent('Calendar', 'nextWeek', 'clicked')">
              <v-icon>mdi-chevron-right</v-icon>
            </v-btn>
            <span>{{ nextLabel }}</span>
          </v-tooltip>

          <span
            v-show="$vuetify.breakpoint.smAndUp"
            v-bind="{summary, calendar}"
            name="extendedDateSummary"
            class = "ds-summary-text">
            {{ summary(false) }}
          </span>
          <span
            v-show="!$vuetify.breakpoint.smAndUp"
            v-bind="{summary, calendar}"
            name="shortDateSummary"
            class = "ds-summary-text">
            {{ summary(true) }}
          </span>
        </v-flex>

        <v-flex shrink>
          <slot name="actions" />
        </v-flex>
      </v-layout>
    </v-flex>

    <v-flex
      v-touch="{
        left: () => { trackMatomoEvent('Calendar', 'nextWeek', 'swiped'); next(); },
        right: () => { trackMatomoEvent('Calendar', 'prevWeek', 'swiped'); prev(); },
      }"
      fill-height>

      <slot
        v-bind="{$scopedSlots, $listeners, calendar, viewDay}"
        name="calendarAppCalendar" >

        <ds-calendar
          ref="calendar"
          :calendar="calendar"
          :read-only="readOnly"
          v-bind="{$scopedSlots}"
          :class="[getWeekendClass]"
          v-on="$listeners"
          @view-day="viewDay"
        />

      </slot>

      <slot name="containerInside" />

    </v-flex>
  </v-layout>
</template>

<script>
import * as moment from 'moment';
import { Sorts, Calendar, Day } from 'dayspan';
import { mapGetters } from 'vuex';

export default {

  name: 'DayspanCustomCalendar',

  props:
  {
    calendar:
    {
      type: Calendar,
      default(){
        return {}
      }
    },
    readOnly:
    {
      type: Boolean,
      default: true
    },
    types:
    {
      type: Array,
      default(){
        return {}
      }
    },
    labels:
    {
      type: Object,
      default() {
        return {
          next: 'Nächste Woche',
          prev: 'Vorherige Woche',
          today: 'Heute',
          todayIcon: 'mdi-calendar-today'
        }
      }
    },
  },
  computed:
  {
    currentType:
    {
      get()
      {
        return this.types.find((type) =>
          type.type === this.calendar.type &&
          type.size === this.calendar.size
        ) || this.types[0];
      },
      set(type)
      {
        this.rebuild(undefined, true, type);
      }
    },

    todayDate()
    {
      let today = new Date();
      let dd = today.getDate();
      let mm = today.getMonth()+1; //January is 0!
      let yyyy = today.getFullYear();

      if(dd<10) {
          dd = '0'+dd
      }

      if(mm<10) {
          mm = '0'+mm
      }

      today = dd + '.'+mm +'.' + yyyy;
      return today
    },

    nextLabel()
    {
      return this.labels.next
    },

    prevLabel()
    {
      return this.labels.prev
    },

    ...mapGetters({
      hasLecturesOnWeekend: 'splus/getHasLecturesOnWeekend',
    }),

    getWeekendClass(){
      return this.hasLecturesOnWeekend ? '' : 'no-weekend'
    }
  },

  methods:
  {
    trackMatomoEvent(category, action , name) {
      this.$matomo.trackEvent(category, action, name);
    },

    summary(short)
    {
      const firstDay = moment(JSON.stringify(this.calendar.days[0]), 'YYYY-MM-DD').add('day', 1);
      const lastDay = moment(JSON.stringify(this.calendar.days[6]), 'YYYY-MM-DD').add('day', 1);
      return short? firstDay.format('DD.MM.') + ' - ' + lastDay.format('DD.MM.') : firstDay.format('DD. MMMM') + ' – ' + lastDay.format('DD. MMMM');
    },

    minTwoDigits(n) {
      return (n < 10 ? '0' : '') + n;
    },

    setState(state)
    {
      state.eventSorter = state.listTimes
        ? Sorts.List([Sorts.FullDay, Sorts.Start])
        : Sorts.Start;

      this.calendar.set( state );

      this.triggerChange();
    },

    isType(type, aroundDay)
    {
      let cal = this.calendar;

      return (cal.type === type.type && cal.size === type.size &&
          (!aroundDay || cal.span.matchesDay(aroundDay)));
    },

    rebuild (aroundDay, force, forceType)
    {
      let type = forceType || this.currentType || this.types[ 2 ];

      if (this.isType( type, aroundDay ) && !force)
      {
        return;
      }

      let input = {
        type: type.type,
        size: type.size,
        around: aroundDay,
        eventsOutside: true,
        preferToday: false,
        listTimes: type.listTimes,
        updateRows: type.updateRows,
        updateColumns: type.listTimes,
        fill: !type.listTimes,
        otherwiseFocus: type.focus,
        repeatCovers: type.repeat
      };

      this.setState( input );
    },

    next()
    {
      this.calendar.unselect().next();

      this.triggerChange();
    },

    prev()
    {
      this.calendar.unselect().prev();

      this.triggerChange();
    },

    setToday()
    {
      const around = Day.fromMoment(moment().startOf('isoWeek'));
      this.rebuild(around);
    },

    viewDay(day)
    {
      this.rebuild( day, false, this.types[ 0 ] );
    },

    eventsRefresh()
    {
      this.calendar.refreshEvents();

      this.triggerChange();
    },

    triggerChange()
    {
      this.$emit('change', {
        calendar: this.calendar
      });
    }
  }
}
</script>

<style lang="scss">

.ds-ev-description{
  display: none;
}

.ds-calendar-event{
  user-select: auto !important;
}

.ds-hour:nth-child(n+21),
.ds-hour:nth-child(-n+7){
  display: none;
}
.ds-day:nth-child(8),
.no-weekend .ds-day:nth-child(7){
  display: none;
}

.ds-week-date{
  cursor: default !important;
}

.ds-week-date:hover{
  text-decoration: none !important;
}

@media screen and (max-width: 350px) {
  .ds-summary-text{
    font-size: 16px;
  }
}

@media screen and (min-width: 350px) {
  .ds-summary-text{
    font-size: 20px;
  }
}

@media screen and (max-width: 500px) {
  .ds-week-date{
    font-size: 14px !important;
  }
}

@media screen and (min-width: 500px) {
  .ds-week-date{
    font-size: 18px !important;
  }
}

@media screen and (min-width: 800px) {
  .ds-week-date{
    font-size: 22px !important;
  }
}

@media screen and (min-width: 1000px) {
  .ds-week-date{
    font-size: 40px !important;
  }
}

.ds-summary-text{
  vertical-align: middle;
}

.v-btn--floating.ds-add-event-today {

  .v-icon {
    width: 24px;
    height: 24px;
  }
}

.ds-week-view {
  background-color: inherit !important;
}

.ds-hour-text {
  color: inherit !important;
}

.ds-week-date {
  color: inherit !important;
}

.ds-week-weekday {
  color: inherit !important;
}

.theme--dark .ds-day-today {
  background-color: rgba(255, 255, 255, 0.08) !important;
}

.ds-week .ds-day-today > div:not(.ds-hour):not(.v-menu) {
  border-top: 3px solid var(--v-primary-base) !important;
}

.ds-hour-list :nth-child(8) .ds-hour-text {
  display: none !important; /* hide 07:00 because it would be cut off */
}

.ds-hour {
  /* same as plugins/dayspan.config.js */
  height: 50px !important;
}

.ds-week-view-scrollable {
  height: 650px !important; /* TODO magic number */
}
</style>
