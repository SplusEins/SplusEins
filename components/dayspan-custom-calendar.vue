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
              <v-icon>keyboard_arrow_left</v-icon>
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
              <v-icon>keyboard_arrow_right</v-icon>
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
        left: () => { trackMatomoEvent('Calendar','nextWeek', 'swiped'); next()},
        right: () => { trackMatomoEvent('Calendar','prevWeek', 'swiped'); prev()},
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

      <slot
        v-bind="{$scopedSlots, $listeners, calendar, eventFinish}"
        name="calendarAppEventDialog" >

        <ds-event-dialog
          ref="eventDialog"
          :calendar="calendar"
          :read-only="readOnly"
          v-bind="{$scopedSlots}"
          v-on="$listeners"
          @saved="eventFinish"
          @actioned="eventFinish"
        />

      </slot>

      <slot
        v-bind="{optionsVisible, optionsDialog, options, chooseOption}"
        name="calendarAppOptions" >

        <v-dialog
          ref="optionsDialog"
          v-model="optionsVisible"
          v-bind="optionsDialog"
          :fullscreen="$dayspan.fullscreenDialogs">
          <v-list>
            <template v-for="option in options">
              <v-list-tile
                :key="option.text"
                @click="chooseOption( option )">
                {{ option.text }}
              </v-list-tile>
            </template>
          </v-list>
        </v-dialog>

      </slot>

      <slot
        v-bind="{promptVisible, promptDialog, promptQuestion, choosePrompt}"
        name="calendarAppPrompt" >

        <v-dialog
          ref="promptDialog"
          v-model="promptVisible"
          v-bind="promptDialog">
          <v-card>
            <v-card-title>{{ promptQuestion }}</v-card-title>
            <v-card-actions>
              <v-btn
                color="primary"
                flat
                @click="choosePrompt( true )">
                {{ labels.promptConfirm }}
              </v-btn>
              <v-spacer/>
              <v-btn
                color="secondary"
                flat
                @click="choosePrompt( false )">
                {{ labels.promptCancel }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

      </slot>

      <slot
        v-bind="{events, calendar}"
        name="containerInside" />

    </v-flex>
  </v-layout>
</template>

<script>
import * as moment from 'moment';
import { Constants, Sorts, Calendar, Day, Units, Weekday, Month, DaySpan, PatternMap, Time, Op } from 'dayspan';
import { mapGetters } from 'vuex';

export default {

  name: 'DayspanCustomCalendar',

  props:
  {
    events:
    {
      type: Array,
      default() {
        return []
      }
    },
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
    allowsAddToday:
    {
      type: Boolean,
      default: true
    },
    formats:
    {
      type: Object,
      default() {
        return {today: 0,
                xs: 0}
      }
    },
    labels:
    {
      type: Object,
      default() {
        return {
          next: 'Nächste Woche',
          prev: 'Vorherige Woche',
          moveCancel: 0,
          moveSingleEvent: 0,
          moveOccurrence: 0,
          moveAll: 0,
          moveDuplicate: 0,
          promptConfirm: 0,
          promptCancel: 0,
          today: 'Heute',
          todayIcon: 'today'
        }
      }
    },
    optionsDialog:
    {
      type: Object,
      default() {
        return  {
        maxWidth: '300px',
        persistent: true}
      }
    },
    promptDialog:
    {
      type: Object,
      default() {
        return {
          maxWidth: '300px',
          persistent: true
        }
      }
    }
  },

  data: vm => ({
    drawer: null,
    optionsVisible: false,
    options: [],
    promptVisible: false,
    promptQuestion: '',
    promptCallback: null
  }),
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

    hasCreatePopover()
    {
      return true
    },

    canAddDay()
    {
      return !this.readOnly
    },

    canAddTime()
    {
      return !this.readOnly
    },

    ...mapGetters({
      hasLecturesOnWeekend: 'splus/getHasLecturesOnWeekend',
    }),

    getWeekendClass(){
      return this.hasLecturesOnWeekend ? '' : 'no-weekend'
    }
  },
  watch:
  {
    'events': 'applyEvents',
    'calendar': 'applyEvents'
  },
  mounted()
  {
    // if (!this.$dayspan.promptOpen)
    // {
    //   this.$dayspan.promptOpen = (question, callback) => {
    //     this.promptVisible = false;
    //     this.promptQuestion = question;
    //     this.promptCallback = callback;
    //     this.promptVisible = true;
    //   };
    // }
  },

  methods:
  {
    trackMatomoEvent(category, action , name) {
      this.$matomo.trackEvent(category, action, name);
    },
    summary(short)
    {
      var monthNames = [
        "Januar", "Februar", "März",
        "April", "Mai", "Juni", "Juli",
        "August", "September", "Oktober",
        "November", "Dezember"
      ];
      let firstDayOfWeekString = JSON.stringify(this.calendar.days[0])
      let lastDayOfWeekString =  JSON.stringify(this.calendar.days[6])
      let firstDayOfWeekSplitted = firstDayOfWeekString.split('-')
      let lastDayOfWeekSplitted = lastDayOfWeekString.split('-')
      let firstDayYear = parseInt(firstDayOfWeekSplitted[0].split('"')[1])
      let firstDayMonth = parseInt(firstDayOfWeekSplitted[1])
      let firstDayDay = parseInt(firstDayOfWeekSplitted[2].split('T')[0])+1
      let lastDayYear = parseInt(lastDayOfWeekSplitted[0].split('"')[1])
      let lastDayMonth = parseInt(lastDayOfWeekSplitted[1])
      let lastDayDay = parseInt(lastDayOfWeekSplitted[2].split('T')[0])+1
      if(short){
        return this.minTwoDigits(firstDayDay) + '.' + this.minTwoDigits(firstDayMonth) + '. - '
        + this.minTwoDigits(lastDayDay) + '.' + this.minTwoDigits(lastDayMonth) + '.'
      }else{
        return this.minTwoDigits(firstDayDay) + '. ' + monthNames[firstDayMonth-1] + ' – ' + this.minTwoDigits(lastDayDay)  + '. ' + monthNames[lastDayMonth-1]
      }
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

    applyEvents()
    {
      if (this.events)
      {
        this.calendar.removeEvents();
        this.calendar.addEvents(this.events);
      }
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

    // edit(calendarEvent)
    // {
    //   let eventDialog = this.$refs.eventDialog;

    //   eventDialog.edit(calendarEvent);
    // },

    // editPlaceholder(createEdit)
    // {
    //   let placeholder = createEdit.calendarEvent;
    //   let details = createEdit.details;
    //   let eventDialog = this.$refs.eventDialog;
    //   let calendar = this.$refs.calendar;

    //   eventDialog.addPlaceholder( placeholder, details );
    //   eventDialog.$once('close', calendar.clearPlaceholder);
    // },

    // add(day)
    // {
    //   if (!this.canAddDay)
    //   {
    //     return;
    //   }

    //   let eventDialog = this.$refs.eventDialog;
    //   let calendar = this.$refs.calendar;
    //   let useDialog = !this.hasCreatePopover;

    //   calendar.addPlaceholder( day, true, useDialog );

    //   if (useDialog)
    //   {
    //     eventDialog.add(day);
    //     eventDialog.$once('close', calendar.clearPlaceholder);
    //   }
    // },

    // addAt(dayHour)
    // {
    //   if (!this.canAddTime)
    //   {
    //     return;
    //   }

    //   let eventDialog = this.$refs.eventDialog;
    //   let calendar = this.$refs.calendar;
    //   let useDialog = !this.hasCreatePopover;
    //   let at = dayHour.day.withHour( dayHour.hour );

    //   calendar.addPlaceholder( at, false, useDialog );

    //   if (useDialog)
    //   {
    //     eventDialog.addAt(dayHour.day, dayHour.hour);
    //     eventDialog.$once('close', calendar.clearPlaceholder);
    //   }
    // },

    // addToday()
    // {
    //   if (!this.canAddDay)
    //   {
    //     return;
    //   }

    //   let eventDialog = this.$refs.eventDialog;
    //   let calendar = this.$refs.calendar;
    //   let useDialog = !this.hasCreatePopover || !calendar;

    //   let day = this.$dayspan.today;

    //   if (!this.calendar.filled.matchesDay( day ))
    //   {
    //     let first = this.calendar.days[ 0 ];
    //     let last = this.calendar.days[ this.calendar.days.length - 1 ];
    //     let firstDistance = Math.abs( first.currentOffset );
    //     let lastDistance = Math.abs( last.currentOffset );

    //     day = firstDistance < lastDistance ? first: last;
    //   }

    //   calendar && calendar.addPlaceholder( day, true, useDialog );

    //   if (useDialog)
    //   {
    //     eventDialog.add( day );

    //     calendar && eventDialog.$once('close', calendar.clearPlaceholder);
    //   }
    // },

    // handleAdd(addEvent)
    // {
    //   let eventDialog = this.$refs.eventDialog;
    //   let calendar = this.$refs.calendar;

    //   addEvent.handled = true;

    //   if (!this.hasCreatePopover)
    //   {
    //     if (addEvent.placeholder.fullDay)
    //     {
    //       eventDialog.add(addEvent.span.start, addEvent.span.days(Op.UP));
    //     }
    //     else
    //     {
    //       eventDialog.addSpan(addEvent.span);
    //     }

    //     eventDialog.$once('close', addEvent.clearPlaceholder);
    //   }
    //   else
    //   {
    //     calendar.placeholderForCreate = true;
    //   }
    // },

    // handleMove(moveEvent)
    // {
    //   let calendarEvent = moveEvent.calendarEvent;
    //   let target = moveEvent.target;
    //   let targetStart = target.start;
    //   let sourceStart = calendarEvent.time.start;
    //   let schedule = calendarEvent.schedule;
    //   let options = [];

    //   moveEvent.handled = true;

    //   let callbacks = {
    //     cancel: () => {
    //       moveEvent.clearPlaceholder()
    //     },
    //     single: () => {
    //       calendarEvent.move( targetStart );
    //       this.eventsRefresh();
    //       moveEvent.clearPlaceholder();

    //       this.$emit('event-update', calendarEvent.event);
    //     },
    //     instance: () => {
    //       calendarEvent.move( targetStart );
    //       this.eventsRefresh();
    //       moveEvent.clearPlaceholder();

    //       this.$emit('event-update', calendarEvent.event);
    //     },
    //     duplicate: () => {
    //       schedule.setExcluded( targetStart, false );
    //       this.eventsRefresh();
    //       moveEvent.clearPlaceholder();

    //       this.$emit('event-update', calendarEvent.event);
    //     },
    //     all: () => {
    //       schedule.moveTime( sourceStart.asTime(), targetStart.asTime() );
    //       this.eventsRefresh();
    //       moveEvent.clearPlaceholder();

    //       this.$emit('event-update', calendarEvent.event);
    //     }
    //   };

    //   options.push({
    //     text: this.labels.moveCancel,
    //     callback: callbacks.cancel
    //   });

    //   if (schedule.isSingleEvent())
    //   {
    //     options.push({
    //       text: this.labels.moveSingleEvent,
    //       callback: callbacks.single
    //     });

    //     if (this.$dayspan.features.moveDuplicate)
    //     {
    //       options.push({
    //         text: this.labels.moveDuplicate,
    //         callback: callbacks.duplicate
    //       });
    //     }
    //   }
    //   else
    //   {
    //     if (this.$dayspan.features.moveInstance)
    //     {
    //       options.push({
    //         text: this.labels.moveOccurrence,
    //         callback: callbacks.instance
    //       });
    //     }

    //     if (this.$dayspan.features.moveDuplicate)
    //     {
    //       options.push({
    //         text: this.labels.moveDuplicate,
    //         callback: callbacks.duplicate
    //       });
    //     }

    //     if (this.$dayspan.features.moveAll &&
    //         !schedule.isFullDay() &&
    //         targetStart.sameDay(sourceStart))
    //     {
    //       options.push({
    //         text: this.labels.moveAll,
    //         callback: callbacks.all
    //       });
    //     }
    //   }

    //   this.options = options;
    //   this.optionsVisible = true;
    // },

    chooseOption(option)
    {
      if (option)
      {
        option.callback();
      }

      this.optionsVisible = false;
    },

    choosePrompt(yes)
    {
      this.promptCallback( yes );
      this.promptVisible = false;
    },

    eventFinish(ev)
    {
      this.triggerChange();
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

.ds-calendar-event{
  user-select: auto !important;
}

.ds-hour{
  // changing this means you have to change the 'multiplicator' attribute in the store aswell
  height: 45px !important;
}

.ds-week-view,
.ds-week-view-container{
  max-height: 751px !important;
}

.ds-week-view-pane,
.ds-week-view-scrollable,
.ds-week-view-bottom{
  height: 675px !important;
}

.ds-hour:nth-child(n+22),
.ds-hour:nth-child(-n+6){
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
.ds-ev-description{
  white-space: pre-wrap;
}

</style>
