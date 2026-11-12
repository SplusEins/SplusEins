<template>
  <v-row density="compact" align="center">
    <v-col cols="12" md="5">
      <v-select
        v-model="selectedPath"
        :items="paths"
        label="Studiengang"
        hide-details
      />
    </v-col>
    <v-col cols="4" md="2">
      <v-select
        v-model="selectedSemester"
        :items="semesters"
        :disabled="selectedPath == undefined"
        label="Semester"
        hide-details
      />
    </v-col>
    <v-col cols="5" md="3">
      <v-select
        v-model="selectedSchedule"
        :items="schedules"
        :disabled="selectedSemester == undefined"
        label="Vertiefung"
        item-title="label"
        item-value="id"
        return-object
        hide-details
      />
    </v-col>
    <v-col>
      <v-btn
        :disabled="disableLoad"
        :loading="loading"
        rounded="pill"
        color="secondary"
        @click="submit()"
      >
        laden
      </v-btn>
    </v-col>
  </v-row>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useSplusStore } from '../stores/splus';

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  /* timetables which were already chosen */
  selectedSchedules: {
    type: Array,
    default: () => [],
  },
});
const emit = defineEmits(['select']);

const { getTimetablesAsTree: schedulesTree } = storeToRefs(useSplusStore());

const selectedPath = ref(undefined);
const selectedSemester = ref(undefined);
const selectedSchedule = ref(undefined);

const paths = computed(() =>
  Object.keys(schedulesTree.value).filter((path) => !path.includes('Räume')),
);
const semesters = computed(() =>
  Object.keys(schedulesTree.value[selectedPath.value] || {}),
);
const schedules = computed(
  () =>
    (schedulesTree.value[selectedPath.value] || {})[selectedSemester.value] ||
    [],
);
const disableLoad = computed(
  () =>
    props.loading ||
    selectedSchedule.value === undefined ||
    props.selectedSchedules.includes(selectedSchedule.value),
);

// preselect if there is only one option
watch(selectedPath, () => {
  selectedSemester.value =
    semesters.value.length === 1 ? semesters.value[0] : undefined;
});
watch(selectedSemester, () => {
  selectedSchedule.value =
    schedules.value.length === 1 ? schedules.value[0] : undefined;
});

function submit() {
  emit('select', selectedSchedule.value);
}
</script>
