export default {

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
      const isToday = calendarEvent.end.dayOfWeek == this.now.dayOfWeek;
      const isAfter = calendarEvent.time.end.asTime().toMilliseconds() < Math.floor((this.now.asTime().toMilliseconds() - sixHoursToMillis) * multiplicator);
      let past = isToday && isAfter;

      let cancelled = calendarEvent.cancelled;
      let bounds = calendarEvent.getTimeBounds( this.dayHeight, 1, this.columnOffset );

      let color = this.getStyleColor( details, calendarEvent );
      let stateColor = this.getStyleColor( details, calendarEvent, past, cancelled );

      return {
        top: bounds.top + 'px',
        height: bounds.height + 'px',
        left: bounds.left + '%',
        width: (100 - bounds.left) + '%',
        backgroundColor: stateColor,
        marginLeft: calendarEvent.starting ? 0 : '-5px',
        marginRight: calendarEvent.ending ? 0 : '-5px',
        textDecoration: cancelled ? 'line-through' : 'inherit',
        textDecorationColor: cancelled ? stateColor : 'inherit'
      };
    },
  },
};