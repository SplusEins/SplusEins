import { Constants } from 'dayspan';

/* recalculate time offsets for adjusted dayspan-custom-calendar layout */
const dayspanOffsetHoursPre = 7; // schedule starts at 7 (instead of 0)
const dayspanOffsetHoursPost = 4; // schedule ends at 20 (instead of 24)
const dayspanDayLengthHours = Constants.HOURS_IN_DAY - dayspanOffsetHoursPre - dayspanOffsetHoursPost;
const dayspanScalingFactor = Constants.HOURS_IN_DAY / dayspanDayLengthHours;
// 13*50px = 650px, +300px for toolbars and footer, +100px for browser = a bit less than 1080px total
// same as components/dayspan-custom-calendar .ds-hour styles
const hourHeight = 50;

// see: https://github.com/ClickerMonkey/dayspan-vuetify/blob/master/src/component.js

export default {
  data: {
    inactiveBlendAmount: 0.6,
    dayHeight: hourHeight * dayspanDayLengthHours,
    hourHeight: hourHeight
  },

  methods:
  {

    getStyleNow () {
      const nowMillis = this.now.asTime().toMilliseconds();
      const dayspanOffsetMillis = dayspanOffsetHoursPre * Constants.MILLIS_IN_HOUR;
      const delta = (nowMillis - dayspanOffsetMillis) /
        (Constants.MILLIS_IN_DAY / dayspanScalingFactor);
      const top = delta * this.dayHeight;

      return {
        position: 'absolute',
        left: '0px',
        right: '-1px',
        top: (top - 1) + 'px',
        borderTop: this.getStyleNowBorder()
      };
    },

    getStyleTimed (details, calendarEvent) {
      const past = calendarEvent.time.end.isBefore(this.now);
      const bounds = calendarEvent.getTimeBounds(
        this.dayHeight * dayspanScalingFactor,
        1, this.columnOffset, true, 0,
        -(dayspanOffsetHoursPre) * this.dayHeight * dayspanScalingFactor / Constants.HOURS_IN_DAY);

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

    getEventOccurrence (start, end) {
      return start.date.format('HH:mm') + ' Uhr bis ' + end.date.format('HH:mm') + ' Uhr';
    }
  }
};
