<template>
  <div>
    <v-text-field
      v-model="search"
      append-icon="search"
      label="Kurs suchen"
      single-line
      hide-details />
    <v-data-table
      v-model="selectedCourses"
      :headers="headers"
      :items="courses"
      :search="search"
      :loading="loading"
      hide-headers
      hide-actions
      item-key="id">
      <template slot="no-data">
        <v-layout
          row
          justify-center>
          <v-progress-circular
            v-show="loading"
            :indeterminate="true"
            color="secondary" />
          <p v-show="!loading">
            Keine Vorlesungen.
          </p>
        </v-layout>
      </template>
      <template
        slot="items"
        slot-scope="props">
        <td>
          <v-checkbox
            v-model="props.selected"
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
import TimetableSelect from './timetable-select.vue';

export default {
  name: 'CustomTimetableDialog',
  components: {
    TimetableSelect,
  },
  props: {
    courses: {
      type: Array,
      default: () => []
    },
    value: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      headers: [
        { text: 'Titel', value: 'title' },
        { text: 'Dozent', value: 'lecturer' },
        { text: 'Raum', value: 'room' },
      ],
      search: '',
    };
  },
  computed: {
    selectedCourses: {
      get() { return this.value; },
      set(value) { this.$emit('input', value); }
    },
  },
};
</script>