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