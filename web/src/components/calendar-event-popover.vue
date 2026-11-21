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
              v-if="event.plan"
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

      <template v-if="event.plan || openPlan || addTargets.length > 0">
        <v-divider />
        <v-card-actions class="justify-start flex-wrap px-4">
          <v-btn
            v-if="openPlan"
            :prepend-icon="mdiEyeOffOutline"
            :disabled="withoutThisCourse.sources.length === 0"
            variant="outlined"
            @click="hideCourse()"
          >
            Alle Termine ausblenden
          </v-btn>
          <v-btn
            v-if="addTargets.length === 1"
            :prepend-icon="has(addTargets[0]) ? mdiCheck : mdiPlus"
            :disabled="has(addTargets[0])"
            variant="outlined"
            @click="addTo(addTargets[0])"
          >
            {{
              has(addTargets[0])
                ? `Schon in ${addTargets[0].name}`
                : `Zu ${addTargets[0].name} hinzufügen`
            }}
          </v-btn>
          <v-menu v-else-if="addTargets.length > 1">
            <template #activator="{ props: menu }">
              <v-btn v-bind="menu" :prepend-icon="mdiPlus" variant="outlined">
                Hinzufügen
              </v-btn>
            </template>
            <v-list>
              <v-list-subheader>Hinzufügen zu</v-list-subheader>
              <v-list-item
                v-for="plan in addTargets"
                :key="plan.name"
                :title="plan.name"
                :subtitle="has(plan) ? 'Schon drin' : undefined"
                :disabled="has(plan)"
                @click="addTo(plan)"
              />
            </v-list>
          </v-menu>
          <v-btn
            v-if="event.plan"
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
import { useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';
import { VBottomSheet } from 'vuetify/components/VBottomSheet';
import { VDialog } from 'vuetify/components/VDialog';
import {
  mdiAccountOutline,
  mdiCheck,
  mdiChevronRight,
  mdiCircle,
  mdiClockOutline,
  mdiClose,
  mdiEyeOffOutline,
  mdiInformationOutline,
  mdiMapMarkerOutline,
  mdiOpenInNew,
  mdiPlus,
} from '@mdi/js';
import dayjs from '../lib/dayjs';
import { useSplusStore } from '../stores/splus';
import { relativeDay } from '../lib/util';
import {
  includesCourse,
  planKey,
  planRoute,
  withoutCourse,
} from '../lib/plans';
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
const router = useRouter();
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

/* the open plan, the agenda has none */
const openPlan = computed(() =>
  props.event.plan ? undefined : splus.schedule,
);
const withoutThisCourse = computed(() =>
  withoutCourse(openPlan.value, props.event.id, props.event.sources),
);
/* plans with a name the course can be added to */
const addTargets = computed(() =>
  props.event.plan
    ? []
    : splus.plans.filter((plan) => plan.name && plan !== splus.savedSchedule),
);
const has = (plan) =>
  plan.sources.some(
    (source) =>
      props.event.sources.includes(source.id) &&
      includesCourse(source, props.event.id),
  );

function addTo(plan) {
  splus.addCourse(planKey(plan), props.event.sources[0], props.event.id);
}

/**
 * Removes the course with all its lectures from the open plan. A saved plan
 * is saved right away, otherwise the bar on the page offers to save it.
 */
function hideCourse() {
  const changed = withoutThisCourse.value;
  if (splus.savedSchedule && !splus.unsavedState) {
    splus.savePlan(planKey(splus.schedule), changed);
  }
  open.value = false;
  // the new URL re-creates the plan page
  router.replace(planRoute(changed));
}

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
