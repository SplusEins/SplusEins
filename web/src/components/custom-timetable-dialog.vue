<template>
  <v-dialog
    v-model="dialogOpen"
    :fullscreen="$vuetify.display.mobile"
    max-width="800px"
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card>
      <v-toolbar color="primary">
        <v-btn
          :icon="mdiClose"
          aria-label="Schließen"
          @click="dialogOpen = false"
        />
        <v-toolbar-title>Neuer Stundenplan</v-toolbar-title>
        <v-btn :disabled="!saveable" @click="save()"> Speichern </v-btn>
      </v-toolbar>
      <v-card-text class="pa-2">
        <v-form v-model="valid">
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="selectedName"
                  :rules="[
                    rules.required,
                    rules.uniqueScheduleLabel,
                    isNew ? rules.uniqueCustomScheduleLabel : true,
                  ]"
                  label="Plan benennen"
                  required
                  autofocus
                />
              </v-col>

              <v-col cols="12">
                <timetable-select
                  v-show="selectedSchedules.length <= maxSchedules"
                  :selected-schedules="selectedSchedules"
                  :loading="loading"
                  @select="addSchedule"
                />
              </v-col>

              <v-col cols="12">
                <v-chip
                  v-for="schedule in selectedSchedules"
                  :key="schedule.id"
                  closable
                  class="mr-1"
                  @click:close="removeSchedule(schedule)"
                >
                  {{ getFormattedName(schedule) }}
                </v-chip>
              </v-col>

              <v-col cols="12">
                <course-multiselect
                  v-show="selectedSchedules.length > 0"
                  v-model="selectedCourses"
                  :max-courses="maxCourses"
                  :lectures="allLectures"
                />
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { mdiClose } from '@mdi/js';
import { uniq, customTimetableToRoute, deepEqual } from '../lib/util';
import {
  useSplusStore,
  loadUniqueLectures,
  eventsAsLectures,
} from '../stores/splus';
import { useAppStore } from '../stores/app';
import TimetableSelect from './timetable-select.vue';
import CourseMultiselect from './course-multiselect.vue';

const props = defineProps({
  /* personalized timetable to edit - leave empty to create a new one */
  customSchedule: {
    type: Object,
    default: () => undefined,
  },
});
/* v-model: whether the dialog is open */
const dialogOpen = defineModel({ type: Boolean, default: false });

const router = useRouter();
const splus = useSplusStore();

// reasonable limits to ensure good performance
// and a usable UI
const maxSchedules = 8;
const maxCourses = 20;

/* user data */
const selectedName = ref('');
const selectedSchedules = ref([]);
const selectedCourses = ref([]);
/* lectures of the selected timetables: { timetable id: [lecture] } */
const lectures = ref({});
/* state */
const pendingLoads = ref(0);
const loading = computed(() => pendingLoads.value > 0);
const valid = ref(false);

const isNew = computed(() => !props.customSchedule);
const saveable = computed(
  () => valid.value && selectedCourses.value.length > 0,
);
const allLectures = computed(() => Object.values(lectures.value).flat());

const rules = {
  required: (value) => !!value || 'Pflichtfeld',
  uniqueScheduleLabel: (value) =>
    !splus.timetableIds.includes(value) || 'Bereits vergeben',
  uniqueCustomScheduleLabel: (value) =>
    !splus.customTimetableLabels.includes(value) || 'Bereits vergeben',
};

function getFormattedName(schedule) {
  for (const element of selectedSchedules.value) {
    if (
      schedule.label === element.label &&
      schedule.semester !== element.semester
    ) {
      return schedule.label + ' (' + schedule.semester + '. Sem)';
    }
  }
  return schedule.label;
}

async function loadLectures(schedule) {
  pendingLoads.value++;
  try {
    const events = await loadUniqueLectures(schedule);
    lectures.value[schedule.id] = eventsAsLectures(events);
  } catch (error) {
    useAppStore().enqueueError('Stundenplan: API-Verbindung fehlgeschlagen');
    console.error('error during API call', error.message);
  } finally {
    pendingLoads.value--;
  }
}

async function addSchedule(schedule) {
  if (selectedSchedules.value.includes(schedule)) {
    return;
  }

  selectedSchedules.value.push(schedule);
  await loadLectures(schedule);
}

function removeSchedule(schedule) {
  const index = selectedSchedules.value.indexOf(schedule);
  selectedSchedules.value.splice(index, 1);
  const titles = (lectures.value[schedule.id] || []).map(
    (lecture) => lecture.title,
  );
  lectures.value[schedule.id] = [];
  selectedCourses.value = selectedCourses.value.filter(
    (course) => !titles.includes(course.title),
  );
}

/**
 * Store the edited schedule.
 */
function save() {
  dialogOpen.value = false;

  // Set the base schedule and filters matching the given courses.
  const titleIds = uniq(selectedCourses.value.map(({ titleId }) => titleId));

  const customScheduleRoute = customTimetableToRoute({
    id: selectedSchedules.value.map(({ id }) => id),
    label: selectedName.value,
    whitelist: titleIds,
  });

  if (isNew.value) {
    router.push(customScheduleRoute);
    return;
  }

  const wasChanged = !splus.customTimetablesAsRoutes.some((route) =>
    deepEqual(route, customScheduleRoute),
  );
  if (wasChanged) {
    router.replace(customScheduleRoute);
    splus.deleteCustomSchedule(props.customSchedule);
  }
}

/**
 * Load the state from the passed schedule.
 */
async function load() {
  selectedName.value = props.customSchedule.label;

  await Promise.all(
    props.customSchedule.id.map((id) =>
      addSchedule(splus.getTimetableById(id)),
    ),
  );

  selectedCourses.value = props.customSchedule.whitelist
    .map((id) => allLectures.value.find(({ titleId }) => titleId === id))
    // courses which do not exist anymore
    .filter((course) => course !== undefined);
}

/**
 * Forget the input, so that the dialog starts empty next time.
 */
function reset() {
  selectedName.value = '';
  selectedSchedules.value = [];
  selectedCourses.value = [];
  lectures.value = {};
}

watch(dialogOpen, () => {
  if (!dialogOpen.value) {
    reset();
  } else if (!isNew.value) {
    load();
  }
});
</script>
