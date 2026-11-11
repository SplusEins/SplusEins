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
import dayjs from '../lib/dayjs';
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
const overlappingCourses = computed(() => {
  // get all lectures which have their title selected
  let selectedLectures = props.lectures.filter((lecture) =>
    selectedCourses.value.some((course) => course.titleId === lecture.titleId),
  );

  // filter duplicates
  const key = (lecture) =>
    `${lecture.organiserShortname} ${lecture.titleId} ${lecture.room} ` +
    `${lecture.start} ${lecture.duration}`;
  const lecturesByKey = new Map();
  selectedLectures.forEach((lecture) =>
    lecturesByKey.set(key(lecture), lecture),
  );
  selectedLectures = [...lecturesByKey.values()];

  // group all lectures by day because only they can conflict
  const lecturesByDay = new Map();
  selectedLectures.forEach((lecture) => {
    const key = `${dayjs(lecture.start).week()} ${lecture.day}`;
    const list = lecturesByDay.get(key) || [];
    list.push(lecture);
    lecturesByDay.set(key, list);
  });

  // given two lectures, return true if they overlap
  const overlapsWith =
    ({ begin: thisBegin, duration: thisDuration }) =>
    ({ begin: otherBegin, duration: otherDuration }) => {
      const thisEnd = thisBegin + thisDuration;
      const otherEnd = otherBegin + otherDuration;
      return (
        thisBegin === otherBegin ||
        thisEnd === otherEnd ||
        (thisBegin > otherBegin && thisBegin < otherEnd) ||
        (thisEnd > otherBegin && thisEnd < otherEnd) ||
        (otherBegin > thisBegin && otherBegin < thisEnd) ||
        (otherEnd > thisBegin && otherEnd < thisEnd)
      );
    };

  const withoutAt = (list, at) => list.filter((el, index) => index !== at);

  // find conflicts
  const overlapLectures = [].concat(
    ...[...lecturesByDay.values()].map(
      // for every day…
      (lectures) =>
        lectures.filter(
          // …get those two lectures…
          (oneLecture, index, self) =>
            // …where there is an overlap
            withoutAt(self, index).some(overlapsWith(oneLecture)),
        ),
    ),
  );

  // get the titles of the overlaps
  const overlapTitles = new Map();
  overlapLectures.forEach((lecture) =>
    overlapTitles.set(lecture.titleId, lecture.title),
  );

  return [...overlapTitles.values()];
});
</script>
