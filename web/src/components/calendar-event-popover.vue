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
          v-for="(room, i) in event.rooms"
          :key="i"
          :title="room.name"
          :subtitle="room.address"
        >
          <template #prepend>
            <v-icon :icon="mdiMapMarkerOutline" :class="{ 'opacity-0': i }" />
          </template>
          <template v-if="room.url" #append>
            <v-btn
              :href="room.url"
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

      <template v-if="event.plan || customPlan || addTargets.length > 0">
        <v-divider />
        <v-card-actions class="justify-start flex-wrap px-4">
          <v-btn
            v-if="customPlan"
            :prepend-icon="mdiEyeOffOutline"
            :disabled="customPlan.whitelist.length === 1"
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
                ? `Schon in ${addTargets[0].label}`
                : `Zu ${addTargets[0].label} hinzufügen`
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
                :key="plan.label"
                :title="plan.label"
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
import { customTimetableToRoute, relativeDay } from '../lib/util';
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
const customPlan = computed(
  () =>
    openPlan.value?.whitelist && splus.customSchedules[openPlan.value.label],
);
/* custom plans the course of a normal plan can be added to */
const addTargets = computed(() =>
  openPlan.value && !openPlan.value.whitelist
    ? Object.values(splus.customSchedules)
    : [],
);
const has = (plan) => plan.whitelist.includes(props.event.id);

function addTo(plan) {
  splus.addCourseToCustomSchedule(
    plan.label,
    openPlan.value.id,
    props.event.id,
  );
}

/* removes the course with all its lectures from the custom plan */
function hideCourse() {
  const updated = splus.removeCourseFromCustomSchedule(
    customPlan.value.label,
    props.event.id,
  );
  open.value = false;
  // the new URL re-creates the plan page
  router.replace(customTimetableToRoute(updated));
}
</script>
