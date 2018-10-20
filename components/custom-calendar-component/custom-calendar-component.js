import { Constants, Sorts, Calendar, Day, Units, Weekday, Month, DaySpan, PatternMap, Time, Op } from 'dayspan';
export default {
  name: 'custom-calendar-component',
  props:
  {
    events:
    {
      type: Array
    },
    calendar:
    {
      type: Calendar,
      default() {
        return Calendar.months();
      }
    },
    readOnly:
    {
      type: Boolean,
      default: false
    },
    types:
    {
      type: Array,
      default() {
        return this.$dsDefaults().types;
      }
    },
    allowsAddToday:
    {
      type: Boolean,
      default() {
        return this.$dsDefaults().allowsAddToday;
      }
    },
    formats:
    {
      validate(x) {
        return this.$dsValidate(x, 'formats');
      },
      default() {
        return this.$dsDefaults().formats;
      }
    },
    labels:
    {
      validate(x) {
        return this.$dsValidate(x, 'labels');
      },
      default() {
        return this.$dsDefaults().labels;
      }
    },
    styles:
    {
      validate(x) {
        return this.$dsValidate(x, 'styles');
      },
      default() {
        return this.$dsDefaults().styles;
      }
    },
    optionsDialog:
    {
      validate(x) {
        return this.$dsValidate(x, 'optionsDialog');
      },
      default() {
        return this.$dsDefaults().optionsDialog;
      }
    },
    promptDialog:
    {
      validate(x) {
        return this.$dsValidate(x, 'promptDialog');
      },
      default() {
        return this.$dsDefaults().promptDialog;
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
  watch:
  {
    'events': 'applyEvents',
    'calendar': 'applyEvents'
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
    summary()
    {
      let small = this.$vuetify.breakpoint.xs;
      if (small)
      {
        return this.calendar.start.format( this.formats.xs );
      }
      let large = this.$vuetify.breakpoint.mdAndUp;
      return this.calendar.summary(false, !large, false, !large);
    },
    todayDate()
    {
      return this.$dayspan.today.format( this.formats.today );
    },
    nextLabel()
    {
      return this.labels.next( this.currentType );
    },
    prevLabel()
    {
      return this.labels.prev( this.currentType );
    },
    toolbarStyle()
    {
      let large = this.$vuetify.breakpoint.lgAndUp;
      return large ? this.styles.toolbar.large : this.styles.toolbar.small;
    },
    hasCreatePopover()
    {
      return !!this.$scopedSlots.eventCreatePopover;
    },
    canAddDay()
    {
      return this.$dayspan.features.addDay && !this.readOnly && !this.$dayspan.readOnly;
    },
    canAddTime()
    {
      return this.$dayspan.features.addTime && !this.readOnly && !this.$dayspan.readOnly;
    }
  },
  mounted()
  {
    if (!this.$dayspan.promptOpen)
    {
      this.$dayspan.promptOpen = (question, callback) => {
        this.promptVisible = false;
        this.promptQuestion = question;
        this.promptCallback = callback;
        this.promptVisible = true;
      };
    }
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
      this.rebuild( this.$dayspan.today );
    },
    viewDay(day)
    {
      this.rebuild( day, false, this.types[ 0 ] );
    },
    edit(calendarEvent)
    {
      let eventDialog = this.$refs.eventDialog;
      eventDialog.edit(calendarEvent);
    },
    editPlaceholder(createEdit)
    {
      let placeholder = createEdit.calendarEvent;
      let details = createEdit.details;
      let eventDialog = this.$refs.eventDialog;
      let calendar = this.$refs.calendar;
      eventDialog.addPlaceholder( placeholder, details );
      eventDialog.$once('close', calendar.clearPlaceholder);
    },
    add(day)
    {
      if (!this.canAddDay)
      {
        return;
      }
      let eventDialog = this.$refs.eventDialog;
      let calendar = this.$refs.calendar;
      let useDialog = !this.hasCreatePopover;
      calendar.addPlaceholder( day, true, useDialog );
      if (useDialog)
      {
        eventDialog.add(day);
        eventDialog.$once('close', calendar.clearPlaceholder);
      }
    },
    addAt(dayHour)
    {
      if (!this.canAddTime)
      {
        return;
      }
      let eventDialog = this.$refs.eventDialog;
      let calendar = this.$refs.calendar;
      let useDialog = !this.hasCreatePopover;
      let at = dayHour.day.withHour( dayHour.hour );
      calendar.addPlaceholder( at, false, useDialog );
      if (useDialog)
      {
        eventDialog.addAt(dayHour.day, dayHour.hour);
        eventDialog.$once('close', calendar.clearPlaceholder);
      }
    },
    addToday()
    {
      if (!this.canAddDay)
      {
        return;
      }
      let eventDialog = this.$refs.eventDialog;
      let calendar = this.$refs.calendar;
      let useDialog = !this.hasCreatePopover || !calendar;
      let day = this.$dayspan.today;
      if (!this.calendar.filled.matchesDay( day ))
      {
        let first = this.calendar.days[ 0 ];
        let last = this.calendar.days[ this.calendar.days.length - 1 ];
        let firstDistance = Math.abs( first.currentOffset );
        let lastDistance = Math.abs( last.currentOffset );
        day = firstDistance < lastDistance ? first: last;
      }
      calendar && calendar.addPlaceholder( day, true, useDialog );
      if (useDialog)
      {
        eventDialog.add( day );
        calendar && eventDialog.$once('close', calendar.clearPlaceholder);
      }
    },
    handleAdd(addEvent)
    {
      let eventDialog = this.$refs.eventDialog;
      let calendar = this.$refs.calendar;
      addEvent.handled = true;
      if (!this.hasCreatePopover)
      {
        if (addEvent.placeholder.fullDay)
        {
          eventDialog.add(addEvent.span.start, addEvent.span.days(Op.UP));
        }
        else
        {
          eventDialog.addSpan(addEvent.span);
        }
        eventDialog.$once('close', addEvent.clearPlaceholder);
      }
      else
      {
        calendar.placeholderForCreate = true;
      }
    },
    handleMove(moveEvent)
    {
      let calendarEvent = moveEvent.calendarEvent;
      let target = moveEvent.target;
      let targetStart = target.start;
      let sourceStart = calendarEvent.time.start;
      let schedule = calendarEvent.schedule;
      let options = [];
      moveEvent.handled = true;
      let callbacks = {
        cancel: () => {
          moveEvent.clearPlaceholder()
        },
        single: () => {
          calendarEvent.move( targetStart );
          this.eventsRefresh();
          moveEvent.clearPlaceholder();
          this.$emit('event-update', calendarEvent.event);
        },
        instance: () => {
          calendarEvent.move( targetStart );
          this.eventsRefresh();
          moveEvent.clearPlaceholder();
          this.$emit('event-update', calendarEvent.event);
        },
        duplicate: () => {
          schedule.setExcluded( targetStart, false );
          this.eventsRefresh();
          moveEvent.clearPlaceholder();
          this.$emit('event-update', calendarEvent.event);
        },
        all: () => {
          schedule.moveTime( sourceStart.asTime(), targetStart.asTime() );
          this.eventsRefresh();
          moveEvent.clearPlaceholder();
          this.$emit('event-update', calendarEvent.event);
        }
      };
      options.push({
        text: this.labels.moveCancel,
        callback: callbacks.cancel
      });
      if (schedule.isSingleEvent())
      {
        options.push({
          text: this.labels.moveSingleEvent,
          callback: callbacks.single
        });
        if (this.$dayspan.features.moveDuplicate)
        {
          options.push({
            text: this.labels.moveDuplicate,
            callback: callbacks.duplicate
          });
        }
      }
      else
      {
        if (this.$dayspan.features.moveInstance)
        {
          options.push({
            text: this.labels.moveOccurrence,
            callback: callbacks.instance
          });
        }
        if (this.$dayspan.features.moveDuplicate)
        {
          options.push({
            text: this.labels.moveDuplicate,
            callback: callbacks.duplicate
          });
        }
        if (this.$dayspan.features.moveAll &&
            !schedule.isFullDay() &&
            targetStart.sameDay(sourceStart))
        {
          options.push({
            text: this.labels.moveAll,
            callback: callbacks.all
          });
        }
      }
      this.options = options;
      this.optionsVisible = true;
    },
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