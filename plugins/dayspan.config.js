// see: https://github.com/ClickerMonkey/dayspan-vuetify/blob/master/src/component.js

export default {
  data: {
    inactiveBlendAmount: 0.6,
  },

  methods:
  {

    getStyleNow()
    {
      const millisPerDay = 86400000;
      const sixHoursToMillis = 21600000;
      const multiplicator = 1.125;
      let now = Math.floor((this.now.asTime().toMilliseconds() - sixHoursToMillis) * multiplicator);
      let delta = now / millisPerDay;
      let top = delta * this.dayHeight;

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
      const sixHoursToMillis = 21600000;
      const multiplicator = 1.125;
      const isBefore =  calendarEvent.end.year <= this.now.year && calendarEvent.end.dayOfYear < this.now.dayOfYear;
      const isToday = calendarEvent.end.year == this.now.year && calendarEvent.end.dayOfYear == this.now.dayOfYear;
      const isAfterEnd = calendarEvent.time.end.asTime().toMilliseconds() < Math.floor((this.now.asTime().toMilliseconds() - sixHoursToMillis) * multiplicator);
      let past = isBefore || (isToday && isAfterEnd);

      let cancelled = calendarEvent.cancelled;
      let bounds = calendarEvent.getTimeBounds( this.dayHeight, 1, this.columnOffset );

      let color = this.getStyleColor( details, calendarEvent );
      let stateColor = this.getStyleColor( details, calendarEvent, past, cancelled );

      return {
        top: bounds.top + 'px',
        height: bounds.height + 'px',
        left: 100 / details.concurrentCount * details.concurrentOffset + '%',
        width: 100 / details.concurrentCount + '%',
        backgroundColor: stateColor,
        marginLeft: calendarEvent.starting ? 0 : '-5px',
        marginRight: calendarEvent.ending ? 0 : '-5px',
        textDecoration: cancelled ? 'line-through' : 'inherit',
        textDecorationColor: cancelled ? stateColor : 'inherit'
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