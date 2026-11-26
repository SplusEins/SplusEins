<template>
  <v-dialog
    v-model="dialogOpen"
    :fullscreen="$vuetify.display.mobile"
    max-width="720px"
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card>
      <v-toolbar color="surface">
        <v-btn
          v-if="addingPlan"
          :icon="mdiArrowLeft"
          aria-label="Zurück"
          @click="addingPlan = false"
        />
        <v-btn
          v-else
          :icon="mdiClose"
          aria-label="Schließen"
          @click="dialogOpen = false"
        />
        <v-toolbar-title>{{ title }}</v-toolbar-title>
      </v-toolbar>

      <v-card-text class="px-0 pt-2">
        <template v-if="adding">
          <p v-if="selectedSchedules.length === 0" class="px-4 mb-2">
            Such deinen Plan und wähle Kurse aus, auch aus mehreren Plänen.
          </p>
          <timetable-search v-model="query" />
        </template>

        <v-form v-else v-model="valid" @submit.prevent>
          <v-progress-linear v-if="loading" indeterminate />
          <course-multiselect
            v-model="selectedCourses"
            v-model:opened="openedSchedules"
            :schedules="selectedSchedules"
            :lectures="lectures"
            @remove="removeSchedule"
          />
          <div class="px-4 pb-4">
            <v-btn
              v-if="selectedSchedules.length < maxSchedules"
              :prepend-icon="mdiPlus"
              variant="tonal"
              @click="addingPlan = true"
            >
              Weiteren Plan hinzufügen
            </v-btn>
            <span v-else class="text-body-medium text-medium-emphasis">
              Du kannst höchstens {{ maxSchedules }} Pläne kombinieren
            </span>
          </div>
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

      <v-divider />
      <v-card-actions>
        <span
          v-if="selectedSchedules.length > 0"
          class="text-body-medium text-medium-emphasis"
        >
          {{ courseCount(selectedCourses.length) }}
        </span>
        <v-spacer />
        <v-btn
          :disabled="!saveable"
          color="primary"
          variant="flat"
          @click="save()"
        >
          Speichern
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, defineAsyncComponent, provide, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { mdiArrowLeft, mdiClose, mdiPlus } from '@mdi/js';
import { courseCount, customTimetableToRoute, uniq } from '../lib/util';
import { useSplusStore, loadUniqueLectures } from '../stores/splus';
import { useAppStore } from '../stores/app';
import TimetableSearch from './timetable-search.vue';

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

// keeps the requests and the list manageable
const maxSchedules = 8;

/* user data */
const selectedName = ref('');
const selectedSchedules = ref([]);
const selectedCourses = ref([]);
const query = ref('');
const addingPlan = ref(false);
const openedSchedules = ref([]);
/* lectures (events) of the selected timetables: { timetable id: [lecture] } */
const lectures = ref({});
const valid = ref(false);

const isNew = computed(() => !props.customSchedule?.label);
const saveable = computed(
  () => valid.value && selectedCourses.value.length > 0,
);
const allLectures = computed(() => Object.values(lectures.value).flat());
const loading = computed(() =>
  selectedSchedules.value.some(({ id }) => !lectures.value[id]),
);
const adding = computed(
  () => addingPlan.value || selectedSchedules.value.length === 0,
);
const title = computed(() => {
  if (addingPlan.value) return 'Plan hinzufügen';
  return isNew.value ? 'Neuer Plan' : props.customSchedule.label;
});
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

/* adds the timetable and loads its courses */
async function addSchedule(schedule) {
  selectedSchedules.value.push(schedule);
  let loaded = [];
  try {
    loaded = await loadUniqueLectures(schedule);
  } catch (error) {
    useAppStore().reportLoadError('Stundenplan', error);
  }
  // the timetable may have been removed in the meantime
  if (selectedSchedules.value.includes(schedule)) {
    lectures.value[schedule.id] = loaded.sort((a, b) =>
      a.title.localeCompare(b.title),
    );
  }
}

/* chosen in the search: adds it with all its courses and shows them */
async function pickSchedule(schedule) {
  query.value = '';
  addingPlan.value = false;
  if (selectedSchedules.value.includes(schedule)) return;

  openedSchedules.value = [schedule.id];
  await addSchedule(schedule);
  const ids = (lectures.value[schedule.id] ?? []).map(({ id }) => id);
  selectedCourses.value = uniq([...selectedCourses.value, ...ids]);
}
provide('timetablePicker', { selectedIds, add: pickSchedule });

function removeSchedule(schedule) {
  selectedSchedules.value = selectedSchedules.value.filter(
    (selected) => selected !== schedule,
  );
  delete lectures.value[schedule.id];
  // courses which are also in another timetable stay selected
  selectedCourses.value = selectedCourses.value.filter((id) =>
    allLectures.value.some((lecture) => lecture.id === id),
  );
}

/**
 * Store the edited schedule.
 */
function save() {
  dialogOpen.value = false;

  const customSchedule = {
    id: selectedIds.value,
    label: selectedName.value,
    whitelist: uniq(selectedCourses.value),
  };
  const route = customTimetableToRoute(customSchedule);

  if (isNew.value) {
    router.push(route);
  } else {
    splus.replaceCustomSchedule(props.customSchedule, customSchedule);
    router.replace(route);
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

  const loadedIds = allLectures.value.map(({ id }) => id);
  if (isNew.value) {
    // started from a plan: all of its courses, shown
    selectedCourses.value = uniq(loadedIds);
    openedSchedules.value = selectedIds.value;
  } else {
    // without courses which do not exist anymore
    selectedCourses.value = props.customSchedule.whitelist.filter((id) =>
      loadedIds.includes(id),
    );
  }
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
  addingPlan.value = false;
  openedSchedules.value = [];
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
