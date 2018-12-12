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
      const past = calendarEvent.time.end.isBefore(this.now);
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
      const multiplicator = 1.125;
      const shiftingHours = 6;

      const calculateExaxtTime = function(moment) {
        const shiftedMinutes = moment.minutes() + moment.hours() * 60;
        const minutesWithoutMultiplicator = Math.ceil(shiftedMinutes / multiplicator);
  
        let hours = Math.floor(minutesWithoutMultiplicator / 60);
        let minutes = minutesWithoutMultiplicator - (hours * 60);

        //round minutes to closest min % 5 == 0
        minutes = minutes%5<3 ? (minutes%5===0 ? minutes : Math.floor(minutes/5)*5) : Math.ceil(minutes/5)*5
        hours += shiftingHours;
  
        const exactTime = moment.clone()
                         .hours(hours)
                         .minutes(minutes);

        return  exactTime.format("HH:mm");
      }

      return calculateExaxtTime(start.date) + " Uhr bis " + calculateExaxtTime(end.date) + " Uhr";
    },
  },
};
