<template>
  <div>
    <v-alert
      :value="overlappingCourses.length > 0"
      type="warning"
    >
      Kurse überschneiden sich: {{ overlappingCourses.join(', ') }}
    </v-alert>
    <v-data-table
      v-model="selectedCourses"
      :headers="headers"
      :items="courses"
      hide-headers
      hide-actions
      item-key="titleId"
    >
      <template slot="no-data">
        <v-layout
          row
          justify-center
        >
          <p>Keine Kurse sind geladen.</p>
        </v-layout>
      </template>
      <template
        slot="items"
        slot-scope="props"
      >
        <td>
          <v-checkbox
            v-model="props.selected"
            :disabled="!props.selected && selectedCourses.length > maxCourses"
            :color="overlappingCourses.includes(props.item.title) ? 'warning' : 'secondary'"
            hide-details
          />
        </td>
        <td>
          {{ props.item.title }}
          <span v-show="$vuetify.breakpoint.xs">{{ getShortMetadata(props.item) }}</span>
        </td>
        <td v-show="$vuetify.breakpoint.smAndUp">
          {{ props.item.lecturer }}
        </td>
        <td v-show="$vuetify.breakpoint.smAndUp">
          {{ props.item.room }}
        </td>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import * as moment from 'moment';

export default {
  name: 'CourseMultiselect',
  props: {
    maxCourses: {
      type: Number,
      default: () => Infinity,
    },
    lectures: {
      type: Array,
      default: () => []
    },
    value: {
      type: Array,
      default: () => []
    },
  },
  data() {
    return {
      headers: [
        { value: 'title' },
        { value: 'lecturer' },
        { value: 'room' },
      ],
    };
  },
  computed: {
    courses() {
      const lecturesById = new Map();
      this.lectures.forEach((lecture) => lecturesById.set(lecture.titleId, lecture));
      return [...lecturesById.values()];
    },
    selectedCourses: {
      get() { return this.value; },
      set(value) { this.$emit('input', value); }
    },
    overlappingCourses() {
      // get all lectures which have their title selected
      let selectedLectures = this.lectures.filter(
        (lecture) => this.selectedCourses.some(
          (course) => course.titleId == lecture.titleId));

      // filter duplicates
      const key = (lecture) =>
        `${lecture.organiserShortname} ${lecture.titleId} ${lecture.room} ` +
        `${lecture.start} ${lecture.duration}`;
      const lecturesByKey = new Map();
      selectedLectures.forEach((lecture) => lecturesByKey.set(key(lecture), lecture));
      selectedLectures = [...lecturesByKey.values()];

      // group all lectures by day because only they can conflict
      const lecturesByDay = new Map();
      selectedLectures.forEach((lecture) => {
        const key = `${moment(lecture.start).week()} ${lecture.day}`;
        const list = lecturesByDay.get(key) || [];
        list.push(lecture);
        lecturesByDay.set(key, list);
      });

      // given two lectures, return true if they overlap
      const overlapsWith = ({
        begin: thisBegin,
        duration: thisDuration,
      }) => ({
        begin: otherBegin,
        duration: otherDuration,
        }) => (thisBegin >= otherBegin && thisBegin <= otherBegin + otherDuration)
           || (thisBegin + thisDuration >= otherBegin && thisBegin + thisDuration <= otherBegin + otherDuration);

      const withoutAt = (list, at) => list.filter((el, index) => index != at);

      // find conflicts
      const overlapLectures = [].concat(...
        [...lecturesByDay.values()].map(
          // for every day…
          (lectures) => lectures.filter(
            // …get those two lectures…
            (oneLecture, index, self) =>
              // …where there is an overlap
              withoutAt(self, index).some(overlapsWith(oneLecture)))
        )
      );

      // get the titles of the overlaps
      const overlapTitles = new Map();
      overlapLectures.forEach(
        (lecture) => overlapTitles.set(lecture.titleId, lecture.title));

      return [...overlapTitles.values()]
    },
  },
  methods: {
    getShortMetadata(data) {
        if (data.organiserShortname && data.room) {
          return `(${data.organiserShortname}, ${data.room})`
        } else if (data.organiserShortname) {
          return `(${data.organiserShortname})`;
        } else if (data.room) {
          return `(${data.room})`;
        } else {
          return '';
        }
    }
  }
};
</script>
