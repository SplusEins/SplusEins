<template>
  <div>
    <v-alert
      :value="overlappingCourses.length > 0"
      type="warning">
      Kurse überschneiden sich: {{ overlappingCourses }}
    </v-alert>
    <v-text-field
      v-model="search"
      append-icon="mdi-magnify"
      label="Kurs suchen"
      single-line
      hide-details />
    <v-data-table
      v-model="selectedCourses"
      :headers="headers"
      :items="courses"
      :search="search"
      hide-headers
      hide-actions
      item-key="titleId">
      <template slot="no-data">
        <v-layout
          row
          justify-center>
          <p>Keine der geladenen Kurse passen zur Suche.</p>
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
export default {
  name: 'CourseMultiselect',
  props: {
    maxCourses: {
      type: Number,
      default: () => Infinity,
    },
    courses: {
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
      search: '',
      headers: [
        { value: 'title' },
        { value: 'lecturer' },
        { value: 'room' },
      ],
    };
  },
  computed: {
    selectedCourses: {
      get() { return this.value; },
      set(value) { this.$emit('input', value); }
    },
    overlappingCourses() {
      const withoutAt = (list, at) =>
        list.filter((el, index) => index != at);
      const overlapsWith = ({ begin: thisBegin, duration: thisDuration, day: thisDay }) =>
        ({ begin: otherBegin, duration: otherDuration, day: otherDay }) =>
          thisDay == otherDay && (
            (thisBegin >= otherBegin
              && thisBegin <= otherBegin + otherDuration)
            || (thisBegin + thisDuration >= otherBegin
              && thisBegin + thisDuration <= otherBegin + otherDuration));

      const courses = this.selectedCourses.filter((oneCourse, index, self) =>
        withoutAt(self, index).some(overlapsWith(oneCourse))
      );

      return courses.map(({ title }) => title).join(', ');
    },
  },
};
</script>