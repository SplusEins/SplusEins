<template>
  <v-list v-model:opened="opened">
    <v-list-group
      v-for="schedule in schedules"
      :key="schedule.id"
      :value="schedule.id"
    >
      <template #activator="{ props: activator }">
        <v-list-item
          v-bind="activator"
          :title="timetableDisplayName(schedule)"
          :subtitle="`${selectedCounts[schedule.id]} von ${courses[schedule.id].length} ausgewählt`"
        >
          <template #prepend>
            <v-checkbox-btn
              :model-value="
                selectedCounts[schedule.id] === courses[schedule.id].length
              "
              :indeterminate="
                selectedCounts[schedule.id] > 0 &&
                selectedCounts[schedule.id] < courses[schedule.id].length
              "
              :aria-label="`Alle Kurse von ${timetableDisplayName(schedule)}`"
              @click.stop
              @update:model-value="toggleAll(schedule, $event)"
            />
          </template>
        </v-list-item>
      </template>

      <v-list-item
        v-for="course in courses[schedule.id]"
        :key="course.id"
        @click="toggle(course)"
      >
        <template #prepend>
          <v-checkbox-btn
            :model-value="isSelected(course)"
            :aria-label="course.title"
            @click.stop
            @update:model-value="toggle(course)"
          />
        </template>
        <v-list-item-title class="text-wrap">{{
          course.title
        }}</v-list-item-title>
        <div
          class="text-body-medium"
          :class="
            overlapping.has(course.id) ? 'text-warning' : 'text-medium-emphasis'
          "
        >
          {{ dayjs(course.start).format('dd HH:mm') }}
          <template v-if="overlapping.has(course.id)">
            · überschneidet sich mit {{ overlapping.get(course.id) }}
          </template>
        </div>
      </v-list-item>

      <div class="pb-2">
        <v-btn variant="text" color="error" @click="emit('remove', schedule)">
          Plan entfernen
        </v-btn>
      </div>
    </v-list-group>
  </v-list>
</template>

<script setup>
import { computed } from 'vue';
import dayjs from '../lib/dayjs';
import { overlappingCourses } from '../lib/overlaps';
import { timetableDisplayName, uniq } from '../lib/util';

const props = defineProps({
  schedules: {
    type: Array,
    default: () => [],
  },
  /* { timetable id: [lecture] }, sorted by title, each course once */
  lectures: {
    type: Object,
    default: () => ({}),
  },
});
const emit = defineEmits(['remove']);
/* v-model: ids of the selected courses */
const selected = defineModel({ type: Array, default: () => [] });
/* v-model:opened: ids of the timetables whose courses are shown */
const opened = defineModel('opened', { type: Array, default: () => [] });

const courses = computed(() =>
  Object.fromEntries(
    props.schedules.map(({ id }) => [id, props.lectures[id] ?? []]),
  ),
);

const overlapping = computed(() =>
  overlappingCourses(Object.values(props.lectures).flat(), selected.value),
);

const selectedSet = computed(() => new Set(selected.value));
const isSelected = (course) => selectedSet.value.has(course.id);
const selectedCounts = computed(() =>
  Object.fromEntries(
    Object.entries(courses.value).map(([id, list]) => [
      id,
      list.filter(isSelected).length,
    ]),
  ),
);

function toggle(course) {
  selected.value = isSelected(course)
    ? selected.value.filter((id) => id !== course.id)
    : [...selected.value, course.id];
}

function toggleAll(schedule, select) {
  const ids = courses.value[schedule.id].map(({ id }) => id);
  selected.value = select
    ? uniq([...selected.value, ...ids])
    : selected.value.filter((id) => !ids.includes(id));
}
</script>
