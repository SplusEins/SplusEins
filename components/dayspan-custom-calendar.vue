<template>
  <div class="ds-expand ds-calendar-app">

    <v-container
      :clipped-left="$vuetify.breakpoint.lgAndUp"
      app 
      flat 
      fixed
      pb-3
      fluid
      class="ds-app-calendar-toolbar"
      color="white">
      <v-tooltip
        v-bind="{setToday, todayDate, calendar}" 
        name="today" 
        bottom>
        <v-btn 
          slot="activator"
          :icon="$vuetify.breakpoint.smAndDown"
          class="ds-skinny-button"
          depressed
          color="primary"
          outline
          @click="setToday">
          <v-icon>today</v-icon>
          <span>{{ labels.today }}</span>
        </v-btn>
        <span>{{ todayDate }}</span>
      </v-tooltip>

      <v-tooltip 
        v-bind="{setToday, todayDate, calendar}" 
        name="today"
        bottom>
        <v-btn 
          slot="activator"
          icon 
          depressed
          @click="prev" >
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
          icon 
          depressed
          @click="next">
          <v-icon>keyboard_arrow_right</v-icon>
        </v-btn>
        <span>{{ nextLabel }}</span>
      </v-tooltip>

      <span
        v-bind="{summary, calendar}"
        name="summary"
        class = "ds-summary-text">
        {{ summary }}
      </span>
    </v-container>

    <v-container 
      fluid
      fill-height
      class="ds-calendar-container">

      <ds-gestures
        @swipeleft="next"
        @swiperight="prev">

        <div 
          v-if="currentType.schedule" 
          class="ds-expand">

          <slot
            v-bind="{$scopedSlots, $listeners, calendar, viewDay}"
            name="calendarAppAgenda" >

            <ds-agenda
              :read-only="readOnly"
              :calendar="calendar"
              v-bind="{$scopedSlots}"
              v-on="$listeners"
              @view-day="viewDay"/>

          </slot>

        </div>

        <div 
          v-else 
          class="ds-expand">

          <slot
            v-bind="{$scopedSlots, $listeners, calendar, viewDay}"
            name="calendarAppCalendar" >

            <ds-calendar 
              ref="calendar"
              :calendar="calendar"
              :read-only="readOnly"
              v-bind="{$scopedSlots}"
              v-on="$listeners"
              @view-day="viewDay"
            />

          </slot>

        </div>

      </ds-gestures>

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

    </v-container>
  </div>
</template>

<script>
import * as moment from 'moment';
import { Constants, Sorts, Calendar, Day, Units, Weekday, Month, DaySpan, PatternMap, Time, Op } from 'dayspan';

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
    styles:
    {
      type: Object,
      default() {
        return {
           toolbar: {
            small: { width: 'auto' },
            large: { width: '300px' }
          }
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

    summary()
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
      return  firstDayDay + '. ' + monthNames[firstDayMonth-1] + ' – ' + lastDayDay + '. ' + monthNames[lastDayMonth-1]
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

    toolbarStyle()
    {
      let large = this.$vuetify.breakpoint.lgAndUp;

      return large ? this.styles.toolbar.large : this.styles.toolbar.small;
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
      this.rebuild( around);
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

.ds-summary-text{
  position: relative;
  top: 3px;
  left: 4px;
  font-size: 20px;
}

.ds-app-calendar-toolbar {

  .v-toolbar__content {
    border-bottom: 1px solid rgb(224, 224, 224);
  }
}

.ds-skinny-button {
  margin-left: 2px !important;
  margin-right: 2px !important;
}

.ds-expand {
  width: 100%;
  height: 100%;
}

.ds-calendar-container {
  padding: 0px !important;
  position: relative;
}

.v-btn--floating.ds-add-event-today {

  .v-icon {
    width: 24px;
    height: 24px;
  }
}

</style>
