<template>
  <lazy-hydrate when-visible>
    <v-card class="ds-calendar-event-popover-card">
      <v-toolbar
        :style="styleHeader"
        flat
      >
        <v-toolbar-title
          slot="extension"
          class="toolbar-padding"
        >
          {{ details.title }}
        </v-toolbar-title>

        <v-spacer />

        <v-btn
          icon
          @click="close"
        >
          <v-icon color="white">
            mdi-close
          </v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text>
        <v-list dense>
          <v-list-tile>
            <v-list-tile-avatar>
              <v-icon>mdi-clock-outline</v-icon>
            </v-list-tile-avatar>
            <v-list-tile-content>
              <v-list-tile-title>{{ startDate }}</v-list-tile-title>
              <v-list-tile-sub-title>{{ timeframe }}</v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>

          <v-list-tile v-if="details.location">
            <v-list-tile-avatar>
              <v-icon>mdi-map-marker</v-icon>
            </v-list-tile-avatar>
            <v-list-tile-content>
              <v-list-tile-title>{{ details.location }}</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>

          <v-list-tile v-if="details.description">
            <v-list-tile-avatar>
              <v-icon>mdi-text-subject</v-icon>
            </v-list-tile-avatar>
            <v-list-tile-content>
              <v-list-tile-title class="overflow-y">
                {{ details.description }}
              </v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>

          <v-list-tile v-if="details.calendar">
            <v-list-tile-avatar>
              <v-icon>event</v-icon>
            </v-list-tile-avatar>
            <v-list-tile-content>
              <v-list-tile-title>{{ details.calendar }}</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-card-text>
    </v-card>
  </lazy-hydrate>
</template>

<script>
import { CalendarEvent, Calendar, Pattern } from 'dayspan';
export default {
  name: 'DsCustomCalendarEventPopover',
  props: {
    calendarEvent: {
      required: true,
      type: CalendarEvent
    },
    calendar: {
      required: true,
      type: Calendar
    },
    close: {
      type: Function,
      default(){}
    },
  },
  computed: {
    styleHeader() {
      return {
        backgroundColor: this.details.color,
        color: this.details.forecolor
      };
    },
    startDate() {
      return this.calendarEvent.start.toMoment().format('dddd, DD.MM.YY');
    },
    details() {
      return this.calendarEvent.event.data;
    },
    timeframe() {
      return this.$dayspan.getEventOccurrence(
        this.calendarEvent.start,
        this.calendarEvent.end,
      );
    },
  },
}
</script>

<style scoped lang="scss">
.ds-calendar-event-popover-card {
  .v-btn--floating.v-btn--left {
    margin-left: 0px !important;
    .v-icon {
      height: auto;
    }
  }
  .v-card__text {
    padding: 16px 0;
    .v-list {
      .v-list__tile {
        padding: 0px !important;
        height: auto;
        .v-list__tile__title{
          white-space: pre-wrap;
          height: auto;
          line-height: normal;
        }
      }
    }
  }
  .v-toolbar__extension {
    .v-toolbar__title {
      margin-left: 56px;
      color: white;
      white-space: normal;
    }
  }
}

.toolbar-padding {
  padding: 0px 16px 20px 0px !important;
}

.overflow-y {
 overflow-y: auto;
}
</style>
