<template>
  <div>
    <v-alert
      :value="overlappingCourses.length > 0"
      type="warning">
      Kurse überschneiden sich: {{ overlappingCourses }}
    </v-alert>
    <v-data-table
      v-model="selectedCourses"
      :headers="headers"
      :items="courses"
      hide-headers
      hide-actions
      item-key="titleId">
      <template slot="no-data">
        <v-layout
          row
          justify-center>
          <p>Keine Kurse sind geladen.</p>
        </v-layout>
      </template>
      <template
        slot="items"
        slot-scope="props">
        <td>
          <v-checkbox
            v-model="props.selected"
            :disabled="!props.selected && selectedCourses.length > maxCourses"
            primary
            hide-details />
        </td>
        <td>{{ props.item.title }}</td>
        <td>{{ props.item.lecturer }}</td>
        <td v-show="$vuetify.breakpoint.smAndUp">{{ props.item.room }}</td>
      </template>
    </v-data-table>
  </div>
</template>

<script lang="js">
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
      const withoutAt = (list, at) =>
        list.filter((el, index) => index != at);
      const overlapsWith = ({
        begin: thisBegin,
        duration: thisDuration,
        day: thisDay,
        start: thisStart
      }) => ({
        begin: otherBegin,
        duration: otherDuration,
        day: otherDay,
        start: otherStart
        }) => thisDay == otherDay &&
          moment(thisStart).week() == moment(otherStart).week() && (
            (thisBegin >= otherBegin
              && thisBegin <= otherBegin + otherDuration)
            || (thisBegin + thisDuration >= otherBegin
              && thisBegin + thisDuration <= otherBegin + otherDuration));

      const selectedLectures = this.lectures.filter(
        (lecture) => this.selectedCourses.some(
          (course) => course.titleId == lecture.titleId));
      
      const overlapLectures = selectedLectures.filter(
        (oneLecture, index, self) =>
          withoutAt(self, index).some(overlapsWith(oneLecture)));
      const overlapTitles = new Map();
      overlapLectures.forEach(
        (lecture) => overlapTitles.set(lecture.titleId, lecture.title));

      return [...overlapTitles.values()].join(', ');
    },
  },
};
</script>