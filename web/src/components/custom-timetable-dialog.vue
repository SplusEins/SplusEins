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
        <v-toolbar-title>Eigener Plan</v-toolbar-title>
        <v-btn :disabled="!saveable" @click="save()"> Speichern </v-btn>
      </v-toolbar>
      <v-card-text class="px-0">
        <v-form v-model="valid" @submit.prevent>
          <p class="px-4 mb-4">
            Kombiniere Kurse aus mehreren Plänen, zum Beispiel dein Semester und
            deine Wahlpflichtfächer.
          </p>

          <div class="px-4 text-label-large text-primary">1 · Pläne</div>
          <div class="px-4 pt-2">
            <v-chip
              v-for="schedule in selectedSchedules"
              :key="schedule.id"
              :text="timetableDisplayName(schedule)"
              closable
              class="mr-1 mb-1"
              @click:close="removeSchedule(schedule)"
            />
          </div>
          <template v-if="selectedSchedules.length < maxSchedules">
            <timetable-search v-model="query">
              <v-btn
                :append-icon="browseOpen ? mdiChevronUp : mdiChevronDown"
                variant="text"
                class="ml-2"
                @click="browseOpen = !browseOpen"
              >
                Alle Pläne durchstöbern
              </v-btn>
              <general-timetables-list v-if="browseOpen" />
            </timetable-search>
          </template>

          <div class="px-4 pt-4 d-flex justify-space-between">
            <span class="text-label-large text-primary">2 · Kurse</span>
            <span class="text-body-small text-medium-emphasis">
              {{ selectedCourses.length }} von {{ maxCourses }}
            </span>
          </div>
          <v-progress-linear v-if="loading" indeterminate class="mt-2" />
          <course-multiselect
            v-show="selectedSchedules.length > 0"
            v-model="selectedCourses"
            :max-courses="maxCourses"
            :lectures="allLectures"
          />

          <div class="px-4 pt-4 text-label-large text-primary">3 · Name</div>
          <div class="px-4">
            <v-text-field
              v-model="selectedName"
              :rules="[
                rules.required,
                rules.uniqueScheduleLabel,
                rules.uniqueCustomScheduleLabel,
              ]"
              label="Name"
              required
            />
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, defineAsyncComponent, provide, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { mdiChevronDown, mdiChevronUp, mdiClose } from '@mdi/js';
import {
  uniq,
  customTimetableToRoute,
  timetableDisplayName,
} from '../lib/util';
import { useSplusStore, loadUniqueLectures } from '../stores/splus';
import { useAppStore } from '../stores/app';
import TimetableSearch from './timetable-search.vue';
import GeneralTimetablesList from './general-timetables-list.vue';

// loaded when the dialog is opened for the first time
const CourseMultiselect = defineAsyncComponent(
  () => import('./course-multiselect.vue'),
);

const props = defineProps({
  /* custom timetable to edit, or one without label to start a new one from - leave empty to start empty */
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
const query = ref('');
const browseOpen = ref(false);
/* lectures (events) of the selected timetables: { timetable id: [lecture] } */
const lectures = ref({});
/* state */
const pendingLoads = ref(0);
const loading = computed(() => pendingLoads.value > 0);
const valid = ref(false);

const isNew = computed(() => !props.customSchedule?.label);
const saveable = computed(
  () => valid.value && selectedCourses.value.length > 0,
);
const allLectures = computed(() => Object.values(lectures.value).flat());
const selectedIds = computed(() => selectedSchedules.value.map(({ id }) => id));

const rules = {
  required: (value) => !!value || 'Pflichtfeld',
  uniqueScheduleLabel: (value) =>
    !splus.timetableIds.includes(value) || 'Bereits vergeben',
  uniqueCustomScheduleLabel: (value) =>
    value === props.customSchedule?.label ||
    !splus.customTimetableLabels.includes(value) ||
    'Bereits vergeben',
};

/* "Mein Plan", or "Mein Plan 2" etc. if that is taken */
function defaultName() {
  const taken = (name) =>
    splus.customTimetableLabels.includes(name) ||
    splus.timetableIds.includes(name);
  let name = 'Mein Plan';
  for (let i = 2; taken(name); i++) name = `Mein Plan ${i}`;
  return name;
}

async function loadLectures(schedule) {
  pendingLoads.value++;
  try {
    const loaded = await loadUniqueLectures(schedule);
    // the timetable may have been removed in the meantime
    if (selectedSchedules.value.includes(schedule)) {
      lectures.value[schedule.id] = loaded;
    }
  } catch (error) {
    useAppStore().reportLoadError('Stundenplan', error);
  } finally {
    pendingLoads.value--;
  }
}

async function addSchedule(schedule) {
  query.value = '';
  if (selectedSchedules.value.includes(schedule)) {
    return;
  }

  selectedSchedules.value.push(schedule);
  await loadLectures(schedule);
}
provide('timetablePicker', { selectedIds, add: addSchedule });

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
  const titleIds = uniq(selectedCourses.value.map(({ id }) => id));

  const customSchedule = {
    id: selectedSchedules.value.map(({ id }) => id),
    label: selectedName.value,
    whitelist: titleIds,
  };
  const customScheduleRoute = customTimetableToRoute(customSchedule);

  if (isNew.value) {
    router.push(customScheduleRoute);
    return;
  }

  const wasChanged =
    JSON.stringify(customScheduleRoute) !==
    JSON.stringify(customTimetableToRoute(props.customSchedule));
  if (wasChanged) {
    splus.replaceCustomSchedule(props.customSchedule, customSchedule);
    router.replace(customScheduleRoute);
  }
}

/**
 * Load the state from the passed schedule.
 */
async function load() {
  selectedName.value = props.customSchedule.label || defaultName();

  await Promise.all(
    props.customSchedule.id
      .map((id) => splus.getTimetableById(id))
      // timetables which do not exist anymore
      .filter((schedule) => schedule !== undefined)
      .map(addSchedule),
  );

  selectedCourses.value = props.customSchedule.whitelist
    .map((id) => allLectures.value.find((lecture) => lecture.id === id))
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
  query.value = '';
  browseOpen.value = false;
}

watch(dialogOpen, () => {
  if (!dialogOpen.value) {
    reset();
  } else if (props.customSchedule) {
    load();
  } else {
    selectedName.value = defaultName();
  }
});
</script>
