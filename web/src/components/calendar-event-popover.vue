<template>
  <component
    :is="mobile ? VBottomSheet : VDialog"
    v-model="open"
    :max-width="mobile ? undefined : 440"
  >
    <v-card v-if="event" :class="{ 'rounded-t-xl': mobile }">
      <div class="d-flex align-start pt-4 px-4">
        <div class="flex-grow-1">
          <div class="text-label-medium text-medium-emphasis">
            <v-icon
              :icon="mdiCircle"
              :color="event.color"
              size="10"
              class="mr-1 mb-1"
            />
            {{ event.plan?.name ?? splus.scheduleDisplayName() }}
          </div>
          <div class="text-headline-small text-wrap">{{ event.name }}</div>
        </div>
        <v-btn
          :icon="mdiClose"
          variant="text"
          density="comfortable"
          aria-label="Schließen"
          @click="open = false"
        />
      </div>

      <div
        v-if="running"
        class="text-label-medium font-weight-bold text-primary px-4 pt-2"
      >
        Jetzt · noch {{ end.diff(now, 'minute') }} min
      </div>

      <v-list>
        <v-list-item
          :prepend-icon="mdiClockOutline"
          :title="timeframe"
          :subtitle="day"
        />

        <v-list-item
          v-for="(loc, i) in location"
          :key="i"
          :title="loc.text"
          :subtitle="loc.extraInfo"
        >
          <template #prepend>
            <v-icon :icon="mdiMapMarkerOutline" :class="{ 'opacity-0': i }" />
          </template>
          <template v-if="loc.url" #append>
            <v-btn
              :href="loc.url"
              target="_blank"
              :append-icon="mdiOpenInNew"
              color="primary"
              variant="tonal"
              size="small"
            >
              Karte
            </v-btn>
          </template>
        </v-list-item>

        <v-list-item
          v-if="event.lecturer"
          :prepend-icon="mdiAccountOutline"
          :title="event.lecturer"
        />

        <v-list-item v-if="event.info" :prepend-icon="mdiInformationOutline">
          <!-- eslint-disable-next-line vue/no-v-html -- the API sanitizes the description -->
          <div v-html="event.info" />
        </v-list-item>
      </v-list>

      <template v-if="event.plan">
        <v-divider />
        <v-card-actions class="justify-start px-4">
          <v-btn
            :to="event.plan.route"
            :append-icon="mdiChevronRight"
            color="primary"
          >
            Im Stundenplan öffnen
          </v-btn>
        </v-card-actions>
      </template>
    </v-card>
  </component>
</template>

<script setup>
import { computed } from 'vue';
import { useDisplay } from 'vuetify';
import { VBottomSheet } from 'vuetify/components/VBottomSheet';
import { VDialog } from 'vuetify/components/VDialog';
import {
  mdiAccountOutline,
  mdiChevronRight,
  mdiCircle,
  mdiClockOutline,
  mdiClose,
  mdiInformationOutline,
  mdiMapMarkerOutline,
  mdiOpenInNew,
} from '@mdi/js';
import dayjs from '../lib/dayjs';
import { useSplusStore } from '../stores/splus';
import { relativeDay } from '../lib/util';
import { useNow } from '../lib/now';

const props = defineProps({
  /* see getCalendarEvents in stores/splus.js, plan is only set in the agenda */
  event: {
    type: Object,
    default: undefined,
  },
});
const open = defineModel({ type: Boolean });

const splus = useSplusStore();
const { mobile } = useDisplay();

const now = useNow();

const start = computed(() => dayjs(props.event.start));
const end = computed(() => dayjs(props.event.end));
const running = computed(
  () => start.value.valueOf() <= now.value && now.value < end.value.valueOf(),
);
const timeframe = computed(
  () => `${start.value.format('HH:mm')} bis ${end.value.format('HH:mm')} Uhr`,
);
const day = computed(() =>
  [relativeDay(start.value, now.value), start.value.format('dddd DD.MM.')]
    .filter(Boolean)
    .join(', '),
);

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
