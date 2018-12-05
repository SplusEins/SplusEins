<template>

  <v-card 
    :class="classes"
    class="ds-calendar-event-popover-card">

    <v-toolbar 
      :style="styleHeader" 
      flat>

      <v-toolbar-title 
        slot="extension"
        class="toolbarBtmPadding">
        {{ details.title }}
        <v-icon 
          v-if="details.icon"
          :style="styleButton">
          {{ details.icon }}
        </v-icon>
      </v-toolbar-title>

      <v-btn
        v-if="allowEdit"
        color="secondary"
        small 
        absolute 
        bottom 
        left 
        fab 
        icon
        @click="edit">
        <v-icon>edit</v-icon>
      </v-btn>

      <slot 
        v-bind="slotData"
        name="eventPopoverToolbarLeft"/>

      <v-spacer/>

      <slot 
        v-bind="slotData"
        name="eventPopoverToolbarRight"/>

      <slot 
        v-bind="slotData"
        name="eventPopoverToolbarActions">
        <v-tooltip 
          v-if="!isReadOnly"
          bottom>

          <ds-schedule-actions
            slot="activator"
            v-bind="{$scopedSlots}"
            :calendar="calendar"
            :calendar-event="calendarEvent"
            :schedule="calendarEvent.schedule"
            v-on="$listeners">

            <v-btn 
              :style="styleButton"
              icon>
              <v-icon>more_vert</v-icon>
            </v-btn>

          </ds-schedule-actions>

          <span>{{ labels.options }}</span>

        </v-tooltip>

      </slot>

      <slot 
        v-bind="slotData"
        name="eventPopoverToolbarClose">

        <v-btn 
          :style="styleButton"
          icon
          @click="close" >
          <v-icon>close</v-icon>
        </v-btn>

      </slot>

    </v-toolbar>
    <v-card-text>

      <slot 
        v-bind="slotData"
        name="eventPopoverBodyTop"/>

      <v-list dense>

        <v-list-tile>
          <v-list-tile-avatar>
            <v-icon>access_time</v-icon>
          </v-list-tile-avatar>
          <v-list-tile-content>
            <slot 
              v-bind="slotData"
              name="eventPopoverOccurs">
              <v-list-tile-title>{{ startDate }}</v-list-tile-title>
              <v-list-tile-sub-title>{{ occurs }}</v-list-tile-sub-title>
            </slot>
          </v-list-tile-content>
        </v-list-tile>

        <v-list-tile v-if="details.location">
          <v-list-tile-avatar>
            <v-icon>location_on</v-icon>
          </v-list-tile-avatar>
          <v-list-tile-content>
            <slot 
              v-bind="slotData"
              name="eventPopoverLocation">
              <v-list-tile-title>
                <span 
                  v-html="details.location"/>
              </v-list-tile-title>
            </slot>
          </v-list-tile-content>
        </v-list-tile>

        <v-list-tile 
          v-if="details.description">
          <v-list-tile-avatar>
            <v-icon>subject</v-icon>
          </v-list-tile-avatar>
          <v-list-tile-content>
            <slot 
              v-bind="slotData"
              name="eventPopoverDescription">
              <v-list-tile-title>
                <span 
                  v-html="details.description"/>
              </v-list-tile-title>
            </slot>
          </v-list-tile-content>
        </v-list-tile>

        <v-list-tile 
          v-if="details.notify">
          <v-list-tile-avatar>
            <v-icon>notifications</v-icon>
          </v-list-tile-avatar>
          <v-list-tile-content>
            <slot 
              v-bind="slotData">
              name="eventPopoverNotifications" 
              <v-list-tile-title>
                <span v-html="details.notify"/>
              </v-list-tile-title>
            </slot>
          </v-list-tile-content>
        </v-list-tile>

        <v-list-tile v-if="details.calendar">
          <v-list-tile-avatar>
            <v-icon>event</v-icon>
          </v-list-tile-avatar>
          <v-list-tile-content>
            <slot 
              v-bind="slotData"
              name="eventPopoverCalendar">
              <v-list-tile-title>
                <span 
                  v-html="details.calendar"/>
              </v-list-tile-title>
            </slot>
          </v-list-tile-content>
        </v-list-tile>

        <v-list-tile 
          v-if="hasBusy">
          <v-list-tile-avatar>
            <v-icon>work</v-icon>
          </v-list-tile-avatar>
          <v-list-tile-content>
            <slot 
              v-bind="slotData"
              name="eventPopoverBusy">
              <v-list-tile-title>{{ busyness }}</v-list-tile-title>
            </slot>
          </v-list-tile-content>
        </v-list-tile>

      </v-list>

      <slot 
        v-bind="slotData"
        name="eventPopoverBodyBottom"/> 

    </v-card-text>

    <slot 
      v-bind="slotData"
      name="eventPopoverActions"/>

  </v-card>

</template>

<script>
import { CalendarEvent, Calendar, Pattern } from 'dayspan';
export default {
  name: 'DsCustomCalendarEventPopover',
  props:
  {
    calendarEvent:
    {
      required: true,
      type: CalendarEvent
    },
    calendar:
    {
      required: true,
      type: Calendar
    },
    readOnly:
    {
      type: Boolean,
      default: false
    },
    edit:
    {
      type: Function,
      default(){}
    },
    allowEditOnReadOnly:
    {
      type: Boolean,
      default: false,
    },
    close:
    {
      type: Function,
      default(){}
    },
    formats:
    {
      type: Function,
      validate(x) {
        return this.$dsValidate(x, 'formats');
      },
      default() {
        return this.$dsDefaults().formats;
      }
    },
    labels:
    {
      type: Function,
      validate(x) {
        return this.$dsValidate(x, 'labels');
      },
      default() {
        return this.$dsDefaults().labels;
      }
    }
  },
  data: vm => ({
  }),
  computed:
  {
    slotData()
    {
      return {
        calendarEvent: this.calendarEvent,
        calendar: this.calendar,
        edit: this.edit,
        close: this.close,
        details: this.details,
        readOnly: this.readOnly
      };
    },
    classes()
    {
      return {
        'ds-event-cancelled': this.calendarEvent.cancelled
      };
    },
    styleHeader()
    {
      return {
        backgroundColor: this.details.color,
        color: this.details.forecolor
      };
    },
    styleButton()
    {
      return {
        color: 'white'
      };
    },
    startDate()
    {
      return this.calendarEvent.start.toMoment().format( 'dddd, DD.MM.YY' );
    },
    busyness()
    {
      return this.details.busy ? this.labels.busy : this.labels.free;
    },
    hasBusy()
    {
      return typeof this.details.busy === 'boolean';
    },
    occurs()
    {
      return this.$dayspan.getEventOccurrence(
        this.calendarEvent.schedule,
        this.calendarEvent.start,
        this.labels,
        this.formats
      );
    },
    details()
    {
      return this.calendarEvent.event.data;
    },
    allowEdit()
    {
      return this.allowEditOnReadOnly || !this.isReadOnly;
    },
    isReadOnly()
    {
      return this.readOnly || this.$dayspan.readOnly || this.details.readonly;
    }
  },
  methods:
  {
  }
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

.toolbarBtmPadding{
  padding: 0px 16px 20px 0px !important;
}
</style>
