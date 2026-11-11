<template>
  <div>
    <v-alert v-if="overlappingCourses.length > 0" type="warning" class="mb-2">
      Kurse überschneiden sich: {{ overlappingCourses.join(', ') }}
    </v-alert>
    <v-data-table
      v-model="selectedCourses"
      :headers="$vuetify.display.mobile ? headersMobile : headers"
      :items="courses"
      :items-per-page="-1"
      :sort-by="[{ key: 'title', order: 'asc' }]"
      :mobile="false"
      item-value="titleId"
      return-object
      show-select
      hide-default-footer
      must-sort
      no-data-text="Keine Kurse geladen."
    >
      <template #item.room="{ item }">
        {{ roomWithoutLinks(item.room) }}
      </template>
      <template
        #item.data-table-select="{
          item,
          internalItem,
          isSelected,
          toggleSelect,
        }"
      >
        <v-checkbox-btn
          :model-value="isSelected(internalItem)"
          :disabled="
            !isSelected(internalItem) && selectedCourses.length > maxCourses
          "
          :color="
            overlappingCourses.includes(item.title) ? 'warning' : undefined
          "
          @update:model-value="toggleSelect(internalItem)"
        />
      </template>
    </v-data-table>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { overlappingCourseTitles } from '../lib/overlaps';
import { roomWithoutLinks } from '../lib/util';

const props = defineProps({
  maxCourses: {
    type: Number,
    default: Infinity,
  },
  lectures: {
    type: Array,
    default: () => [],
  },
});
/* v-model: the selected courses */
const selectedCourses = defineModel({ type: Array, default: () => [] });

const headers = [
  { key: 'title', title: 'Vorlesung' },
  { key: 'lecturer', title: 'Dozent' },
  { key: 'room', title: 'Raum' },
];
const headersMobile = [{ key: 'title', title: 'Vorlesung' }];

/* a course has many lectures, show each course only once */
const courses = computed(() => {
  const lecturesById = new Map();
  props.lectures.forEach((lecture) =>
    lecturesById.set(lecture.titleId, lecture),
  );
  return [...lecturesById.values()];
});

/* titles of the selected courses which take place at the same time */
const overlappingCourses = computed(() =>
  overlappingCourseTitles(props.lectures, selectedCourses.value),
);
</script>
