<template>
  <v-dialog
    v-model="dialogOpen"
    :fullscreen="$vuetify.display.mobile"
    max-width="720px"
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card>
      <v-toolbar color="primary">
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

      <v-card-text class="px-0">
        <template v-if="adding">
          <p v-if="selectedSchedules.length === 0" class="px-4 mb-2">
            Such deinen Plan und wähle Kurse aus, auch aus mehreren Plänen.
          </p>
          <timetable-search v-model="query" />
        </template>

        <v-form v-else ref="form" v-model="valid" @submit.prevent>
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
              Höchstens {{ maxSchedules }} Pläne
            </span>
          </div>
          <div class="px-4">
            <v-text-field
              v-model="selectedName"
              :rules="[rules.required, rules.notATimetable, rules.unique]"
              :label="nameRequired ? 'Name' : 'Name (optional)'"
              :required="nameRequired"
            />
          </div>
        </v-form>
      </v-card-text>

      <v-divider />
      <v-card-actions class="px-4">
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
import { courseCount, uniq } from '../lib/util';
import {
  includesCourse,
  planDisplayName,
  planKey,
  planRoute,
} from '../lib/plans';
import { useSplusStore, loadUniqueLectures } from '../stores/splus';
import { useAppStore } from '../stores/app';
import TimetableSearch from './timetable-search.vue';

// loaded when the dialog is opened for the first time
const CourseMultiselect = defineAsyncComponent(
  () => import('./course-multiselect.vue'),
);

const props = defineProps({
  /* plan to edit, leave empty to start a new one */
  plan: {
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
const form = ref(undefined);

const isNew = computed(() => !props.plan);
const nameRequired = computed(() => selectedSchedules.value.length >= 2);
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
  return isNew.value ? 'Neuer Plan' : planDisplayName(props.plan);
});
const selectedIds = computed(() => selectedSchedules.value.map(({ id }) => id));

const rules = {
  required: (value) =>
    !!value || !nameRequired.value || 'Pflichtfeld bei mehreren Plänen',
  notATimetable: (value) =>
    !splus.timetableIds.includes(value) || 'Bereits vergeben',
  unique: (value) =>
    !value ||
    value === props.plan?.name ||
    !splus.plans.some(({ name }) => name === value) ||
    'Bereits vergeben',
};

/* "Mein Plan", or "Mein Plan 2" etc. if that is taken */
function defaultName() {
  const taken = (name) =>
    splus.plans.some((plan) => plan.name === name) ||
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
 * Per timetable all courses, all except the unchecked or only the checked ones,
 * whichever list is shorter. Timetables without checked courses are left out.
 */
function selectedSources() {
  const selected = new Set(selectedCourses.value);
  return selectedSchedules.value.flatMap(({ id }) => {
    const ids = (lectures.value[id] ?? []).map((lecture) => lecture.id);
    // the courses could not be loaded
    if (ids.length === 0) {
      return props.plan?.sources.filter((source) => source.id === id) ?? [];
    }
    const checked = ids.filter((course) => selected.has(course));
    const unchecked = ids.filter((course) => !selected.has(course));
    if (checked.length === 0) return [];
    if (unchecked.length === 0) return [{ id }];
    return checked.length > unchecked.length
      ? [{ id, except: unchecked }]
      : [{ id, only: checked }];
  });
}

function save() {
  dialogOpen.value = false;
  const sources = selectedSources();
  const plan = selectedName.value
    ? { name: selectedName.value, sources }
    : { sources };
  splus.savePlan(props.plan && planKey(props.plan), plan);
  router[isNew.value ? 'push' : 'replace'](planRoute(plan));
}

/**
 * Load the courses of the plan.
 */
async function load() {
  selectedName.value = props.plan.name ?? '';

  await Promise.all(
    props.plan.sources
      .map(({ id }) => splus.getTimetableById(id))
      // timetables which do not exist anymore
      .filter((schedule) => schedule !== undefined)
      .map(addSchedule),
  );

  selectedCourses.value = uniq(
    props.plan.sources.flatMap((source) =>
      (lectures.value[source.id] ?? [])
        .map(({ id }) => id)
        .filter((id) => includesCourse(source, id)),
    ),
  );
  if (selectedIds.value.length === 1) openedSchedules.value = selectedIds.value;
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
  } else if (props.plan) {
    load();
  }
});

// several timetables need a name
watch(nameRequired, () => {
  if (nameRequired.value && !selectedName.value) {
    selectedName.value = defaultName();
  }
  form.value?.validate();
});
</script>
