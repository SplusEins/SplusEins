export default {
  promptLabels: {
    actionRemove: 'Are you sure you want to remove this event?',
    actionExclude: 'Are you sure you want to remove this event occurrence?',
    actionCancel: 'Are you sure you want to cancel this event?',
    actionUncancel: 'Are you sure you want to uncancel this event?',
    actionSetStart:
      'Are you sure you want to set this occurrence as the first?',
    actionSetEnd: 'Are you sure you want to set this occurrence as the last?',
    actionMove: 'Are you sure you want to move this event?',
    actionInclude: 'Are you sure you want to add an event occurrence?',
    move: 'Are you sure you want to move this event?',
    toggleAllDay:
      'Are you sure you want to change whether this event occurs all day?',
    removeExistingTime:
      'Are you sure you want to remove all event occurrences at this time?',
  },
  placeholder: {
    noTitle: '(kein Titel)',
  },
  patterns: {
    lastDay: (day) => 'Letzter Tag des Monats',
    lastDayOfMonth: (day) => 'Letzter Tag von ' + day.format('MMMM'),
    lastWeekday: (day) =>
      'Letzter ' + day.format('dddd') + ' im ' + day.format('MMMM'),
  },
  colors: [
    { text: 'Red' },
    { text: 'Pink' },
    { text: 'Purple' },
    { text: 'Deep Purple' },
    { text: 'Indigo' },
    { text: 'Blue' },
    { text: 'Glue' },
    { text: 'Light Blue' },
    { text: 'Cyan' },
    { text: 'Teal' },
    { text: 'Green' },
    { text: 'Light Green' },
    { text: 'Lime' },
    { text: 'Yellow' },
    { text: 'Amber' },
    { text: 'Orange' },
    { text: 'Deep Orange' },
    { text: 'Brown' },
    { text: 'Blue Gray' },
    { text: 'Gray' },
    { text: 'Black' },
  ],
  icons: [
    { text: 'Alarm' },
    { text: 'Star' },
    { text: 'Love' },
    { text: 'Action' },
    { text: 'Assignment' },
    { text: 'Warning' },
    { text: 'Money' },
    { text: 'Charge' },
    { text: 'Home' },
    { text: 'Play' },
    { text: 'Email' },
    { text: 'Phone' },
    { text: 'Chart' },
    { text: 'Biking' },
    { text: 'Travel' },
  ],
  defaults: {
    dsDay: {
      formats: {
        month: 'MMM',
      },
    },
    dsCalendarApp: {
      types: [
        { label: 'Tag' },
        { label: 'Woche' },
        { label: 'Monat' },
        { label: 'Jahr' },
        { label: 'Plan' },
        { label: '4 Tage' },
      ],
      formats: {
        today: 'dddd, MMMM D',
        xs: 'MMM',
      },
      labels: {
        next: (type) =>
          type ? 'Nächste ' + type.label.toLowerCase() : 'Weiter',
        prev: (type) =>
          type ? 'Letzte ' + type.label.toLowerCase() : 'Zurück',
        moveCancel: 'Cancel move',
        moveSingleEvent: 'Move event',
        moveOccurrence: 'Move just this event occurrence',
        moveAll: 'Move all event occurrences',
        moveDuplicate: 'Add event occurrence',
        promptConfirm: 'Ja',
        promptCancel: 'Nein',
        today: 'HEUTE',
      },
    },
    dsAgendaEvent: {
      formats: {
        firstLine: 'ddd',
        secondLine: 'MMM Do',
        start: 'dddd, MMMM D',
        time: 'h:mm a',
      },
      labels: {
        allDay: 'All day',
        options: 'Options',
        close: 'Close',
        day: ['day', 'days'],
        days: ['day', 'days'],
        minute: ['minute', 'minutes'],
        minutes: ['minute', 'minutes'],
        hour: ['hour', 'hours'],
        hours: ['hour', 'hours'],
        week: ['week', 'weeks'],
        weeks: ['week', 'weeks'],
        busy: 'Busy',
        free: 'Free',
      },
    },
    dsCalendarEventChip: {
      formats: {
        fullDay: 'ddd MMM Do YYYY',
        timed: 'ddd MMM Do YYYY',
      },
    },
    dsCalendarEventPopover: {
      allowEditOnReadOnly: false,
      formats: {
        start: 'dddd, D. MMMM',
        time: 'hh:mm',
      },
      labels: {
        allDay: 'All day',
        options: 'Options',
        close: 'Close',
        day: ['day', 'days'],
        days: ['day', 'days'],
        minute: ['minute', 'minutes'],
        minutes: ['minute', 'minutes'],
        hour: ['hour', 'hours'],
        hours: ['hour', 'hours'],
        week: ['week', 'weeks'],
        weeks: ['week', 'weeks'],
        busy: 'Busy',
        free: 'Free',
      },
    },
    dsCalendarEventCreatePopover: {
      formats: {
        start: 'dddd, MMMM D',
        time: 'h:mm a',
      },
      labels: {
        title: 'Add title',
        allDay: 'All day',
        close: 'Close',
        save: 'Save',
        day: ['day', 'days'],
        days: ['day', 'days'],
        minute: ['minute', 'minutes'],
        minutes: ['minute', 'minutes'],
        hour: ['hour', 'hours'],
        hours: ['hour', 'hours'],
        week: ['week', 'weeks'],
        weeks: ['week', 'weeks'],
        busy: 'Busy',
        free: 'Free',
        location: 'Add location',
        description: 'Add description',
        calendar: 'Calendar',
      },
      busyOptions: [{ text: 'Busy' }, { text: 'Free' }],
    },
    dsSchedule: {
      labels: {
        editCustom: 'Edit',
      },
    },
    dsEvent: {
      labels: {
        cancel: 'Cancel event changes',
        save: 'Save',
        title: 'Title',
        exclusions:
          'These are events or spans of time where a normally occurring event was excluded from the schedule. Events are excluded here if an event occurrence is moved.',
        inclusions:
          'These are events or spans of time where events were added outside the normally occurring schedule. Events are added here if an event occurrence is moved.',
        cancelled:
          'These are events or spans of time where events were cancelled.',
        edit: 'Edit event',
        add: 'Add event',
        location: 'Add location',
        description: 'Add description',
        calendar: 'Calendar',
        tabs: {
          details: 'Event Details',
          forecast: 'Forecast',
          removed: 'Removed',
          added: 'Added',
          cancelled: 'Cancelled',
        },
      },
      busyOptions: [{ text: 'Busy' }, { text: 'Free' }],
    },
    dsScheduleActions: {
      labels: {
        remove: 'Remove this event',
        exclude: 'Remove this occurrence',
        cancel: 'Cancel this occurrence',
        uncancel: 'Undo cancellation',
        move: 'Move this occurrence',
        include: 'Add new occurrence',
        setStart: 'Set as first occurrence',
        setEnd: 'Set as last occurrence',
        pickerOk: 'OK',
        pickerCancel: 'Cancel',
      },
    },
    dsScheduleForecast: {
      labels: {
        prefix: 'The forecast shows previous & next',
        suffix: 'event occurrences within a years time.',
      },
    },
    dsScheduleFrequencyDay: {
      labels: {
        type: 'Days',
      },
      options: [
        { text: 'Any day' },
        { text: 'On the following days...' },
        { text: 'Every _ days starting on _' },
      ],
      types: [
        { text: 'Day of the month' },
        { text: 'Last day of the month' },
        { text: 'Day of the year' },
      ],
    },
    dsScheduleFrequencyDayOfWeek: {
      weekdays: [
        'Sonntag',
        'Montag',
        'Dienstag',
        'Mittwoch',
        'Donnerstag',
        'Freitag',
        'Samstag',
      ],
      labels: {
        type: 'Wochentag',
      },
      options: [
        { text: 'Any day of the week' },
        { text: 'On the following days of the week...' },
        { text: 'Every _ weekday starting on _' },
        { text: 'Weekends' },
        { text: 'Weekdays' },
      ],
    },
    dsScheduleFrequencyMonth: {
      labels: {
        type: 'Monate',
      },
      months: [
        'Januar',
        'Februar',
        'März',
        'April',
        'Mai',
        'Juni',
        'Juli',
        'August',
        'September',
        'Oktober',
        'November',
        'Dezember',
      ],
      options: [
        { text: 'Any month' },
        { text: 'On the following months...' },
        { text: 'Every _ months starting on _' },
      ],
    },

    dsScheduleFrequencyWeek: {
      labels: {
        type: 'Woche',
      },
      options: [
        { text: 'Any week' },
        { text: 'On the following weeks...' },
        { text: 'Every _ weeks starting on _' },
      ],
      types: [
        { text: 'Week of the month (first week has a Thursday)' },
        { text: 'Weekspan of the month (starts on first day of month)' },
        { text: 'Full week of the month (0th = the week before if any)' },
        { text: 'Last weekspan of the month (starts on last day of month)' },
        { text: 'Last full week of the month (0th = the week after if any)' },
        { text: 'Week of the year (first week has a Thursday)' },
        { text: 'Weekspan of the year (starts on first day of year)' },
        { text: 'Full week of the year (0th = the week before if any)' },
        { text: 'Last weekspan of the year (starts on last day of year)' },
        { text: 'Last full week of the year (0th = the week after if any)' },
      ],
    },

    dsScheduleFrequencyYear: {
      labels: {
        type: 'Jahre',
      },
      options: [
        { text: 'Any year' },
        { text: 'On the following years...' },
        { text: 'Every _ years starting on _' },
      ],
    },

    dsScheduleSpan: {
      labels: {
        startless: 'Beginning of Time',
        endless: 'End of Time',
      },
      formats: {
        start: 'MMMM Do, YYYY',
        end: 'MMMM Do, YYYY',
      },
    },

    dsScheduleTime: {
      labels: {
        remove: 'Remove time',
        add: 'Add time',
      },
    },

    dsScheduleTimes: {
      labels: {
        all: 'All day',
        minute: 'minute',
        minutes: 'minutes',
        hour: 'hour',
        hours: 'hours',
        day: 'day',
        days: 'days',
        week: 'week',
        weeks: 'weeks',
        month: 'month',
        months: 'months',
      },
    },

    dsScheduleType: {
      formats: {
        date: 'LL',
      },
    },

    dsScheduleTypeCustomDialog: {
      labels: {
        save: 'Save',
        cancel: 'Cancel',
      },
    },

    dsWeekDayHeader: {
      formats: {
        weekday: 'ddd',
      },
    },

    dsWeeksView: {
      weekdays: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
    },

    dsDaysView: {
      scrollToFirst: false,
      hours: [
        '    ',
        '01:00',
        '02:00',
        '03:00',
        '04:00',
        '05:00',
        '06:00',
        '07:00',
        '08:00',
        '09:00',
        '10:00',
        '11:00',
        '12:00',
        '13:00',
        '14:00',
        '15:00',
        '16:00',
        '17:00',
        '18:00',
        '19:00',
        '20:00',
        '21:00',
        '22:00',
        '23:00',
      ],
    },

    dsDayPicker: {
      weekdays: [
        'Sonntag',
        'Montag',
        'Dienstag',
        'Mittwoch',
        'Donnerstag',
        'Freitag',
        'Samstag',
      ],
      labels: {
        prevMonth: 'Letzter Monat',
        nextMonth: 'Nächster Monat',
      },
    },
  },
};
