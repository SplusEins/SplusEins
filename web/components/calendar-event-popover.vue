<template>
  <lazy-hydrate when-visible>
    <v-card>
      <v-toolbar
        :style="styleHeader"
        flat
      >
        <template #extension>
          <v-toolbar-title class="ml-4 mb-6 white--text">
            {{ details.name }}
          </v-toolbar-title>
        </template>
        <v-spacer />

        <v-btn
          icon
          @click="$emit('close')"
        >
          <v-icon color="white">
            {{ mdiClose }}
          </v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="px-4">
        <v-list dense>
          <v-list-item>
            <v-list-item-icon>
              <v-icon>{{ mdiClockOutline }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>{{ startDate }}</v-list-item-title>
              <v-list-item-subtitle>{{ timeframe }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>

          <v-list-item v-if="details.location">
            <v-list-item-icon>
              <v-icon>{{ mdiMapMarker }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title v-html="details.location" />
            </v-list-item-content>
          </v-list-item>

          <v-list-item v-if="details.desc">
            <v-list-item-icon>
              <v-icon>{{ mdiTextSubject }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title class="overflow-y">
                {{ details.desc }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </lazy-hydrate>
</template>

<script>
import { mdiClockOutline, mdiClose, mdiMapMarker, mdiTextSubject } from '@mdi/js'

export default {
  name: 'DsCustomCalendarEventPopover',
  props: {
    selectedEvent: {
      required: true,
      type: Object
    }
  },
  data () {
    return {
      mdiClockOutline,
      mdiClose,
      mdiMapMarker,
      mdiTextSubject
    }
  },
  computed: {
    styleHeader () {
      return {
        backgroundColor: this.details.color
      };
    },
    startDate () {
      return this.$dayjs(this.selectedEvent.eventParsed.start.date).format('dddd, DD.MM.YY');
    },
    details () {
      return this.selectedEvent.event;
    },
    timeframe () {
      return this.selectedEvent.eventParsed.start.time + ' bis ' + this.selectedEvent.eventParsed.end.time + ' Uhr'
    }
  }
}
</script>

<style scoped lang="scss">

.overflow-y {
  overflow-y: auto;
  white-space: normal !important;
}
.v-toolbar__title {
  white-space: normal;
}
</style>
