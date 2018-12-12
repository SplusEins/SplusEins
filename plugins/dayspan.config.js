import { Constants } from 'dayspan';

/* recalculate time offsets for adjusted dayspan-custom-calendar layout */
const dayspanOffsetHoursPre = 6; // schedule starts at 6 (instead of 0)
const dayspanOffsetHoursPost = 3; // schedule ends at 21 (instead of 24)
const dayspanScalingFactor = Constants.HOURS_IN_DAY /
  (Constants.HOURS_IN_DAY - dayspanOffsetHoursPre - dayspanOffsetHoursPost);

// see: https://github.com/ClickerMonkey/dayspan-vuetify/blob/master/src/component.js

export default {
  data: {
    inactiveBlendAmount: 0.6,
    dayHeight: 960 / dayspanScalingFactor,
  },

  methods:
  {

    getStyleNow()
    {
      const nowMillis = this.now.asTime().toMilliseconds();
      const dayspanOffsetMillis = dayspanOffsetHoursPre * Constants.MILLIS_IN_HOUR;
      const delta = (nowMillis - dayspanOffsetMillis)
        / (Constants.MILLIS_IN_DAY / dayspanScalingFactor);
      const top = delta * this.dayHeight;

      return {
        position: 'absolute',
        left: '0px',
        right: '-1px',
        top: (top - 1) + 'px',
        borderTop: this.getStyleNowBorder()
      };
    },

    getStyleTimed(details, calendarEvent)
    {
      const past = calendarEvent.time.end.utc().isBefore(this.now.utc().add(1,'hours'));
      const bounds = calendarEvent.getTimeBounds(
        this.dayHeight * dayspanScalingFactor,
        1, this.columnOffset, true, 0,
        -(dayspanOffsetHoursPre + 1) * this.dayHeight * dayspanScalingFactor / Constants.HOURS_IN_DAY);

      const stateColor = this.getStyleColor(details, calendarEvent, past, false);

      return {
        top: bounds.top + 'px',
        height: bounds.height + 'px',
        left: 100 / details.concurrentCount * details.concurrentOffset + '%',
        width: 100 / details.concurrentCount + '%',
        backgroundColor: stateColor,
        marginLeft: calendarEvent.starting ? 0 : '-5px',
        marginRight: calendarEvent.ending ? 0 : '-5px',
        textDecoration: 'inherit',
        textDecorationColor: 'inherit'
      };
    },

    getEventOccurrence(start, end)
    {    
      return start.date.utc().format('HH:mm') + ' Uhr bis ' + end.date.utc().format('HH:mm') + ' Uhr';
    },
  },
};
