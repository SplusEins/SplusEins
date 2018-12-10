import { Constants } from 'dayspan';

/* recalculate time offsets for adjusted dayspan-custom-calendar layout */
const dayspanOffsetHours = 6; // schedule starts at 6
const dayspanFactorHours = 24 / (24 - 6 - 3); // 0-24 -> 6-21

// see: https://github.com/ClickerMonkey/dayspan-vuetify/blob/master/src/component.js

export default {
  data: {
    inactiveBlendAmount: 0.6,
    dayHeight: 960 / dayspanFactorHours,
  },

  methods:
  {

    getStyleNow()
    {
      const nowMillis = this.now.asTime().toMilliseconds();
      const dayspanOffsetMillis = dayspanOffsetHours * 60 * 60 * 1000;
      const delta = (nowMillis - dayspanOffsetMillis)
        / (Constants.MILLIS_IN_DAY / dayspanFactorHours);
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
      const past = calendarEvent.time.end.isBefore(this.now);
      const bounds = calendarEvent.getTimeBounds(
        this.dayHeight * dayspanFactorHours,
        1, this.columnOffset, true, 0,
        -(dayspanOffsetHours + 1) * this.dayHeight * dayspanFactorHours / 24);

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

    getEventOccurrence()
    {    
      return "";
    },
  },
};