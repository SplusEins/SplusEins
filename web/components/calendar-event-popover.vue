<template>
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

        <v-list-item v-if="location">
          <v-list-item-icon>
            <v-icon>{{ mdiMapMarker }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>
              <div
                v-for="(loc, index) in location"
                :key="index"
              >
                <span v-if="loc.url">
                  <a
                    :href="loc.url"
                    target="_blank"
                  >
                    {{ loc.text }}
                  </a>
                  <span v-if="loc.extraInfo"> ({{ loc.extraInfo }})</span>
                </span>
                <span v-else>
                  {{ loc.text }}
                </span>
              </div>
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item v-if="details.desc">
          <v-list-item-icon>
            <v-icon>{{ mdiText }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title
              class="overflow-y"
              v-html="details.desc"
            />
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script>
import { mdiClockOutline, mdiClose, mdiMapMarker, mdiText } from '@mdi/js'

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
      mdiText
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
    /**
     * Parses the location string into an array of objects with text and url
     * @returns { text: string, url?: string, extraInfo?: string}>}
     */
    location () {
      const rawLocation = this.selectedEvent.event.location;
      if (!rawLocation) return '';

      // If there are multiple locations separated by ' / '
      const locations = rawLocation.split(' / ');

      /**
       * The rawLocation is in the form "WF-EX-2/252 (Am Exer 2, 38302 Wolfenbüttel) Link: https://..."
       * Explanation:
       * The WF-EX-2/252 is the text to display as link text
       * The (Am Exer 2, 38302 Wolfenbüttel) is optional and should be displayed after the link in parentheses
       * The URL after "Link: " is the href of the link
       */
      const locationObject = locations.map(location => {
        const trimmed = location.trim();
        const [nameAndInfoPart, linkPart] = trimmed.split(' Link: ');

        if (!linkPart) return { text: nameAndInfoPart.trim() };

        const url = linkPart.trim();
        const [displayText, extraInfo] = nameAndInfoPart.split(' (');

        if (extraInfo) {
          return { text: displayText.trim(), url, extraInfo: extraInfo.trim().slice(0, -1) /* remove trailing ) */ };
        }
        return { text: nameAndInfoPart.trim(), url };
      });
      return locationObject;
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
