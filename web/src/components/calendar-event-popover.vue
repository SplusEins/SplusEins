<template>
  <v-card>
    <v-toolbar :color="event.color" flat>
      <v-toolbar-title class="event-title">
        {{ event.name }}
      </v-toolbar-title>
      <v-btn :icon="mdiClose" aria-label="Schließen" @click="$emit('close')" />
    </v-toolbar>

    <v-list density="compact">
      <v-list-item
        :prepend-icon="mdiClockOutline"
        :title="startDate"
        :subtitle="timeframe"
      />

      <v-list-item v-if="location.length > 0" :prepend-icon="mdiMapMarker">
        <div v-for="(loc, index) in location" :key="index">
          <span v-if="loc.url">
            <a :href="loc.url" target="_blank">
              {{ loc.text }}
            </a>
            <span v-if="loc.extraInfo"> ({{ loc.extraInfo }})</span>
          </span>
          <span v-else>
            {{ loc.text }}
          </span>
        </div>
      </v-list-item>

      <v-list-item v-if="event.desc" :prepend-icon="mdiText">
        <!-- eslint-disable-next-line vue/no-v-html -- the API sanitizes the description -->
        <div v-html="event.desc" />
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';
import { mdiClockOutline, mdiClose, mdiMapMarker, mdiText } from '@mdi/js';
import dayjs from '../lib/dayjs';

const props = defineProps({
  /* calendar event, see getCalendarEvents in stores/splus.js */
  event: {
    required: true,
    type: Object,
  },
});
defineEmits(['close']);

const startDate = computed(() =>
  dayjs(props.event.start).format('dddd, DD.MM.YY'),
);
const timeframe = computed(() => {
  const format = (date) => dayjs(date).format('HH:mm');
  return `${format(props.event.start)} bis ${format(props.event.end)} Uhr`;
});

/**
 * Parses the location string into an array of objects with text and url
 * @returns {{ text: string, url?: string, extraInfo?: string }[]}
 */
const location = computed(() => {
  const rawLocation = props.event.location;
  if (!rawLocation) return [];

  // If there are multiple locations separated by ' / '
  const locations = rawLocation.split(' / ');

  /**
   * The rawLocation is in the form "WF-EX-2/252 (Am Exer 2, 38302 Wolfenbüttel) Link: https://..."
   * Explanation:
   * The WF-EX-2/252 is the text to display as link text
   * The (Am Exer 2, 38302 Wolfenbüttel) is optional and should be displayed after the link in parentheses
   * The URL after "Link: " is the href of the link
   */
  return locations.map((location) => {
    const trimmed = location.trim();
    const [nameAndInfoPart, linkPart] = trimmed.split(' Link: ');

    if (!linkPart) return { text: nameAndInfoPart.trim() };

    const url = linkPart.trim();
    const [displayText, extraInfo] = nameAndInfoPart.split(' (');

    if (extraInfo) {
      return {
        text: displayText.trim(),
        url,
        extraInfo: extraInfo.trim().slice(0, -1) /* remove trailing ) */,
      };
    }
    return { text: nameAndInfoPart.trim(), url };
  });
});
</script>

<style scoped>
.event-title {
  white-space: normal;
}
</style>
