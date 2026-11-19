<template>
  <v-container
    v-touch="{
      right: () => splus.moveWeek(-1),
      left: () => splus.moveWeek(1),
    }"
    fluid
    class="pa-1 pa-md-3"
  >
    <v-toolbar flat density="compact" class="inherit-background-color mb-2">
      <responsive-icon-button
        :breakpoint="!$vuetify.display.mobile"
        :icon="mdiCalendarToday"
        text="Heute"
        @click="splus.showWeek()"
      />
      <v-btn
        v-tooltip:bottom="'Vorherige Woche'"
        :icon="mdiChevronLeft"
        aria-label="Vorherige Woche"
        @click="splus.moveWeek(-1)"
      />
      <v-btn
        v-tooltip:bottom="'Nächste Woche'"
        :icon="mdiChevronRight"
        aria-label="Nächste Woche"
        @click="splus.moveWeek(1)"
      />

      <v-toolbar-title class="ml-2">
        {{ monthSummary }}
      </v-toolbar-title>

      <calendar-action-bar />
    </v-toolbar>

    <v-calendar
      class="inherit-background-color"
      type="custom-daily"
      :events="events"
      :start="week"
      :end="calendarEndDate"
      :interval-width="$vuetify.display.mobile ? 25 : 50"
      :interval-format="formatInterval"
      first-time="07:00"
      interval-count="15"
      interval-height="50"
      event-overlap-mode="column"
      event-color="transparent"
      @click:event="showEvent"
    >
      <template #day-label-header="{ day, present }">
        <span
          :class="['text-headline-small', present ? 'font-weight-bold' : '']"
        >
          {{ day }}
        </span>
      </template>
      <template #event="{ event }">
        <div
          :class="[
            'pa-md-1',
            'custom-event',
            { 'mini-padding': $vuetify.display.mobile },
          ]"
          :style="{ '--course': event.color }"
        >
          <div class="font-weight-bold">
            {{ event.name }}
          </div>
          <div v-if="!$vuetify.display.mobile" class="pt-1">
            {{ event.start.slice(-5) }} - {{ event.end.slice(-5) }} Uhr
          </div>
        </div>
      </template>
    </v-calendar>

    <calendar-event-popover v-model="selectedOpen" :event="selectedEvent" />

    <a
      v-if="schedule && schedule.timetablePath"
      :href="schedule.timetablePath"
      class="pt-1 d-flex justify-end text-body-small text-medium-emphasis"
      target="_blank"
      rel="nofollow noopener"
    >
      Originalen Stundenplan anzeigen
    </a>
  </v-container>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useDisplay } from 'vuetify';
import { mdiChevronLeft, mdiChevronRight, mdiCalendarToday } from '@mdi/js';
import dayjs from '../lib/dayjs';
import { useSplusStore } from '../stores/splus';
import CalendarActionBar from './calendar-action-bar.vue';
import CalendarEventPopover from './calendar-event-popover.vue';
import ResponsiveIconButton from './responsive-icon-button.vue';

const splus = useSplusStore();
const { schedule, week, getCalendarEvents: events } = storeToRefs(splus);
const { mobile } = useDisplay();

const calendarEndDate = computed(() =>
  dayjs(week.value)
    .add(splus.lastWeekday - 1, 'days')
    .format('YYYY-MM-DD'),
);
const monthSummary = computed(() => {
  const startDate = dayjs(week.value);
  const endDate = dayjs(calendarEndDate.value);
  if (startDate.isSame(endDate, 'month')) {
    return startDate.format('MMM YYYY');
  } else {
    return startDate.format('MMM') + '/' + endDate.format('MMM YYYY');
  }
});

onMounted(() => splus.showWeek(splus.week));

function formatInterval(interval) {
  if (mobile.value) {
    return interval.hour.toString().padStart(2, '0');
  } else {
    return interval.time;
  }
}

/* event whose details are shown in the dialog */
const selectedEvent = ref(undefined);
const selectedOpen = ref(false);

function showEvent(nativeEvent, { event }) {
  selectedEvent.value = event;
  selectedOpen.value = true;
}
</script>

<style>
/* grey out the days before today */
.v-calendar .v-calendar-daily_head-day.v-past > * {
  opacity: 0.38;
}
.v-calendar .v-calendar-daily_head-day-label {
  cursor: auto;
}
.v-calendar .v-calendar-daily__scroll-area {
  overflow-y: hidden;
}
.v-calendar.v-calendar-daily {
  border-left: none !important;
  border-top: none !important;
}
.v-calendar .v-event-timed-container {
  margin-right: -1px;
}

.inherit-background-color {
  background: inherit !important;
}
.custom-event {
  height: 100%;
  white-space: normal;
  word-wrap: break-word;
  line-height: normal;
  border-top: 3px solid var(--course);
  background: oklch(from var(--course) 0.95 0.03 h);
  color: oklch(from var(--course) 0.4 c h);
}
.v-theme--dark .custom-event {
  background: oklch(from var(--course) 0.32 0.05 h);
  color: oklch(from var(--course) 0.9 0.05 h);
}
.mini-padding {
  padding-top: 2px;
  padding-left: 2px;
  padding-right: 1px;
}

.v-calendar .v-event-timed {
  overflow: hidden;
}
</style>
